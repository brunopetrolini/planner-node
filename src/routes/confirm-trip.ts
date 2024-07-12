import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

const confirmTripParamsSchema = z.object({
  tripId: z.string().uuid(),
})

export async function confirmTrip(app: FastifyInstance) {
  app.get(
    '/trips/:tripId/confirm',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { tripId } = confirmTripParamsSchema.parse(request.params)
      return reply.send({ tripId })
    },
  )
}
