import fastify from 'fastify'
import cors from '@fastify/cors'

import { createTrip } from './routes/create-trip'
import { confirmTrip } from './routes/confirm-trip'

const app = fastify()

app.register(cors, {
  origin: '*',
})

app.register(createTrip)
app.register(confirmTrip)

app
  .listen({ port: 3030 })
  .then((address) => console.log(`Server listening on ${address} 🚀`))
