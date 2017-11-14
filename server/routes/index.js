'use strict'

let express = require('express')
let request = require('request-promise-native')

let accounts = require('./accounts')
let transfers = require('./transfers')

let app = express()
let router = express.Router()

router.post('/accounts/open/', accounts.open)
router.delete('/accounts/close', accounts.close)
router.get('/accounts/account_status', accounts.fetchAccount)
router.put('/accounts/deposit', accounts.deposit)
router.put('/accounts/withdraw', accounts.withdraw)
router.post('/transfers/submit_transfer', transfers.transfer)

module.exports = router