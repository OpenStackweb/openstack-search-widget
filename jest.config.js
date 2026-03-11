module.exports = {
    testEnvironment: 'jsdom',
    testMatch: ['<rootDir>/tests/**/*.test.js'],
    transform: {
        '\\.js$': 'babel-jest'
    },
    transformIgnorePatterns: [
        '/node_modules/'
    ]
};
