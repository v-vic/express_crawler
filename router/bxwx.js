const express = require('express')
const router = express.Router()

const book = require('../controller/bxwx')

router.get('/getBook',book.getBook)
router.get('/getMore',book.getMore)
router.get('/getContent',book.getContent)
router.get('/getSearch',book.getSearch)

module.exports = router;