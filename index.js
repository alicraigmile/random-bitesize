
const fs = require('fs'),
    pkg = require('./package'),
    express = require('express'),
    NodeCache = require( "node-cache" ),
    myCache = new NodeCache();
    app = express(),
    ttl = 60*60*24,
    port = process.env.PORT || 3000;

let rndm = (x) => x[Math.floor(Math.random() * x.length)];

app.get('/', randomTopicHtml);
app.get('/json', randomTopicJson);
app.get('/rss', randomTopicRss);
app.get('/daily', randomTopicDaily);
app.get('/daily/go', randomTopicDailyRedirect);
app.get('/daily/rss', randomTopicDailyRss);
app.get('/go', randomTopicRedirect);
app.get('/status', status);

// index.js
function generateFact() {
  const facts = [
    "The shortest war in history lasted 38 minutes.",
    "A group of owls is called a parliament.",
    "Honey never spoils."
  ];
  return rndm(facts);
}


function _randomTopic () {
    var folder = 'data/curriculum-data/',
        allTurtles = fs.readdirSync(folder),
        randomTurtle = rndm(allTurtles),
        fileContents = fs.readFileSync(folder + randomTurtle, {encoding: 'utf8'}),
        re = /(http:\/\/www\.bbc\.co\.uk\/education\/topics[^#]+)/ig,
        found = fileContents.match(re) || [],
        randomFind = rndm(found);

    return randomFind;
}

function randomTopicHtml (req, res) {
        var url = _randomTopic(),
            title = "A random bitesize page",
            listItems =  [{url: url, title: title}]; //there can only be one

        _sendHtml(req,res,listItems);
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

var _sendHtml = function(req, res, items) {
    var html = '',
        name = pkg.name,
        description = pkg.description;

    html = '<!DOCTYPE html><html><body><h1>' + name + '</h1><p>' + description + '</p><ul>';
    items.forEach(function(item) {
        html += '<li><a href="' + item.url + '">' + item.title + '</a></li>';
    });
    html += '</ul><a href="https://github.com/alicraigmile/random-bitesize"><img style="position: absolute; top: 0; right: 0; border: 0;" src="https://camo.githubusercontent.com/a6677b08c955af8400f44c6298f40e7d19cc5b2d/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f677261795f3664366436642e706e67" alt="Fork me on GitHub" data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png"></a></body></html>';

    res.set('Content-Type', 'text/html');
    res.send(html);
}


function randomTopicRss (req, res) {
    var url = _randomTopic(),
        title = "A random bitesize page",
        rssItems =  [{url: url, title: title}]; //there can only be one

    _sendRss(req, res, rssItems);
}

function randomTopicDaily (req, res) {
       const cacheKey = '24hrs',
             cacheUpdate = function() {
                var url = _randomTopic(),
                    title = "Today's random bitesize page";
                return [{url:url, title:title}];
             };

        myCache.get(cacheKey, function(err, value) {
            if (!err)
                if(value == undefined) {
                    value = cacheUpdate();
                    myCache.set(cacheKey, value, ttl, function(err, success) {
                        if (!err && success) {
                            _sendHtml(req,res,value);
                        } else {
                            req.send('error');
                        }
                    });
                } else {
                    _sendHtml(req,res,value);
                }
                    
    });
}


function randomTopicDailyRss (req, res) {
       const cacheKey = '24hrs',
             cacheUpdate = function() {
                var url = _randomTopic(),
                    title = "Today's random bitesize page";
                return [{url: url, title: title}];
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

function randomTopicDailyRedirect (req, res) {
       const cacheKey = '24hrs',
             cacheUpdate = function() {
                var url = _randomTopic(),
                    title = "Today's random bitesize page";
                return [{url: url, title: title}];
             };

        myCache.get(cacheKey, function(err, value) {
            if (!err)
                if(value == undefined) {
                    value = cacheUpdate();
                    myCache.set(cacheKey, value, ttl, function(err, success) {
                        if (!err && success) {
                            _sendRss(req,res,value);
                            res.redirect(value[0].url);
                        } else {
                            req.send('error');
                        }
                    });
                } else {
                    res.redirect(value[0].url);
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


module.exports = { generateFact,  app };

// Only start the server if this file is run directly (not imported by tests)
if (require.main === module) {
//console.log('Started on http://localhost:' + port + ' (Ctrl-C to quit)');
//app.listen(port);
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
}
