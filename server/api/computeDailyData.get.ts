import { Match, PlayerDaily } from '../utils/types'
import { eloK } from '../utils/elo'
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const sp = await serverSupabaseClient(event)

    const { data: matchData } = await sp.from('game').select('*').order('id')

    const matchs: Match[] | null = matchData

    const { data, error } = await sp.from('player').select('*').order('elo', { ascending: false })

    const players: Player[] | null = data

    if (error) {
        throw createError({
            status: 500,
            message: error.message,
        })
    }

    const matchsByDay = matchs!.reduce((acc, match) => {
        const date = new Date(match.created_at).toLocaleDateString('fr-FR')

        if (!acc[date]) {
            acc[date] = []
        }
        acc[date].push(match)
        return acc
    }, {} as Record<string, Match[]>)

    const newPlayers = players!.reduce((acc, player) => {
        acc[player.id] = { elo: 500, numberOfWin: 0, numberOfLose: 0, id: player.id }
        return acc
    }, {} as Record<number, { elo: number, numberOfWin: number, numberOfLose: number, id: number }>)

    const playersByDay = Object.entries(matchsByDay).sort(
        (mA, mB) => new Date(mA[0]).getTime() - new Date(mB[0]).getTime()
    ).reduce((acc, [date, matchs]) => {
        matchs.sort(
            (mA, mB) => new Date(mA.created_at).getTime() - new Date(mB.created_at).getTime()
        ).forEach((match) => {
            const winnerElo = newPlayers[match.winner].elo
            const looserElo = newPlayers[match.looser].elo

            const { winnerNewElo, looserNewElo } = calculateNewElo(winnerElo, looserElo, eloK)

            newPlayers[match.winner].elo = Math.round(winnerNewElo)
            newPlayers[match.looser].elo = Math.round(looserNewElo)

            newPlayers[match.winner].numberOfWin += 1
            newPlayers[match.looser].numberOfLose += 1
        })

        // copy the object newPlayers
        acc[date] = Object.values(newPlayers).reduce((acc2: PlayerDaily[], player: PlayerDaily) => {
            acc2.push({ ...player })
            return acc2
        }, [] as PlayerDaily[])

        return acc
    }, {} as Record<string, { id: number, elo: number, numberOfWin: number, numberOfLose: number }[]>)

    sp.from('dailyStat').delete().neq('elo', '-10000').then(() => {
        Object.entries(playersByDay).forEach(([date, players]) => {
            players.forEach((player) => {
                sp.from('dailyStat').insert(
                    {
                        date: new Date(date.split('/').reverse().join('-')),
                        player: player.id,
                        elo: player.elo,
                        win: player.numberOfWin,
                        lose: player.numberOfLose
                    } as never
                ).select().then(({ error }) => {
                    if (error) {
                        throw createError({
                            status: 500,
                            message: error.message,
                        })
                    }
                })
            })
        })
    })
})
