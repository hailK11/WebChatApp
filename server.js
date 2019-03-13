const express = require('express')
const app = express()

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.get('/', (req, res) => {
    res.render('index')
})

///app.use('/js', express.static('/node_modules/bootstrap/dist/js'));
//app.use('/css', express.static('/node_modules/bootstrap/dist/css'));

const port = process.env.PORT || 3000

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
