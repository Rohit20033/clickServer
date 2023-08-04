const mongoose = require('mongoose')



const connection = mongoose.connect(process.env.mongoUrl)
module.exports = {connection}