import { getBpmnDefinitionsForConversion, getDmnDefinitionsForConversion } from '../../../util/xmlConversion';
import { is } from './namespace';
import Metadata from '../../../util/Metadata';
import { toBpmnXml, toDmnXml } from '../../../util/xmlConversion';
import { ENGINES, getLatestStable } from '../../../util/Engines';
import { Type } from './type';
import { XMLValidator } from 'fast-xml-parser';

const NAMESPACE_URI_BPMN_FLOWAVE = 'http://flowave.finos.org/schema/1.0/bpmn';
const NAMESPACE_URI_DMN_FLOWAVE = 'http://flowave.finos.org/schema/1.0/dmn';
const NAMESPACE_URI_MODELER = 'http://flowave.finos.org/schema/modeler/1.0';
const EXECUTION_PLATFORM_FLOWAVE = 'Flowave Platform';
const NAMESPACE_URI_C8 = 'http://camunda.org/schema/zeebe/1.0';
const EXECUTION_PLATFORM_C8 = 'Camunda Cloud';

export async function convertBpmnToFlowaveIfRequired(contents, onAction, onContentUpdated) {
  const entity = await convertToFlowaveIfRequired(contents, Type.BPMN, onAction);
  const result = getConvertedResult(entity, onContentUpdated);
  return result || contents;
}

export async function convertDmnToFlowaveIfRequired(contents, onAction, onContentUpdated) {
  const entity = await convertToFlowaveIfRequired(contents, Type.DMN, onAction);
  const result = getConvertedResult(entity, onContentUpdated);
  return result || contents;
}

export async function convertFormToFlowaveIfRequired(contents, onAction) {
  const entity = await convertToFlowaveIfRequired(contents, Type.FORM, onAction);
  const result = getConvertedResult(entity);
  return result || contents;
}

async function convertToFlowaveIfRequired(contents, type, onAction) {
  if (isConversionCandidate(contents, type)) {
    return await handleFlowaveConversion(contents, type, onAction);
  }
  return contents;
}

async function handleFlowaveConversion(contents, type, onAction) {
  const isC8Model = is(contents, NAMESPACE_URI_C8, EXECUTION_PLATFORM_C8);
  let dialog = isC8Model ? getFlowaveUnsupportedDialog() : getFlowaveConversionDialog(type);
  const { button } = await onAction('show-dialog', dialog);

  if (button === '0') {
    const result = await convertToFlowave(contents, type);
    return {
      result,
      converted: true
    };
  } else {
    await onAction('close-tab');
    return {
      converted: false
    };
  }
}

function isConversionCandidate(contents, type) {
  const ns = type === Type.BPMN ? NAMESPACE_URI_BPMN_FLOWAVE : NAMESPACE_URI_DMN_FLOWAVE;
  return isEntityValid(contents, type) && !is(contents, ns, EXECUTION_PLATFORM_FLOWAVE);
}

function getFlowaveConversionDialog(type) {
  return {
    type: 'error',
    title: `Unsupported ${type} file detected`,
    buttons: [
      { id: '0', label: 'Yes' },
      { id: '1', label: 'Close File' }
    ],
    message: `Would you like to migrate your ${type} file to be Flowave compatible? `,
    detail: [
      'This modeler only supports Flowave files.',
      'Please make sure to have a backup of this file before migrating.',
    ].join('\n')
  };
}

function getFlowaveUnsupportedDialog() {
  return {
    type: 'error',
    title: 'Unsupported Camunda 8 file detected',
    buttons: [
      { id: '2', label: 'Close File' }
    ],
    message: 'Camunda 8 files are unsupported in Flowave',
    detail: [
      'This modeler only supports Flowave files.',
    ].join('\n')
  };
}

function getConvertedResult(entity, onContentUpdated) {
  if (entity.converted) {
    const result = entity.result;
    if (onContentUpdated) {
      onContentUpdated(result);
    }
    return result;
  }
  return null;
}

async function convertToFlowave(contents, type) {
  const latestStable = getLatestStable(ENGINES.FLOWAVE);
  if ([ Type.BPMN, Type.DMN ].includes(type)) {
    return await handleConversionForXml(contents, type, latestStable);
  } else {
    return handleConversionForJson(contents, latestStable);
  }
}

async function handleConversionForXml(contents, type, latestStable) {
  let convertedXml;
  try {
    if (type === Type.BPMN) {
      const definitions = await getBpmnDefinitionsForConversion(contents);
      definitions.$attrs['xmlns:flowave'] = NAMESPACE_URI_BPMN_FLOWAVE;
      const updatedDefinitions = updateCommonAttributesForXml(definitions, latestStable);
      convertedXml = await toBpmnXml(updatedDefinitions);
    } else {
      const definitions = await getDmnDefinitionsForConversion(contents);
      definitions.namespace = NAMESPACE_URI_DMN_FLOWAVE;
      const updatedDefinitions = updateCommonAttributesForXml(definitions, latestStable);
      convertedXml = await toDmnXml(updatedDefinitions);
    }
    return convertedXml.xml;
  } catch (error) {
    throw new Error('Error converting model to Flowave');
  }
}

function handleConversionForJson(contents, latestStable) {
  if (!contents.exporter) {
    contents.exporter = {};
  }
  contents.exporter.name = Metadata.name;
  contents.exporter.version = Metadata.version;
  return updateCommonAttributes(contents, latestStable);
}

function updateCommonAttributesForXml(definitions, latestStable) {
  const updatedAttributes = updateCommonAttributes(definitions, latestStable);
  updatedAttributes.exporter = Metadata.name;
  updatedAttributes.exporterVersion = Metadata.version;
  updatedAttributes.$attrs['xmlns:modeler'] = NAMESPACE_URI_MODELER;
  updatedAttributes.$attrs['modeler:executionPlatform'] = ENGINES.FLOWAVE;
  updatedAttributes.$attrs['modeler:executionPlatformVersion'] = latestStable;
  return updatedAttributes;
}

function updateCommonAttributes(definitions, latestStable) {
  definitions.executionPlatform = ENGINES.FLOWAVE;
  definitions.executionPlatformVersion = latestStable;
  return definitions;
}

function isEntityValid(contents, type) {
  if ([ Type.BPMN, Type.DMN ].includes(type)) {
    return isXml(contents);
  } else {
    return isJson(contents);
  }
}

function isXml(contents) {
  return XMLValidator.validate(contents.trim()) === true;
}

function isJson(contents) {
  return typeof contents === 'object';
}
