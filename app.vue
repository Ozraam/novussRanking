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

const matchs : Ref<Match[] | null> = ref(null)

async function fetchPlayers() {
    const { data: matchsA } = await useFetch('/api/match', { method: 'get' })
    matchs.value = matchsA.value?.matchs ?? null

    const { data: playersArrays } = await useFetch('/api/players')
    players.value = playersArrays.value?.players ?? null
    players2.value = playersArrays.value?.players2 ?? null
    players3.value = playersArrays.value?.players3 ?? null
}

onMounted(() => {
    fetchPlayers()
})

function computeDailyDataFromBeginin() {
    useFetch('/api/computeDailyData').then(() => {
        fetchPlayers()
    })
}
</script>

<template>
    <main class="dark:bg-gray-900 bg-white">
        <NovussHeader
            @update-elo-or-daily-data="fetchPlayers"
        />

        <PlayerList
            v-if="players"
            :ranking-system="[players, players3]"
        />

        <PlayersMatchForm
            :players="players ?? []"
            @update="() => fetchPlayers().then(() => computeDailyDataFromBeginin())"
        />
    </main>
</template>

<style>
html {
    background-color: #0F172A;
}
</style>
