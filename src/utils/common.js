// (C) 2007-2018 GoodData Corporation
import { setWith, clone } from 'lodash';
import { Observable } from 'rxjs/Rx';

export function parseValue(value) {
    const parsedValue = parseFloat(value);
    return isNaN(parsedValue) ? null : parsedValue;
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
