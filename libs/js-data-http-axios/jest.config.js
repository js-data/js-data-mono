module.exports = {
  name: 'js-data-http-axios',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/js-data-http-axios',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
