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

const processing = ref(false)

async function processMatch() {
    if (!winner.value || !losser.value) {
        return
    }

    processing.value = true

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
        processing.value = false
    })
}
</script>

<template>
    <form
        class="players-match-form"
        @submit.prevent="processMatch"
    >
        <label for="winner">Winner</label>

        <select
            id="winner"
            v-model="winner"
            name="winner"
            class="select-input"
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
            class="select-input"
        >
            <option
                v-for="player in players?.filter(p => p.id !== winner)"
                :key="player.id"
                :value="player.id"
            >
                {{ player.name }}
            </option>
        </select>

        <button
            type="submit"
            class="button"
            :disabled="processing"
        >
            Submit
        </button>

        <div
            v-if="processing"
            class="processing"
        >
            <!-- Processing... -->
        </div>
    </form>
</template>

<style scoped lang="scss">
.players-match-form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    position: relative;
}

.select-input {
    border: 2px solid $wrong;
    border-radius: 10px;
    padding: 5px;
    background-color: $primary;
    color: $background;
}

.button {
    border: 2px solid $wrong;
    border-radius: 10px;
    padding: 5px;
    background-color: $primary;
    color: $background;

    &:hover {
        background-color: $wrong;
        color: $background;
    }

    &:active {
        background-color: $wrong;
        color: $background;
    }
}

.processing {
    position: absolute;
    height: 20px;
    width: 20px;
    bottom: -25px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 50%;
    border: 2px dashed $wrong;
    animation: pulse 1s infinite;
    transform-origin: left;
}

@keyframes pulse {
    0% {
        transform: scale(0.8) rotate(0deg) translateX(-50%);
    }

    50% {
        transform: scale(1) rotate(180deg) translateX(-50%);
    }

    100% {
        transform: scale(0.8) rotate(360deg) translateX(-50%);
    }
}
</style>
