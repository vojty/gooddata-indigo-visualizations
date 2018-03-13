// (C) 2007-2018 GoodData Corporation
import { getHeaderOffset } from './header';
import { getHiddenRowsOffset } from './row';
import { DEFAULT_FOOTER_ROW_HEIGHT, TOTALS_ADD_ROW_HEIGHT } from '../TableVisualization';

export function getFooterHeight(totals, totalsEditAllowed, totalsVisisble) {
    return (totalsVisisble ? totals.length * DEFAULT_FOOTER_ROW_HEIGHT : 0) +
        (totalsEditAllowed ? TOTALS_ADD_ROW_HEIGHT : 0);
}

export function isFooterAtDefaultPosition(hasHiddenRows, tableBottom, windowHeight) {
    const hiddenRowsOffset = getHiddenRowsOffset(hasHiddenRows);

    return (tableBottom - hiddenRowsOffset) <= windowHeight;
}

export function isFooterAtEdgePosition(
    hasHiddenRows, totals, windowHeight, totalsEditAllowed, totalsVisisble, tableDimensions
) {
    const { height: tableHeight, bottom: tableBottom } = tableDimensions;

    const footerHeight = getFooterHeight(totals, totalsEditAllowed, totalsVisisble);
    const headerOffset = getHeaderOffset(hasHiddenRows);

    const footerHeightTranslate = tableHeight - footerHeight;

    return (tableBottom + headerOffset) >= (windowHeight + footerHeightTranslate);
}

export function getFooterPositions(
    hasHiddenRows, totals, windowHeight, totalsEditAllowed, totalsVisisble, tableDimensions
) {
    const { height: tableHeight, bottom: tableBottom } = tableDimensions;

    const footerHeight = getFooterHeight(totals, totalsEditAllowed, totalsVisisble);
    const hiddenRowsOffset = getHiddenRowsOffset(hasHiddenRows);
    const headerOffset = getHeaderOffset(hasHiddenRows);

    const footerHeightTranslate = tableHeight - footerHeight;

    return {
        defaultTop: -hiddenRowsOffset,
        edgeTop: headerOffset - footerHeightTranslate,
        fixedTop: windowHeight - footerHeightTranslate - footerHeight,
        absoluteTop: windowHeight - tableBottom
    };
}
