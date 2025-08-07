// index.test.js
const request = require('supertest'); 
const { app, generateFact } = require('../index'); // Adjust path as needed
const bbcBitesizeUrl = /https?:\/\/www.bbc.co.uk\/[bitesize|education]/;
const port = 3001;

beforeAll((done) => {
  server = app.listen(port, () => {
    console.log(`Test server started on port ${port}`);
    done(); // Call done() to signal that asynchronous setup is complete
  });
});

afterAll((done) => {
  server.close(() => {
    console.log('Test server stopped.');
    done(); // Call done() to signal that asynchronous teardown is complete
  });
});



describe('Unit Tests', () => {
  

});

describe('App Status', () => {
  
   test('GET /status should return JSON response', async () => {
    const response = await request(server).get('/status');
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(response.body).toHaveProperty('name', 'random-bitesize');
    expect(response.body).toHaveProperty('version');
    expect(response.body['version']).not.toBeUndefined();
  });

});

describe('Default Behaviour', () => {
  
  test('GET / should return "random-bitesize"', async () => {
    const response = await request(server).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toMatch(/text\/html/);
    expect(response.text).toContain('random-bitesize');
  });
  
  test('GET /json should return JSON format', async () => {
    const response = await request(server).get('/json');
    expect(response.headers['content-type']).toMatch(/application\/json/);
  });

  test('GET /rss should respond with RSS format', async () => {
    const response = await request(server).get('/rss');
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toMatch(/application\/rss\+xml/);
  });

  test('GET /go should return redirect user to BBC Bitesize', async () => {
    const response = await request(server).get('/go');
    expect(response.statusCode).toBe(302);
    expect(response.headers['location']).toMatch(bbcBitesizeUrl);
  });

});

describe('"Daily" mode Behaviour', () => {

  test('GET /daily should return "random-bitesize"', async () => {
    const response = await request(server).get('/daily');
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toMatch(/text\/html/);
    expect(response.text).toContain('random-bitesize'); 
  });

  test('GET /daily/go should redirect user to BBC Bitesize', async () => {
    const response = await request(server).get('/daily/go');
    expect(response.statusCode).toBe(302);
    expect(response.headers).toHaveProperty('location');
    expect(response.headers['location']).toMatch(bbcBitesizeUrl);
  });
  
  test('GET /daily/rss should return RSS format response', async () => {
    const response = await request(server).get('/daily/rss');
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toMatch(/application\/rss\+xml/);
  });
    
});
