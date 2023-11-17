<script setup lang="ts">
const rankingSystemIndex = ref(0)
defineProps({
    rankingSystem: {
        type: Array as PropType<Array<{id: number, name: string, elo: number, numberOfMatchs: number, percentageOfMatchs: number, eloDisplay: string}[] | null>>,
        required: true
    },
})
</script>

<template>
    <div>
        <h1>Players</h1>

        <transition-group
            name="list"
            tag="ul"
            class="players"
        >
            <player-info
                v-for="(player, index) in rankingSystem[rankingSystemIndex]"
                :key="player.id"
                :player="player"
                :rank="index + 1"
            />
        </transition-group>

        <elo-system-switcher
            :selection-possible="['Elo', 'Match', 'Win']"
            @switch="rankingSystemIndex = $event"
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

.list-move {
  transition: transform 0.5s ease-out;
}
</style>
