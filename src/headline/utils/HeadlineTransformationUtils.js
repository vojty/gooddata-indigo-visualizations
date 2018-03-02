import { cloneDeep, get, isEmpty } from 'lodash';
import { getMeasureUriOrIdentifier } from '../../utils/drilldownEventing';

function mapToHeadlineItemData(measure, measureHeaderItem, value) {
    return {
        localIdentifier: measure.localIdentifier,
        title: measureHeaderItem.name,
        value,
        format: measureHeaderItem.format,
        isDrillable: false
    };
}

/**
 * Get {HeadlineData} used by the {Headline} component.
 *
 * @param executionRequest - Required for measure localIdentifier and definition id (uri, identifier)
 * @param executionResponse - Required for retrieving measure name and format.
 * @param executionResult - Get one dimensional array with measure values
 * @returns {*}
 */
export function getData(executionRequest, executionResponse, executionResult) {
    const primaryMeasure = get(executionRequest, 'afm.measures[0]');
    const primaryValue = get(executionResult, 'data[0]');
    const primaryMeasureHeaderItem = get(executionResponse,
        'dimensions[0].headers[0].measureGroupHeader.items[0].measureHeaderItem');

    if (primaryMeasure === undefined || primaryValue === undefined || primaryMeasureHeaderItem === undefined) {
        throw new Error('Value or measure or measure header for the primary item has not been found in the execution!');
    }
    return {
        primaryItem: mapToHeadlineItemData(primaryMeasure, primaryMeasureHeaderItem, primaryValue)
    };
}

function findMeasureHeaderItem(localIdentifier, executionResponse) {
    const measureGroupHeaderItems = get(executionResponse, 'dimensions[0].headers[0].measureGroupHeader.items', []);
    return measureGroupHeaderItems
        .map(item => item.measureHeaderItem)
        .find(header => header !== undefined && header.localIdentifier === localIdentifier);
}

function isItemDrillable(measureLocalIdentifier, drillableItems, executionRequest) {
    if (measureLocalIdentifier === undefined || measureLocalIdentifier === null) {
        return false;
    }
    const measureIds = getMeasureUriOrIdentifier(executionRequest.afm, measureLocalIdentifier);
    if (!measureIds) {
        return false;
    }
    return drillableItems.some((drillableItem) => {
        const matchByUri = measureIds.uri === drillableItem.uri;
        const matchByIdentifier = measureIds.identifier === drillableItem.identifier;
        return matchByUri || matchByIdentifier;
    });
}

/**
 * Take headline data and apply list of drillable items.
 * The method will return copied collection of the headline data with altered drillable status.
 *
 * @param headlineData - The headline data that we want to change the drillable status.
 * @param drillableItems - list of drillable items {uri, identifier}
 * @param executionRequest - Request with required measure id (uri or identifier) for activation of drill eventing
 * @returns altered headlineData
 */
export function applyDrillableItems(headlineData, drillableItems, executionRequest) {
    const data = cloneDeep(headlineData);
    const { primaryItem } = data;

    if (!isEmpty(primaryItem)) {
        primaryItem.isDrillable = isItemDrillable(primaryItem.localIdentifier, drillableItems, executionRequest);
    }

    return data;
}

/**
 * Build drill event data (object with execution and drill context) from the data obtained by clicking on the {Headline}
 * component an from the execution objects.
 *
 * @param itemContext - data received from the click on the {Headline} component.
 * @param executionRequest - The execution request with AFM and ResultSpec.
 * @param executionResponse - The execution response with dimensions definition.
 * @returns {*}
 */
export function buildDrillEventData(itemContext, executionRequest, executionResponse) {
    const measureHeaderItem = findMeasureHeaderItem(itemContext.localIdentifier, executionResponse);
    if (!measureHeaderItem) {
        throw new Error('The metric uri has not been found in execution response!');
    }

    const measureIds = getMeasureUriOrIdentifier(executionRequest.afm, itemContext.localIdentifier);
    if (!measureIds) {
        throw new Error('The metric ids has not been found in execution request!');
    }

    return {
        executionContext: executionRequest.afm,
        drillContext: {
            type: 'headline',
            element: itemContext.element,
            value: itemContext.value,
            intersection: [
                {
                    id: measureHeaderItem.localIdentifier,
                    title: measureHeaderItem.name,
                    header: {
                        identifier: measureIds.identifier || '',
                        uri: measureIds.uri || ''
                    }
                }
            ]
        }

    };
}

/**
 * Fire a new drill event built from the provided data to the target that have a 'dispatchEvent' method.
 *
 * @param drillEventFunction - custom drill event function which could process and prevent default post message event.
 * @param drillEventData - The event data in {executionContext, drillContext} format.
 * @param target - The target where the built event must be dispatched.
 */
export function fireDrillEvent(drillEventFunction, drillEventData, target) {
    const shouldDispatchPostMessage = drillEventFunction && drillEventFunction(drillEventData);

    if (shouldDispatchPostMessage !== false) {
        target.dispatchEvent(new CustomEvent('drill', {
            detail: drillEventData,
            bubbles: true
        }));
    }
}
