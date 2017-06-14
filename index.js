Array.prototype.randomItem = function () {
    return this[Math.floor(Math.random() * this.length)]
}

const fs = require('fs'),
    pkg = require('./package'),
    express = require('express'),
    app = express(),
    port = process.env.PORT || 3000;

app.get('/', randomTopicHtml);
app.get('/json', randomTopicJson);
app.get('/rss', randomTopicRss);
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

function randomTopicRss (req, res) {
		var url = _randomTopic(),
        name = pkg.name,
        description = pkg.description,
				ttl = 1800;

		res.set('Content-Type', 'application/rss+xml');

    res.send('<?xml version="1.0" encoding="utf-8"><rss version="2.0"><channel><title>' + name + '</title><description>' + description + '</description><link>http://random-bitesize.herokuapp.com/</link><ttl>' + ttl + '</ttl><item><title>' + url + '</title><link>' + url + '</link></item></channel></rss>');
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
