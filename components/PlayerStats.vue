<script setup lang="ts">
const props = defineProps({
    player: {
        type: Object as PropType<{id: number, name: string, elo:number}>,
        required: true
    },
    players: {
        type: Object as PropType<{id: number, name: string, elo:number}[]>,
        required: true
    },
})

function getWinRate(opponent: {id: number, victories: number, defeats: number, total: number, name: String}) {
    const v = opponent.total > 0 ? 100 - (opponent.victories / opponent.total) * 100 : 0

    return v
}

const opponentsStats = ref<{
    id: number;
    victories: number;
    defeats: number;
    total: number;
    name: string;
}[]>([])

onMounted(() => {
    useFetch('/api/stats', {
        query: {
            id: props.player.id
        }
    }).then(({ data, error }) => {
        if (error.value) {
            console.log('hauoghao')

            console.log(error.value)
            // TODO : handle error with toast
        } else {
            opponentsStats.value = data.value!.opponentsStats
        }
    })
})
</script>

<template>
    <div>
        <ul class="grid grid-cols-3 gap-10 mb-4">
            <li
                v-for="opponent in opponentsStats"
                :key="opponent.id"
            >
                <div class="flex victory-bars">
                    <div
                        class="loss-bar h-full flex items-end pl-2"
                        :style="{ '--loss-left': (100 - getWinRate(opponent)) + '%' }"
                    >
                        {{ opponent.defeats }}
                    </div>

                    <div
                        class="win-bar h-full flex items-end justify-end pr-2 text-gray-900 dark:font-semibold"
                        :style="{ '--win-right': getWinRate(opponent) + '%' }"
                    >
                        {{ opponent.victories }}
                    </div>
                </div>

                <h5 class="w-full text-center">
                    {{ opponent.name }}
                </h5>
            </li>
        </ul>

        <player-charts
            class="dark:bg-white p-2 pt-0 rounded"
            :player-id="player.id"
        />
    </div>
</template>

<style scoped lang="scss">
.victory-bars {
    position: relative;
    width: 100%;
    height: 4em;

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
            left: 0;
            top: var(--win-right);
            bottom: 0;
            right: 0;
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
            top: var(--loss-left);
            left: 0;
            bottom: 0;
            right: 0;
            background-color: $wrong;
            z-index: -1;
        }
    }
}

.show-charts {
    &-container {
        display: flex;
        justify-content: center;
        margin: 10px 0;
    }

    padding: 3px;
    border-radius: 3px;
    border: 1px solid $background;
    background-color: $primary;
    color: $background;
    cursor: pointer;
    transition: all 0.2s ease;

    &:active {
        transform: scale(0.9);
    }
}
</style>
