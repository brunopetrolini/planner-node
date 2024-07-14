import type { FastifyInstance, FastifyRequest } from 'fastify'
import nodemailer from 'nodemailer'
import { z } from 'zod'

import { env } from '../../env'
import { NotFoundError } from '../../errors'
import { dayjs, getMailClient, prisma } from '../../lib'

const createInviteParamsSchema = z.object({
  tripId: z.string().uuid(),
})

const createInviteBodySchema = z.object({
  email: z.string().email(),
})

export async function createInvite(app: FastifyInstance) {
  app.post('/trips/:tripId/invite', async (request: FastifyRequest) => {
    const { tripId } = createInviteParamsSchema.parse(request.params)
    const { email } = createInviteBodySchema.parse(request.body)

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
    })

    if (!trip) {
      throw new NotFoundError('Trip not found.')
    }

    const participant = await prisma.participant.create({
      data: { email, tripId },
    })

    const formattedStartDate = dayjs(trip.startsAt).format('LL')
    const formattedEndDate = dayjs(trip.endsAt).format('LL')

    const mail = await getMailClient()

    const confirmationLink = `${env.API_BASE_URL}/participants/${participant.id}/confirm`

    const message = await mail.sendMail({
      from: {
        name: 'Equipe plann.er',
        address: 'oi@plann.er',
      },
      to: participant.email,
      subject: `Confirme sua presença na viagem para ${trip.destination} em ${formattedStartDate}`,
      html: `
        <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
          <p>Você convidado(a) para participar de uma viagem para <strong>${trip.destination}</strong> nas datas de <strong>${formattedStartDate}</strong> a <strong>${formattedEndDate}</strong>.</p>
          <p></p>
          <p>para confirmar sua presença viagem, clique no link abaixo:</p>
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

    return { participantId: participant.id }
  })
}
