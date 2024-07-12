import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import dayjs from 'dayjs'

import { prisma } from '../lib/prisma'

const createTripSchema = z.object({
  destination: z.string().min(4),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
})

export async function createTrip(app: FastifyInstance) {
  app.post('/trips', async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = createTripSchema.parse(request.body)

    const isStartsDateBeforeNow = dayjs(payload.startsAt).isBefore(dayjs())
    if (isStartsDateBeforeNow) {
      return reply.status(400).send({ error: 'Invalid start date.' })
    }

    const isEndsDateBeforeStartsDate = dayjs(payload.endsAt).isBefore(
      payload.startsAt,
    )
    if (isEndsDateBeforeStartsDate) {
      return reply.status(400).send({ error: 'Invalid end date.' })
    }

    const trip = await prisma.trip.create({ data: payload })

    return reply.status(201).send({ tripId: trip.id })
  })
}
