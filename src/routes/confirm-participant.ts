import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { prisma } from '../lib/prisma'

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
        return reply.status(404).send({ error: 'Participant not found.' })
      }

      if (participant.isConfirmed) {
        return reply.redirect(
          `http://localhost:3000/trips/${participant.tripId}`,
        )
      }

      await prisma.participant.update({
        where: { id: participantId },
        data: { isConfirmed: true },
      })

      return reply.redirect(`http://localhost:3000/trips/${participant.tripId}`)
    },
  )
}
