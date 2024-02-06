export type Player = {id: number, name: string, elo:number, numberOfMatchs: number, percentageOfMatchs: number, eloDisplay: string}
export type Match = {id: number, winner: number, looser: number, drunk: boolean, created_at: string}
export type PlayerDaily = {
    elo: number;
    numberOfWin: number;
    numberOfLose: number;
    id: number;
}
