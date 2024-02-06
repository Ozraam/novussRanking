<script setup>
const props = defineProps({
    rankingSystem: {
        type: Array,
        required: true
    },
})

const tabsItems = computed(() => {
    return props.rankingSystem.map((ranking, index) => {
        return {
            label: index === 0 ? 'Elo' : 'Win Rate',
            content: ranking.map((p, i) => {
                return {
                    rank: (i + 1) + '°',
                    name: p.name,
                    elo: p.eloDisplay,
                    index: i,
                    id: p.id,
                }
            }),
            column: [
                {
                    label: 'Rank',
                    key: 'rank',
                },
                {
                    label: 'Name',
                    key: 'name',
                },
                {
                    label: 'Elo',
                    key: 'elo',
                },
                {
                    key: 'actions',
                }
            ]
        }
    })
})

const modalsOpen = ref(props.rankingSystem[0].map(() => false))
</script>

<template>
    <section class="p-2">
        <h2 class="mb-3">
            Players Rank
        </h2>

        <UTabs :items="tabsItems">
            <template #item="{ item }">
                <UTable
                    :rows="item.content"
                    :columns="item.column"
                >
                    <template #actions-data="{ row }">
                        <UButton
                            label="Stats"
                            size="xs"
                            @click="modalsOpen[row.index] = true;"
                        />

                        <UModal
                            v-model="modalsOpen[row.index]"
                            fullscreen
                            :ui="{
                                inner: 'overflow-auto',
                                container: 'overflow-auto',
                                base: 'overflow-auto',
                            }"
                        >
                            <UCard
                                :ui="{
                                    rounded: '',
                                    base: 'overflow-auto'
                                }"
                            >
                                <template #header>
                                    <div class="flex justify-between">
                                        <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                                            {{ row.name }} Stats
                                        </h3>

                                        <UButton
                                            color="gray"
                                            variant="ghost"
                                            icon="i-heroicons-x-mark-20-solid"
                                            class="-my-1"
                                            @click="modalsOpen[row.index] = false"
                                        />
                                    </div>
                                </template>

                                <PlayerStats
                                    :players="props.rankingSystem[0]"
                                    :player="row"
                                />
                            </UCard>
                        </UModal>
                    </template>
                </UTable>
            </template>
        </UTabs>
    </section>
</template>
