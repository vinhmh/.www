import express from 'express'
import queryString from 'querystring'
import cors from 'cors'
import { parseString } from 'xml2js'
import sha1 from 'sha1'
import config, { confMap } from '../config'
import { getMeetings, getMeetingInfo } from '../services/bbb'

const router = express.Router()

const bbbJoin = async (fullName, meetingID) => {
  const { bbb_secret, host } = config
  let joinUrl
  let password

  const join = () => {
    if (meetingID && password && meetingID.length && password.length) {
      const query = queryString.stringify({ fullName, meetingID, password })
      const checksum = sha1(`join${query}${bbb_secret}`)
      joinUrl = `${host}/join?${query}&checksum=${checksum}`
    }
    return { joinUrl }
  }

  if (!meetingID) return join()

  const meetingQuery = `meetingID=${meetingID}`
  try {
    const { data } = await getMeetingInfo(meetingQuery)
    if (data.response) {
      const { returncode, message } = data.response
      if (returncode === 'FAILED') {
        throw new Error(message)
      }
    }
    password = await new Promise((resolve, reject) => parseString(data, { explicitRoot: false, explicitArray: false },
      (err, parsed) => (!err ? resolve(parsed.moderatorPW) : reject(err))))
    return join()
  } catch (err) {
    console.error(err)
    return { error: `There isn't an active meeting with ID ${meetingID}. Please retry with an existing meeting.` }
  }
}

const render = async (req, res, template, locals) => {
  const data = await getMeetings()
  parseString(data.data, { explicitRoot: false, explicitArray: false }, (err, data) => {
    let meetings = []
    if (!err) {
      meetings = Array.isArray(data.meetings) ? data.meetings : [data.meetings]
    } else {
      console.error(err)
    }

    return res.render(template, { ...meetings, ...locals })
  })
}

router.get('/', async (req, res) => {
  if (['citeo.ibridgepeople.fr'].indexOf(req.hostname) !== -1) {
    const meeting = confMap.meetings.Citeo19062019
    const conferences = meeting.conferences.filter(c => c.accessible)
    if (conferences.length === 1) {
      const conference = conferences[0]
      return res.redirect(`${config.webphoneUrl}?cf1=${conference.number}&username=citeo_user&meetingID=Citeo19062019`)
    }

    return render(req, res, 'app/connect/citeo')
  }
  if (['citeo.ibridgepeople.fr'].indexOf(req.hostname) !== -1) {
    const meeting = confMap.meetings.Citeo19062019
    const conferences = meeting.conferences.filter(c => c.accessible)
    if (conferences.length === 1) {
      const conference = conferences[0]
      return res.redirect(`${config.webphoneUrl}?cf1=${conference.number}&username=demo_user&meetingID=Citeo19062019`)
    }

    return render(req, res, 'app/connect/sustain')
  }
  res.redirect('/connect')
})

router.get('/connect', (req, res) => {
  const { meetingID, language1, name } = req.query
  return render(req, res, 'app/connect/regular', { meetingID, language1, name })
})

router.get('/connect/coordinator', (req, res) => {
  const { meetingID, language1, name, coordinator } = req.query
  return render(req, res, 'app/connect/coordinator', { meetingID, language1, name, coordinator })
})

router.get('/showcase', (req, res) => render(req, res, 'app/connect/showcase'))

router.get('/demo', (req, res) => render(req, res, 'app/connect/demo'))

router.get('/connect/interpreter', (req, res) => {
  const { meetingID, language1, language2, password, name } = req.query
  return render(req, res, 'app/connect/interpreter', { meetingID, language1, language2, password, name })
})

router.get('/connect/tablet', (req, res) => {
  const { meetingID, name } = req.query
  return render(req, res, 'app/connect/tablet', { meetingID, name })
})

router.get('/connect/multimedia', (req, res) => {
  const { meetingID, name } = req.query
  return render(req, res, 'app/connect/multimedia', { meetingID, name })
})

router.use('/bbbPage', (req, res) => {
  const { joinUrl } = req.query
  return res.render('app/bbbPage', { joinUrl })
})

router.get('/listDevices', (req, res) => res.sendFile('public/media_devices.html', { root: config.rootPath }))

router.post('/meetingConferences', cors(), (req, res) => {
  const { title, role } = req.body
  const meeting = confMap.meetings[title]
  if (!meeting) return res.json(null)

  const map = meeting.conferences.filter(c => role !== 'regular' || c.accessible)
  res.json(map)
})

router.get('/getMeetingData', async (req, res) => {
  const { meetingID, username, secretToken } = req.query
  if (secretToken !== config.secretToken) return res.status(404)

  const meeting = confMap.meetings[meetingID]
  const response = { meeting }

  if (username) {
    const bbb = await bbbJoin(username, meetingID)
    response.bbb = bbb
  }

  res.json(response)
})

export default router
