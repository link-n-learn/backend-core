require('dotenv').config()

const { urlencoded } = require('express')
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose');
const app = express()

mongoose.connect(process.env.MONGO_URI);

app.use(cors())
app.use(express.json())
app.use(urlencoded({extended : false}))

const authRoutes = require('./Routes/auth')
app.use('/auth' , authRoutes)



app.use((err , req , res , next)=>{
    console.log(err)
    res.status(500).json({err : "Something went wrong. Internal error"})
})

app.all('*' , (req , res)=>{
    res.status(404).json({err : "Resource not found"})
})

const httpPort = process.env.HTTP_PORT || 3000; 

//Http server listen
app.listen(httpPort , ()=>{
    console.log(`App is listening on port ${httpPort}`)
})