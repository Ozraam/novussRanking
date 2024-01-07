import { Player, Match } from '../utils/types'
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const sp = await serverSupabaseClient(event)

    const { data, error } = await sp.from('player').select('*').order('elo', { ascending: false })

    const players : Player[] | null = data

    if (error) {
        throw createError({
            status: 500,
            message: error.message,
        })
    }

    const { data: matchData, error: matchError } = await sp.from('game').select('*').order('id')

    const matchs : Match[] | null = matchData

    players?.forEach((p) => {
        p.eloDisplay = `${p.elo.toFixed(0)}`
    })

    // Calculate elo based on matchs played
    let players2 : Player[] | null = [...players!]

    players2 = players2?.map((pl) => {
        const p = { ...pl }
        p.numberOfMatchs = matchs?.filter(m => m.winner === p.id || m.looser === p.id).length ?? 0
        p.percentageOfMatchs = (p.numberOfMatchs / (matchs?.length ?? 1)) * 100

        p.elo = Math.round(p.elo * p.percentageOfMatchs / 100)
        p.eloDisplay = `${p.elo.toFixed(0)}`
        return p
    })

    players2?.sort((a, b) => b.elo - a.elo)

    // Calculate elo based on matchs won
    let players3 : Player[] | null = [...players!]

    players3 = players3?.map((pl) => {
        const p = { ...pl }
        p.numberOfMatchs = matchs?.filter(m => m.winner === p.id || m.looser === p.id).length ?? 1
        const numberOfMatchsWon = matchs?.filter(m => m.winner === p.id).length ?? 0
        p.percentageOfMatchs = (numberOfMatchsWon / p.numberOfMatchs) * 100

        p.elo = p.percentageOfMatchs
        p.eloDisplay = `${p.elo.toFixed(1).padEnd(4, '0')}%`

        return p
    })

    players3?.sort((a, b) => b.elo - a.elo)

    if (matchError) {
        throw createError({
            status: 500,
            message: matchError.message,
        })
    }

    return {
        players,
        players2,
        players3,
    }
})
