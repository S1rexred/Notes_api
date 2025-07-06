import Fastify from 'fastify';
import jwt from '@fastify/jwt';
import notesRoutes from './routes/notes';
import authRoutes from './routes/auth';
import { FastifyRequest, FastifyReply } from 'fastify';

const app = Fastify();

app.register(jwt, {
  secret: 'secret_key'
});

app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ error: 'требуется авторизация' });
  }
});

app.register(notesRoutes, { prefix: '/notes' });
app.register(authRoutes, { prefix: '/auth' });

app.listen({ port: 3000 }, (err, address) => {
  if (err) throw err;
  console.log(`Сервер запущен на ${address}`);
});