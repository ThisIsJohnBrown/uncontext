var WebSocket = require('ws'); // npm install ws

ws = new WebSocket('ws://literature.uncontext.com');

ws.on('message', function(message) {
    console.log(message);
});