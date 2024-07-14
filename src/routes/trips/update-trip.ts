import type { FastifyInstance, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { ClientError, NotFoundError } from '../../errors'
import { dayjs, prisma } from '../../lib'

const updateTripParamsSchema = z.object({
  tripId: z.string().uuid(),
})

const updateTripBodySchema = z.object({
  destination: z.string().min(4),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
})

export async function updateTrip(app: FastifyInstance) {
  app.put('/trips/:tripId', async (request: FastifyRequest) => {
    const { tripId } = updateTripParamsSchema.parse(request.params)
    const { destination, startsAt, endsAt } = updateTripBodySchema.parse(
      request.body,
    )

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
    })

    if (!trip) {
      throw new NotFoundError('Trip not found.')
    }

    const isStartsDateBeforeNow = dayjs(startsAt).isBefore(dayjs())
    if (isStartsDateBeforeNow) {
      throw new ClientError('Invalid start date.')
    }

    const isEndsDateBeforeStartsDate = dayjs(endsAt).isBefore(startsAt)
    if (isEndsDateBeforeStartsDate) {
      throw new ClientError('Invalid end date.')
    }

    await prisma.trip.update({
      where: { id: tripId },
      data: { destination, startsAt, endsAt },
    })

    return { tripId: trip.id }
  })
}
