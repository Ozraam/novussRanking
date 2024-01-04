<!-- eslint-disable no-console -->
<script setup lang="ts">
const sp = useSupabaseClient()

const eloK = 32

const players : Ref<{id: number, name: string, elo:number, numberOfMatchs: number, percentageOfMatchs: number, eloDisplay: string}[] | null> = ref(null)
const players2 : Ref<{id: number, name: string, elo:number, numberOfMatchs: number, percentageOfMatchs: number, eloDisplay: string}[] | null> = ref(null)
const players3 : Ref<{id: number, name: string, elo:number, numberOfMatchs: number, percentageOfMatchs: number, eloDisplay: string}[] | null> = ref(null)

const winnerChangeValue : Ref<undefined | number> = ref(undefined)
const looserChangeValue : Ref<undefined | number> = ref(undefined)

const matchs : Ref<{id: number, winner: number, looser: number, drunk: boolean, created_at: string}[] | null> = ref(null)

const rankingSystem = computed(() => [players.value, players2.value, players3.value])

async function fetchPlayers() {
    const { data: matchsA } = await useFetch('/api/match', { method: 'get' })
    matchs.value = matchsA.value?.matchs ?? null

    const { data: playersArrays } = await useFetch('/api/players')
    players.value = playersArrays.value?.players ?? null
    players2.value = playersArrays.value?.players2 ?? null
    players3.value = playersArrays.value?.players3 ?? null
}

const processing = ref(false)

function calculateNewElo(winnerElo: number, looserElo: number, eloK: number): { winnerNewElo: number, looserNewElo: number } {
    const winnerExpectedScore = 1 / (1 + 10 ** ((looserElo - winnerElo) / 400))
    const looserExpectedScore = 1 / (1 + 10 ** ((winnerElo - looserElo) / 400))

    const winnerNewElo = winnerElo + eloK * (1 - winnerExpectedScore)
    const looserNewElo = looserElo + eloK * (0 - looserExpectedScore)

    return { winnerNewElo, looserNewElo }
}

async function proccessMatch({ winner, looser } : { winner: Ref<number | null>, looser: Ref<number | null> }) {
    if (!winner.value || !looser.value) {
        return
    }

    processing.value = true
    await fetchPlayers()

    const winnerElo = players.value?.find(p => p.id === winner.value)?.elo ?? 0
    const looserElo = players.value?.find(p => p.id === looser.value)?.elo ?? 0

    const { winnerNewElo, looserNewElo } = calculateNewElo(winnerElo, looserElo, eloK)

    // Update players
    await sp.from('player').update(
        { elo: winnerNewElo.toFixed(0) } as never
    ).eq('id', winner.value as never)

    await sp.from('player').update(
        { elo: looserNewElo.toFixed(0) } as never
    ).eq('id', looser.value as never)

    sp.from('game').insert(
        { winner: winner.value, looser: looser.value, drunk: false } as never
    ).then(() => {
        processing.value = false
        fetchPlayers()
        setTimeout(() => {
            computeDailyDataFromBeginin()
        }, 10)
    })
}

fetchPlayers()

async function recalculateElo() {
    players.value = players.value!.map(p => ({ ...p, elo: 500 }))

    // for each matchs update elo
    matchs.value!.forEach((match) => {
        const winnerElo = players.value?.find(p => p.id === match.winner)?.elo ?? 0
        const looserElo = players.value?.find(p => p.id === match.looser)?.elo ?? 0

        const winnerExpectedScore = 1 / (1 + 10 ** ((looserElo - winnerElo) / 400))
        const looserExpectedScore = 1 / (1 + 10 ** ((winnerElo - looserElo) / 400))

        const winnerNewElo = winnerElo + eloK * (1 - winnerExpectedScore)
        const looserNewElo = looserElo + eloK * (0 - looserExpectedScore)

        players.value = players.value!.map((p: any) => {
            if (p.id === match.winner) {
                return { ...p, elo: Math.round(winnerNewElo) }
            }

            if (p.id === match.looser) {
                return { ...p, elo: Math.round(looserNewElo) }
            }

            return p
        })
    })

    // Update players
    await Promise.all(players.value!.map(p => sp.from('player').update(
        { elo: p.elo } as never
    ).eq('id', p.id as never)))

    fetchPlayers()
}

