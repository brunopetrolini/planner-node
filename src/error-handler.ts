import type { FastifyInstance } from 'fastify'
import { ZodError } from 'zod'
import { ClientError } from './errors/client'
import { NotFoundError } from './errors/not-found'

type FastifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler: FastifyErrorHandler = (error, _, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      statusCode: 400,
      message: 'Invalid input.',
      details: error.flatten().fieldErrors,
    })
  }

  if (error instanceof NotFoundError) {
    return reply.status(404).send({
      statusCode: 404,
      message: error.message,
    })
  }

  if (error instanceof ClientError) {
    return reply.status(400).send({
      statusCode: 400,
      message: error.message,
    })
  }

  return reply.status(500).send({
    statusCode: 500,
    message: 'Internal server error.',
    stack: error.stack,
  })
}
