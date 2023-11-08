<script setup lang="ts">
defineProps({
    players: {
        type: Array as PropType<{id: number, name: string, elo:number}[] | null>,
        required: true
    },
    processing: {
        type: Boolean,
        required: true
    },
    winnerChangeValue: {
        type: Number,
        required: false,
        default: undefined
    },
    looserChangeValue: {
        type: Number,
        required: false,
        default: undefined
    }
})
const emit = defineEmits(['update', 'process-match', 'player-selected'])

const winner = ref(null)
const looser = ref(null)

function processMatch() {
    emit('process-match', { winner, looser })
}

watch([winner, looser], ([winnerValue, looserValue]) => {
    emit('player-selected', { winner: winnerValue, looser: looserValue })
})
</script>

<template>
    <form
        class="players-match-form"
        @submit.prevent="processMatch"
    >
        <label for="winner">
            Winner
            <span
                v-if="winnerChangeValue"
                class="winner"
            >
                +{{ winnerChangeValue }}
            </span>
        </label>

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

        <label for="looser">
            looser
            <span
                v-if="looserChangeValue"
                class="looser"
            >
                {{ looserChangeValue }}
            </span>
        </label>

        <select
            id="looser"
            v-model="looser"
            name="looser"
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

.looser {
    color: $wrong;
}

.winner {
    color: $valid;
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
