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

var clients = {};
var numClients = 0;
var numClientObjects = 0;
var clientToDisconnect = null

removeClient = function (sockId) {
    for (var client in clients) {
        if (clients[client]['sockId'] == sockId)
            clientToDisconnect = client
    }
    console.log("Disconnected client: " + clientToDisconnect)
    delete clients[clientToDisconnect]
    console.log(clients)
}

io.on('connection', (socket) => {
    console.log("A user connected")
    numClients++;
    numClientObjects++;
    //console.log(numClients + " connected");
    var id = "Client" + numClientObjects;
    socket.emit('initPublicKeys', { q: 23, alpha: 5, id: id, sockId: socket.id })

    socket.on('disconnect', function () {
        console.log("A user disconnected")
        numClients--;
        //console.log(numClients + " connected");
        console.log(socket.id + " is disconnecting")
        removeClient(socket.id);
    })

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

    socket.on('updateYvals', (data) => {
        var client = {
            sockId: data.sockId,
            Yval: data.Yval
        }
        clients[data.id] = client
        console.log(clients)

        socket.join(data.id)
    })
})
