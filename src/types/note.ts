export type Note = {
    id: number
    title: string
    content: string
}

export type CreateNoteBody = {
    title?: string
    content?: string
}

export type UpdateNoteBody = {
    title?: string
    content?: string
}