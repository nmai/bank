'use strict'

let Account = require('../../models/account')

module.exports.open = (req, res) => {
  Account.createAccount({
      balance: req.body.balance ? req.body.balance : 0,
      owner_name: req.body.owner_name ? req.body.owner_name : void(0)
    }).then( acc => {
      res.send({
        id: acc._id,
        balance: acc.balance,
        owner_name: acc.owner_name
      })
    })
    .catch( err => res.status(400).send({ error: err }) )
}

module.exports.close = (req, res) => {
  Account.closeAccount(req.body.id)
    .then( data => {
      res.send({
        id: req.params.id
      })
    })
    .catch( err => res.status(400).send({ error: err }) )
}

module.exports.fetchAccount = (req, res) => {
  Account.findOne({ _id: req.query.id })
    .then( data => {
      res.send({
        id: data._id,
        balance: data.balance,
        owner_name: data.owner_name
      })
    })
    .catch( err => res.status(400).send({ error: err }) )
}

module.exports.deposit = (req, res) => {
  Account.deposit(req.body.id, req.body.credit_amount)
    .then( data => res.send(data) )
    .catch( err => res.status(500).send('An unknown error occurred during the deposit operation') )
}

module.exports.withdraw = (req, res) => {
  Account.withdraw(req.body.id, req.body.debit_amount)
    .then( data => res.send(data) )
    .catch( err => {
      if (err.message == 'Insufficient funds')
        return res.status(403).send(err.message)
      else
        return res.status(500).send('An unknown error occurred during the withdraw operation')
    })
}
