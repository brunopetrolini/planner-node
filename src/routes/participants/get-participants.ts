import type { FastifyInstance, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { NotFoundError } from '../../errors'
import { prisma } from '../../lib'

const getParticipantsParamsSchema = z.object({
  tripId: z.string().uuid(),
})

export async function getParticipants(app: FastifyInstance) {
  app.get('/trips/:tripId/participants', async (request: FastifyRequest) => {
    const { tripId } = getParticipantsParamsSchema.parse(request.params)

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        participants: {
          select: {
            id: true,
            name: true,
            email: true,
            isConfirmed: true,
          },
        },
      },
    })

    if (!trip) {
      throw new NotFoundError('Trip not found.')
    }

    return { participants: trip.participants }
  })
}
