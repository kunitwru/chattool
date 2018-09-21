var express = require('express')
var app = express()
app.set('view engine', 'ejs')
app.set('views', './views')
app.use(express.static('public'))
var server = require('http').Server(app)

var io = require('socket.io')(server)

server.listen(3001)
app.get('/', function(req, res) {
    res.render('home');
})
var emailList = [];
var userList = [];
var msgUserChat = [];
// socket start
io.on("connection", function(socket) {
    // client đăng ký
    socket.on('CLIENT_DANG_KY', function(data) {
        if(emailList.indexOf(data.email) > -1) {
            socket.emit('CLIENT_DANG_KY_STATUS', true);
        } else {
            socket.phong = data.email;
            socket.fullName = data.fullName;
            emailList.push(data.email);
            userList.push(data);
            socket.broadcast.emit('WELCOME_USER_ONLINE', 'Chào mừng thành viên mới <b>' + data.fullName + '</b>');
            socket.emit('CLIENT_DANG_KY_STATUS', true);
        }
        io.sockets.emit('SERVER_SEND_LIST_USER', userList)
    });

    socket.on('CLIENT_DANG_KY_COOKIE', function(data) {
        if(emailList.indexOf(data.email) > -1) {
            socket.emit('CLIENT_DANG_KY_COOKIE_STATUS', true);
        } else {
            emailList.push(data.email);
            userList.push(data);
            socket.emit('CLIENT_DANG_KY_COOKIE_STATUS', true);
        }
        socket.phong = data.email;
        socket.fullName = data.fullName;
        socket.broadcast.emit('WELCOME_USER_ONLINE', 'Chào mừng <b>' + data.fullName + '</b> trở lại')
        io.sockets.emit('SERVER_SEND_LIST_USER', userList)
    })

    // lắng nghe sự kiên client send data
    socket.on('CLIENT_SEND_DATA', function(data){
        var socketid = socket.id;
        var obj = {
            socketid : socket.phong,
            msg : data.msg,
            name : data.fullName,
            time : new Date().toLocaleString()
        }
        msgUserChat.push(obj);
        io.sockets.emit('SERVER_SEND_DATA', obj); // phát toàn server
    })

    io.sockets.emit('SERVER_SEND_ALL_DATA', msgUserChat);
    socket.on("disconnect", function() {
        
    })
});
// socket end
app.get('/about', function(req, res) {
    res.send('I am Sinh')
})

app.get('/product/:a/:b', function(req, res) {
    var number1 = parseInt(req.params.a);
    var number2 = parseInt(req.params.b);
    var sum = number1 + number2;
    res.send('Ket qua : ' + (number1 + number2));
})