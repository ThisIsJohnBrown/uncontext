var http = require('http');
var express = require('express');
var app = express();
var port = Number(process.env.PORT || 12097);
console.log('------------------------------- ' + port);
var server = http.createServer(app).listen(port);
var io = require('socket.io').listen(server);
var fs = require('fs');
io.set('log level', 1);

app.set('views', __dirname + '/views');

app.set('view engine', 'html');
app.set('view engine', 'mustache');
app.engine('html', require('hogan-middleware').__express);
app.engine('mustache', require('hogan-middleware').__express);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  return res.render('home.html', {datasets: datasets});
});

var datasets = [];
var sets = fs.readdirSync(__dirname + '/scenes/');
for (var i = 0;i < sets.length; i++) {
  if (sets[i].substr(0, 1) !== '.') {
    datasets[sets[i]] = [];
    app.get('/' + sets[i], function(req, res){
      return res.render(req.url.substr(1) + '.mustache', {datasets: datasets});
    });
    var scenes = fs.readdirSync(__dirname + '/scenes/' + sets[i]);
    var sceneArray = [];
    for (var j = 0; j < scenes.length; j++) {
      if (scenes[j].substr(0, 1) !== '.') {
        sceneArray.push(scenes[j].split('.')[0]);
      }
    }
    datasets.push({
      name: sets[i],
      slugs: sceneArray
    })
  }
}

app.get('/:dataset/:slug', function(req, res){

  var file = __dirname + '/scenes/' + req.params.dataset + '/' + req.params.slug + '.json';
  fs.readFile(file, 'utf8', function (err, data) {
    try {
      data = JSON.parse(data);
    } catch (e) {
      data = {};
    }
    if (!data.slug) {
      return res.render('404.mustache');
    }
    data.datasets = datasets;
    if (data.youtube) {
      res.render('youtube.mustache', data, function(err, html) {
        res.send(html);
      });
    } else if (data.vimeo) {
      res.render('vimeo.mustache', data, function(err, html) {
        res.send(html);
      });
    } else {
      res.render(req.params.dataset + '/' + req.params.slug + '.mustache', function(err, html) {
        if (!err) {
          data.content = html;
        }
        res.render('creations.mustache', data, function(err, html2) {
          res.send(html2);
        });
      });
    }


  });
});

app.listen(3001);