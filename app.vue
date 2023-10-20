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

const processing = ref(false)

async function proccessMatch({ winner, losser } : { winner: Ref<number | null>, losser: Ref<number | null> }) {
    if (!winner.value || !losser.value) {
        return
    }

    processing.value = true
    await fetchPlayers()

    // Elo calculation
    // https://metinmediamath.wordpress.com/2013/11/27/how-to-calculate-the-elo-rating-including-example/
    const winnerElo = players.value?.find(p => p.id === winner.value)?.elo ?? 0
    const losserElo = players.value?.find(p => p.id === losser.value)?.elo ?? 0

    const winnerExpectedScore = 1 / (1 + 10 ** ((losserElo - winnerElo) / 400))
    const losserExpectedScore = 1 / (1 + 10 ** ((winnerElo - losserElo) / 400))

    const winnerNewElo = winnerElo + 32 * (1 - winnerExpectedScore)
    const losserNewElo = losserElo + 32 * (0 - losserExpectedScore)

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
            @update="fetchPlayers"
            @process-match="proccessMatch"
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

<style scoped lang="scss">
main {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  padding-top: 2em;
}
</style>
