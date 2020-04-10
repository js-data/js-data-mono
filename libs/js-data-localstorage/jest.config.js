module.exports = {
  name: 'js-data-localstorage',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/js-data-localstorage',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
