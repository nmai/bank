'use strict'

let express = require("express")
let bodyParser = require('body-parser')
let queryParser = require('query-parser-express');
let Account = require('../models/account')

let app = express()
let router = express.Router()

app.use(bodyParser.json())
app.use(queryParser())

router.post('/open', (req, res) => {
  Account.createAccount({
      balance: req.body.balance ? req.body.balance : 0,
      owner_name: req.body.owner_name ? req.body.owner_name : void(0)
    }, (err, acc) => {
      if (err)
        return res.status(400).send({ error: err })
      res.send({
        id: acc._id,
        balance: acc.balance,
        owner_name: acc.owner_name
      })
    })
})

router.delete('/close', (req, res) => {
  Account.closeAccount(req.body.id, (err, data) => {
    if (err)
      return res.status(400)
        .send({ error: err })
      
    res.send({
      id: req.params.id
    })
  })
})

router.get('/account', (req, res) => {
  console.log('queryid: ', req.query.id)
  Account.findOne({ _id: req.query.id }, (err, accountDoc) => {
    if (err)
      return res.status(400)
        .send({ error: err })

    res.send({
      id: accountDoc._id,
      balance: accountDoc.balance,
      owner_name: accountDoc.owner_name
    })
  })
})

router.put('/deposit', (req, res) => {
  Account.deposit(req.body.id, req.body.credit_amount, (err, data) => {
    // this should never be the case except if the data is corrupted
    // or if the database becomes inaccessible
    if (err)
      return res.status(500).send('An unknown error occurred during the deposit operation')

    res.send(data)
  })
})

router.put('/withdraw', (req, res) => {
  Account.withdraw(req.body.id, req.body.debit_amount, (err, data) => {
    // insufficent funds is a common error case
    if (err) {
      if (err.message == 'Insufficient funds')
        return res.status(403).send(err.message)
      else
        return res.status(500).send('An unknown error occurred during the withdraw operation')
    }

    res.send(data)
  })
})

module.exports = router