import { Player } from '../utils/types'
import { eloK } from '../utils/elo'
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (!body.winner || !body.looser) {
        throw createError({
            status: 400,
            message: 'You must provide a winner and a looser'
        })
    }

    const { winner, looser } = body

    const sp = await serverSupabaseClient(event)

    const { data, error } = await sp.from('player').select('*').order('elo', { ascending: false })

    const players : Player[] | null = data

    if (error) {
        throw createError({
            status: 500,
            message: error.message,
        })
    }

    const winnerElo = players?.find(p => p.id === winner)?.elo ?? 0
    const looserElo = players?.find(p => p.id === looser)?.elo ?? 0

    const { winnerNewElo, looserNewElo } = calculateNewElo(winnerElo, looserElo, eloK)

    // Update players
    await sp.from('player').update(
        { elo: winnerNewElo.toFixed(0) } as never
    ).eq('id', winner as never)

    await sp.from('player').update(
        { elo: looserNewElo.toFixed(0) } as never
    ).eq('id', looser as never)

    await sp.from('game').insert(
        { winner, looser, drunk: false } as never
    )
})
