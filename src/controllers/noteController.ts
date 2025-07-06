import { FastifyReply, FastifyRequest } from 'fastify';
import { Note, CreateNoteBody, UpdateNoteBody } from '../types/note';
import { error } from 'console';
import { noteSchema, updateNoteSchema } from '../validators/noteValidator';
import { pool } from '../db';
let notes: Note[] = [];

export const getAllNotes = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const result = await pool.query(`
      SELECT notes.id, title, content, notes.user_id, users.email AS author
      FROM notes
      JOIN users ON notes.user_id = users.id
      ORDER BY notes.id
      `)
    res.send(result.rows);
  } catch (err) {
    console.error(err)
    res.status(500).send({ error: 'Ошибка при получении заметок'})
  }
};

export const getNoteById = async ( req: FastifyRequest<{ Params: { id: string } }>, res: FastifyReply) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).send({ error: 'Некорректный id' })
  }

  try {
    const result = await pool.query(
      'SELECT * FROM notes WHERE id = $1',
      [id]
    )

    const note = result.rows[0]

    if (!note) {
      return res.status(404).send({ error: "Заметка не найдена"})
    }

    res.send(note)
  } catch (err) {
    console.error('Ошибка при получени id', err)
    res.status(500).send({ error: 'Ошибка сервера' })
  }
};

export const createNote = async (req: FastifyRequest, res: FastifyReply) => {
  const result = noteSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).send({
      error: 'Неверные данные',
      issues: result.error.flatten().fieldErrors,
    });
  }

  const { title, content } = result.data;
  const { id: userId } = req.user as { id: string, email: string}

  try {
    const insertResult = await pool.query(
      'INSERT INTO notes (title, content, user_id) VALUES ($1, $2, $3) RETURNING *',
      [title, content, userId]
    );

    const newNote = insertResult.rows[0];

    res.status(201).send(newNote);
  } catch (err) {
    console.error('Ошибка при создании заметки:', err);
    res.status(500).send({ error: 'Не удалось создать заметку' });
  }
};

export const deleteNote = async (req: FastifyRequest<{ Params: { id: string }}>, res: FastifyReply) => {
  const id = parseInt(req.params.id)

  if (isNaN(id)) {
    return res.status(400).send({ error: 'Некорректный id' })
  }

  try {
    const result = await pool.query(
      'DELETE FROM notes WHERE id = $1',
      [id]
    )

    const note = result.rows[0]
    res.send({ message: `Заметка с id ${id} удалена`})
  } catch (err) {
    console.error(err)
    res.status(500).send({ error: 'Ошибка севера при удалении метки' })
  }
}

export const updateNote = async (req: FastifyRequest<{ Params: {id: string }, Body: UpdateNoteBody}>, res: FastifyReply) => {
  const id = parseInt(req.params.id)

  if (isNaN(id)) {
    return res.status(404).send({ error: 'Заметка не найдена' })
  }

  const result = noteSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).send({
      error: 'Ошибка валидации',
      ussues: result.error.flatten().fieldErrors
    })
  }

  const { title, content } = req.body

  if (!title || !content) {
    return res.status(400).send({ error: 'Заголовок и контент обязательны '})
  }

  try {
    const insertResult = await pool.query(
      'UPDATE notes SET title = $1, content = $2 WHERE id = $3 RETURNING *',
      [title, content, id]
    )

    if (insertResult.rowCount === 0) {
      return res.status(404).send({ error: "Заметка не найдена"})
    }

  } catch (err) {
    console.error(err)
    res.status(500).send({ error: 'Ошибка сервера при обновлении заметки' })
  }
}