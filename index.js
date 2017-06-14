Array.prototype.randomItem = function () {
    return this[Math.floor(Math.random() * this.length)]
}

const fs = require('fs'),
    pkg = require('./package'),
    express = require('express'),
    NodeCache = require( "node-cache" ),
    myCache = new NodeCache();
    app = express(),
    ttl = 60*60*24,
    port = process.env.PORT || 3000;

app.get('/', randomTopicHtml);
app.get('/json', randomTopicJson);
app.get('/rss', randomTopicRss);
app.get('/daily/rss', randomTopicDailyRss);
app.get('/go', randomTopicRedirect);
app.get('/status', status);
console.log('Started on http://localhost:' + port + ' (Ctrl-C to quit)');
app.listen(port);

function _randomTopic () {
    var folder = 'data/curriculum-data/',
        allTurtles = fs.readdirSync(folder),
        randomTurtle = allTurtles.randomItem(),
        fileContents = fs.readFileSync(folder + randomTurtle, {encoding: 'utf8'}),
        re = /(http:\/\/www\.bbc\.co\.uk\/education\/topics[^#]+)/ig,
        found = fileContents.match(re) || [],
        randomFind = found.randomItem();

    return randomFind;
}

function randomTopicHtml (req, res) {
		var url = _randomTopic(),
        name = pkg.name,
        description = pkg.description;
    res.send('<body><h1>' + name + '</h1><p>' + description + '</p><h2>Random topic</h2><ul><li><a href="' + url + '">' + url + '</a></li></ul></body>');
}

var _sendRss = function(req, res, items) {
    var rss = '';

    rss = '<?xml version="1.0" encoding="utf-8"?><rss version="2.0"><channel><title>' + pkg.name + '</title><description>' + pkg.description + '</description><link>http://random-bitesize.herokuapp.com/</link><ttl>' + ttl + '</ttl>';
    items.forEach(function(item) {
        rss += '<item><title>' + item.title + '</title><link>' + item.url + '</link></item>';
    });
    rss += '</channel></rss>';

    res.set('Content-Type', 'application/rss+xml');
    res.send(rss);
}

function randomTopicRss (req, res) {
    var url = _randomTopic(),
        title = "A random bitesize page",
        rssItems =  [{url, title}]; //there can only be one

    _sendRss(req, res, rssItems);
}

function randomTopicDailyRss (req, res) {
       const cacheKey = '24hrs',
             cacheUpdate = function() {
                var url = _randomTopic(),
                    title = "Today's random bitesize page";
                return [{url, title}];
             };

        myCache.get(cacheKey, function(err, value) {
            if (!err)
                if(value == undefined) {
                    value = cacheUpdate();
                    myCache.set(cacheKey, value, ttl, function(err, success) {
                        if (!err && success) {
                            _sendRss(req,res,value);
                        } else {
                            req.send('error');
                        }
                    });
                } else {
                    _sendRss(req,res,value);
                }
                    
    });
}

function randomTopicJson (req, res) {
		var url = _randomTopic();
    res.json({randomTopic: url});
}

function randomTopicRedirect (req, res) {
		var url = _randomTopic();
    res.redirect(url);
}

function status (req, res) {
    var version = pkg.version,
        name = pkg.name;

    res.json({name, version});
}
