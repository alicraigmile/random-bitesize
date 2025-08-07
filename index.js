
const fs = require('fs'),
    pkg = require('./package'),
    express = require('express'),
    NodeCache = require( "node-cache" ),
    myCache = new NodeCache();
    app = express(),
    ttl = 60*60*24,
    port = process.env.PORT || 3000,
    rndm = (x) => x[Math.floor(Math.random() * x.length)],
    strings = {
        'forkMeOnGithub': 'Fork me on GitHub',
        'aRandomBitesizeTopic': 'A random bitesize topic',
        'todaysRandomBitesizeTopic': "Today's random bitesize topic",
        'githubUrl': "https://github.com/alicraigmile/random-bitesize",
        'appUrl': 'http://random-bitesize.herokuapp.com/'
    };


const randomTopic = () => {
    const folder = 'data/curriculum-data/',
        allTurtles = fs.readdirSync(folder),
        randomTurtle = rndm(allTurtles),
        fileContents = fs.readFileSync(folder + randomTurtle, {encoding: 'utf8'}),
        re = /(http:\/\/www\.bbc\.co\.uk\/education\/topics[^#]+)/ig,
        found = fileContents.match(re) || [],
        randomFind = rndm(found);
    return randomFind;
}

const randomTopicHtml = (req, res) => {
        const url = randomTopic(),
            title = strings.aRandomBitesizeTopic,
            listItems =  [{url: url, title: title}]; //there can only be one

        sendHtml(req,res,listItems);
}

const sendRss = (req, res, items) => {
    let rss = '';

    rss = `<?xml version="1.0" encoding="utf-8"?><rss version="2.0"><channel><title>${pkg.name}</title><description>${pkg.description}</description><link>${strings.appUrl}</link><ttl>${ttl}</ttl>`;
    items.forEach((item) => {
        rss += `<item><title>${item.title}</title><link>${item.url}</link></item>`;
    });
    rss += `</channel></rss>`;

    res.set('Content-Type', 'application/rss+xml');
    res.send(rss);
}

const sendHtml = (req, res, items) => {
    const name = pkg.name,
        description = pkg.description;
    
    let html = '';

    html = `<!DOCTYPE html><html><body><h1>${name}</h1><p>${description}</p><ul>`;
    items.forEach((item) => {
        html += `<li><a href="${item.url}">${item.title}</a></li>`;
    });
    html += `</ul><a href="${strings.githubUrl}"><img style="position: absolute; top: 0; right: 0; border: 0;" src="https://camo.githubusercontent.com/a6677b08c955af8400f44c6298f40e7d19cc5b2d/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f677261795f3664366436642e706e67" alt="${strings.forkMeOnGithub}" data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png"></a></body></html>`;

    res.set('Content-Type', 'text/html');
    res.send(html);
}
 

const randomTopicRss = (req, res) => {
    const url = randomTopic(),
        title = strings.aRandomBitesizeTopic,
        rssItems =  [{url: url, title: title}]; //there can only be one

    sendRss(req, res, rssItems);
}

const randomTopicDaily = (req, res) => {
       const cacheKey = '24hrs',
             cacheUpdate = () => {
                const url = randomTopic(),
                    title = strings.todaysRandomBitesizeTopic;
                return [{url:url, title:title}];
             };

        myCache.get(cacheKey, (err, value) => {
            if (!err)
                if(value == undefined) {
                    value = cacheUpdate();
                    myCache.set(cacheKey, value, ttl, (err, success) => {
                        if (!err && success) {
                            sendHtml(req,res,value);
                        } else {
                            req.send('error');
                        }
                    });
                } else {
                    sendHtml(req,res,value);
                }
                    
    });
}

const randomTopicDailyRss = (req, res) => {
       const cacheKey = '24hrs',
             cacheUpdate = () => {
                const url = randomTopic(),
                    title = strings.todaysRandomBitesizeTopic;
                return [{url: url, title: title}];
             };

        myCache.get(cacheKey, (err, value) => {
            if (!err)
                if(value == undefined) {
                    value = cacheUpdate();
                    myCache.set(cacheKey, value, ttl, (err, success) => {
                        if (!err && success) {
                            sendRss(req,res,value);
                        } else {
                            req.send('error');
                        }
                    });
                } else {
                    sendRss(req,res,value);
                }

    });
}

const randomTopicDailyRedirect = (req, res) => {
       const cacheKey = '24hrs',
             cacheUpdate = () => {
                const url = randomTopic(),
                    title = strings.todaysRandomBitesizeTopic;
                return [{url: url, title: title}];
             };

        myCache.get(cacheKey, (err, value) => {
            if (!err)
                if(value == undefined) {
                    value = cacheUpdate();
                    myCache.set(cacheKey, value, ttl, (err, success) => {
                        if (!err && success) {
                            sendRss(req,res,value);
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

const randomTopicJson = (req, res) => {
	const url = randomTopic();
    res.json({randomTopic: url});
}

const randomTopicRedirect = (req, res) => {
	const url = randomTopic();
    res.redirect(url);
}

const status = (req, res) => {
    const version = pkg.version,
        name = pkg.name;

    res.json({name, version});
}

// index.js
app.get('/', randomTopicHtml);
app.get('/json', randomTopicJson);
app.get('/rss', randomTopicRss);
app.get('/daily', randomTopicDaily);
app.get('/daily/go', randomTopicDailyRedirect);
app.get('/daily/rss', randomTopicDailyRss);
app.get('/go', randomTopicRedirect);
app.get('/status', status);

module.exports = { randomTopic,  app };

// Only start the server if this file is run directly (not imported by tests)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
}
