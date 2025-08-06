// index.test.js
const request = require('supertest'); 
const { app, generateFact } = require('../index'); // Adjust path as needed
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

describe('Express App Integration Tests', () => {
  // Test for the GET / route
  test('GET / should return "random-bitesize"', async () => {
    const response = await request(server).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toMatch(/text\/html/);
    expect(response.text).toContain('random-bitesize');
  });
});


describe('generateFact', () => {
  test('should return a string', () => {
    const fact = generateFact();
    expect(typeof fact).toBe('string');
  });

  test('should return one of the predefined facts', () => {
    const facts = [
      "The shortest war in history lasted 38 minutes.",
      "A group of owls is called a parliament.",
      "Honey never spoils."
    ];
    const fact = generateFact();
    expect(facts).toContain(fact);
  });

  // You might want to mock Math.random for more deterministic tests
  test('should return the first fact when Math.random is mocked', () => {
    const mockMath = Object.create(global.Math);
    mockMath.random = () => 0.0; // Always return 0
    global.Math = mockMath;

    const fact = generateFact();
    expect(fact).toBe("The shortest war in history lasted 38 minutes.");

    // Restore original Math.random
    global.Math = Object.create(global.Math);
  });
});
