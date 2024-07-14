import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { prisma } from '../lib/prisma'
import { dayjs } from '../lib/dayjs'

const createActivityParamsSchema = z.object({
  tripId: z.string().uuid(),
})

const createActivityBodySchema = z.object({
  title: z.string().min(4),
  occursAt: z.coerce.date(),
})

export async function createActivity(app: FastifyInstance) {
  app.get(
    '/trips/:tripId/activities',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { tripId } = createActivityParamsSchema.parse(request.params)
      const { title, occursAt } = createActivityBodySchema.parse(request.body)

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
      })

      if (!trip) {
        return reply.status(404).send({ error: 'Trip not found.' })
      }

      const activityDateOccursBeforeTripStarts = dayjs(occursAt).isBefore(
        trip.startsAt,
      )
      if (activityDateOccursBeforeTripStarts) {
        return reply.status(400).send({
          error: 'Activity occurs before the trip starts.',
        })
      }

      const activityDateOccursAfterTripEnds = dayjs(occursAt).isAfter(
        trip.endsAt,
      )
      if (activityDateOccursAfterTripEnds) {
        return reply.status(400).send({
          error: 'Activity occurs after the trip ends.',
        })
      }

      const activity = await prisma.activity.create({
        data: {
          title,
          occursAt,
          tripId,
        },
      })

      return reply.status(201).send({ activityId: activity.id })
    },
  )
}
