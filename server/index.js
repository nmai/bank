'use strict'

let express = require('express')
let app = express()
let bodyParser = require('body-parser')
let mongoose = require('mongoose')

let routes = require('./routes')

app.use(
	bodyParser.urlencoded({
    extended : true
	})
)

app.use(bodyParser.json())

mongoose.connect('mongodb://localhost/db')
let db = mongoose.connection

app.use('/api', routes)

app.listen('3000', function(){
	console.log('running on port 3000')
})