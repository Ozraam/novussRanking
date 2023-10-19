<script setup lang="ts">
defineProps({
    player: {
        type: Object as PropType<{id: number, name: string, elo:number}>,
        required: true
    },
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
    <li>
        <h3>
            {{ player.name }}
        </h3>

        <h4>
            Stats
        </h4>

        <ul>
            <li
                v-for="opponent in players.filter(p => p.id != player.id)"
                :key="opponent.id"
            >
                <h5>
                    {{ opponent.name }}
                </h5>

                <ul>
                    <li>
                        <strong>Wins:</strong> {{ matchs.filter(m => m.winner === player.id && m.losser === opponent.id).length }}
                    </li>

                    <li>
                        <strong>Losses:</strong> {{ matchs.filter(m => m.winner === opponent.id && m.losser === player.id).length }}
                    </li>
                </ul>
            </li>
        </ul>
    </li>
</template>
