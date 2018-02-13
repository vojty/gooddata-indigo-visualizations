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
    THREE_METRICS_EXECUTION_RESPONSE
} from '../../test/fixtures/three_measures';

describe('HeadlineTransformationUtils', () => {
    describe('getData', () => {
        it('should set primary item data from the execution result', () => {
            const data = getData(SINGLE_METRIC_EXECUTION_RESPONSE, SINGLE_METRIC_EXECUTION_RESULT);
            expect(data).toEqual({
                primaryItem: {
                    uri: '/gdc/md/project_id/obj/1',
                    title: 'Lost',
                    value: '42470571.16',
                    format: '$#,##0.00',
                    isDrillable: false
                }
            });
        });

        it('should throw error if primary item data is not found in the execution response', () => {
            expect(() => getData(SINGLE_METRIC_EXECUTION_RESPONSE, null)).toThrow();
        });

        it('should throw error if primary item value is not found in the execution result', () => {
            expect(() => getData(null, SINGLE_METRIC_EXECUTION_RESULT)).toThrow();
        });
    });

    describe('applyDrillableItems', () => {
        it('should NOT throw any error when drillable items do not match defined headline or execution data', () => {
            const data = applyDrillableItems({}, [{
                identifier: 'some-identifier',
                uri: 'some-uri'
            }], SINGLE_METRIC_EXECUTION_RESPONSE);
            expect(data).toEqual({});
        });

        it('should reset drilling state of every item when drillable items does not match any header item', () => {
            const data = {
                primaryItem: {
                    uri: '/gdc/md/project_id/obj/1',
                    title: 'Lost',
                    value: '120',
                    isDrillable: true
                }
            };
            const updatedData = applyDrillableItems(data, [{
                identifier: 'some-identifier',
                uri: 'some-uri'
            }]);

            expect(updatedData).toEqual({
                primaryItem: {
                    uri: '/gdc/md/project_id/obj/1',
                    title: 'Lost',
                    value: '120',
                    isDrillable: false
                }
            });
        });

        const threeNonDrillableMetricsData = {
            primaryItem: {
                uri: '/gdc/md/project_id/obj/1',
                title: 'Lost',
                value: '120',
                isDrillable: false
            }
        };

        it('should enable drilling of the primary item identified by the drillable item uri', () => {
            const data = applyDrillableItems(threeNonDrillableMetricsData, [{
                uri: '/gdc/md/project_id/obj/1'
            }], THREE_METRICS_EXECUTION_RESPONSE);

            expect(data).toEqual({
                primaryItem: {
                    uri: '/gdc/md/project_id/obj/1',
                    title: 'Lost',
                    value: '120',
                    isDrillable: true
                }
            });
        });

        it('should enable drilling of the secondary item identified by the drillable item uri', () => {
            const data = applyDrillableItems(threeNonDrillableMetricsData, [{
                uri: '/gdc/md/project_id/obj/2'
            }], THREE_METRICS_EXECUTION_RESPONSE);

            expect(data).toEqual({
                primaryItem: {
                    uri: '/gdc/md/project_id/obj/1',
                    title: 'Lost',
                    value: '120',
                    isDrillable: false
                }
            });
        });

        it('should enable drilling of the tertiary item identified by the drillable item uri', () => {
            const data = applyDrillableItems(threeNonDrillableMetricsData, [{
                uri: '/gdc/md/project_id/obj/3'
            }], THREE_METRICS_EXECUTION_RESPONSE);

            expect(data).toEqual({
                primaryItem: {
                    uri: '/gdc/md/project_id/obj/1',
                    title: 'Lost',
                    value: '120',
                    isDrillable: false
                }
            });
        });

        it('should enable drilling of the primary item identified by the drillable item identifier', () => {
            const data = applyDrillableItems(threeNonDrillableMetricsData, [{
                identifier: 'metric.lost'
            }], THREE_METRICS_EXECUTION_RESPONSE);

            expect(data).toEqual({
                primaryItem: {
                    uri: '/gdc/md/project_id/obj/1',
                    title: 'Lost',
                    value: '120',
                    isDrillable: true
                }
            });
        });

        it('should enable drilling of the secondary item identified by the drillable item identifier', () => {
            const data = applyDrillableItems(threeNonDrillableMetricsData, [{
                identifier: 'metric.found'
            }], THREE_METRICS_EXECUTION_RESPONSE);

            expect(data).toEqual({
                primaryItem: {
                    uri: '/gdc/md/project_id/obj/1',
                    title: 'Lost',
                    value: '120',
                    isDrillable: false
                }
            });
        });

        it('should enable drilling of the tertiary item identified by the drillable item identifier', () => {
            const data = applyDrillableItems(threeNonDrillableMetricsData, [{
                identifier: 'metric.sold'
            }], THREE_METRICS_EXECUTION_RESPONSE);

            expect(data).toEqual({
                primaryItem: {
                    uri: '/gdc/md/project_id/obj/1',
                    title: 'Lost',
                    value: '120',
                    isDrillable: false
                }
            });
        });

        it('should treat provided data object as immutable', () => {
            const data = {
                primaryItem: {
                    uri: '/gdc/md/project_id/obj/1',
                    title: 'Lost',
                    value: '120',
                    isDrillable: false
                }
            };
            const updatedData = applyDrillableItems(data, [{
                identifier: 'metric.lost',
                uri: '/gdc/md/project_id/obj/1'
            }], SINGLE_METRIC_EXECUTION_RESPONSE);

            expect(updatedData).toEqual({
                primaryItem: {
                    uri: '/gdc/md/project_id/obj/1',
                    title: 'Lost',
                    value: '120',
                    isDrillable: true
                }
            });
            expect(data.primaryItem.isDrillable).toEqual(false);
        });
    });

    describe('buildDrillEventData', () => {
        const expectedDrillContext = {
            type: 'headline',
            element: 'primaryValue',
            value: '42',
            intersection: [
                {
                    id: 'm1',
                    title: 'Lost',
                    header: {
                        identifier: 'metric.lost',
                        uri: '/gdc/md/project_id/obj/1'
                    }
                }
            ]
        };

        it('should build expected drill event data from execution request made with metric uri', () => {
            const itemContext = {
                uri: '/gdc/md/project_id/obj/1',
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
                drillContext: expectedDrillContext
            });
        });

        it('should build expected drill event data from execution request made with metric identifier', () => {
            const itemContext = {
                uri: '/gdc/md/project_id/obj/1',
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
                drillContext: expectedDrillContext
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
