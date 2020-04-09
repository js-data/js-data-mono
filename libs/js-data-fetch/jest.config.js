module.exports = {
  name: 'js-data-fetch',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/js-data-fetch',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
