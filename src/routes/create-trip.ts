import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import nodemailer from 'nodemailer'

import { prisma } from '../lib/prisma'
import { getMailClient } from '../lib/mail'
import { dayjs } from '../lib/dayjs'

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

    const formattedStartDate = dayjs(startsAt).format('LL')
    const formattedEndDate = dayjs(endsAt).format('LL')

    const confirmationLink = `http://localhost:3030/trips/${trip.id}/confirm`

    const mail = await getMailClient()
    const message = await mail.sendMail({
      from: {
        name: 'Equipe plann.er',
        address: 'oi@plann.er',
      },
      to: {
        name: ownerName,
        address: ownerEmail,
      },
      subject: `Confirme sua viagem para ${destination} em ${formattedStartDate}`,
      html: `
        <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
          <p>Você solicitou a criação de uma viagem para <strong>${destination}</strong> nas datas de <strong>${formattedStartDate}</strong> a <strong>${formattedEndDate}</strong>.</p>
          <p></p>
          <p>para confirmar sua viagem, clique no link abaixo:</p>
          <p></p>
          <p>
            <a href="${confirmationLink}" target="_blank">Confirmar viagem</a>
          </p>
          <p></p>
          <p>Caso você não saiba do que se trata, apenas ignore esse e-mail</p>
        </div>
      `.trim(),
    })

    console.log(nodemailer.getTestMessageUrl(message))

    return reply.status(201).send({ tripId: trip.id })
  })
}
