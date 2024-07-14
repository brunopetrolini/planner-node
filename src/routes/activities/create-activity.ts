import type { FastifyInstance, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { ClientError, NotFoundError } from '../../errors'
import { dayjs, prisma } from '../../lib'

const createActivityParamsSchema = z.object({
  tripId: z.string().uuid(),
})

const createActivityBodySchema = z.object({
  title: z.string().min(4),
  occursAt: z.coerce.date(),
})

export async function createActivity(app: FastifyInstance) {
  app.post('/trips/:tripId/activities', async (request: FastifyRequest) => {
    const { tripId } = createActivityParamsSchema.parse(request.params)
    const { title, occursAt } = createActivityBodySchema.parse(request.body)

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
    })

    if (!trip) {
      throw new NotFoundError('Trip not found.')
    }

    const activityDateOccursBeforeTripStarts = dayjs(occursAt).isBefore(
      trip.startsAt,
    )
    if (activityDateOccursBeforeTripStarts) {
      throw new ClientError('Activity occurs before the trip starts.')
    }

    const activityDateOccursAfterTripEnds = dayjs(occursAt).isAfter(trip.endsAt)
    if (activityDateOccursAfterTripEnds) {
      throw new ClientError('Activity occurs after the trip ends.')
    }

    const activity = await prisma.activity.create({
      data: {
        title,
        occursAt,
        tripId,
      },
    })

    return { activityId: activity.id }
  })
}
