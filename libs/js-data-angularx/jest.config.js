module.exports = {
  name: 'js-data-angularx',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/js-data-angularx',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ],
  setupFilesAfterEnv: ["<rootDir>/src/test-setup.ts"]
};
