import type { FastifyInstance, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { NotFoundError } from '../../errors'
import { prisma } from '../../lib'

const getTripDetailsParamsSchema = z.object({
  tripId: z.string().uuid(),
})

export async function getTripDetails(app: FastifyInstance) {
  app.get('/trips/:tripId', async (request: FastifyRequest) => {
    const { tripId } = getTripDetailsParamsSchema.parse(request.params)

    const trip = await prisma.trip.findUnique({
      select: {
        id: true,
        destination: true,
        startsAt: true,
        endsAt: true,
        isConfirmed: true,
      },
      where: { id: tripId },
    })

    if (!trip) {
      throw new NotFoundError('Trip not found.')
    }

    return { trip }
  })
}
