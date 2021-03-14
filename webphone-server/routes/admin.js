import express from 'express'
import { confMap } from '../config'

const router = express.Router()

router.get('/', (req, res) => res.render('admin/admin', { title: 'Admin' }))
router.get('/monitor', (req, res) => res.render('admin/monitor'))
router.get('/switcher', (req, res) => res.render('admin/switcher'))
router.get('/confMap', (req, res) => res.send(confMap))

export default router
