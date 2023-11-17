<script setup lang="ts">
defineProps({
    player: {
        type: Object as PropType<{id: number, name: string, elo:number, numberOfMatchs:number, percentageOfMatchs: number, eloDisplay: string}>,
        required: true
    },
    rank: {
        type: Number,
        required: true
    }
})
</script>

<template>
    <li class="player">
        <div class="player-rank">
            {{ rank }}°
        </div>

        <div class="player-name">
            {{ player.name }}
        </div>

        <div class="player-elo">
            {{ player.eloDisplay }}
        </div>
    </li>
</template>

<style scoped lang="scss">
.player {
    display: grid;
    grid-template-columns: 1fr 3fr 1fr;
    width: 100%;
    border: 2px solid $secondary;
    color: $background;
    background-color: $primary;
    padding: 10px;
    border-radius: 10px;

    &-rank {
        position: relative;
        &::after {
            content: '';
            position: absolute;
            display: block;
            right: 20%;
            top: 0;
            width: 1px;
            height: 100%;
            background-color: $secondary;
        }
    }
}
</style>
