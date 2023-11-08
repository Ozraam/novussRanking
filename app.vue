<!-- eslint-disable no-console -->
<script setup lang="ts">
const sp = useSupabaseClient()

const eloK = 32

const players : Ref<{id: number, name: string, elo:number, numberOfMatchs: number, percentageOfMatchs: number}[] | null> = ref(null)
const players2 : Ref<{id: number, name: string, elo:number, numberOfMatchs: number, percentageOfMatchs: number}[] | null> = ref(null)

const winnerChangeValue : Ref<undefined | number> = ref(undefined)
const losserChangeValue : Ref<undefined | number> = ref(undefined)

const matchs : Ref<{id: number, winner: number, losser: number, drunk: boolean}[] | null> = ref(null)

async function fetchPlayers() {
    const { data, error } = await sp.from('player').select('*').order('elo', { ascending: false })

    players.value = data

    if (error) {
        console.error(error)
    }

    const { data: matchData, error: matchError } = await sp.from('game').select('*')

    matchs.value = matchData

    // Calculate elo based on matchs played
    players2.value = [...players.value!]

    players2.value = players2.value?.map((pl) => {
        const p = { ...pl }
        p.numberOfMatchs = matchs.value?.filter(m => m.winner === p.id || m.losser === p.id).length ?? 0
        p.percentageOfMatchs = parseFloat(((p.numberOfMatchs / (matchs.value?.length ?? 1)) * 100).toFixed(2))

        p.elo = Math.round(p.elo * p.percentageOfMatchs / 100)

        return p
    })

    players2.value?.sort((a, b) => b.elo - a.elo)

    if (matchError) {
        console.error(matchError)
    }
}

const processing = ref(false)

function calculateNewElo(winnerElo: number, losserElo: number, eloK: number): { winnerNewElo: number, losserNewElo: number } {
    const winnerExpectedScore = 1 / (1 + 10 ** ((losserElo - winnerElo) / 400))
    const losserExpectedScore = 1 / (1 + 10 ** ((winnerElo - losserElo) / 400))

    const winnerNewElo = winnerElo + eloK * (1 - winnerExpectedScore)
    const losserNewElo = losserElo + eloK * (0 - losserExpectedScore)

    return { winnerNewElo, losserNewElo }
}

async function proccessMatch({ winner, losser } : { winner: Ref<number | null>, losser: Ref<number | null> }) {
    if (!winner.value || !losser.value) {
        return
    }

    processing.value = true
    await fetchPlayers()

    const winnerElo = players.value?.find(p => p.id === winner.value)?.elo ?? 0
    const losserElo = players.value?.find(p => p.id === losser.value)?.elo ?? 0

    const { winnerNewElo, losserNewElo } = calculateNewElo(winnerElo, losserElo, eloK)

    // Update players
    await sp.from('player').update(
        { elo: winnerNewElo.toFixed(0) } as never
    ).eq('id', winner.value as never)

    await sp.from('player').update(
        { elo: losserNewElo.toFixed(0) } as never
    ).eq('id', losser.value as never)

    sp.from('game').insert(
        { winner: winner.value, losser: losser.value, drunk: false } as never
    ).then(() => {
        processing.value = false
        fetchPlayers()
    })
}

fetchPlayers()

async function recalculateElo() {
    players.value = players.value!.map(p => ({ ...p, elo: 500 }))

    // for each matchs update elo
    matchs.value!.forEach((match) => {
        const winnerElo = players.value?.find(p => p.id === match.winner)?.elo ?? 0
        const losserElo = players.value?.find(p => p.id === match.losser)?.elo ?? 0

        const winnerExpectedScore = 1 / (1 + 10 ** ((losserElo - winnerElo) / 400))
        const losserExpectedScore = 1 / (1 + 10 ** ((winnerElo - losserElo) / 400))

        const winnerNewElo = winnerElo + eloK * (1 - winnerExpectedScore)
        const losserNewElo = losserElo + eloK * (0 - losserExpectedScore)

        players.value = players.value!.map((p: any) => {
            if (p.id === match.winner) {
                return { ...p, elo: Math.round(winnerNewElo) }
            }

            if (p.id === match.losser) {
                return { ...p, elo: Math.round(losserNewElo) }
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

function calculateEloVariation({ winner, losser } : { winner: number | null, losser: number | null }) {
    if (!winner || !losser) {
        return
    }
    const winnerElo = players.value?.find(p => p.id === winner)?.elo ?? 0
    const losserElo = players.value?.find(p => p.id === losser)?.elo ?? 0

    const { winnerNewElo, losserNewElo } = calculateNewElo(winnerElo, losserElo, eloK)

    winnerChangeValue.value = Math.round(winnerNewElo - winnerElo)
    losserChangeValue.value = Math.round(losserNewElo - losserElo)
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
            :losser-change-value="losserChangeValue"
            :winner-change-value="winnerChangeValue"
            @update="fetchPlayers"
            @process-match="proccessMatch"
            @player-selected="calculateEloVariation"
        />

        <player-list
            v-if="players && players2"
            :players="players"
            :players2="players2"
        />

        <players-stats
            v-if="players && matchs"
            :players="players"
            :matchs="matchs"
        />

        <button @click="recalculateElo">
            Recalculate elo
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
