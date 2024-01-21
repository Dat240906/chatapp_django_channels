
function createMessage(name, message, is_message_myself) {
// Tạo một div mới với các class và nội dung tương ứng
    var messageDiv = document.createElement("div");
    messageDiv.className = "message br-7 background-container-message pd-lr-6 mg-10px bs animation_message";

    var nameElement = document.createElement("h4");
    if (is_message_myself) {
        nameElement.className = "name color-name-in-message-myself animation_userconnect pd-6";
    } else {
        nameElement.className = "name color-name-in-message animation_userconnect pd-6";
    }
    nameElement.textContent = name;

    var messageElement = document.createElement("p");
    messageElement.className = "message mg-10px fz-1_2em pd-bt-6";
    messageElement.textContent = message;

    // Thêm các phần tử con vào div message
    messageDiv.appendChild(nameElement);
    messageDiv.appendChild(messageElement);

    // Lấy phần tử container-show-message để thêm div message vào
    var containerShowMessage = document.querySelector(".container-show-message");

    // Thêm div message vào container-show-message
    containerShowMessage.appendChild(messageDiv);



    // Thiết lập scrollTop để cuộn xuống đáy container
    containerShowMessage.scrollTop = containerShowMessage.scrollHeight;

}

function updateTotalConnect(total) {
    const total_connect = document.querySelector('.total-connect-js')
    total_connect.textContent = ` Online: ${String(total)}`
    

}

function create_tag_when_user_connect_or_disconnect(username, is_connect_or_disconnect) {
    var containerShowMessage = document.querySelector(".container-show-message");

    var tag_notification = document.createElement('p')
    if (is_connect_or_disconnect) {
        tag_notification.className = 'color-name-in-message-myself animation_userconnect pd-bt-6 mg-10px'
        tag_notification.textContent = `${username} đã tham gia kênh chat`
    }
    else {
        tag_notification.className = 'color-name-in-message-admin animation_userconnect pd-bt-6 mg-10px'
        tag_notification.textContent = `${username} đã rời khỏi kênh chat`
    }
    
    containerShowMessage.appendChild(tag_notification);
    containerShowMessage.scrollTop = containerShowMessage.scrollHeight;

}

//tạo user ở group_icon:hover

function create_remove_UsernameShowWhileHover(username) {
    const container_for_group = document.querySelector('.container_for_group')
    let username_div_container = document.createElement('div')
    let username_p = document.createElement('p')
    let br = document.createElement('br')
    
    username_p.className = 'font-text pd-6 color-white back fz-16px fw-600'
    username_div_container.className = 'container-user backreound-color-container-user mg-10px br-5 dp-inline-bl'

    username_p.textContent = username

    username_div_container.appendChild(username_p)
    container_for_group.appendChild(username_div_container)
    container_for_group.appendChild(br)

        

   
}

function run_create_remove_UsernameShowWhileHover(array) {
    const list_child_for_container_for_group = document.querySelector('.container_for_group').children
    const array_list_child_for_container_for_group = Array.from(list_child_for_container_for_group)
    array_list_child_for_container_for_group.forEach((element) => {

        element.remove()
    })

    

    array.forEach((username) => {
        create_remove_UsernameShowWhileHover(username)
    })
}

let username = '';

while (true) {
    username = prompt('Username: ');

    if (!username ) {
        alert('Nhập lại username khác.');
    }
    else {break}
}
const socket = new WebSocket(
    'wss://'
    + window.location.host
    + '/ws/chat/'
)



// nhận dữ liệu từ server rồi in ra
socket.onmessage = (e) => {
    const data = JSON.parse(e.data)
    let is_message_myself = false
    if (data.total_connect || data.status == 'user_disconnect_and_total_connect') {
        updateTotalConnect(data.total_connect)

        if (data.user_disconnect) {
            create_tag_when_user_connect_or_disconnect(data.user_disconnect, false)
            run_create_remove_UsernameShowWhileHover(data.list_user_connecting)
        }
    }
    if (data.message){
        
        if (data.username == username) {
            is_message_myself = true
        } 
         else  {
            is_message_myself = false
        }
        createMessage(data.username, data.message, is_message_myself)
    }

    if (data.status == 'user_connect') {
        run_create_remove_UsernameShowWhileHover(data.list_user_connecting)
        create_tag_when_user_connect_or_disconnect(data.username, true)
    }
    
  
}
window.addEventListener('beforeunload', function(event) {
    socket.onclose()
});
socket.onopen = (e) => {
    socket.send(JSON.stringify({
        'status':'connect',
        'username':username
    }))

}
// xử lí khi ấn enter cũng là bấnnút send
document.querySelector('#chat-message-input').focus();
document.querySelector('#chat-message-input').onkeyup = function(e) {
    if (e.key === 'Enter') {  // enter, return
        document.querySelector('#chat-message-submit').click();
    }
};

// khi bấn send thì gửi lên server
document.querySelector('#chat-message-submit').onclick = (e) => {
    const messageDOM = document.querySelector('#chat-message-input')
    const message = messageDOM.value
    if (message == '') {return}
    socket.send(JSON.stringify({
        'status':'send_message',
        'username':username,
        'message':message
    }))
    messageDOM.value = ''
}
