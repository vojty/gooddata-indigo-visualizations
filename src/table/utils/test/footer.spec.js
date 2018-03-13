// (C) 2007-2018 GoodData Corporation
import {
    getFooterHeight,
    getFooterPositions,
    isFooterAtDefaultPosition,
    isFooterAtEdgePosition
} from '../footer';

describe('Table utils - Footer', () => {
    describe('getFooterHeight', () => {
        const twoTotals = [
            { type: 'sum', outputMeasureIndexes: [] },
            { type: 'avg', outputMeasureIndexes: [] }
        ];

        describe('edit allowed and totals visible', () => {
            it('should return sum of aggregation rows and height of the row for adding aggregaitons', () => {
                const editAllowed = true;
                const totalsVisible = true;
                expect(getFooterHeight(twoTotals, editAllowed, totalsVisible)).toEqual((2 * 30) + 50);
            });
        });

        describe('edit not allowed and totals visible', () => {
            it('should return sum of aggregation rows', () => {
                const editAllowed = false;
                const totalsVisible = true;
                expect(getFooterHeight(twoTotals, editAllowed, totalsVisible)).toEqual(2 * 30);
            });
        });

        describe('edit not allowed and totals not visible', () => {
            it('should return sum of aggregation rows', () => {
                const editAllowed = false;
                const totalsVisible = false;
                expect(getFooterHeight(twoTotals, editAllowed, totalsVisible)).toEqual(0);
            });
        });

        describe('edit allowed and totals visible, empty totals', () => {
            it('should return height of the row for adding aggregaitons', () => {
                const editAllowed = true;
                const totalsVisible = true;
                const emptyTotals = [];
                expect(getFooterHeight(emptyTotals, editAllowed, totalsVisible)).toEqual(50);
            });
        });
    });

    describe('isFooterAtDefaultPosition', () => {
        const windowHeight = 500;

        it('should return true if footer is scrolled above the bottom of the viewport', () => {
            const tableBottom = 250;
            const hasHiddenRows = false;
            expect(isFooterAtDefaultPosition(hasHiddenRows, tableBottom, windowHeight))
                .toEqual(true);
        });

        it('should return true if footer is scrolled near the bottom of the viewport and table contains hidden rows', () => {
            const tableBottom = 510;
            const hasHiddenRows = true;
            expect(isFooterAtDefaultPosition(hasHiddenRows, tableBottom, windowHeight))
                .toEqual(true);
        });

        it('should return false if footer is scrolled near the bottom of the viewport and table has no hidden rows', () => {
            const tableBottom = 510;
            const hasHiddenRows = false;
            expect(isFooterAtDefaultPosition(hasHiddenRows, tableBottom, windowHeight))
                .toEqual(false);
        });


        it('should return false if footer is scrolled below the bottom of the viewport', () => {
            const tableBottom = 750;
            const hasHiddenRows = false;
            expect(isFooterAtDefaultPosition(hasHiddenRows, tableBottom, windowHeight))
                .toEqual(false);
        });
    });

    describe('isFooterAtEdgePosition', () => {
        const totals = [1, 2, 3];
        const hasHiddenRows = false;
        const windowHeight = 500;
        const totalsEditAllowed = false;
        const totalsVisible = true;

        it('should return true if footer is at its edge position', () => {
            const tableDimensions = {
                height: 500,
                bottom: 1000
            };

            const footerAtEdgePosition = isFooterAtEdgePosition(
                hasHiddenRows, totals, windowHeight, totalsEditAllowed, totalsVisible, tableDimensions
            );

            expect(footerAtEdgePosition).toBe(true);
        });

        it('should return false if footer is not at its edge position', () => {
            const tableDimensions = {
                height: 500,
                bottom: 100
            };

            const footerAtEdgePosition = isFooterAtEdgePosition(
                hasHiddenRows, totals, windowHeight, totalsEditAllowed, totalsVisible, tableDimensions
            );

            expect(footerAtEdgePosition).toBe(false);
        });
    });

    describe('getFooterPositions', () => {
        it('should return proper footer positions', () => {
            const totals = [1, 2, 3];
            let hasHiddenRows = true;
            let tableDimensions = {
                height: 300,
                bottom: 500
            };
            let windowHeight = 400;
            let totalsEditAllowed = false;
            let totalsVisible = true;

            let footerPositions = getFooterPositions(
                hasHiddenRows, totals, windowHeight, totalsEditAllowed, totalsVisible, tableDimensions
            );

            expect(footerPositions).toEqual({
                absoluteTop: -100,
                defaultTop: -15,
                edgeTop: -139,
                fixedTop: 100
            });

            tableDimensions = {
                height: 500,
                bottom: 1000
            };
            windowHeight = 800;

            footerPositions = getFooterPositions(
                hasHiddenRows, totals, windowHeight, totalsEditAllowed, totalsVisible, tableDimensions
            );
            expect(footerPositions).toEqual({
                absoluteTop: -200,
                defaultTop: -15,
                edgeTop: -339,
                fixedTop: 300
            });

            totalsEditAllowed = true;

            footerPositions = getFooterPositions(
                hasHiddenRows, totals, windowHeight, totalsEditAllowed, totalsVisible, tableDimensions
            );
            expect(footerPositions).toEqual({
                absoluteTop: -200,
                defaultTop: -15,
                edgeTop: -289,
                fixedTop: 300
            });

            hasHiddenRows = false;
            tableDimensions = {
                height: 300,
                bottom: 100
            };
            windowHeight = 500;
            totalsEditAllowed = false;

            footerPositions = getFooterPositions(
                hasHiddenRows, totals, windowHeight, totalsEditAllowed, totalsVisible, tableDimensions
            );
            expect(footerPositions).toEqual({
                absoluteTop: 400,
                defaultTop: -0,
                edgeTop: -154,
                fixedTop: 200
            });

            totalsVisible = false;

            footerPositions = getFooterPositions(
                hasHiddenRows, totals, windowHeight, totalsEditAllowed, totalsVisible, tableDimensions
            );
            expect(footerPositions).toEqual({
                absoluteTop: 400,
                defaultTop: -0,
                edgeTop: -244,
                fixedTop: 200
            });
        });
    });
});
