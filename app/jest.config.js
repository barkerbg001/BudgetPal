module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ['@testing-library/react-native/matchers'],
};
