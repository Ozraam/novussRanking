<script setup lang="ts">
defineProps({
    players: {
        type: Array as PropType<{id: number, name: string, elo:number}[] | null>,
        required: true
    }
})
</script>

<template>
    <div>
        <h1>Players</h1>

        <ul>
            <player-info
                v-for="(player, index) in players"
                :key="player.id"
                :player="player"
                :rank="index + 1"
            />
        </ul>
    </div>
</template>

<style scoped lang="scss">
.player {
  display: flex;
  gap: 10px;
}
</style>
