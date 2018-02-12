/* eslint-disable react/jsx-filename-extension,react/no-multi-comp */
import React, { Component } from 'react';
import { mount } from 'enzyme';

import { createIntlMock } from '../../../test/utils';
import {
    getTotalsTypesList,
    getTotalsDatasource,
    createTotalItem,
    toggleCellClass,
    resetRowClass,
    isAddingMoreTotalsEnabled,
    removeTotalsRow,
    isTotalUsed,
    addTotalsRow,
    updateTotalsRemovePosition,
    getAddTotalDropdownAlignPoints,
    shouldShowAddTotalButton,
    getFirstMeasureIndex,
    hasTableColumnTotalEnabled,
    addMeasureIndex,
    removeMeasureIndex,
    getTotalsDefinition,
    orderTotals,
    shouldShowTotals
} from '../utils';

const intl = createIntlMock();

describe('Totals', () => {
    describe('getTotalsTypesList', () => {
        it('should return proper list of total types', () => {
            const totalTypes = getTotalsTypesList();

            expect(totalTypes).toEqual([
                'sum',
                'max',
                'min',
                'avg',
                'med',
                'nat'
            ]);
        });
    });

    describe('getTotalsDatasource', () => {
        const usedTotals = [
            { type: 'sum' },
            { type: 'max' }
        ];
        const dataSource = getTotalsDatasource(usedTotals, intl);

        it('should return rows count of 7 (header + 6 totals)', () => {
            expect(dataSource.rowsCount).toEqual(7);
        });

        describe('getObjectAt', () => {
            it('should return disabled "max" on index 2 when it is already used', () => {
                expect(dataSource.getObjectAt(2)).toEqual({
                    disabled: true,
                    title: 'Max',
                    type: 'max'
                });
            });

            it('should return enabled "Rollup" on index 5 when it is not used already', () => {
                expect(dataSource.getObjectAt(5)).toEqual({
                    disabled: false,
                    title: 'Median',
                    type: 'med'
                });
            });
        });
    });

    describe('orderTotals', () => {
        it('should order totals by order provided by getTotalsTypesList', () => {
            const totalsList = [
                { type: 'nat' },
                { type: 'max' },
                { type: 'sum' }
            ];

            expect(orderTotals(totalsList)).toEqual([
                { type: 'sum' },
                { type: 'max' },
                { type: 'nat' }
            ]);
        });
    });

    describe('createTotalItem', () => {
        it('should return `sum` total item', () => {
            const total = createTotalItem('sum');

            expect(total).toEqual({
                type: 'sum',
                outputMeasureIndexes: []
            });
        });
    });

    describe('toggleCellClass', () => {
        const testClassname = 'toggle';

        class CellTestComponent extends Component {
            render() {
                return (
                    <div ref={(ref) => { this.parentRef = ref; }}>
                        <span className="col-1" />
                        <span className={`col-2 ${testClassname}`} />
                        <span className="col-2" />
                    </div>
                );
            }
        }

        it('should remove given classname to all cells having a particular classname', () => {
            const cell = mount(<CellTestComponent />);
            const cellReference = cell.instance().parentRef;

            toggleCellClass(cellReference, 2, false, testClassname);

            expect(cellReference.querySelectorAll(`.${testClassname}`).length).toEqual(0);
        });

        it('should add given classname to all cells having a particular classname', () => {
            const cell = mount(<CellTestComponent />);
            const cellReference = cell.instance().parentRef;

            toggleCellClass(cellReference, 2, true, testClassname);

            expect(cellReference.querySelectorAll(`.${testClassname}`).length).toEqual(2);
        });
    });

    describe('resetRowClass', () => {
        const testClassname = 'toggle';

        class RowTestComponent extends Component {
            render() {
                return (
                    <div ref={(ref) => { this.parentRef = ref; }}>
                        <div className="indigo-totals-remove">
                            <div className={`indigo-totals-remove-row ${testClassname}`} />
                            <div className="indigo-totals-remove-row" />
                            <div className="indigo-totals-remove-row" />
                        </div>
                    </div>
                );
            }
        }

        it('should remove given classname from all rows and set it to one row on a given column index', () => {
            const row = mount(<RowTestComponent />);
            const rowReference = row.instance().parentRef;
            const oldIndex = 0;
            const newIndex = 2;

            resetRowClass(rowReference, testClassname, '.indigo-totals-remove > .indigo-totals-remove-row', newIndex);

            expect(rowReference.querySelectorAll(`.${testClassname}`).length).toEqual(1);
            expect(rowReference.querySelectorAll('.indigo-totals-remove-row')[oldIndex].classList.contains(testClassname)).toEqual(false);
            expect(rowReference.querySelectorAll('.indigo-totals-remove-row')[newIndex].classList.contains(testClassname)).toEqual(true);
        });

        it('should keep given classname if row on the given column index already has one', () => {
            const row = mount(<RowTestComponent />);
            const rowReference = row.instance().parentRef;
            const columnIndex = 0;

            expect(rowReference.querySelectorAll('.indigo-totals-remove-row')[columnIndex].classList.contains(testClassname)).toEqual(true);

            resetRowClass(rowReference, testClassname, '.indigo-totals-remove > .indigo-totals-remove-row', columnIndex);

            expect(rowReference.querySelectorAll('.indigo-totals-remove-row')[columnIndex].classList.contains(testClassname)).toEqual(true);
        });
    });

    describe('isAddingMoreTotalsEnabled', () => {
        it('should return true if there are some totals remaining to add', () => {
            const totals = [1, 2, 3];
            const addingEnabled = isAddingMoreTotalsEnabled(totals);

            expect(addingEnabled).toEqual(true);
        });

        it('should return false if there are no more totals remaining to add', () => {
            const totals = [1, 2, 3, 4, 5, 6];
            const addingEnabled = isAddingMoreTotalsEnabled(totals);

            expect(addingEnabled).toEqual(false);
        });
    });

    describe('removeTotalsRow', () => {
        it('should return totals without selected total', () => {
            const usedTotals = [
                { type: 'sum' },
                { type: 'avg' }
            ];
            const totalToRemove = 'avg';
            expect(removeTotalsRow(usedTotals, totalToRemove)).toEqual([{ type: 'sum' }]);
        });

        it('should return unchanged totals if total to remove is not among selected ones', () => {
            const usedTotals = [
                { type: 'sum' },
                { type: 'avg' }
            ];
            const totalToRemove = 'min';
            expect(removeTotalsRow(usedTotals, totalToRemove)).toEqual(usedTotals);
        });
    });

    describe('isTotalUsed', () => {
        it('should return true when given total is already present among selected ones', () => {
            const usedTotals = [
                { type: 'sum' },
                { type: 'avg' }
            ];
            const total = 'avg';
            expect(isTotalUsed(usedTotals, total)).toEqual(true);
        });

        it('should return false when given total is not present among selected ones', () => {
            const usedTotals = [
                { type: 'sum' },
                { type: 'avg' }
            ];
            const total = 'min';
            expect(isTotalUsed(usedTotals, total)).toEqual(false);
        });
    });

    describe('addTotalsRow', () => {
        it('should add total among used ones', () => {
            const usedTotals = [
                {
                    type: 'sum',
                    outputMeasureIndexes: []
                }
            ];
            const totalToAdd = 'avg';
            const expectedTotals = [...usedTotals, {
                type: 'avg',
                outputMeasureIndexes: []
            }];
            expect(addTotalsRow(usedTotals, totalToAdd)).toEqual(expectedTotals);
        });

        it('should not add total if is already present among used ones', () => {
            const usedTotals = [
                { type: 'sum' },
                { type: 'avg' }
            ];
            const totalToAdd = 'avg';
            expect(addTotalsRow(usedTotals, totalToAdd)).toEqual(usedTotals);
        });
    });

    describe('updateTotalsRemovePosition', () => {
        class TestComponent extends Component {
            render() {
                return (
                    <div ref={(ref) => { this.parentRef = ref; }} />
                );
            }
        }

        const tableBoundingRect = { height: 100 };
        const totals = [1, 2, 3, 4];
        let ref = null;

        beforeEach(() => {
            const component = mount(<TestComponent />);
            ref = component.instance().parentRef;
        });

        it('should set proper style \'top\' property to referenced node', () => {
            const isTotalsEditAllowed = true;
            const totalsVisible = true;

            updateTotalsRemovePosition(tableBoundingRect, totals, isTotalsEditAllowed, totalsVisible, ref);

            expect(ref.style.top).toEqual('-70px');
        });

        it('should not set any style \'top\' property to referenced node if edit is not allowed', () => {
            const isTotalsEditAllowed = false;
            const totalsVisible = false;

            updateTotalsRemovePosition(tableBoundingRect, totals, isTotalsEditAllowed, totalsVisible, ref);

            expect(ref.style.top).toEqual('');
        });
    });

    describe('getAddTotalDropdownAlignPoints', () => {
        it('should return proper align points for dropdown', () => {
            const expectedAlignPoints = { align: 'tc bc', offset: { x: 0, y: -3 } };
            expect(getAddTotalDropdownAlignPoints()).toEqual(expectedAlignPoints);
        });

        it('should return proper align points for dropdown in last column', () => {
            const isLastColumn = true;
            const expectedAlignPoints = { align: 'tc br', offset: { x: 30, y: -3 } };
            expect(getAddTotalDropdownAlignPoints(isLastColumn)).toEqual(expectedAlignPoints);
        });
    });

    describe('shouldShowAddTotalButton', () => {
        it('should return true if column is not first, is of \'measure\' type and adding of more totals is enabled', () => {
            const column = {
                type: 'measure'
            };
            const isFirstColumn = false;
            const addingMoreTotalsEnabled = true;
            expect(shouldShowAddTotalButton(column, isFirstColumn, addingMoreTotalsEnabled)).toEqual(true);
        });

        it('should return false if column is first, is not of \'measure\' type or adding of more totals is not enabled', () => {
            const metricTypeColumn = {
                type: 'measure'
            };
            const otherTypeColumn = {
                type: 'other'
            };
            const isFirstColumn = true;
            const addingMoreTotalsEnabled = true;
            expect(shouldShowAddTotalButton(metricTypeColumn, isFirstColumn, addingMoreTotalsEnabled)).toEqual(false);
            expect(shouldShowAddTotalButton(metricTypeColumn, !isFirstColumn, !addingMoreTotalsEnabled)).toEqual(false);
            expect(shouldShowAddTotalButton(otherTypeColumn, isFirstColumn, addingMoreTotalsEnabled)).toEqual(false);
        });
    });

    describe('getFirstMeasureIndex', () => {
        it('should return index of first measure when measure present in headers', () => {
            const headers = [{ type: 'foo' }, { type: 'attribute' }, { type: 'measure' }, { type: 'measure' }];
            expect(getFirstMeasureIndex(headers)).toBe(2);
        });

        it('should return index of first measure even when headers are wrongly mixed', () => {
            const headers = [{ type: 'foo' }, { type: 'measure' }, { type: 'attribute' }, { type: 'measure' }];
            expect(getFirstMeasureIndex(headers)).toBe(1);
        });

        it('should return 0 when measure is first header', () => {
            const headers = [{ type: 'measure' }];
            expect(getFirstMeasureIndex(headers)).toBe(0);
        });

        it('should return 0 when no measure present in headers', () => {
            const headers = [{ type: 'foo' }, { type: 'attribute' }];
            expect(getFirstMeasureIndex(headers)).toBe(0);
        });
    });

    describe('hasTableColumnTotalEnabled', () => {
        const outputMeasureIndexes = [3];
        const tableColumnIndex = 4;
        const measureIndexOffset = 1;

        it('should return true on enabled column', () => {
            expect(hasTableColumnTotalEnabled(outputMeasureIndexes, tableColumnIndex, measureIndexOffset)).toBeTruthy();
        });

        it('should return false on disabled column', () => {
            expect(hasTableColumnTotalEnabled(outputMeasureIndexes, 3, measureIndexOffset)).toBeFalsy();
        });
    });

    describe('addMeasureIndex', () => {
        const totals = [
            { type: 'sum', outputMeasureIndexes: [] },
            { type: 'max', outputMeasureIndexes: [1] }
        ];
        const headers = [
            { type: 'attribute' },
            { type: 'measure' },
            { type: 'measure' }
        ];
        const totalType = 'sum';
        const tableColumnIndex = 1;

        it('should add measure index in particular total', () => {
            expect(addMeasureIndex(totals, headers, totalType, tableColumnIndex)).toEqual([
                { type: 'sum', outputMeasureIndexes: [0] },
                { type: 'max', outputMeasureIndexes: [1] }
            ]);
        });

        it('should not duplicate measure indexes when adding same index again', () => {
            expect(addMeasureIndex(totals, headers, 'max', 2)).toEqual([
                { type: 'sum', outputMeasureIndexes: [] },
                { type: 'max', outputMeasureIndexes: [1] }
            ]);
        });

        it('should do nothing when total not found', () => {
            expect(addMeasureIndex(totals, headers, 'nat', tableColumnIndex)).toEqual([
                { type: 'sum', outputMeasureIndexes: [] },
                { type: 'max', outputMeasureIndexes: [1] }
            ]);
        });
    });

    describe('removeMeasureIndex', () => {
        const totals = [
            { type: 'sum', outputMeasureIndexes: [] },
            { type: 'max', outputMeasureIndexes: [1] }
        ];
        const headers = [
            { type: 'attribute' },
            { type: 'measure' },
            { type: 'measure' }
        ];
        const totalType = 'max';
        const tableColumnIndex = 2;

        it('should remove measure index in particular total', () => {
            expect(removeMeasureIndex(totals, headers, totalType, tableColumnIndex)).toEqual([
                { type: 'sum', outputMeasureIndexes: [] },
                { type: 'max', outputMeasureIndexes: [] }
            ]);
        });

        it('should do nothing when total not found', () => {
            expect(removeMeasureIndex(totals, headers, 'nat', tableColumnIndex)).toEqual([
                { type: 'sum', outputMeasureIndexes: [] },
                { type: 'max', outputMeasureIndexes: [1] }
            ]);
        });
    });

    describe('getTotalsDefinition', () => {
        const totals = [
            { type: 'avg', outputMeasureIndexes: [], values: 'foo' },
            { type: 'sum', outputMeasureIndexes: [], values: 'foo' }
        ];

        it('should remove values from totals and return ordered', () => {
            expect(getTotalsDefinition(totals)).toEqual([
                { type: 'sum', outputMeasureIndexes: [] },
                { type: 'avg', outputMeasureIndexes: [] }
            ]);
        });
    });

    describe('shouldShowTotals', () => {
        it('should return false when no header', () => {
            const headers = [];

            expect(shouldShowTotals(headers)).toBeFalsy();
        });

        it('should return true when mixed attributes and measures', () => {
            const headers = [
                { type: 'attribute' },
                { type: 'measure' }
            ];

            expect(shouldShowTotals(headers)).toBeTruthy();
        });

        it('should return false when attributes used', () => {
            const headers = [
                { type: 'attribute' },
                { type: 'attribute' }
            ];

            expect(shouldShowTotals(headers)).toBeFalsy();
        });

        it('should return false when measures used', () => {
            const headers = [
                { type: 'measure' },
                { type: 'measure' }
            ];

            expect(shouldShowTotals(headers)).toBeFalsy();
        });
    });
});
