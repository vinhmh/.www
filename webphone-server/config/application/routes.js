import express from 'express'
import auth from 'http-auth'
import * as Routes from '../../routes'
import { app, env } from '..'

const basic = auth.basic({ realm: 'SUPER SECRET STUFF' },
  (username, password, callback) => callback(username === 'admin' && password === 'webphone'))

const authMiddleware = auth.connect(basic)

app.use('/', Routes.app)
app.use('/admin', authMiddleware, Routes.admin)
app.use('/bbb', Routes.bbb)

if (env.development) {
  app.use(express.static(`${rootPath}/public`))
}

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
app.use((err, req, res, next) => {
  res.locals.message = err.message
  res.locals.error = err

  res.status(err.status || 500)
  res.render('shared/error')
})
