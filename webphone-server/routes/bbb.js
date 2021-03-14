import express from 'express'
import queryString from 'querystring'
import { getMeetings, createMeeting, endMeeting, joinMeetingUrl } from '../services/bbb'

const router = express.Router()

const makeRequest = (request, res, next) => request()
  .then((response) => {
    res.send(response.data)
  })
  .catch((error) => {
    console.log(error)
    next()
  })

router.use('/getMeetings', (req, res, next) => {
  const send = () => getMeetings()
  return makeRequest(send, res, next)
})

router.use('/create', (req, res, next) => {
  const query = queryString.stringify(req.query)
  const send = () => createMeeting(query)
  return makeRequest(send, res, next)
})

router.use('/end', (req, res, next) => {
  const query = queryString.stringify(req.query)
  const send = () => endMeeting(query)
  return makeRequest(send, res, next)
})

router.use('/join', (req, res, next) => {
  const query = queryString.stringify(req.query)
  return res.send(joinMeetingUrl(query))
})

export default router
