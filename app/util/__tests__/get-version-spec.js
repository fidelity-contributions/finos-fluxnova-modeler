const getVersion = require('../get-version');

const { expect } = require('chai');
const sinon = require('sinon');
let baseVersion = require('../../package.json').version;

describe('Check getVersion() function with and witout passing a parameter', function() {
  let origEnv, clock, version;
  baseVersion = baseVersion.split('-')[0];

  beforeEach(function() {
    origEnv = { ...process.env };

    clock = sinon.useFakeTimers();
  });

  afterEach(function() {
    process.env = { ...origEnv };

    clock.restore();
  });

  it('should retrieve version for a "main" branch build', function() {
    process.env.IS_CI = true;
    process.env.BUILD_REF = 'main';
    process.env.BUILD_NUMBER = '123';

    version = getVersion('1.0.0');
    expect(version).to.eql('1.0.0');

    version = getVersion();
    expect(version).to.eql(baseVersion);
  });

  it('should retrieve version for a "develop" branch build', function() {
    process.env.IS_CI = true;
    process.env.BUILD_REF = 'develop';
    process.env.BUILD_NUMBER = '123';

    version = getVersion('1.0.0');
    expect(version).to.eql('1.0.0-b123');

    version = getVersion();
    expect(version).to.eql(baseVersion + '-b123');
  });

  it('should retrieve version for a "release" branch build', function() {
    process.env.IS_CI = true;
    process.env.BUILD_REF = 'release';
    process.env.BUILD_NUMBER = '123';

    version = getVersion('1.0.0');
    expect(version).to.eql('1.0.0-rc123');

    version = getVersion();
    expect(version).to.eql(baseVersion + '-rc123');
  });

  it('should retrieve version for a feature branch build', function() {
    process.env.IS_CI = true;
    process.env.BUILD_REF = 'feature/my-first-feature';
    process.env.BUILD_NUMBER = '123';

    version = getVersion('1.0.0');
    expect(version).to.eql('1.0.0-feature-my-first-feature-b123');

    version = getVersion();
    expect(version).to.eql(baseVersion + '-feature-my-first-feature-b123');
  });

  it('should retrieve default version', function() {
    process.env.IS_CI = false;
    process.env.NIGHTLY = false;

    version = getVersion('1.0.0');
    expect(version).to.eql('1.0.0-dev');

    version = getVersion();
    expect(version).to.eql(baseVersion + '-dev');
  });

  it('should retrieve version for a nightly build', function() {
    process.env.IS_CI = false;
    process.env.NIGHTLY = true;

    const expectedDate = new Date('2025-12-31T12:00:00Z');

    // advance the clock to the expected date
    clock.setSystemTime(expectedDate);

    version = getVersion('1.0.0');
    expect(version).to.eql('1.0.0-nightly.20251231');

    version = getVersion();
    expect(version).to.eql(baseVersion + '-nightly.20251231');
  });
});
