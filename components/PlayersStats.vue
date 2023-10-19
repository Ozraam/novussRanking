<script setup lang="ts">
defineProps({
    players: {
        type: Object as PropType<{id: number, name: string, elo:number}[]>,
        required: true
    },
    matchs: {
        type: Array as PropType<{id: number, winner: number, losser: number, drunk: boolean}[]>,
        required: true
    }
})
</script>

<template>
    <section>
        <h2>
            Stats
        </h2>

        <ul class="players-stats">
            <player-stats
                v-for="player in players"
                :key="player.id"
                :player="player"
                :players="players"
                :matchs="matchs.filter(m => m.winner === player.id || m.losser === player.id)"
            />
        </ul>
    </section>
</template>

<style scoped lang="scss">
.players-stats {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
}
</style>
