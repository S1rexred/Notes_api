import { FastifyInstance } from "fastify";
import { getAllNotes, getNoteById, createNote, deleteNote, updateNote } from "../controllers/noteController";

export default async function notesRoutes(app: FastifyInstance) {
    app.get('/', { preHandler: app.authenticate }, getAllNotes)
    app.get('/:id', getNoteById)
    app.put('/:id', updateNote)
    app.post('/', { preHandler: app.authenticate }, createNote)
    app.delete('/:id', deleteNote)
}