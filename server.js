const express = require('express')
const app = express()

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.get('/', (req, res) => {
    res.render('index')
})

const port = 3000 || process.env.PORT

server = app.listen(port)

const io = require('socket.io')(server)

io.on('connection', (socket) => {
    console.log("A user connected")

    socket.username = "AnonymousUser"

    socket.on('changeUsername', (data) => {
        socket.username = data.username
    })

    socket.on('newMessage', (data) => {
        io.sockets.emit('newMessage', { message: data.message, username: socket.username })
    })

    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', { username: socket.username })
    })
})
