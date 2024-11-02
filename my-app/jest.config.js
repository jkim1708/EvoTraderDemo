module.exports = {
    transform: {
        "^.+\\.(ts|tsx)$": "babel-jest"
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1'
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};