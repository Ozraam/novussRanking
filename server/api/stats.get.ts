import { Match } from '../utils/types'
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const playerIdQ = getQuery(event).id

    if (!playerIdQ) {
        throw createError({
            status: 400,
            message: 'Missing player id',
        })
    }

    const playerId = parseInt(playerIdQ!.toString())

    const sp = await serverSupabaseClient(event)

    const { data, error } = await sp.from('player').select('id, name').neq('id', playerId?.valueOf()).order('elo', { ascending: false })

    const players : {id: number, name: string}[] | null = data

    if (error) {
        throw createError({
            status: 500,
            message: error.message,
        })
    }

    const { data: matchData, error: matchError } = await sp.from('game').select('*').or('winner.eq.' + playerId!.toString() + ',looser.eq.' + playerId!.toString())

    if (matchError) {
        throw createError({
            status: 500,
            message: matchError.message,
        })
    }

    const matchs : Match[] | null = matchData

    const opponents = []

    for (const opponent of players!) {
        const victories = matchs.filter(m => m.winner === playerId && m.looser === opponent.id).length
        const defeats = matchs.filter(m => m.winner === opponent.id && m.looser === playerId).length

        opponents.push({
            id: opponent.id,
            victories,
            defeats,
            total: victories + defeats,
            name: opponent.name
        })
    }

    opponents.push({
        id: playerId,
        victories: matchs.filter(m => m.winner === playerId).length,
        defeats: matchs.filter(m => m.looser === playerId).length,
        total: matchs.length,
        name: 'Total'
    })

    return {
        opponentsStats: opponents
    }
})
