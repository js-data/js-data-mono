module.exports = {
  name: 'js-data',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/js-data',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
