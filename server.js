/*
	Caching API (get doang) NodeJS pake redis
	biar cepet.. hehe
	author : muhammad yusup
*/

//'use strict';

const express = require('express')
const app = express()
const axios = require('axios')
const redis = require('redis')
const bluebird = require('bluebird')
const client = redis.createClient()

bluebird.promisifyAll(redis)

client.on('connect', () => {
	console.log("Connected to default rediss server")
})

async function getPosts(req,res){
	let idx = req.query.idx
	let hasilnya = ""

	await axios.get(`https://jsonplaceholder.typicode.com/posts/${idx}`)
	.then(resp => hasilnya = resp.data)
	.then(() => client.set(idx.toString(), JSON.stringify(hasilnya)))
	.catch(err=> res.send(err))
	.finally(() => res.send(hasilnya))
}

const cache = (req,res,next) => {
	let idx = req.query.idx

	client.get(idx.toString(), (err, value) => {
		if (err) {
			throw err
		} else {
			if (value != null){
				res.send(value)	
			} else {
				next()
			}
		}
	})
}

app.get('/posts', cache, getPosts)
//app.get('/test', test)

app.listen(3000, function () {
    console.log('node-redis app listening on port 3000!')
})