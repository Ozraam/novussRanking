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
                            @click="console.log(row)"
                        />
                    </template>
                </UTable>
            </template>
        </UTabs>
    </section>
</template>
