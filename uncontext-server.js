require('newrelic');
var http = require('http');
var express = require('express');
var app = express();
var port = Number(process.env.PORT || 5001);
var server = http.createServer(app).listen(port);
var fs = require('fs');
var client;

if (process.env.REDISCLOUD_URL) {
  var redis = require('redis');
  var url = require('url');
  var redisURL = url.parse(process.env.REDISCLOUD_URL);
  client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
  client.auth(redisURL.auth.split(":")[1]);
}

app.set('views', __dirname + '/views');

app.set('view engine', 'html');
app.set('view engine', 'mustache');
app.engine('html', require('hogan-middleware').__express);
app.engine('mustache', require('hogan-middleware').__express);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  return res.render('home.mustache', {datasets: datasets, homepage: true});
});

app.get('/submit/', function(req, res) {
  return res.render('submit.mustache', {submit: true})
});

app.get('/submit-project/', function(req, res) {
  if (client) {
    var key = req.query.title + '-' + new Date().getTime();
    client.set(key, JSON.stringify(req.query), redis.print);
  }

  return res.send('success!');
});

app.get('/literature/', function(req, res) {
  return res.render('submissions.mustache', {datasets: datasets});
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
    scenes.sort(function(a, b) {
         return fs.statSync(__dirname + '/scenes/' + sets[i] + '/' + b).mtime.getTime() - 
                fs.statSync(__dirname + '/scenes/' + sets[i] + '/' + a).mtime.getTime();
     });
    var sceneArray = [];
    for (var j = 0; j < scenes.length; j++) {
      if (scenes[j].substr(0, 1) !== '.' && scenes[j] !== 'staging') {
        var data = JSON.parse(fs.readFileSync(__dirname + '/scenes/' + sets[i] + '/' + scenes[j]).toString());
        var displayLink = '';
        if (data.twitter) {
          displayLink = 'http://twitter.com/' + data.twitter;
        } else if (data.url) {
          displayLink = data.url;
        }
        sceneArray.push({
          'slug': scenes[j].split('.')[0],
          'author': data.creator,
          'title': data.name,
          'link': displayLink
        });
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
        if (!data.assets) {
          data.assets = {};
        }
        data.submission = true;
        if (fs.existsSync(__dirname + '/public/js/' + req.params.dataset + '/' + req.params.slug + '.js')) {
          data.assets.js = true;
        }
        if (fs.existsSync(__dirname + '/public/css/' + req.params.dataset + '/' + req.params.slug + '.css')) {
          data.assets.css = true;
        }
        res.render('creations.mustache', data, function(err, html2) {
          res.send(html2);
        });
      });
    }


  });
});

app.listen(3001);