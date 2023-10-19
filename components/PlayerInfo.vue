<script setup lang="ts">
defineProps({
    player: {
        type: Object as PropType<{id: number, name: string, elo:number}>,
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
        <div class="player-name">
            {{ rank }} {{ player.name }}
        </div>

        <div class="player-elo">
            {{ player.elo }}
        </div>
    </li>
</template>
