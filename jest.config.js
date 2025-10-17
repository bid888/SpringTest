module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/server.test.js'],
  coveragePathIgnorePatterns: ['/node_modules/', '/client/'],
  testPathIgnorePatterns: ['/node_modules/', '/client/']
};
