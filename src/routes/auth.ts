import { FastifyInstance } from "fastify";
import { registerUser } from "../controllers/authController";
import { loginUser } from "../controllers/loginUser";


export default async function authRoutes(app: FastifyInstance) {
    app.post('/register', registerUser)
    app.post('/login', loginUser)
}