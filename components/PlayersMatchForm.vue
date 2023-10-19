<script setup lang="ts">
const props = defineProps({
    players: {
        type: Array as PropType<{id: number, name: string, elo:number}[] | null>,
        required: true
    }
})

const sp = useSupabaseClient()

const emit = defineEmits(['update'])

const winner = ref(null)
const losser = ref(null)

async function processMatch() {
    // Elo calculation
    // https://metinmediamath.wordpress.com/2013/11/27/how-to-calculate-the-elo-rating-including-example/
    const winnerElo = props.players?.find(p => p.id === winner.value)?.elo ?? 0
    const losserElo = props.players?.find(p => p.id === losser.value)?.elo ?? 0

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
        emit('update')
    })
}
</script>

<template>
    <form @submit.prevent="processMatch">
        <label for="winner">Winner</label>

        <select
            id="winner"
            v-model="winner"
            name="winner"
        >
            <option
                v-for="player in players"
                :key="player.id"
                :value="player.id"
            >
                {{ player.name }}
            </option>
        </select>

        <label for="losser">Losser</label>

        <select
            id="losser"
            v-model="losser"
            name="losser"
        >
            <option
                v-for="player in players?.filter(p => p.id !== winner)"
                :key="player.id"
                :value="player.id"
            >
                {{ player.name }}
            </option>
        </select>

        <button type="submit">
            Submit
        </button>
    </form>
</template>
