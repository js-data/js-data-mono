module.exports = {
  name: 'js-data-angularx',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/js-data-angularx',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
