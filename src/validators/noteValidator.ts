import { z } from 'zod'

export const noteSchema = z.object({
    title: z.string().min(1, 'Title обязателен'),
    content: z.string().min(1, 'Content обязателен')
})

export const updateNoteSchema = z.object({
    title: z.string().min(1).optional(),
    content: z.string().min(1).optional()
})

export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6, 'Пароль должен состоять минимум из 6 символов')
})

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, 'Для входа нужно ввести пароль')
})