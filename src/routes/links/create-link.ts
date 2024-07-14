import type { FastifyInstance, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { NotFoundError } from '../../errors'
import { prisma } from '../../lib'

const createLinkParamsSchema = z.object({
  tripId: z.string().uuid(),
})

const createLinkBodySchema = z.object({
  title: z.string().min(4),
  url: z.string().url(),
})

export async function createLink(app: FastifyInstance) {
  app.post('/trips/:tripId/links', async (request: FastifyRequest) => {
    const { tripId } = createLinkParamsSchema.parse(request.params)
    const { title, url } = createLinkBodySchema.parse(request.body)

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
    })

    if (!trip) {
      throw new NotFoundError('Trip not found.')
    }

    const link = await prisma.link.create({
      data: {
        title,
        url,
        tripId,
      },
    })

    return { linkId: link.id }
  })
}
