module.exports = {
  name: 'js-data-http-node',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/js-data-http-node',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
