'use strict'

var express = require("express")
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var Account = require('../../models/account')

var app = express()
var router = express.Router()
var db = mongoose.connection

app.use(bodyParser.json())

module.exports = router.post('', (req, res) => {
  let payerId = req.body.payer_id
  let payeeId = req.body.payee_id
  let transferAmount = req.body.transfer_amount

  console.log('amount: ', transferAmount)

  let accounts = Account.find({ 
    "$or": [ 
      { _id: payerId },
      { _id: payeeId }
    ]
  }, (err, data) => {
    let payerAccount, payeeAccount

    console.log(data[0]._id, payerId)

    if (data[0]._id == payerId) {
      payerAccount = data[0]
      payeeAccount = data[1]
    } else {
      payerAccount = data[1]
      payeeAccount = data[0]
    }

    if (!payerAccount || !payeeAccount) {
      return res.status(404)
        .send('{ error: "could not find one or both accounts" }')
    }

    console.log("owner name", payerAccount, payeeAccount)

    let fee = payerAccount.owner_name == payeeAccount.owner_name ? 0 : 100
    console.log('calc fee', fee)
    payerAccount.balance -= transferAmount + fee
    payeeAccount.balance += transferAmount

    console.log(payerAccount.balance, "< --- is it too low!!")

    if (payerAccount.balance < 0) {
      return res.status(403)
        .send('{ error: "insufficient funds" }')
    }

    try {
      console.log('trying')
      Account.collection.bulkWrite([
        { updateOne : { "filter" : { _id: payerId }, 'update': payerAccount.toObject() } },
        { updateOne : { "filter" : { _id: payeeId }, 'update': payeeAccount.toObject() } }
      ], (err, success) => {
        return res.status(200).send({
          payer_balance: payerAccount.balance,
          payee_balance: payeeAccount.balance
        })
      })
    } catch(e) {
      console.log('catching', e)
      return res.status(500)
        .send('{ error: "transfer bulk update operation failed" }')
    }
  })
})