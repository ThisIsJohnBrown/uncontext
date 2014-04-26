var http = require('http');
var express = require('express');
var app = express();
var port = Number(process.env.PORT || 12097);
console.log('------------------------------- ' + port);
var server = http.createServer(app).listen(port);
var jade = require('jade');
var io = require('socket.io').listen(server);
io.set('log level', 1);

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set("view options", { layout: false });
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.render('home.jade');
});

app.listen(3001);