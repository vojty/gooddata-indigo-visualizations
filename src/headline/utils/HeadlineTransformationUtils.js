// (C) 2007-2018 GoodData Corporation
import { cloneDeep, get, isEmpty, isNumber } from 'lodash';
import CustomEvent from 'custom-event';
import invariant from 'invariant';
import { getMeasureUriOrIdentifier } from '../../utils/drilldownEventing';

function createHeadlineDataItem(executionDataItem) {
    if (!executionDataItem) {
        return null;
    }

    return {
        localIdentifier: executionDataItem.measureHeaderItem.localIdentifier,
        title: executionDataItem.measureHeaderItem.name,
        value: executionDataItem.value,
        format: executionDataItem.measureHeaderItem.format,
        isDrillable: false
    };
}

function createTertiaryItem(executionData, intl) {
    const secondaryHeaderItem = get(executionData, ['1', 'measureHeaderItem']);
    if (!secondaryHeaderItem) {
        return null;
    }

    const primaryValueString = get(executionData, ['0', 'value']);
    const primaryValue = primaryValueString !== null ? Number(primaryValueString) : null;
    const secondaryValueString = get(executionData, ['1', 'value']);
    const secondaryValue = secondaryValueString !== null ? Number(secondaryValueString) : null;

    const tertiaryTitle = intl.formatMessage({ id: 'visualizations.headline.tertiary.title' });

    const isCountableValue = isNumber(primaryValue) && isNumber(secondaryValue);
    const tertiaryValue = (isCountableValue && secondaryValue !== 0)
        ? ((primaryValue - secondaryValue) / secondaryValue)
        : null;

    return {
        localIdentifier: 'tertiaryIdentifier',
        title: tertiaryTitle,
        value: tertiaryValue ? String(tertiaryValue) : null,
        format: '#,##0%',
        isDrillable: false
    };
}

/**
 * Get tuple of measure header items with related data value by index position from executionResponse and
 * executionResult.
 *
 * @param executionResponse
 * @param executionResult
 * @returns {any[]}
 */
function getExecutionData(executionResponse, executionResult) {
    const headerItems = get(executionResponse, 'dimensions[0].headers[0].measureGroupHeader.items', []);

    return headerItems.map((item, index) => {
        const value = get(executionResult, ['data', index]);

        invariant(value !== undefined, 'Undefined execution value data for headline transformation');
        invariant(item.measureHeaderItem, 'Missing expected measureHeaderItem');

        return {
            measureHeaderItem: item.measureHeaderItem,
            value
        };
    });
}

/**
 * Get {HeadlineData} used by the {Headline} component.
 *
 * @param executionResponse - The execution response with dimensions definition.
 * @param executionResult - The execution result with an actual data values.
 * @param intl - Required localization for compare item title
 * @returns {*}
 */
export function getHeadlineData(executionResponse, executionResult, intl) {
    const executionData = getExecutionData(executionResponse, executionResult);

    const primaryItem = createHeadlineDataItem(executionData[0]);
    const primaryItemProp = primaryItem ? { primaryItem } : {};

    const secondaryItem = createHeadlineDataItem(executionData[1]);
    const secondaryItemProp = secondaryItem ? { secondaryItem } : {};

    const tertiaryItem = createTertiaryItem(executionData, intl);
    const tertiaryItemProp = tertiaryItem ? { tertiaryItem } : {};

    return {
        ...primaryItemProp,
        ...secondaryItemProp,
        ...tertiaryItemProp
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
        // Check for defined values because undefined === undefined
        const matchByIdentifier = drillableItem.identifier && measureIds.identifier &&
            drillableItem.identifier === measureIds.identifier;
        const matchByUri = drillableItem.uri && measureIds.uri && drillableItem.uri === measureIds.uri;

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
    const { primaryItem, secondaryItem } = data;

    if (!isEmpty(primaryItem)) {
        primaryItem.isDrillable = isItemDrillable(primaryItem.localIdentifier, drillableItems, executionRequest);
    }

    if (!isEmpty(secondaryItem)) {
        secondaryItem.isDrillable = isItemDrillable(secondaryItem.localIdentifier, drillableItems, executionRequest);
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
