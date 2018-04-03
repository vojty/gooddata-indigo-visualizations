// (C) 2007-2018 GoodData Corporation
import { get, debounce } from 'lodash';
import invariant from 'invariant';
import CustomEvent from 'custom-event';
import { BAR_CHART, COLUMN_CHART, LINE_CHART, PIE_CHART, AREA_CHART, TABLE } from '../VisualizationTypes';

function getPoPMeasureIdentifier(measure) {
    return get(measure, ['definition', 'popMeasure', 'measureIdentifier']);
}

function findMeasureByIdentifier(afm, localIdentifier) {
    return (afm.measures || []).find(m => m.localIdentifier === localIdentifier);
}

export function getMeasureUriOrIdentifier(afm, localIdentifier) {
    let measure = findMeasureByIdentifier(afm, localIdentifier);
    if (measure) {
        const popMeasureIdentifier = getPoPMeasureIdentifier(measure);
        if (popMeasureIdentifier) {
            measure = findMeasureByIdentifier(afm, popMeasureIdentifier);
        }
        return {
            uri: get(measure, ['definition', 'measure', 'item', 'uri']),
            identifier: get(measure, ['definition', 'measure', 'item', 'identifier'])
        };
    }
    return null;
}

function isHeaderDrillable(drillableItems, header) {
    return drillableItems.some(drillableItem =>
        // Check for defined values because undefined === undefined
        (drillableItem.identifier && header.identifier && drillableItem.identifier === header.identifier) ||
        (drillableItem.uri && header.uri && drillableItem.uri === header.uri)
    );
}

export function isDrillable(drillableItems, header, afm) {
    // This works only for non adhoc metric & attributes
    // because adhoc metrics don't have uri & identifier
    const isDrillablePureHeader = isHeaderDrillable(drillableItems, header);

    const afmHeader = getMeasureUriOrIdentifier(afm, header.localIdentifier);
    const isDrillableAdhocHeader = afmHeader && isHeaderDrillable(drillableItems, afmHeader);

    return !!(isDrillablePureHeader || isDrillableAdhocHeader);
}

export function getClickableElementNameByChartType(type) {
    switch (type) {
        case LINE_CHART:
        case AREA_CHART:
            return 'point';
        case COLUMN_CHART:
        case BAR_CHART:
            return 'bar';
        case PIE_CHART:
            return 'slice';
        case TABLE:
            return 'cell';
        default:
            return invariant(false, `Unknown visualization type: ${type}`);
    }
}

function fireEvent(onFiredDrillEvent, data, target) {
    const returnValue = onFiredDrillEvent(data);

    // if user-specified onFiredDrillEvent fn returns false, do not fire default DOM event
    if (returnValue !== false) {
        target.dispatchEvent(new CustomEvent('drill', {
            detail: data,
            bubbles: true
        }));
    }
}

function normalizeIntersectionElements(intersection) {
    return intersection.map(({ id, title, value, name, uri, identifier }) => {
        return {
            id,
            title: title || value || name,
            header: {
                uri,
                identifier
            }
        };
    });
}

function composeDrillContextGroup({ points }, chartType) {
    return {
        type: chartType,
        element: 'label',
        points: points.map((p) => {
            return {
                x: p.x,
                y: p.y,
                intersection: normalizeIntersectionElements(p.drillContext)
            };
        })
    };
}

function composeDrillContextPoint({ point }, chartType) {
    return {
        type: chartType,
        element: getClickableElementNameByChartType(chartType),
        x: point.x,
        y: point.y,
        intersection: normalizeIntersectionElements(point.drillContext)
    };
}

const chartClickDebounced = debounce((drillConfig, event, target, chartType) => {
    const { afm, onFiredDrillEvent } = drillConfig;
    const { points } = event;
    const isGroupClick = !!points;

    const data = {
        executionContext: afm,
        drillContext: isGroupClick ?
            composeDrillContextGroup(event, chartType) : composeDrillContextPoint(event, chartType)
    };

    fireEvent(onFiredDrillEvent, data, target);
});

export const chartClick = (...props) => chartClickDebounced(...props);

export const cellClick = (drillConfig, event, target) => {
    const { afm, onFiredDrillEvent } = drillConfig;
    const { columnIndex, rowIndex, row, intersection } = event;
    const data = {
        executionContext: afm,
        drillContext: {
            type: TABLE,
            element: getClickableElementNameByChartType(TABLE),
            columnIndex,
            rowIndex,
            row,
            intersection: normalizeIntersectionElements(intersection)
        }
    };

    fireEvent(onFiredDrillEvent, data, target);
};
