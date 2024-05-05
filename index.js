const express = require('express')

const app = express()

const port = 5001

app.get('/', (req, res) => {
    res.send('Hello, Lolo v5 Backend!')
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})