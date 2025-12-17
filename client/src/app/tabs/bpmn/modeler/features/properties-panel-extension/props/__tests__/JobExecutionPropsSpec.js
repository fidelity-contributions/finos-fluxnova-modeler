import { expect } from 'chai';
import { JobExecutionProps } from '../JobExecutionProps';

describe('JobExecutionProps', function() {
  it('should call RetryTimeCycle function with correct props', function() {
    const element = {
      businessObject: {
        get: (attr) => (attr === 'camunda:asyncBefore') ? true : undefined,
        $instanceOf: (type) => type === 'camunda:AsyncCapable'
      }
    };
    const props = { element };
    const result = JobExecutionProps(props);
    const hasRetryTimeCycle = result.some(entry => entry.id === 'retryTimeCycle');
    expect(hasRetryTimeCycle).to.be.true;
  });

  it('should call JobPriority function with correct props', function() {
    const element = {
      businessObject: {
        get: (attr) => (attr === 'camunda:asyncBefore') ? true : undefined,
        $instanceOf: (type) => type === 'camunda:JobPriorized'
      }
    };
    const props = { element };
    const result = JobExecutionProps(props);
    const hasJobPriority = result.some(entry => entry.id === 'jobPriority');
    expect(hasJobPriority).to.be.true;
  });

  it('should return empty array if no conditions are met', function() {
    const element = {
      businessObject: {
        get: () => undefined,
        $instanceOf: () => false
      }
    };
    const props = { element };
    const result = JobExecutionProps(props);
    expect(result).to.be.an('array').that.is.empty;
  });

  it('should add both entries for timer event', function() {
    const element = {
      businessObject: {
        get: (attr) => (attr === 'eventDefinitions') ? [ { $type: 'bpmn:TimerEventDefinition', $instanceOf: t => t === 'bpmn:TimerEventDefinition' } ] : undefined,
        $instanceOf: (type) => type === 'bpmn:Event'
      }
    };
    const props = { element };
    const result = JobExecutionProps(props);
    const ids = result.map(e => e.id);
    expect(ids).to.include('retryTimeCycle');
    expect(ids).to.include('jobPriority');
  });

  it('should add jobPriority for bpmn:Process', function() {
    const element = {
      businessObject: {
        get: () => undefined,
        $instanceOf: (type) => type === 'bpmn:Process'
      }
    };
    const props = { element };
    const result = JobExecutionProps(props);
    const hasJobPriority = result.some(entry => entry.id === 'jobPriority');
    expect(hasJobPriority).to.be.true;
  });

  it('should add jobPriority for bpmn:Participant with processRef', function() {
    const element = {
      businessObject: {
        get: (attr) => (attr === 'processRef') ? {} : undefined,
        $instanceOf: (type) => type === 'bpmn:Participant'
      }
    };
    const props = { element };
    const result = JobExecutionProps(props);
    const hasJobPriority = result.some(entry => entry.id === 'jobPriority');
    expect(hasJobPriority).to.be.true;
  });
});
