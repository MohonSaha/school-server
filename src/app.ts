import express, { Application, Request, Response } from 'express'
import cors from 'cors'
import router from './app/routes'
import globalErrorHandler from './app/middlewares/globalErrorHandlers'
import notFound from './app/middlewares/notFound'
const app: Application = express()
// const port = 3000;

// parser
app.use(express.json())
app.use(cors())

// application routes
app.use('/api', router)

const test = (req: Request, res: Response) => {
  res.send('Backend Starter Server Is Running....')
}

// Test route
app.get('/', test)

// globalErrorHandlerMiddleware
app.use(globalErrorHandler)
// not found middleware
app.use(notFound)
export default app
