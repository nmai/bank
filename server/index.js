'use strict'

let express = require("express")
let app = express()
let bodyParser = require("body-parser")
let mongoose = require("mongoose")

let accounts = require('./routes/accounts')
let transfer = require('./routes/accounts/transfer')

app.use(
	bodyParser.urlencoded({
    extended : true
	})
)

app.use(bodyParser.json())

mongoose.connect('mongodb://localhost/db')
let db = mongoose.connection

app.use('/api/accounts', accounts)
app.use('/api/accounts/transfer', transfer)

app.listen("3000", function(){
	console.log("running on port 3000")
})