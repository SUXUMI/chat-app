var socket = io();

function scrollToBottom () {
  var messages = document.getElementById('messages');
  var allMessages = messages.querySelectorAll('.message');
  var newMessage = allMessages[allMessages.length - 1];
  var lastMessage = allMessages[allMessages.length - 2];

  var clientHeight = messages.clientHeight;
  var scrollTop = messages.scrollTop;
  var scrollHeight = messages.scrollHeight;
  var newMessageHeight = newMessage ? newMessage.clientHeight : 0;
  var lastMessageHeight = lastMessage ? lastMessage.clientHeight : 0;

  if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
    messages.scrollBy(0, scrollHeight);
  }
}

socket.on('connect', function () {
    console.log('Connected to server');
})

socket.on('disconnect', function () {
    console.log('Connection is down');
})

socket.on('newMessage', function (message) {
    var formattedDate = new moment(message.createdAt).format('h:mm a')
    addMessage({
      from: message.from,
      text: message.text,
      date: formattedDate
    });
})

socket.on('newLocationMessage', function (message) {
  var formattedDate = new moment(message.createdAt).format('h:mm a')
  addLocationMessage({
    from: message.from,
    url: message.url,
    date: formattedDate
  })
})

function addMessage(message) {
  var template = document.getElementById('message-template').innerHTML;
  var html = Mustache.render(template, message);

  var messages = document.getElementById('messages');
  messages.insertAdjacentHTML('beforeend', html);
  scrollToBottom()
}

function addLocationMessage(message) {
  var template = document.getElementById('location-message-template').innerHTML;
  var html = Mustache.render(template, message);

  var messages = document.getElementById('messages');
  messages.insertAdjacentHTML('beforeend', html);
  scrollToBottom()
}

document.getElementById('messages-form')
  .addEventListener('submit', function (e) {
      e.preventDefault();
      var messageInput = this.message;

      if (!messageInput.value.length) {
        return;
      }

      socket.emit('createMessage', {
          from: 'User',
          text: messageInput.value
      }, function (message) {
        messageInput.value = '';
      })
  })

locationButton = document.getElementById('send-location')
locationButton
  .addEventListener('click', function () {
    if (!navigator.geolocation) {
      alert('geolocation is not supported by your browser.')
    }

    locationButton.setAttribute('disabled', 'disabled')
    locationButton.innerText = 'Sending location...'

    navigator.geolocation.getCurrentPosition(function (position) {
      locationButton.removeAttribute('disabled')
      locationButton.innerText = 'Send location'

      socket.emit('createLocationMessage', {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      })
    }, function () {
      locationButton.removeAttribute('disabled')
      locationButton.innerText = 'Send location'
      alert('Unable to fetch the location')
    })
  })
