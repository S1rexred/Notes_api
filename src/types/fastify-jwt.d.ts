import "fastify"

declare module "fastify" {
    interface FastifyInstance {
        authenticate: any
    }

    interface FastifyRequest {
        jwtVerify: () => Promise<void>
        user: {
            id: number
            email: string
        }
    }
}