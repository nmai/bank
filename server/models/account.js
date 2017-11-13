'use strict'

let mongoose = require("mongoose")

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

let account = module.exports = mongoose.model("account", account_schema)

module.exports.createAccount = (accountInfo, callback) => {
  return account.create({
    balance: accountInfo.balance || 0,
    owner_name: accountInfo.owner_name
  }, callback)
}

module.exports.closeAccount = (accountId, callback) => {
  return account.remove({ _id: accountId }, callback)
}

module.exports.deposit = (accountId, creditAmount, callback) => {
  let acc = account.findOne({ _id: accountId }, (err, accountData) => {
    return incrementBalance(acc, accountData, creditAmount, callback)
  })
}

module.exports.withdraw = (accountId, debitAmount, callback) => {
  let acc = account.findOne({ _id: accountId }, (err, accountData) => {
    if (accountData.balance - debitAmount < 0)
      return callback(new Error('Insufficient funds'))

    return incrementBalance(acc, accountData, -debitAmount, callback)
  })
}

/**
 * Moves the near-identical inc/dec operation to a helper func
 * @param  {Object} accountInstance - Mongoose model instance
 * @param  {Object} accountData     - The data behind the model
 * @param  {Number} amount          - accepts negative values too, for withdraw
 */
function incrementBalance(accountInstance, accountData, amount, callback) {
  return accountInstance.update({
    $inc: { balance: amount } 
  }, (err, success) => {
    if (!err && success.ok)
      callback(null, Object.assign(accountData, {
        balance: accountData.balance += amount
      }))
    else
      callback.apply(this, arguments)
  })
}