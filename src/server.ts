import cors from '@fastify/cors'
import fastify from 'fastify'

import { env } from './env'
import { errorHandler } from './error-handler'
import { createActivity, getActivities } from './routes/activities'
import { createLink, getLinks } from './routes/links'
import {
  confirmParticipant,
  createInvite,
  getParticipant,
  getParticipants,
} from './routes/participants'
import {
  confirmTrip,
  createTrip,
  getTripDetails,
  updateTrip,
} from './routes/trips'

const app = fastify()

app.register(cors, {
  origin: '*',
})

app.setErrorHandler(errorHandler)

app.register(createTrip)
app.register(confirmTrip)
app.register(updateTrip)
app.register(getTripDetails)
app.register(createActivity)
app.register(getActivities)
app.register(createLink)
app.register(getLinks)
app.register(createInvite)
app.register(confirmParticipant)
app.register(getParticipants)
app.register(getParticipant)

app
  .listen({ port: env.API_PORT })
  .then((address) => console.log(`Server listening on ${address} 🚀`))
