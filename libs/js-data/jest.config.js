module.exports = {
  name: 'js-data',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/js-data',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
