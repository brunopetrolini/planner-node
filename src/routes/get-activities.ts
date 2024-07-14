import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { prisma } from '../lib/prisma'
import { dayjs } from '../lib/dayjs'

const getActivitiesParamsSchema = z.object({
  tripId: z.string().uuid(),
})

export async function getActivities(app: FastifyInstance) {
  app.get(
    '/trips/:tripId/activities',
    async (request: FastifyRequest, reply: FastifyReply) => {
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
        return reply.status(404).send({ error: 'Trip not found.' })
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

      return reply.status(200).send({ activities })
    },
  )
}
