module.exports = {
  name: 'js-data-adapter',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/js-data-adapter',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
