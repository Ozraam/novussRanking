<!-- eslint-disable no-console -->
<script setup lang="ts">
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

function proccessMatch({ winner, looser } : { winner: Ref<number | null>, looser: Ref<number | null> }) {
    if (!winner.value || !looser.value) {
        return
    }

    processing.value = true
    useFetch('/api/match', {
        method: 'post',
        body: JSON.stringify({
            winner: winner.value,
            looser: looser.value
        })
    }).then(() => {
        processing.value = false
        fetchPlayers().then(() => {
            setTimeout(() => {
                computeDailyDataFromBeginin()
            }, 10)
        })
    })
}

onMounted(() => {
    fetchPlayers()
})

async function recalculateElo() {
    await useFetch('/api/recalculateElo')

    fetchPlayers()
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
    <main class="dark:bg-gray-900 bg-white h-screen">
        <NovussHeader />

        <PlayerList
            v-if="players"
            :ranking-system="[players, players3]"
        />

        <div class="w-full flex justify-center mt-4">
            <UButton
                label="Add Match"
                size="md"
            />
        </div>
    </main>
</template>
