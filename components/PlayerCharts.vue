<!-- eslint-disable vue/component-name-in-template-casing -->
<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js'

const props = defineProps({
    playerId: {
        type: Number,
        required: true
    }
})

const sp = useSupabaseClient()

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
)

const dataElo : Ref<any> = ref({})
const dataWin : Ref<any> = ref({})
const dataWinrate : Ref<any> = ref({})
const loaded = ref(false)
// {
//     labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
//     datasets: [
//         {
//             label: 'Data One',
//             backgroundColor: '#f87979',
//             data: [40, 39, 10, 40, 39, 80, 40]
//         }
//     ]
// }

sp.from('dailyStat').select('*').eq('player', props.playerId).then(({ data: dailyStats }) => {
    if (!dailyStats) { return }

    const dailySorted = dailyStats.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const labels = dailySorted.map((ds: any) => ds.date.split('T')[0].split('-').reverse().join('/'))
    const datasetsElo = [
        {
            label: 'Elo',
            backgroundColor: '#ff0000',
            borderColor: 'rgba(255, 0, 0, 0.2)',
            data: dailySorted.map((ds: any) => ds.elo)
        },
    ]

    const datasetsWin = [
        {
            label: 'Win',
            backgroundColor: '#32CD32',
            borderColor: 'rgba(50, 205, 50, 0.2)',
            data: dailySorted.map((ds: any) => ds.win)
        },
        {
            label: 'Loss',
            backgroundColor: '#0000ff',
            borderColor: 'rgba(0, 0, 255, 0.2)',
            data: dailySorted.map((ds: any) => ds.lose)
        },
    ]

    const datasetsWinrate = [
        {
            label: 'Winrate',
            backgroundColor: '#0000ff',
            borderColor: 'rgba(0, 0, 255, 0.2)',
            data: dailySorted.map((ds: any) => ds.win / (ds.win + ds.lose) * 100)
        },
    ]

    dataElo.value = {
        labels,
        datasets: datasetsElo
    }

    dataWin.value = {
        labels,
        datasets: datasetsWin
    }

    dataWinrate.value = {
        labels,
        datasets: datasetsWinrate
    }

    loaded.value = true
})
</script>

<template>
    <div>
        <h3>Player Charts</h3>

        <Line
            v-if="loaded"
            :data="dataElo"
        />

        <Line
            v-if="loaded"
            :data="dataWin"
        />

        <Line
            v-if="loaded"
            :data="dataWinrate"
        />
    </div>
</template>
