export default {
  displayName: '@oss-maintainer-helper/agent',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: {
          module: 'NodeNext',
          moduleResolution: 'NodeNext'
        }
      }
    ]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: 'test-output/jest/coverage',
};
