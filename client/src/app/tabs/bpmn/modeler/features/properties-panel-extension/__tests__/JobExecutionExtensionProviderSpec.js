import { expect } from 'chai';
import sinon from 'sinon';
import JobExecutionExtensionProvider from '../JobExecutionExtensionProvider';

describe('JobExecutionExtensionProvider', function() {
  let propertiesPanel;

  beforeEach(function() {
    propertiesPanel = { registerProvider: sinon.spy() };
  });

  it('should register provider with propertiesPanel', function() {
    new JobExecutionExtensionProvider(propertiesPanel);
    expect(propertiesPanel.registerProvider.calledOnce).to.be.true;
    expect(propertiesPanel.registerProvider.firstCall.args[0]).to.equal(100);
  });

  describe('#getGroups', function() {
    let provider, createJobExecutionGroupStub;

    beforeEach(function() {
      createJobExecutionGroupStub = sinon.stub();
      provider = new JobExecutionExtensionProvider(propertiesPanel, createJobExecutionGroupStub);
    });

    it('should remove existing CamundaPlatform__JobExecution group', function() {
      const groups = [
        { id: 'CamundaPlatform__JobExecution', entries: [] },
        { id: 'other', entries: [] }
      ];
      const getGroups = provider.getGroups({});
      const result = getGroups(groups);
      expect(result.find(g => g.id === 'CamundaPlatform__JobExecution')).to.be.undefined;
    });

    it('should not add job_execution group if already present', function() {
      const groups = [
        { id: 'job_execution', entries: [] },
        { id: 'other', entries: [] }
      ];
      const getGroups = provider.getGroups({});
      const result = getGroups(groups);
      expect(result.filter(g => g.id === 'job_execution').length).to.equal(1);
      expect(createJobExecutionGroupStub.called).to.be.false;
    });

    it('should add job_execution group if not present and group is created', function() {
      createJobExecutionGroupStub.returns({ id: 'job_execution', entries: [] });
      const groups = [
        { id: 'other', entries: [] },
        { id: 'another', entries: [] }
      ];
      const getGroups = provider.getGroups({});
      const result = getGroups(groups);
      expect(result.find(g => g.id === 'job_execution')).to.exist;
    });

    it('should not add job_execution group if createJobExecutionGroup returns null', function() {
      createJobExecutionGroupStub.returns(null);
      const groups = [
        { id: 'other', entries: [] },
        { id: 'another', entries: [] }
      ];
      const getGroups = provider.getGroups({});
      const result = getGroups(groups);
      expect(result.find(g => g.id === 'job_execution')).to.not.exist;
    });

    it('should insert job_execution group after adjacent group', function() {
      createJobExecutionGroupStub.returns({ id: 'job_execution', entries: [] });
      const groups = [
        { id: 'foo', entries: [] },
        { id: 'CamundaPlatform__AsynchronousContinuations', entries: [] },
        { id: 'bar', entries: [] }
      ];
      const getGroups = provider.getGroups({});
      const result = getGroups(groups);
      const jobExecutionIndex = result.findIndex(g => g.id === 'job_execution');
      const asyncIndex = result.findIndex(g => g.id === 'CamundaPlatform__AsynchronousContinuations');
      expect(jobExecutionIndex).to.equal(asyncIndex + 1);
    });
  });
});
