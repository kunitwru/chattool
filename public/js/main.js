var socket = io("https://murmuring-citadel-34522.herokuapp.com/");
var fullName = '';
var socketEmail = '';
$.fn.serializeObject = function() {
    var obj = {};
    var arr = this.serializeArray();
    $.each(arr, function() {
        if (obj[this.name]) {
            if (!obj[this.name].push) {
                obj[this.name] = [obj[this.name]];
            }
            obj[this.name].push(this.value || '');
        } else {
            obj[this.name] = this.value || '';
        }
    });
    return obj;
};

socket.on('SERVER_SEND_DATA', function(data){
    var html = '<li>' + data + '</li>';
    $('#content').append(html);
})
// socket email
socket.on('CLIENT_DANG_KY_STATUS', function(data) {
    if(data) {
        $("#chat-area-off").hide();
        $("#chat-area-on").show();
        var data = $("#register").serializeObject();
        localStorage.setItem("userChat", JSON.stringify(data));
        fullName = data.fullName;
        socketEmail = data.email;
        $("#alert-chat").show().removeClass('alert-danger').addClass('alert-success');
        $("#alert-chat small").html("Đăng ký thành công. Bạn có thể bắt đầu chát.")
    } else {
        $("#alert-dangky").show();
        $("#alert-dangky small").html("Email sử dụng đã được đăng ký")
        $("#chat-area-off").show();
        $("#chat-area-on").hide();
    }
})

socket.on('CLIENT_DANG_KY_COOKIE_STATUS', function(data) {
    $("#alert-chat").show().removeClass('alert-danger').addClass('alert-success');
    $("#alert-chat small").html("Chào mừng bạn quay trở lại.")
})

// get list users
socket.on('SERVER_SEND_LIST_USER', function(data) {
    $("#list-user").html('');
    data.map(function(user) {
        var name = user.fullName.charAt(0);
        var html = '<div class="chat_list active_chat">';
            html += '<div class="chat_people">';
            html += '<div class="chat_img">';
            html += '<span class="name">'+name+'</span>';
            html += '</div>';
            html += '<div class="chat_ib">';
            html += '<h5>'+ user.fullName +'</h5>';
            html += '</div>';
            html += '</div>';
            html += '</div>';
        $("#list-user").append(html);
    })
})

// welcome new user
socket.on('WELCOME_USER_ONLINE', function(data) {
    var html = '<div class="incoming_msg">';
        html += '<div class="incoming_msg_img"> <span title="Server" class="name server">S</span> </div>';
        html += '<div class="received_msg">';
        html += '<div class="received_withd_msg">';
        html += '<p>'+ data +'</p>';
        html += '<span class="time_date">' + new Date().toLocaleString() + '</span>';
        html += '</div>';
        html += '</div>';
        html += '</div>';

    $("#msg_history").append(html);
})
socket.on('SERVER_SEND_DATA', function(data) {
    if (socketEmail == data.socketid) {
        var html = '<div class="outgoing_msg">';
        html += '<div class="sent_msg">';
        html += '<p>'+ data.msg+ '</p>';
        html += '<span class="time_date">' + data.time + '</span>';
        html += '</div>';
        html += '</div>';
    }else {
        var name = data.name.charAt(0);
        var html = '<div class="incoming_msg">';
        html += '<div class="incoming_msg_img"> <span class="name">'+name+'</span> </div>';
        html += '<div class="received_msg">';
        html += '<div class="received_withd_msg">';
        html += '<p>'+ data.msg +'</p>';
        html += '<span class="time_date">' + data.time + '</span>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
    }
    $("#msg_history").append(html);
    scrollChat();
})

function checkExitsUser() {
    var aValue = localStorage.getItem("userChat");
    if(aValue) {
        $("#chat-area-off").hide();
        $("#chat-area-on").show();
        var userData = JSON.parse(aValue);
        socket.emit('CLIENT_DANG_KY_COOKIE', JSON.parse(aValue));
        fullName = userData.fullName;
        socketEmail = userData.email;
        $('#user-current').text('Con zời ' + fullName);
    }
}
function scrollChat() {
    $("#msg_history").animate({ scrollTop: $(document).height() }, "fast")
}

$(document).ready(function() {
    //hidden alert
    setTimeout(function(){
        $('.alert').hide();
    }, 2000)

    socket.on('SERVER_SEND_ALL_DATA', function(data){
        var aValue = localStorage.getItem("userChat");
        if(aValue) {
            var userData = JSON.parse(aValue);
            socketEmail = userData.email;
            $("#msg_history").html('');
            data.map(function(msg) {
                if (socketEmail == msg.socketid) {
                    var html = '<div class="outgoing_msg">';
                    html += '<div class="sent_msg">';
                    html += '<p>'+ msg.msg+ '</p>';
                    html += '<span class="time_date">' + msg.time + '</span>';
                    html += '</div>';
                    html += '</div>';
                }else {
                    var name = msg.name.charAt(0);
                    var html = '<div class="incoming_msg">';
                    html += '<div class="incoming_msg_img"> <span title="'+ msg.name +'" class="name">'+name+'</span> </div>';
                    html += '<div class="received_msg">';
                    html += '<div class="received_withd_msg">';
                    html += '<p>'+ msg.msg +'</p>';
                    html += '<span class="time_date">' + msg.time + '</span>';
                    html += '</div>';
                    html += '</div>';
                    html += '</div>';
                }
                $("#msg_history").append(html);
            })
        }
        scrollChat();
    })


    $("#register").submit(function(e) {
        e.preventDefault();
        var data = $("#register").serializeObject(); 
        socket.emit('CLIENT_DANG_KY', data);
    })
    
    $('form#formEvent').submit(function(e){
        e.preventDefault();
        socket.emit('CLIENT_SEND_DATA', 
            {
                msg : $("#message").val(),
                fullName : fullName
            }
        );
        $("#message").val('');
    })
})