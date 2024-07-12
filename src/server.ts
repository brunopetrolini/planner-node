import fastify from 'fastify'

import { createTrip } from './routes/create-trip'

const app = fastify()

app.register(createTrip)

app
  .listen({ port: 3030 })
  .then((address) => console.log(`Server listening on ${address} 🚀`))
