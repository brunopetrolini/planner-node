import fastify from 'fastify'
import cors from '@fastify/cors'

import { createTrip } from './routes/create-trip'
import { confirmTrip } from './routes/confirm-trip'
import { confirmParticipant } from './routes/confirm-participant'

const app = fastify()

app.register(cors, {
  origin: '*',
})

app.register(createTrip)
app.register(confirmTrip)
app.register(confirmParticipant)

app
  .listen({ port: 3030 })
  .then((address) => console.log(`Server listening on ${address} 🚀`))
