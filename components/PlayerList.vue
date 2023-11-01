<script setup lang="ts">
const useEloMatchBased = ref(false)
defineProps({
    players: {
        type: Array as PropType<{id: number, name: string, elo: number, numberOfMatchs: number, percentageOfMatchs: number}[] | null>,
        required: true
    },
    players2: {
        type: Array as PropType<{id: number, name: string, elo: number, numberOfMatchs: number, percentageOfMatchs: number}[] | null>,
        required: true
    },
})
</script>

<template>
    <div>
        <h1>Players</h1>

        <ul class="players">
            <player-info
                v-for="(player, index) in (useEloMatchBased ? players2 : players)"
                :key="player.id"
                :player="player"
                :rank="index + 1"
            />
        </ul>

        <elo-system-switcher
            :use-elo-match-based="useEloMatchBased"
            @switch="useEloMatchBased = $event"
        />
    </div>
</template>

<style scoped lang="scss">
.players {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}
</style>
