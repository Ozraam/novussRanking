<script setup lang="ts">
const isOpen = ref(false)
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
            <UCard>
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                            Slideover
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
