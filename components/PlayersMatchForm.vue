<script setup lang="ts">
const props = defineProps({
    players: {
        type: Array as PropType<{id: number, name: string, elo:number}[] | null>,
        required: true
    },
})

const emit = defineEmits(['update'])

const winner = ref(undefined)
const looser = ref(undefined)

const processing = ref(false)

function proccessMatch() {
    if (!winner.value || !looser.value) {
        return
    }

    processing.value = true
    useFetch('/api/match', {
        method: 'post',
        body: JSON.stringify({
            winner: parseInt(winner.value),
            looser: parseInt(looser.value)
        })
    }).then(() => {
        processing.value = false
        emit('update')
        isOpen.value = false
    })
}

const winnerChangeValue : Ref<Number | undefined> = ref(undefined)
const looserChangeValue : Ref<Number | undefined> = ref(undefined)

async function calculateEloVariation() {
    if (!winner.value || !looser.value) {
        return
    }

    const winnerElo = props.players?.find(p => p.id.toString() === winner.value)
    const looserElo = props.players?.find(p => p.id.toString() === looser.value)

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

const isOpen = ref(false)

const looserAllowed = computed(() => {
    const winnerIdInt = Number(winner.value ?? -1)
    return props.players?.filter(player => player.id !== winnerIdInt) ?? null
})
</script>

<template>
    <div class="w-full flex justify-center">
        <UButton
            label="Add Match"
            size="md"
            @click="isOpen = true"
        />

        <UModal
            v-model="isOpen"
        >
            <UContainer class="p-4">
                <h3 class="h1 mb-3">
                    Add Match
                </h3>

                <form
                    class="flex flex-col items-center gap-2 relative"
                    @submit.prevent="proccessMatch"
                >
                    <UFormGroup>
                        <USelect
                            v-model="winner"
                            :options="(players as unknown[])"
                            option-attribute="name"
                            value-attribute="id"
                            @change="calculateEloVariation"
                        />

                        <template #label>
                            Winner <span
                                v-if="winnerChangeValue"
                                class="text-green-500"
                            >
                                +{{ winnerChangeValue }}
                            </span>
                        </template>
                    </UFormGroup>

                    <UFormGroup>
                        <USelect
                            v-model="looser"
                            :options="(looserAllowed as unknown[])"
                            option-attribute="name"
                            value-attribute="id"
                            @change="calculateEloVariation"
                        />

                        <template #label>
                            Looser <span class="text-red-500">{{ looserChangeValue }}</span>
                        </template>
                    </UFormGroup>

                    <UButton
                        type="submit"
                        label="Submit"
                        :disabled="processing"
                    />

                    <UProgress
                        v-if="processing"
                        animation="carousel"
                    />
                </form>
            </UContainer>
        </UModal>
    </div>
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
</style>
