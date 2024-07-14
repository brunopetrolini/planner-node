import type { FastifyInstance, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { NotFoundError } from '../../errors'
import { dayjs, prisma } from '../../lib'

const getActivitiesParamsSchema = z.object({
  tripId: z.string().uuid(),
})

export async function getActivities(app: FastifyInstance) {
  app.get('/trips/:tripId/activities', async (request: FastifyRequest) => {
    const { tripId } = getActivitiesParamsSchema.parse(request.params)

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        activities: {
          orderBy: {
            occursAt: 'asc',
          },
        },
      },
    })

    if (!trip) {
      throw new NotFoundError('Trip not found.')
    }

    const differenceInDaysBetweenStartAndEnd = dayjs(trip.endsAt).diff(
      trip.startsAt,
      'days',
    )

    const activities = Array.from({
      length: differenceInDaysBetweenStartAndEnd + 1,
    }).map((_, index) => {
      const date = dayjs(trip.startsAt).add(index, 'days')
      return {
        date: date.toDate(),
        activities: trip.activities.filter((activity) => {
          return dayjs(activity.occursAt).isSame(date, 'day')
        }),
      }
    })

    return { activities }
  })
}
