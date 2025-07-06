import { FastifyRequest, FastifyReply } from "fastify";
import { registerSchema } from "../validators/noteValidator";
import bcrypt from 'bcrypt'
import { pool } from "../db";

export const registerUser = async (req: FastifyRequest, res: FastifyReply) => {
    const result = registerSchema.safeParse(req.body)

    if (!result.success) {
        return res.status(400).send({
            error: 'Ошибка валидации',
            issues: result.error.flatten().fieldErrors
        })
    }

    const { email, password } = result.data

    try {
        const insertResult = await pool.query('SELECT * FROM users WHERE email = $1', [email])

        if (insertResult.rows.length > 0) {
            return res.status(409).send({ error: 'Пользователь с таким email уже существует'})
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await pool.query(
            'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
            [email, hashedPassword]
        )

        res.status(201).send({ message: 'Регистрация прошла успешно', user: user.rows[0]})
    } catch (err) {
        console.error(err)
        res.status(500).send({ error: "Ошибка сервера при регистрации"})
    }
}