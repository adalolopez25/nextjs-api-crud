export type Course = {
    id : number
    title : string
    level : 'basico' | 'intermedio' | 'avanzado' | string
    duration : number
}