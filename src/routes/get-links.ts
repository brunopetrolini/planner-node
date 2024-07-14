import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { prisma } from '../lib/prisma'

const getLinksParamsSchema = z.object({
  tripId: z.string().uuid(),
})

export async function getLinks(app: FastifyInstance) {
  app.get(
    '/trips/:tripId/links',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { tripId } = getLinksParamsSchema.parse(request.params)

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: {
          links: true,
        },
      })

      if (!trip) {
        return reply.status(404).send({ error: 'Trip not found.' })
      }

      return reply.status(200).send({ links: trip.links })
    },
  )
}
