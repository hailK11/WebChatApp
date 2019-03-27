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

var clients = {}
var numClients = 0
var clientToDisconnect = null
var disconnectedClientNum = 0
var updateCount = 0

removeClient = function (sockId) {
    for (var client in clients) {
        if (clients[client]['sockId'] == sockId) {
            clientToDisconnect = client
            disconnectedClientNum = client.charAt(6)
        }
    }
    console.log("Disconnected client: " + clientToDisconnect)
    delete clients[clientToDisconnect]
    var toReplaceNum = disconnectedClientNum
    for (var client in clients) {
        if (parseInt(client.charAt(6)) >= disconnectedClientNum) {
            var currNum = client.charAt(6)
            clients['Client' + toReplaceNum] = clients['Client' + currNum]
            delete clients['Client' + currNum]
            toReplaceNum++
        }
    }
    console.log(clients)
}

io.on('connection', (socket) => {
    console.log("A user connected")
    numClients++;
    //console.log(numClients + " connected");
    var id = "Client" + (numClients - 1);
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
        updateCount++;
        console.log('Inside updateYvals')
        var client = {
            sockId: data.sockId,
            Yval: data.Yval
        }
        clients[data.id] = client
        console.log(clients)

        socket.join(data.id)
        var tmp = updateCount
        setTimeout(function () {
            while (tmp == numClients) {
                for (var client in clients) {
                    var currId = client.charAt(6)
                    var nextId = (currId + 1) % numClients

                    console.log('Client' + currId + ' inside timeout')
                    console.log('Computenextval from upd sent to ' + 'Client' + nextId + ' from Client' + currId)
                    io.sockets.in('Client' + nextId).emit('ComputeNextYval', { Yval: clients[client]['Yval'], ret: 0, sourceClientId: 'Client' + currId, destClientId: 'Client' + nextId })
                }
                tmp = 0
            }
        }, 6000)
    })

    socket.on('sendToNextClient', (data) => {
        var newYval = data.newYval
        //console.log('New y from ' + data.clientId + ' : ' + newYval)
        var ret = data.ret
        var clientId = data.clientId
        console.log("ClientID: " + clientId + " Ret: " + ret)
        var clientNum = clientId.charAt(6)
        if (ret == (numClients - 1)) {
            io.sockets.in('Client' + clientNum).emit('AESEncrypt', { Yval: newYval, clientId: clientId })
        }
        else {
            var nextId = (clientNum + 1) % numClients
            console.log('Computenextval sent to ' + 'Client' + nextId + ' from ' + clientId)
            io.sockets.in('Client' + nextId).emit('ComputeNextYval', { Yval: newYval, ret: ret, sourceClientId: clientId, destClientId: 'Client' + nextId })
        }
    })
})
