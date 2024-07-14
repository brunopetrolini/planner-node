import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { prisma } from '../lib/prisma'

const createActivityParamsSchema = z.object({
  tripId: z.string().uuid(),
})

export async function getActivities(app: FastifyInstance) {
  app.get(
    '/trips/:tripId/activities',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { tripId } = createActivityParamsSchema.parse(request.params)

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: { activities: true },
      })

      if (!trip) {
        return reply.status(404).send({ error: 'Trip not found.' })
      }

      return reply.status(200).send({ activities: trip.activities })
    },
  )
}
