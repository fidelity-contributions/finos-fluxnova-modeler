import { createAdHocSubProcessGroup as defaultAdHocSubProcessGroup } from './props/AdHocSubProcessGroup';


export default class AdHocSubProcessExtensionProvider {

  constructor(propertiesPanel, createAdHocSubProcessGroup = defaultAdHocSubProcessGroup) {
    propertiesPanel.registerProvider(100, this);
    this.createAdHocSubProcessGroup = createAdHocSubProcessGroup;
  }

  getGroups(element) {
    return groups => {

      const extendedAdHocGroup = groupExists(groups, 'ad_hoc_subprocess');

      groups = groups.slice();

      if (extendedAdHocGroup === -1) {
        const adHocSubProcessGroup = this.createAdHocSubProcessGroup(element);
        if (adHocSubProcessGroup) {
          let adjacentIndex = groups.length - 2;
          groups.forEach((group, index) => {
            if (isAdjacentGroup(group)) {
              adjacentIndex = index + 1;
            }
          });

          groups.splice(adjacentIndex, 0, adHocSubProcessGroup);
        }
      }

      return groups;
    };
  }
}

AdHocSubProcessExtensionProvider.$inject = [ 'propertiesPanel' ];

function isAdjacentGroup(group) {
  // Position after subprocess-specific groups
  const adjacentGroupIds = [
    'CamundaPlatform__Subprocess',
    'subprocess'
  ];
  return adjacentGroupIds.includes(group.id);
}

function groupExists(groups, groupId) {
  return groups.reduce((acc, group, index) => {
    return groupId === group.id ? index : acc;
  }, -1);
}
