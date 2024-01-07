import { Player, Match } from '../utils/types'
import { eloK } from '../utils/elo'
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const sp = await serverSupabaseClient(event)

    const { data, error } = await sp.from('player').select('*').order('elo', { ascending: false })

    let players : Player[] | null = data

    if (error) {
        throw createError({
            status: 500,
            message: error.message,
        })
    }

    players = players!.map(p => ({ ...p, elo: 500 }))

    const { data: matchData } = await sp.from('game').select('*').order('id')

    const matchs : Match[] | null = matchData

    // for each matchs update elo
    matchs!.forEach((match) => {
        const winnerElo = players?.find(p => p.id === match.winner)?.elo ?? 0
        const looserElo = players?.find(p => p.id === match.looser)?.elo ?? 0

        const winnerExpectedScore = 1 / (1 + 10 ** ((looserElo - winnerElo) / 400))
        const looserExpectedScore = 1 / (1 + 10 ** ((winnerElo - looserElo) / 400))

        const winnerNewElo = winnerElo + eloK * (1 - winnerExpectedScore)
        const looserNewElo = looserElo + eloK * (0 - looserExpectedScore)

        players = players!.map((p: any) => {
            if (p.id === match.winner) {
                return { ...p, elo: Math.round(winnerNewElo) }
            }

            if (p.id === match.looser) {
                return { ...p, elo: Math.round(looserNewElo) }
            }

            return p
        })
    })

    // Update players
    await Promise.all(players!.map(p => sp.from('player').update(
        { elo: p.elo } as never
    ).eq('id', p.id as never)))
})
