<!-- eslint-disable no-console -->
<script setup lang="ts">
const sp = useSupabaseClient()

const eloK = 32

type Player = {
    id: number;
    name: string;
    elo: number;
    numberOfMatchs: number;
    percentageOfMatchs: number;
    eloDisplay: string;
};

type Match = {
    id: number;
    winner: number;
    looser: number;
    drunk: boolean;
    created_at: string;
};

const players : Ref<Player[] | null> = ref(null)
const players2 : Ref<Player[] | null> = ref(null)
const players3 : Ref<Player[] | null> = ref(null)

const winnerChangeValue : Ref<undefined | number> = ref(undefined)
const looserChangeValue : Ref<undefined | number> = ref(undefined)

const matchs : Ref<Match[] | null> = ref(null)

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

onMounted(() => {
    fetchPlayers()
})

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

function calculateNewElo(winnerElo: number, looserElo: number, eloK: number): { winnerNewElo: number, looserNewElo: number } {
    const winnerExpectedScore = 1 / (1 + 10 ** ((looserElo - winnerElo) / 400))
    const looserExpectedScore = 1 / (1 + 10 ** ((winnerElo - looserElo) / 400))

    const winnerNewElo = winnerElo + eloK * (1 - winnerExpectedScore)
    const looserNewElo = looserElo + eloK * (0 - looserExpectedScore)

    return { winnerNewElo, looserNewElo }
}

async function calculateEloVariation({ winner, looser } : { winner: number | null, looser: number | null }) {
    if (!winner || !looser) {
        return
    }
    const winnerElo = players.value?.find(p => p.id === winner)
    const looserElo = players.value?.find(p => p.id === looser)

    const { data, error } = await useFetch('/api/elo', {
        method: 'post',
        body: JSON.stringify({
            winner: winnerElo,
            looser: looserElo
        })
    })

    if (error.value) {
        winnerChangeValue.value = undefined
        looserChangeValue.value = undefined
        return
    }

    winnerChangeValue.value = Math.round(data.value?.winnerElo ?? 0)
    looserChangeValue.value = Math.round(data.value?.looserElo ?? 0)
}

function computeDailyDataFromBeginin() {
    useFetch('/api/computeDailyData').then(() => {
        fetchPlayers()
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
