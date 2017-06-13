Array.prototype.randomItem = function () {
    return this[Math.floor(Math.random() * this.length)]
}

const fs = require('fs'),
    express = require('express'),
    app = express(),
    port = process.env.PORT || 3000;

app.get('/', randomTopic);
app.get('/status', status);
console.log('Started on http://localhost:' + port + ' (Ctrl-C to quit)');
app.listen(port);

function randomTopic (req, res) {
    var folder = 'data/curriculum-data/',
        allTurtles = fs.readdirSync(folder),
        randomTurtle = allTurtles.randomItem(),
        fileContents = fs.readFileSync(folder + randomTurtle, {encoding: 'utf8'}),
        re = /(http:\/\/www\.bbc\.co\.uk\/education\/topics[^#]+)/ig,
        found = fileContents.match(re) || [],
        randomFind = found.randomItem();

    res.json({randomTopic: randomFind});
}

function status (req, res) {
    var pkg = require('./package'),
        version = pkg.version,
        name = pkg.name;

    res.json({name, version});
}
