import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import nodemailer from 'nodemailer'
import { z } from 'zod'

import { env } from '../../env'
import { NotFoundError } from '../../errors'
import { dayjs, getMailClient, prisma } from '../../lib'

const confirmTripParamsSchema = z.object({
  tripId: z.string().uuid(),
})

export async function confirmTrip(app: FastifyInstance) {
  app.get(
    '/trips/:tripId/confirm',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { tripId } = confirmTripParamsSchema.parse(request.params)

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: {
          participants: {
            where: { isOwner: false },
          },
        },
      })

      if (!trip) {
        throw new NotFoundError('Trip not found.')
      }

      if (trip.isConfirmed) {
        return reply.redirect(`${env.WEB_BASE_URL}/trips/${tripId}`)
      }

      await prisma.trip.update({
        where: { id: tripId },
        data: { isConfirmed: true },
      })

      const formattedStartDate = dayjs(trip.startsAt).format('LL')
      const formattedEndDate = dayjs(trip.endsAt).format('LL')

      const mail = await getMailClient()

      await Promise.all(
        trip.participants.map(async (participant) => {
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
        }),
      )

      return reply.redirect(`${env.WEB_BASE_URL}/trips/${tripId}`)
    },
  )
}
