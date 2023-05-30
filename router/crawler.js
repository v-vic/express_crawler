const express = require('express')
const router = express.Router()

const list = require('../controller/crawler')

router.get('/getList',list.getList)

module.exports = router;