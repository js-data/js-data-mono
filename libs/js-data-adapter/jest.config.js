module.exports = {
  name: 'js-data-adapter',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/js-data-adapter',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
