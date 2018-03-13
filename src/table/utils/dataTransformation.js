// (C) 2007-2018 GoodData Corporation
import invariant from 'invariant';
import { get, has, isObject, omit, zip, isEmpty } from 'lodash';
import { getAttributeElementIdFromAttributeElementUri } from '../../utils/common';
import { getMeasureUriOrIdentifier } from '../../utils/drilldownEventing';
import { getTotalsTypesList } from '../totals/utils';

function getAttributeHeaders(attributeDimension) {
    return attributeDimension.headers
        .map((attributeHeader) => {
            return {
                ...omit(attributeHeader.attributeHeader, ['formOf', 'totalItems']),
                name: attributeHeader.attributeHeader.formOf.name,
                type: 'attribute'
            };
        });
}

function getMeasureHeaders(measureDimension) {
    return get(measureDimension.headers[0], ['measureGroupHeader', 'items'], [])
        .map((measureHeader) => {
            return {
                ...measureHeader.measureHeaderItem,
                type: 'measure'
            };
        });
}

export function getHeaders(executionResponse) {
    const dimensions = get(executionResponse, 'dimensions', []);

    // two dimensions must be always returned (and requested)
    invariant(dimensions.length === 2, 'Number of dimensions must be equal two');

    // attributes are always returned (and requested) in 0-th dimension
    const attributeHeaders = getAttributeHeaders(dimensions[0]);

    // measures are always returned (and requested) in 1-st dimension
    const measureHeaders = getMeasureHeaders(dimensions[1]);

    return [...attributeHeaders, ...measureHeaders];
}

export function getRows(executionResult) {
    // two dimensional headerItems array are always returned (and requested)
    // attributes are always returned (and requested) in 0-th dimension
    const attributeValues = executionResult.headerItems[0]
        .filter( // filter only arrays which contains some attribute header items
            headerItem => headerItem.some(item => has(item, 'attributeHeaderItem'))
        )
        .map(
            attributeHeaderItems => attributeHeaderItems
                .map(
                    attributeHeaderItem => get(attributeHeaderItem, 'attributeHeaderItem')
                )
        );

    const measureValues = get(executionResult, 'data');

    const attributeRows = zip(...attributeValues);

    if (measureValues.length === 0) {
        return attributeRows;
    }

    if (attributeRows.length === 0) {
        return measureValues;
    }

    return measureValues.map((measureValue, index) => {
        return [...attributeRows[index], ...measureValue];
    });
}

function getResultTotalsValues(executionResult) {
    const totalsData = executionResult.totals;
    if (!isEmpty(totalsData)) {
        // Totals are requested and returned in the same dimension as attributes,
        // and in case of Table, attributes are always in 0-th dimension
        return totalsData[0];
    }
    return [];
}

function getOrderedTotalTypes(executionResult) {
    // Totals are requested (and returned) in the same dimension as attributes, and in case of Table,
    // attributes are always in 0-th dimension right now, therefore executionResult.headerItems[0].
    // Also, we are now supporting only Grand Totals, so totals will be returned always next to the headerItems
    // of the first attribute, therefore executionResult.headerItems[0][0]
    const headerItems = get(executionResult, 'headerItems[0][0]', []);

    return headerItems.reduce((types, headerItem) => {
        if (headerItem.totalHeaderItem) {
            types.push(headerItem.totalHeaderItem.type);
        }
        return types;
    }, []);
}

export function getTotalsWithData(totalsDefinition, executionResult) {
    const totalsResultValues = getResultTotalsValues(executionResult);
    if (isEmpty(totalsDefinition)) {
        return [];
    }

    let orderedTotalsTypes = getOrderedTotalTypes(executionResult);

    if (!orderedTotalsTypes.length) {
        orderedTotalsTypes = getTotalsTypesList();
    }

    let index = 0;
    return orderedTotalsTypes.reduce((totals, type) => {
        const totalDefinition = totalsDefinition.find(total => total.type === type);

        if (totalDefinition) {
            totals.push({
                ...totalDefinition,
                values: totalsResultValues[index] || []
            });
            index += 1;
        }

        return totals;
    }, []);
}

export function validateTableProportions(headers, rows) {
    invariant(
        rows.length === 0 || headers.length === rows[0].length,
        'Number of table columns must be equal to number of table headers'
    );
}

export function getBackwardCompatibleHeaderForDrilling(afm, header) {
    if (header.type === 'attribute') {
        return {
            type: 'attrLabel',
            id: header.identifier,
            identifier: header.identifier,
            uri: header.uri,
            title: header.name
        };
    }

    return {
        type: 'metric',
        id: header.localIdentifier,
        identifier: '',
        uri: get(getMeasureUriOrIdentifier(afm, header.localIdentifier), 'uri'),
        title: header.name,
        format: header.format
    };
}

export function getBackwardCompatibleRowForDrilling(row) {
    return row.map((cell) => {
        return isObject(cell)
            ? {
                id: getAttributeElementIdFromAttributeElementUri(cell.uri),
                name: cell.name
            }
            : cell;
    });
}
