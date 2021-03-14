import logger from 'morgan'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import config, { app, env } from '..'

app.set('views', `${rootPath}/views`)
app.set('view engine', 'pug')
app.set('config', config)

app.use((req, res, next) => {
  res.locals.config = config
  res.locals.env = env
  next()
})

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
