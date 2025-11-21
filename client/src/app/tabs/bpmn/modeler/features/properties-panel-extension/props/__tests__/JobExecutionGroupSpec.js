import { createJobExecutionGroup } from '../JobExecutionGroup';

describe('JobExecutionGroup', function() {

  it('should return group with proper structure when element has job execution properties', function() {

    const element = {
      businessObject: {
        get: (attr) => (attr === 'camunda:asyncBefore') ? true : undefined,
        $instanceOf: (type) => type === 'camunda:AsyncCapable'
      }
    };
    const group = createJobExecutionGroup(element);

    expect(group).to.not.be.null;
    expect(group.id).to.equal('job_execution');
    expect(group.label).to.be.a('string');
    expect(group.component).to.be.a('function');
    expect(group.entries).to.be.an('array');

  });

  it('should return null when element has no job execution properties', function() {

    const element = {
      businessObject: {
        $type: 'bpmn:StartEvent'
      }
    };

    const group = createJobExecutionGroup(element);

    expect(group).to.be.null;
  });

  it('should have correct group properties when group is created', function() {

    const element = {
      businessObject: {
        get: (attr) => (attr === 'camunda:asyncBefore') ? true : undefined,
        $instanceOf: (type) => type === 'camunda:AsyncCapable'
      }
    };

    const group = createJobExecutionGroup(element);

    expect(group).to.have.property('id', 'job_execution');
    expect(group).to.have.property('label');
    expect(group).to.have.property('component');
    expect(group).to.have.property('entries');
    expect(group.label).to.be.a('string');
    expect(group.component).to.be.a('function');
    expect(group.entries).to.be.an('array');
  });
});
