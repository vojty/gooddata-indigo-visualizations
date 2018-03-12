// (C) 2007-2018 GoodData Corporation
import { setWith, clone } from 'lodash';
import { isEqual } from 'lodash/fp';
import { Observable } from 'rxjs/Rx';

import {
    TABLE,
    COLUMN_CHART,
    BAR_CHART,
    LINE_CHART,
    PIE_CHART,
    AREA_CHART,
    DOUGHNUT_CHART,
    HEADLINE,
    CHART_TYPES
} from '../VisualizationTypes';

export function parseValue(value) {
    const parsedValue = parseFloat(value);
    return isNaN(parsedValue) ? null : parsedValue; // eslint-disable-line no-restricted-globals
}

export const immutableSet = (dataSet, path, newValue) => setWith({ ...dataSet }, path, newValue, clone);

export const repeatItemsNTimes = (array, n) => new Array(n).fill(null).reduce(result => [...result, ...array], []);

export function subscribeEvent(event, debounce, func, target = window) {
    if (debounce > 0) {
        return Observable
            .fromEvent(target, event)
            .debounceTime(debounce)
            .subscribe(func);
    }

    return Observable
        .fromEvent(target, event)
        .subscribe(func);
}

export function subscribeEvents(func, events, target = window) {
    return events.map((event) => {
        return subscribeEvent(event.name, event.debounce, func, target);
    });
}

export const unEscapeAngleBrackets = str => str && str.replace(/&lt;|&#60;/g, '<').replace(/&gt;|&#62;/g, '>');

export function getAttributeElementIdFromAttributeElementUri(attributeElementUri) {
    const match = '/elements?id=';
    return attributeElementUri.slice(attributeElementUri.lastIndexOf(match) + match.length);
}

export const isTable = isEqual(TABLE);
export const isColumnChart = isEqual(COLUMN_CHART);
export const isBarChart = isEqual(BAR_CHART);
export const isLineChart = isEqual(LINE_CHART);
export const isPieChart = isEqual(PIE_CHART);
export const isAreaChart = isEqual(AREA_CHART);
export const isDoughnutChart = isEqual(DOUGHNUT_CHART);
export const isHeadline = isEqual(HEADLINE);
export const isChartSupported = type => CHART_TYPES.includes(type);
export const stringifyChartTypes = () => CHART_TYPES.join(', ');
