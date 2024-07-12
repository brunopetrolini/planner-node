import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import dayjs from 'dayjs'
import nodemailer from 'nodemailer'

import { prisma } from '../lib/prisma'
import { getMailClient } from '../lib/mail'

const createTripSchema = z.object({
  destination: z.string().min(4),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  ownerName: z.string(),
  ownerEmail: z.string().email(),
  emailsToInvite: z.array(z.string().email()),
})

export async function createTrip(app: FastifyInstance) {
  app.post('/trips', async (request: FastifyRequest, reply: FastifyReply) => {
    const {
      destination,
      startsAt,
      endsAt,
      ownerName,
      ownerEmail,
      emailsToInvite,
    } = createTripSchema.parse(request.body)

    const isStartsDateBeforeNow = dayjs(startsAt).isBefore(dayjs())
    if (isStartsDateBeforeNow) {
      return reply.status(400).send({ error: 'Invalid start date.' })
    }

    const isEndsDateBeforeStartsDate = dayjs(endsAt).isBefore(startsAt)
    if (isEndsDateBeforeStartsDate) {
      return reply.status(400).send({ error: 'Invalid end date.' })
    }

    const trip = await prisma.trip.create({
      data: {
        destination,
        startsAt,
        endsAt,
        participants: {
          createMany: {
            data: [
              {
                name: ownerName,
                email: ownerEmail,
                isOwner: true,
                isConfirmed: true,
              },
              ...emailsToInvite.map((email) => ({ email })),
            ],
          },
        },
      },
    })

    const mail = await getMailClient()
    const message = await mail.sendMail({
      from: {
        name: 'Trip Planner',
        address: 'oi@plann.er',
      },
      to: {
        name: ownerName,
        address: ownerEmail,
      },
      subject: 'Trip created!',
      html: `<p>Teste do envio de e-mail</p>`,
    })

    console.log(nodemailer.getTestMessageUrl(message))

    return reply.status(201).send({ tripId: trip.id })
  })
}
