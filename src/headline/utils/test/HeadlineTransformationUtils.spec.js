import {
    getData,
    applyDrillableItems,
    buildDrillEventData,
    fireDrillEvent
} from '../HeadlineTransformationUtils';
import {
    SINGLE_URI_METRIC_EXECUTION_REQUEST,
    SINGLE_IDENTIFIER_METRIC_EXECUTION_REQUEST,
    SINGLE_METRIC_EXECUTION_RESPONSE,
    SINGLE_METRIC_EXECUTION_RESULT
} from '../../test/fixtures/one_measure';
import {
    THREE_METRICS_EXECUTION_REQUEST
} from '../../test/fixtures/three_measures';

describe('HeadlineTransformationUtils', () => {
    describe('getData', () => {
        it('should set primary item data from the execution result', () => {
            const data = getData(SINGLE_URI_METRIC_EXECUTION_REQUEST, SINGLE_METRIC_EXECUTION_RESPONSE,
                SINGLE_METRIC_EXECUTION_RESULT);
            expect(data).toEqual({
                primaryItem: {
                    localIdentifier: 'm1',
                    title: 'Lost',
                    value: '42470571.16',
                    format: '$#,##0.00',
                    isDrillable: false
                }
            });
        });

        it('should throw error if primary item value is not found in the execution request', () => {
            expect(() => getData(null, SINGLE_METRIC_EXECUTION_RESPONSE, SINGLE_METRIC_EXECUTION_RESULT)).toThrow();
        });

        it('should throw error if primary item data is not found in the execution response', () => {
            expect(() => getData(SINGLE_URI_METRIC_EXECUTION_REQUEST, SINGLE_METRIC_EXECUTION_RESPONSE, null))
                .toThrow();
        });

        it('should throw error if primary item value is not found in the execution result', () => {
            expect(() => getData(SINGLE_URI_METRIC_EXECUTION_REQUEST, null, SINGLE_METRIC_EXECUTION_RESULT)).toThrow();
        });
    });

    describe('applyDrillableItems', () => {
        it('should NOT throw any error when drillable items do not match defined headline or execution data', () => {
            const data = applyDrillableItems({}, [{
                identifier: 'some-identifier',
                uri: 'some-uri'
            }], THREE_METRICS_EXECUTION_REQUEST);
            expect(data).toEqual({});
        });

        it('should reset drilling state of every item when drillable items does not match any header item', () => {
            const data = {
                primaryItem: {
                    localIdentifier: 'm1',
                    title: 'Lost',
                    value: '120',
                    isDrillable: true
                }
            };
            const updatedData = applyDrillableItems(data, [{
                identifier: 'some-identifier',
                uri: 'some-uri'
            }], THREE_METRICS_EXECUTION_REQUEST);

            expect(updatedData).toEqual({
                primaryItem: {
                    localIdentifier: 'm1',
                    title: 'Lost',
                    value: '120',
                    isDrillable: false
                }
            });
        });

        it('should enable drilling of the item identified by the drillable item uri', () => {
            const data = applyDrillableItems({
                primaryItem: {
                    localIdentifier: 'm1',
                    title: 'Lost',
                    value: '120',
                    isDrillable: false
                }
            }, [{
                uri: '/gdc/md/project_id/obj/1'
            }], SINGLE_URI_METRIC_EXECUTION_REQUEST);

            expect(data).toEqual({
                primaryItem: {
                    localIdentifier: 'm1',
                    title: 'Lost',
                    value: '120',
                    isDrillable: true
                }
            });
        });

        it('should enable drilling of the item identified by the drillable item identifier', () => {
            const data = applyDrillableItems({
                primaryItem: {
                    localIdentifier: 'm1',
                    title: 'Lost',
                    value: '120',
                    isDrillable: false
                }
            }, [{
                identifier: 'metric.found'
            }], SINGLE_IDENTIFIER_METRIC_EXECUTION_REQUEST);

            expect(data).toEqual({
                primaryItem: {
                    localIdentifier: 'm1',
                    title: 'Lost',
                    value: '120',
                    isDrillable: true
                }
            });
        });

        it('should treat provided data object as immutable', () => {
            const data = {
                primaryItem: {
                    localIdentifier: 'm1',
                    title: 'Lost',
                    value: '120',
                    isDrillable: false
                }
            };
            const updatedData = applyDrillableItems(data, [{
                identifier: 'metric.lost',
                uri: '/gdc/md/project_id/obj/1'
            }], SINGLE_URI_METRIC_EXECUTION_REQUEST);

            expect(updatedData).toEqual({
                primaryItem: {
                    localIdentifier: 'm1',
                    title: 'Lost',
                    value: '120',
                    isDrillable: true
                }
            });
            expect(data.primaryItem.isDrillable).toEqual(false);
        });
    });

    describe('buildDrillEventData', () => {
        it('should build expected drill event data from execution request made with metric uri', () => {
            const itemContext = {
                localIdentifier: 'm1',
                element: 'primaryValue',
                value: '42'
            };
            const eventData = buildDrillEventData(
                itemContext,
                SINGLE_URI_METRIC_EXECUTION_REQUEST,
                SINGLE_METRIC_EXECUTION_RESPONSE
            );
            expect(eventData).toEqual({
                executionContext: {
                    measures: [
                        {
                            localIdentifier: 'm1',
                            definition: {
                                measure: {
                                    item: {
                                        uri: '/gdc/md/project_id/obj/1'
                                    }
                                }
                            }
                        }
                    ]
                },
                drillContext: {
                    type: 'headline',
                    element: 'primaryValue',
                    value: '42',
                    intersection: [
                        {
                            id: 'm1',
                            title: 'Lost',
                            header: {
                                identifier: '',
                                uri: '/gdc/md/project_id/obj/1'
                            }
                        }
                    ]
                }
            });
        });

        it('should build expected drill event data from execution request made with metric identifier', () => {
            const itemContext = {
                localIdentifier: 'm1',
                element: 'primaryValue',
                value: '42'
            };
            const eventData = buildDrillEventData(
                itemContext,
                SINGLE_IDENTIFIER_METRIC_EXECUTION_REQUEST,
                SINGLE_METRIC_EXECUTION_RESPONSE
            );
            expect(eventData).toEqual({
                executionContext: {
                    measures: [
                        {
                            localIdentifier: 'm1',
                            definition: {
                                measure: {
                                    item: {
                                        identifier: 'metric.lost'
                                    }
                                }
                            }
                        }
                    ]
                },
                drillContext: {
                    type: 'headline',
                    element: 'primaryValue',
                    value: '42',
                    intersection: [
                        {
                            id: 'm1',
                            title: 'Lost',
                            header: {
                                identifier: 'metric.lost',
                                uri: ''
                            }
                        }
                    ]
                }
            });
        });

        it('should throw exception when metric from item context is not found in the execution response.', () => {
            const itemContext = {
                uri: '/gdc/md/project_id/obj/2',
                element: 'primaryValue',
                value: '42'
            };
            expect(() => buildDrillEventData(
                itemContext,
                SINGLE_URI_METRIC_EXECUTION_REQUEST,
                SINGLE_METRIC_EXECUTION_RESPONSE
            )).toThrow();
        });
    });

    describe('fireDrillEvent', () => {
        it('should dispatch expected drill post message', () => {
            const eventData = {
                executionContext: {},
                drillContext: {}
            };
            const eventHandler = jest.fn();
            const target = {
                dispatchEvent: eventHandler
            };

            fireDrillEvent(undefined, eventData, target);

            expect(eventHandler).toHaveBeenCalledTimes(1);
            expect(eventHandler).toHaveBeenCalledWith(expect.objectContaining(
                {
                    detail: {
                        executionContext: {},
                        drillContext: {}
                    },
                    bubbles: true,
                    type: 'drill'
                })
            );
        });

        it('should dispatch expected drill event and post message to the provided target', () => {
            const eventData = {
                executionContext: {},
                drillContext: {}
            };
            const eventHandler = jest.fn();
            const target = {
                dispatchEvent: eventHandler
            };
            const drillEventFunction = jest.fn(() => true);

            fireDrillEvent(drillEventFunction, eventData, target);

            expect(drillEventFunction).toHaveBeenCalledTimes(1);
            expect(eventHandler).toHaveBeenCalledTimes(1);
            expect(eventHandler).toHaveBeenCalledWith(expect.objectContaining(
                {
                    detail: {
                        executionContext: {},
                        drillContext: {}
                    },
                    bubbles: true,
                    type: 'drill'
                })
            );
        });

        it('should dispatch expected drill event, but prevent drill post message', () => {
            const eventData = {
                executionContext: {},
                drillContext: {}
            };
            const eventHandler = jest.fn();
            const target = {
                dispatchEvent: eventHandler
            };

            const drillEventFunction = jest.fn(() => false);

            fireDrillEvent(drillEventFunction, eventData, target);

            expect(eventHandler).toHaveBeenCalledTimes(0);
            expect(drillEventFunction).toHaveBeenCalledTimes(1);
        });
    });
});