function calculateEloVariation({ winner, looser } : { winner: number | null, looser: number | null }) {
    if (!winner || !looser) {
        return
    }
    const winnerElo = players.value?.find(p => p.id === winner)?.elo ?? 0
    const looserElo = players.value?.find(p => p.id === looser)?.elo ?? 0

    const { winnerNewElo, looserNewElo } = calculateNewElo(winnerElo, looserElo, eloK)

    winnerChangeValue.value = Math.round(winnerNewElo - winnerElo)
    looserChangeValue.value = Math.round(looserNewElo - looserElo)
}

const channels = sp.channel('custom-update-channel')
    .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'player' },
        () => {
            fetchPlayers()
        }
    )
    .subscribe()

onUnmounted(() => {
    channels.unsubscribe()
})

function computeDailyDataFromBeginin() {
    console.clear()
    const matchsByDay = matchs.value!.reduce((acc, match) => {
        const date = new Date(match.created_at).toLocaleDateString()

        if (!acc[date]) {
            acc[date] = []
        }
        acc[date].push(match)
        return acc
    }, {} as Record<string, {id: number, winner: number, looser: number, drunk: boolean, created_at: string}[]>)

    const newPlayers = players.value!.reduce((acc, player) => {
        acc[player.id] = { elo: 500, numberOfWin: 0, numberOfLose: 0, id: player.id }
        return acc
    }, {} as Record<number, {elo: number, numberOfWin: number, numberOfLose: number, id: number}>)

    const playersByDay = Object.entries(matchsByDay).sort(
        (mA, mB) => new Date(mA[0]).getTime() - new Date(mB[0]).getTime()
    ).reduce((acc, [date, matchs]) => {
        console.log(date)

        matchs.sort(
            (mA, mB) => new Date(mA.created_at).getTime() - new Date(mB.created_at).getTime()
        ).forEach((match) => {
            console.log(match.created_at)

            const winnerElo = newPlayers[match.winner].elo
            const looserElo = newPlayers[match.looser].elo

            const { winnerNewElo, looserNewElo } = calculateNewElo(winnerElo, looserElo, eloK)

            newPlayers[match.winner].elo = Math.round(winnerNewElo)
            newPlayers[match.looser].elo = Math.round(looserNewElo)

            newPlayers[match.winner].numberOfWin += 1
            newPlayers[match.looser].numberOfLose += 1
        })

        // copy the object newPlayers
        acc[date] = Object.values(newPlayers).reduce((acc2, player) => {
            acc2.push({ ...player })
            return acc2
        }, [] as {id: number, elo: number, numberOfWin: number, numberOfLose: number}[])

        return acc
    }, {} as Record<string, {id: number, elo: number, numberOfWin: number, numberOfLose: number}[]>)

    sp.from('dailyStat').delete().neq('elo', '-10000').then(() => {
        Object.entries(playersByDay).forEach(([date, players]) => {
            players.forEach((player) => {
                sp.from('dailyStat').insert(
                    {
                        date: new Date(date.split('/').reverse().join('-')),
                        player: player.id,
                        elo: player.elo,
                        win: player.numberOfWin,
                        lose: player.numberOfLose
                    } as never
                ).select().then(({ error }) => {
                    console.log('done', date, player.id)
                    if (error) {
                        console.error(error)
                    }
                })
            })
        })

        console.log('done')
    })
}
</script>

<template>
    <main>
        <h1>
            Novuss Ranking
        </h1>

        <players-match-form
            v-if="players"
            :players="players"
            :processing="processing"
            :looser-change-value="looserChangeValue"
            :winner-change-value="winnerChangeValue"
            @update="fetchPlayers"
            @process-match="proccessMatch"
            @player-selected="calculateEloVariation"
        />

        <player-list
            v-if="players"
            :ranking-system="rankingSystem"
        />

        <players-stats
            v-if="players && matchs"
            :players="players"
            :matchs="matchs"
        />

        <button @click="recalculateElo">
            Recalculate elo
        </button>

        <button @click="computeDailyDataFromBeginin">
            Compute daily data
        </button>
    </main>
</template>

<style scoped lang="scss">
main {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  padding-top: 2em;
}
</style>
