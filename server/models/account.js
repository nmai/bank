'use strict'

let mongoose = require('mongoose')

let account_schema = mongoose.Schema({
  balance: {
    required: true,
    type: Number
  },
  owner_name: {
    required: false,
    type: String
  }
})

let account = module.exports = mongoose.model('account', account_schema)

module.exports.createAccount = (accountInfo) => {
  return account.create({
    balance: accountInfo.balance || 0,
    owner_name: accountInfo.owner_name
  })
}

module.exports.closeAccount = (accountId) => {
  return account.remove({ _id: accountId })
}

module.exports.deposit = (accountId, creditAmount) => {
  // I try to avoid nasty setups like this but I don't think the
  // promise wrapper is easily avoidable. I think the mongoose 
  // object becomes a promise if there is no callback in the arguments.
  // But I am trying to pass on the original instance, while returning
  // a promise at the same time... it is awkward but not terrible.
  return new Promise((resolve, reject) => {

    let acc = account.findOne({ _id: accountId }, (error, accountData) => {
      if (error)
        return promise.reject(error)

      incrementBalance(acc, accountData, creditAmount)
        .then( data => resolve(data) )
        .catch( error => reject(error) )
    })
  })
}

module.exports.withdraw = (accountId, debitAmount) => {
  return new Promise((resolve, reject) => {

    let acc = account.findOne({ _id: accountId }, (err, accountData) => {
      if (accountData.balance - debitAmount < 0)
        return Promise.reject(new Error('Insufficient funds'))

      incrementBalance(acc, accountData, -debitAmount)
        .then( data => resolve(data) )
        .catch( error => reject(error) )
    })
  })
}

/**
 * Moves the near-identical inc/dec operation to a helper func
 * @param  {Object} accountInstance - Mongoose model instance
 * @param  {Object} accountData     - The data behind the model
 * @param  {Number} amount          - accepts negative values too, for withdraw
 */
function incrementBalance(accountInstance, accountData, amount) {
  return accountInstance.update({
    $inc: { balance: amount } 
  }).then( data => Promise.resolve({
    balance: accountData.balance += amount
  }))
}