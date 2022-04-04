module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    // moduleNameMapper: {
    //   "@exmpl/(.*)": "<rootDir>/src/$1"
    // },
    testMatch: ["**/**/*.test.ts"],
    verbose:true,
    forceExit: true,
  };