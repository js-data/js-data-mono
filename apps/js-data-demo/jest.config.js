module.exports = {
  name: 'js-data-demo',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/js-data-demo',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
