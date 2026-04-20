import { is } from 'bpmn-js/lib/util/ModelUtil';

import {
  ActiveTasksCollectionProps,
  CompletionProps
} from './AdHocSubProcessProps';


export function createAdHocSubProcessGroup(element) {
  if (!is(element, 'bpmn:AdHocSubProcess')) {
    return null;
  }

  const group = {
    id: 'ad_hoc_subprocess',
    label: 'Ad Hoc Subprocess',
    entries: [
      ...ActiveTasksCollectionProps({ element }),
      ...CompletionProps({ element })
    ]
  };

  return group;
}
