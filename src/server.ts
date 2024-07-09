import fastify from 'fastify'

const app = fastify()

app.get('/health', () => {
  return { status: 'ok' }
})

app
  .listen({ port: 3030 })
  .then((address) => console.log(`Server listening on ${address} 🚀`))
