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
})