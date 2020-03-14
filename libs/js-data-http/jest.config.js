module.exports = {
  name: 'js-data-http',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/js-data-http',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
