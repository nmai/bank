'use strict'

let should = require('should')
let supertest = require('supertest')
let server = supertest.agent('http://localhost:3000')

should.Assertion.add('number', (val) => {
  return !!Number(val)
})


describe('POST, DELETE Open/Close Accounts: ', () => {

  let openedAccountId;
  
  describe('POST account open request: ', () => {  
    let balance = 3

    it('should return 200 and data match format',(done) => {
      server.post('/api/accounts/open')
        .send({balance: balance})
        .expect('Content-type',/json/)
        .expect(200)
        .end((err,res) => {
          res.status.should.equal(200)
          res.body.should.have.property('balance').which.is.a.Number()
          res.body.should.have.property('id')
          openedAccountId = res.body.id
          done()
        })
    })
  })

  describe('DELETE account close request: ', () => {  
    it('should return 200',(done) => {
      server.delete('/api/accounts/close')
        .send({id: openedAccountId})
        .expect('Content-type',/json/)
        .expect(200)
        .end((err,res) => {
          res.status.should.equal(200)
          done()
        })
    })
  })
})

describe('GET, PUT basic account access', () => {

  let accountTemplate = {
    balance: 100
  }

  let currentAccountID

  beforeEach((done) => {
    server.post('/api/accounts/open')
      .send({ balance: accountTemplate.balance })
      .end((err,res) => {
        currentAccountID = res.body.id
        done()
      })
  })

  afterEach((done) => {
    server.delete('/api/accounts/close')
      .send({ id: currentAccountID })
      .end((err, res) => {
        currentAccountID = void(0)
        done()
      })
  })

  describe('GET account balance request: ', () => {  
    it('should return balance in correct format',(done) => {
      server.get('/api/accounts/account_status')
        .query({ id: currentAccountID })
        .send()
        .expect('Content-type',/json/)
        .expect(200)
        .end((err,res) => {
          res.body.should.have.property('balance').which.equals(accountTemplate.balance)
          done()
        })
    })
  })

  describe('PUT update account balance (withdraw): ', () => {
    let debitAmount = 40

    it('should return success and correct new balance',(done) => {
      server.put('/api/accounts/withdraw')
        .send({ 
          id: currentAccountID, 
          debit_amount: debitAmount
        })
        .expect('Content-type',/json/)
        .expect(200)
        .end((err,res) => {
          res.body.should.have.property('balance').which.equals(accountTemplate.balance - debitAmount)
          done()
        })
    })
  })

  describe('PUT update account balance (deposit): ', () => {
    let creditAmount = 30

    it('should return success and correct new balance',(done) => {
      server.put('/api/accounts/deposit')
        .send({ 
          id: currentAccountID, 
          credit_amount: creditAmount
        })
        .expect('Content-type',/json/)
        .expect(200)
        .end((err,res) => {
          res.body.should.have.property('balance').which.equals(accountTemplate.balance + creditAmount)
          done()
        })
    })
  })
})

describe('POST account transfer: ', () => {

  let accountJohn1 = {
    balance: 70,
    owner_name: 'John'
  }

  let accountJohn2 = {
    balance: 300,
    owner_name: 'John'
  }

  let accountBob = {
    balance: 20,
    owner_name: 'Bob'
  }

  let accountMary = {
    balance: 500,
    owner_name: 'Mary'
  }

  let currentAccountID

  beforeEach((done) => {
    let markedComplete = 0
    let taskDone = () => {
      markedComplete++
      if (markedComplete == 4)
        done()
    }

    server.post('/api/accounts/open')
      .send({
        balance: accountJohn1.balance,
        owner_name: accountJohn1.owner_name
      })
      .end((err,res) => {
        accountJohn1.id = res.body.id
        taskDone()
      })

    server.post('/api/accounts/open')
      .send({
        balance: accountJohn2.balance,
        owner_name: accountJohn2.owner_name
      })
      .end((err,res) => {
        accountJohn2.id = res.body.id
        taskDone()
      })

    server.post('/api/accounts/open')
      .send({
        balance: accountBob.balance,
        owner_name: accountBob.owner_name
      })
      .end((err,res) => {
        accountBob.id = res.body.id
        taskDone()
      })

    server.post('/api/accounts/open')
      .send({
        balance: accountMary.balance,
        owner_name: accountMary.owner_name
      })
      .end((err,res) => {
        accountMary.id = res.body.id
        taskDone()
      })
  })

  afterEach((done) => {
    let markedDone = 0
    let taskDone = () => {
      markedDone++
      if (markedDone == 4)
        done()
    }

    server.delete('/api/accounts/close')
      .send({ id: accountJohn1.id })
      .end(() => taskDone())

    server.delete('/api/accounts/close')
      .send({ id: accountJohn2.id })
      .end(() => taskDone())

    server.delete('/api/accounts/close')
      .send({ id: accountBob.id })
      .end(() => taskDone())

    server.delete('/api/accounts/close')
      .send({ id: accountMary.id })
      .end(() => taskDone())
  })

  describe('POST transfer funds to another account (same owner): ', () => {

    it('given sufficient funds, should return success and correct new balance',done => {
      let transferAmount = 50

      server.post('/api/transfers/submit_transfer')
        .send({ 
          payer_id: accountJohn1.id,
          payee_id: accountJohn2.id,
          transfer_amount: transferAmount
        })
        .expect('Content-type',/json/)
        .expect(200)
        .end((err, res) => {
          res.status.should.equal(200)

          res.body.should.have.property('payer_balance').which.equals(accountJohn1.balance - transferAmount)
          res.body.should.have.property('payee_balance').which.equals(accountJohn2.balance + transferAmount)
          done()
        })
    })

    it('given insufficient funds, should return error', done => {
      let transferAmount = 100

      server.post('/api/transfers/submit_transfer')
        .send({ 
          payer_id: accountJohn1.id,
          payee_id: accountJohn2.id,
          transfer_amount: transferAmount
        })
        .expect('Content-type',/json/)
        .expect(403)
        .end((err, res) => {
          res.status.should.equal(403)
          done()
        })
    })
  })

  describe('POST transfer funds to another account (different owner): ', () => {
    it('given sufficient funds, should return success and correct new balance',done => {
      let transferAmount = 50

      server.post('/api/transfers/submit_transfer')
        .send({ 
          payer_id: accountMary.id,
          payee_id: accountJohn2.id,
          transfer_amount: transferAmount
        })
        .expect('Content-type',/json/)
        .expect(200)
        .end((err,res) => {
          res.status.should.equal(200)
          res.body.should.have.property('payer_balance').which.equals(accountMary.balance - transferAmount - 100)
          res.body.should.have.property('payee_balance').which.equals(accountJohn2.balance + transferAmount)
          done()
        })
    })

    it('given insufficient funds, should error', done => {
      let transferAmount = 10

      server.post('/api/transfers/submit_transfer')
        .send({ 
          payer_id: accountBob.id,
          payee_id: accountJohn1.id,
          transfer_amount: transferAmount
        })
        .expect('Content-type',/json/)
        .expect(403)
        .end((err,res) => {
          res.status.should.equal(403)
          done()
        })
    })
  })
})