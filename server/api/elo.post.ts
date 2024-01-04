import { calculateNewElo } from '../utils/elo'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (!body.winner || !body.looser) {
        throw createError({
            status: 400,
            message: 'You must provide a winner and a looser'
        })
    }

    if (body.winner.id === body.looser.id) {
        throw createError({
            status: 400,
            message: 'Winner and looser cannot be the same'
        })
    }

    const winnerElo = body.winner?.elo ?? 0
    const looserElo = body.looser?.elo ?? 0

    const { winnerNewElo, looserNewElo } = calculateNewElo(winnerElo, looserElo, body.eloK ?? 32)

    return {
        winnerElo: winnerNewElo - winnerElo,
        looserElo: looserNewElo - looserElo
    }
})
