export function calculateNewElo(winnerElo: number, looserElo: number, eloK: number): { winnerNewElo: number, looserNewElo: number } {
    const winnerExpectedScore = 1 / (1 + 10 ** ((looserElo - winnerElo) / 400))
    const looserExpectedScore = 1 / (1 + 10 ** ((winnerElo - looserElo) / 400))

    const winnerNewElo = winnerElo + eloK * (1 - winnerExpectedScore)
    const looserNewElo = looserElo + eloK * (0 - looserExpectedScore)

    return { winnerNewElo, looserNewElo }
}
