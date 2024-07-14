import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { env } from '../../env'
import { NotFoundError } from '../../errors'
import { prisma } from '../../lib'

const confirmParticipantParamsSchema = z.object({
  participantId: z.string().uuid(),
})

export async function confirmParticipant(app: FastifyInstance) {
  app.get(
    '/participants/:participantId/confirm',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { participantId } = confirmParticipantParamsSchema.parse(
        request.params,
      )

      const participant = await prisma.participant.findUnique({
        where: { id: participantId },
        include: { trip: true },
      })

      if (!participant) {
        throw new NotFoundError('Participant not found.')
      }

      if (participant.isConfirmed) {
        return reply.redirect(`${env.WEB_BASE_URL}/trips/${participant.tripId}`)
      }

      await prisma.participant.update({
        where: { id: participantId },
        data: { isConfirmed: true },
      })

      return reply.redirect(`${env.WEB_BASE_URL}/trips/${participant.tripId}`)
    },
  )
}
