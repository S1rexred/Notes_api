import jwt from "jsonwebtoken";
import { FastifyRequest, FastifyReply } from "fastify";
import { loginSchema } from "../validators/noteValidator";
import { pool } from "../db";
import bcrypt from 'bcrypt'

export const loginUser = async (req: FastifyRequest, res: FastifyReply) => {
    const result = loginSchema.safeParse(req.body)

    if (!result.success) {
        return res.status(500).send({
            error: 'Ошибка валидации',
            issues: result.error.flatten().fieldErrors
        })
    }

    const { email, password } = result.data

    try {
        const userQuery = await pool.query('SELECT * FROM users WHERE email = $1', [email])

        const user = userQuery.rows[0]

        if (!user) {
            return res.status(401).send({ error: 'Неверная почта или пароль'})
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(401).send({ error: 'Неверная почта или пароль' })
        }

        const token = await res.jwtSign({ id: user.id, email: user.email })

        res.send({ message: 'Вход успешен', token })
    } catch (err) {
        console.error(err)
        res.status(500).send({ error: 'Ошибка сервера при входе' })
    }
}