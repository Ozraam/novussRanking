import { Match } from '../utils/types'
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const sp = await serverSupabaseClient(event)
    const { data: matchData, error: matchError } = await sp.from('game').select('*').order('id')

    const matchs : Match[] | null = matchData

    if (matchError) {
        throw createError({
            status: 500,
            message: matchError.message,
        })
    }

    return {
        matchs,
    }
})
