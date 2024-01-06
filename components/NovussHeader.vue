<script setup lang="ts">
const isOpen = ref(false)

const emit = defineEmits(['updateEloOrDailyData'])

async function recalculateElo() {
    await useFetch('/api/recalculateElo')

    emit('updateEloOrDailyData')

    isOpen.value = false
}

async function computeDailyDataFromBeginin() {
    await useFetch('/api/computeDailyData')

    emit('updateEloOrDailyData')

    isOpen.value = false
}
</script>

<template>
    <header class="p-2">
        <h1>Novuss Ranking</h1>

        <UButton
            label="Login"
            variant="ghost"
            size="xl"
            @click="isOpen = true"
        />

        <USlideover v-model="isOpen">
            <UCard :ui="{ rounded: '' }">
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                            Option
                        </h3>

                        <UButton
                            color="gray"
                            variant="ghost"
                            icon="i-heroicons-x-mark-20-solid"
                            class="-my-1"
                            @click="isOpen = false"
                        />
                    </div>
                </template>

                <template #footer>
                    <div class="flex">
                        <UButton
                            label="Recaculate Elo"
                            variant="ghost"
                            size="2xs"
                            @click="recalculateElo"
                        />

                        <UDivider
                            color="gray"
                            orientation="vertical"
                        />

                        <UButton
                            label="Compute Daily Data"
                            variant="ghost"
                            size="2xs"
                            @click="computeDailyDataFromBeginin"
                        />
                    </div>
                </template>
            </UCard>
        </USlideover>
    </header>
</template>

<style scoped lang="scss">
header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #ccc;
}

.login_btn {
    padding: .5rem 1rem;
    border-radius: 5px;
    border: 1px solid #ccc;
    background-color: #fff;
    cursor: pointer;
}
</style>
