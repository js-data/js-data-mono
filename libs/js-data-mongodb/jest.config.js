module.exports = {
  name: 'js-data-mongodb',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/js-data-mongodb',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
