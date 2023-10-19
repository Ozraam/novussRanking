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

function getWinRate(matchs: any, player: any, opponent:any) {
    const v = 100 - (
        (
            matchs.filter((m:any) => m.winner === player.id && m.losser === opponent.id).length / (matchs.filter((m:any) => (m.winner === player.id && m.losser === opponent.id) || (m.winner === opponent.id && m.losser === player.id)).length)
        ) *
        100)

    return v
}
</script>

<template>
    <li class="player-stats">
        <h3>
            {{ player.name }}
        </h3>

        <ul class="player-stats-matchs">
            <li
                v-for="opponent in players.filter(p => p.id != player.id)"
                :key="opponent.id"
                class="player-stats-matchs-match"
            >
                <h5>
                    {{ opponent.name }}
                </h5>

                <!-- <ul>
                    <li>
                        <strong>Wins:</strong> {{ matchs.filter(m => m.winner === player.id && m.losser === opponent.id).length }}
                    </li>

                    <li>
                        <strong>Losses:</strong> {{ matchs.filter(m => m.winner === opponent.id && m.losser === player.id).length }}
                    </li>
                </ul> -->
                <div class="victory-bars">
                    <div
                        class="loss-bar"
                        :style="{ '--loss-left': (100 - getWinRate(matchs, player, opponent)) + '%' }"
                    >
                        {{ matchs.filter(m => m.winner === opponent.id && m.losser === player.id).length }}
                    </div>

                    <div
                        class="win-bar"
                        :style="{ '--win-right': getWinRate(matchs, player, opponent) + '%' }"
                    >
                        {{ matchs.filter(m => m.winner === player.id && m.losser === opponent.id).length }}
                    </div>
                </div>
            </li>
        </ul>
    </li>
</template>

<style scoped lang="scss">
.player-stats {

    background-color: $primary;
    border: 2px solid $secondary;
    border-radius: 10px;
    color: $background;
    padding: 10px;

    &-matchs {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 10px;
        width: 100%;

        &-match {
            min-width: 40%;
            text-align: center;
            border: 1px solid $background;
            padding: 3px;
            border-radius: 3px;
        }
    }
}

.victory-bars {
    display: flex;
    justify-content: space-between;
    position: relative;
    width: 100%;
    height: 1em;

    &::after {
        content: '';
        position: absolute;
        display: block;
        right: 50%;
        top: 0;
        width: 2px;
        z-index: 2;
        height: 100%;
        background-color: $background;
    }

    .win-bar {
        text-align: right;
        --win-right: 50%;
        position: relative;
        width: 100%;
        z-index: 1;

        &::before {
            content: '';
            position: absolute;
            height: 100%;
            left: 0;
            top: 0;
            bottom: 0;
            right: var(--win-right);
            background-color: $valid;
            z-index: -1;
        }
    }

    .loss-bar {
        content: '';
        --loss-left: 50%;
        text-align: left;
        position: relative;
        width: 100%;
        z-index: 1;

        &::before {
            content: "";
            position: absolute;
            left: var(--loss-left);
            height: 100%;
            top: 0;
            bottom: 0;
            right: 0;
            background-color: $wrong;
            z-index: -1;
        }
    }
}
</style>
