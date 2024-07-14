import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { prisma } from '../lib/prisma'

const createLinkParamsSchema = z.object({
  tripId: z.string().uuid(),
})

const createLinkBodySchema = z.object({
  title: z.string().min(4),
  url: z.string().url(),
})

export async function createLink(app: FastifyInstance) {
  app.get(
    '/trips/:tripId/links',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { tripId } = createLinkParamsSchema.parse(request.params)
      const { title, url } = createLinkBodySchema.parse(request.body)

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
      })

      if (!trip) {
        return reply.status(404).send({ error: 'Trip not found.' })
      }

      const link = await prisma.link.create({
        data: {
          title,
          url,
          tripId,
        },
      })

      return reply.status(201).send({ linkId: link.id })
    },
  )
}
