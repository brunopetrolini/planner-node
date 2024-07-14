import type { FastifyInstance, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { NotFoundError } from '../../errors'
import { prisma } from '../../lib'

const getParticipantParamsSchema = z.object({
  participantId: z.string().uuid(),
})

export async function getParticipant(app: FastifyInstance) {
  app.get('/participants/:participantId', async (request: FastifyRequest) => {
    const { participantId } = getParticipantParamsSchema.parse(request.params)

    const participant = await prisma.participant.findUnique({
      select: {
        id: true,
        name: true,
        email: true,
        isConfirmed: true,
      },
      where: { id: participantId },
    })

    if (!participant) {
      throw new NotFoundError('Participant not found.')
    }

    return { participant }
  })
}
