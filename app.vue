<!-- eslint-disable no-console -->
<script setup lang="ts">
const sp = useSupabaseClient()

const players : Ref<{id: number, name: string, elo:number}[] | null> = ref(null)
const matchs : Ref<{id: number, winner: number, losser: number, drunk: boolean}[] | null> = ref(null)

async function fetchPlayers() {
    const { data, error } = await sp.from('player').select('*').order('elo', { ascending: false })

    players.value = data

    if (error) {
        console.error(error)
    }

    const { data: matchData, error: matchError } = await sp.from('game').select('*')

    matchs.value = matchData

    if (matchError) {
        console.error(matchError)
    }
}

fetchPlayers()
</script>

<template>
    <main>
        <players-match-form
            v-if="players"
            :players="players"
            @update="fetchPlayers"
        />

        <player-list
            v-if="players"
            :players="players"
        />

        <players-stats
            v-if="players && matchs"
            :players="players"
            :matchs="matchs"
        />
    </main>
</template>
