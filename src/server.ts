import fastify from 'fastify'
import cors from '@fastify/cors'

import { createTrip } from './routes/create-trip'
import { confirmTrip } from './routes/confirm-trip'
import { confirmParticipant } from './routes/confirm-participant'
import { createActivity } from './routes/create-activity'
import { getActivities } from './routes/get-activities'

const app = fastify()

app.register(cors, {
  origin: '*',
})

app.register(createTrip)
app.register(confirmTrip)
app.register(confirmParticipant)
app.register(createActivity)
app.register(getActivities)

app
  .listen({ port: 3030 })
  .then((address) => console.log(`Server listening on ${address} 🚀`))
