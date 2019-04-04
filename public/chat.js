$(function () {
    var socket = io()
    var message = $("#message")
    var username = $("#username")
    var sendMessage = $("#sendMessage")
    var sendUsername = $("#sendUsername")
    var chatroom = $("#chatroom")
    var feedback = $("#feedback")
    var encKey = $("#encKey")

    var X = 0
    var q = 0
    var key = 0

    sendMessage.click(function () {
        var encrypted = CryptoJS.AES.encrypt(message.val(), key);
        //alert("Encrypted Value is :" + encrypted);
        encrypted = encrypted.toString();
        socket.emit('newMessage', { message: encrypted })
    })

    socket.on('initPublicKeys', (data) => {
        q = data.q
        var alpha = data.alpha

        var id = data.id
        var sockId = data.sockId

        X = Math.floor(Math.random() * q)
        var Y = Math.pow(alpha, X) % q

        socket.emit('updateYvals', { Yval: Y, id: id, sockId: sockId })
    })

    socket.on("newMessage", (data) => {
        feedback.html('')
        message.val('')
        var msg = data.message
        msg = msg.toString();
        var decrypted = CryptoJS.AES.decrypt(msg, key);
        var dec = decrypted.toString(CryptoJS.enc.Utf8);
        chatroom.append("<p class = 'message'>" + data.username + ": " + dec + "</p")
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

    socket.on('ComputeNextYval', (data) => {
        var Yval = parseInt(data.Yval)
        //alert('Received from ' + data.sourceClientId)
        var newYval = Math.pow(Yval, X) % q
        var ret = parseInt(data.ret) + 1

        setTimeout(function () {
            socket.emit('sendToNextClient', { newYval: newYval, ret: ret, clientId: data.destClientId })
        }, 2000);
    })

    socket.on('AESEncrypt', (data) => {
        key = parseInt(data.Yval)
        key = key.toString();
        encKey.html("<p><i>" + "Encryption Key: " + key + "</i></p>")
    })
})