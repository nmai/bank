'use strict'

var express = require("express")
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var request = require('request-promise-native')
var Account = require('../../models/account')

var app = express()
var router = express.Router()
var db = mongoose.connection

app.use(bodyParser.json())

module.exports = router.post('', (req, res) => {
  let payerId = req.body.payer_id
  let payeeId = req.body.payee_id
  let transferAmount = req.body.transfer_amount

  Account.find({ 
    "$or": [ 
      { _id: payerId },
      { _id: payeeId }
    ]
  }).then( async function(data) {
    let payerAccount = data[data[0]._id == payerId ? 0 : 1]
    let payeeAccount = data[data[0]._id != payerId ? 0 : 1]

    if (!payerAccount || !payeeAccount) {
      return res.status(404)
        .send('{ error: "could not find one or both accounts" }')
    }

    let isSameOwner = Boolean(payerAccount.owner_name == payeeAccount.owner_name)
    let fee = isSameOwner ? 0 : 100
    payerAccount.balance -= transferAmount + fee
    payeeAccount.balance += transferAmount

    let transferApproved = isSameOwner ? true : await fetchApproval()

    if (!transferApproved)
      return res.status(403).send('{ error: "external transfer denied" }')
    else if (payerAccount.balance < 0)
      return res.status(403).send('{ error: "insufficient funds" }')

    Account.collection.bulkWrite([
      { updateOne : { "filter" : { _id: payerId }, 'update': payerAccount.toObject() } },
      { updateOne : { "filter" : { _id: payeeId }, 'update': payeeAccount.toObject() } }
    ]).then( data => {
      return res.status(200).send({
        payer_balance: payerAccount.balance,
        payee_balance: payeeAccount.balance
      })
    }).catch( error => {
      return res.status(500)
        .send('{ error: "transfer bulk update operation failed" }')
    })
  }).catch( error => {
    return res.status(500)
      .send(error)
  })
})

function fetchApproval() {
  return request('http://handy.travel/test/success.json')
    .then( res =>
      new Promise( resolve =>
        resolve(Boolean(JSON.parse(res).status == 'success'))
      )
    )
}