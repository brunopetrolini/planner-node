import type { FastifyInstance, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { NotFoundError } from '../../errors'
import { prisma } from '../../lib'

const getLinksParamsSchema = z.object({
  tripId: z.string().uuid(),
})

export async function getLinks(app: FastifyInstance) {
  app.get('/trips/:tripId/links', async (request: FastifyRequest) => {
    const { tripId } = getLinksParamsSchema.parse(request.params)

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        links: true,
      },
    })

    if (!trip) {
      throw new NotFoundError('Trip not found.')
    }

    return { links: trip.links }
  })
}
