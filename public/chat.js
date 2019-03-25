$(function () {
    var socket = io()

    var message = $("#message")
    var username = $("#username")
    var sendMessage = $("#sendMessage")
    var sendUsername = $("#sendUsername")
    var chatroom = $("#chatroom")
    var feedback = $("#feedback")

    sendMessage.click(function () {
        socket.emit('newMessage', { message: message.val() })
    })

    socket.on('initPublicKeys', (data) => {
        var q = data.q
        var alpha = data.alpha

        var id = data.id
        var sockId = data.sockId
        alert(sockId)

        var X = Math.floor(Math.random() * q);
        var Y = Math.pow(alpha, X) % q;

        socket.emit('updateYvals', { Yval: Y, id: id, sockId: sockId })
    })

    socket.on("newMessage", (data) => {
        feedback.html('')
        message.val('')
        chatroom.append("<p class = 'message'>" + data.username + ": " + data.message + "</p")
    })

    sendUsername.click(function () {
        socket.emit('changeUsername', { username: username.val() })
    })

    message.keypress(() => {
        socket.emit('typing', username.val())
    })

    socket.on('typing', (data) => {
        feedback.html("<p><i>" + data.username + " is typing a message..." + "</i></p>")
    })

    socket.on('updateYvals', (data) => {
        var K = Math.pow(Y1, X) % q;
    })
})