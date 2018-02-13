import { cloneDeep, get, isEmpty } from 'lodash';

function mapToHeadlineItemData(measureHeaderItem, value) {
    return {
        uri: measureHeaderItem.uri,
        title: measureHeaderItem.name,
        value,
        format: measureHeaderItem.format,
        isDrillable: false
    };
}

/**
 * Get {HeadlineData} used by the {Headline} component.
 *
 * @param executionResponse - The execution response with dimensions definition.
 * @param executionResult - The execution result with an actual data values.
 * @returns {*}
 */
export function getData(executionResponse, executionResult) {
    const primaryValue = get(executionResult, 'data[0]');
    const primaryMeasureHeaderItem = get(executionResponse,
        'dimensions[0].headers[0].measureGroupHeader.items[0].measureHeaderItem');
    if (primaryValue === undefined || primaryMeasureHeaderItem === undefined) {
        throw new Error('Value or measure header for the primary item has not been found in the execution result!');
    }
    return {
        primaryItem: mapToHeadlineItemData(primaryMeasureHeaderItem, primaryValue)
    };
}

function findMeasureHeaderItem(uri, executionResponse) {
    const measureGroupHeaderItems = get(executionResponse, 'dimensions[0].headers[0].measureGroupHeader.items', []);
    return measureGroupHeaderItems
        .map(item => item.measureHeaderItem)
        .find(header => header !== undefined && header.uri === uri);
}

function isItemDrillable(headerItemUri, drillableItems, executionResponse) {
    if (headerItemUri === undefined || headerItemUri === null) {
        return false;
    }
    const header = findMeasureHeaderItem(headerItemUri, executionResponse);
    if (header === undefined) {
        return false;
    }
    return drillableItems.some((drillableItem) => {
        const matchByUri = header.uri === drillableItem.uri;
        const matchByIdentifier = header.identifier === drillableItem.identifier;
        return matchByUri || matchByIdentifier;
    });
}

/**
 * Take headline data and apply drillable items received from the event.
 * The method will return copied collection of the headline data with altered drillable status.
 *
 * @param headlineData - The headline data that we want to change the drillable status.
 * @param drillableItems - The drillable items created from 'drillableItems' event received by the iframe.
 * @param executionResponse - The execution response with dimensions definition.
 * @returns headlineData
 */
export function applyDrillableItems(headlineData, drillableItems, executionResponse) {
    const data = cloneDeep(headlineData);
    const { primaryItem } = data;

    if (!isEmpty(primaryItem)) {
        primaryItem.isDrillable = isItemDrillable(primaryItem.uri, drillableItems, executionResponse);
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
    const measureHeaderItem = findMeasureHeaderItem(itemContext.uri, executionResponse);
    if (measureHeaderItem === undefined) {
        throw new Error('The metric uri has not been found in execution response!');
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
                        identifier: measureHeaderItem.identifier,
                        uri: measureHeaderItem.uri
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
