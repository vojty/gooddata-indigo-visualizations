import React from 'react';
import { noop } from 'lodash';
import { mount } from 'enzyme';
import HeadlineTransformation from '../HeadlineTransformation';
import {
    SINGLE_URI_METRIC_EXECUTION_REQUEST,
    SINGLE_METRIC_EXECUTION_RESPONSE,
    SINGLE_METRIC_EXECUTION_RESULT,
    SINGLE_IDENTIFIER_METRIC_EXECUTION_REQUEST,
    SINGLE_ADHOC_METRIC_EXECUTION_RESPONSE,
    SINGLE_ADHOC_METRIC_EXECUTION_RESULT
} from './fixtures/one_measure';
import Headline from '../Headline';
import {
    DRILL_EVENT_DATA_BY_MEASURE_IDENTIFIER,
    DRILL_EVENT_DATA_BY_MEASURE_URI
} from './fixtures/drill_event_data';

describe('HeadlineTransformation', () => {
    let spyConsole;

    beforeAll(() => {
        // Headline uses 3rd party component Textfit which logs console warning about inability to compute element's
        // height because the component is not visible. The warning is logged only during the testing. It will not be
        // encountered in the production when the component is rendered by a real browser.
        spyConsole = jest.spyOn(console, 'warn').mockImplementation(noop);
    });

    afterAll(() => {
        spyConsole.mockRestore();
    });

    function createComponent(props = {}) {
        return mount(<HeadlineTransformation {...props} />);
    }

    it('should pass default props to Headline component', () => {
        const wrapper = createComponent({
            executionRequest: SINGLE_URI_METRIC_EXECUTION_REQUEST,
            executionResponse: SINGLE_METRIC_EXECUTION_RESPONSE,
            executionResult: SINGLE_METRIC_EXECUTION_RESULT
        });

        const props = wrapper.find(Headline).props();
        expect(props.config).toEqual({
            maxFontSize: 50
        });
        expect(props.onAfterRender).toEqual(noop);
    });

    it('should pass all required props to Headline component and enable drilling identified by uri', () => {
        const onAfterRender = jest.fn();
        const drillableItems = [{
            uri: '/gdc/md/project_id/obj/1'
        }];
        const config = {
            maxFontSize: 20
        };
        const wrapper = createComponent({
            executionRequest: SINGLE_URI_METRIC_EXECUTION_REQUEST,
            executionResponse: SINGLE_METRIC_EXECUTION_RESPONSE,
            executionResult: SINGLE_METRIC_EXECUTION_RESULT,
            config,
            drillableItems,
            onAfterRender
        });

        const props = wrapper.find(Headline).props();
        expect(props.data).toEqual({
            primaryItem: {
                localIdentifier: 'm1',
                title: 'Lost',
                value: '42470571.16',
                format: '$#,##0.00',
                isDrillable: true
            }
        });
        expect(props.config).toEqual(config);
        expect(props.onAfterRender).toEqual(onAfterRender);
        expect(props.onFiredDrillEvent).toBeDefined();
    });

    it('should pass all required props to Headline component and enable drilling identified by identifier', () => {
        const onAfterRender = jest.fn();
        const drillableItems = [{
            identifier: 'metric.lost'
        }];
        const config = {
            maxFontSize: 20
        };
        const wrapper = createComponent({
            executionRequest: SINGLE_IDENTIFIER_METRIC_EXECUTION_REQUEST,
            executionResponse: SINGLE_METRIC_EXECUTION_RESPONSE,
            executionResult: SINGLE_METRIC_EXECUTION_RESULT,
            config,
            drillableItems,
            onAfterRender
        });

        const props = wrapper.find(Headline).props();
        expect(props.data).toEqual({
            primaryItem: {
                localIdentifier: 'm1',
                title: 'Lost',
                value: '42470571.16',
                format: '$#,##0.00',
                isDrillable: true
            }
        });
        expect(props.config).toEqual(config);
        expect(props.onAfterRender).toEqual(onAfterRender);
        expect(props.onFiredDrillEvent).toBeDefined();
    });

    it('should call afterRender callback on componentDidMount & componentDidUpdate', () => {
        const onAfterRender = jest.fn();
        const wrapper = createComponent({
            executionRequest: SINGLE_URI_METRIC_EXECUTION_REQUEST,
            executionResponse: SINGLE_METRIC_EXECUTION_RESPONSE,
            executionResult: SINGLE_METRIC_EXECUTION_RESULT,
            onAfterRender
        });

        expect(onAfterRender).toHaveBeenCalledTimes(1);

        wrapper.setProps({
            config: {
                maxFontSize: 100
            }
        });

        expect(onAfterRender).toHaveBeenCalledTimes(2);
    });

    describe('drill eventing', () => {
        describe('for primary value', () => {
            it('should dispatch drill event and post message', () => {
                const drillEventFunction = jest.fn(() => true);

                const wrapper = createComponent({
                    executionRequest: SINGLE_URI_METRIC_EXECUTION_REQUEST,
                    executionResponse: SINGLE_METRIC_EXECUTION_RESPONSE,
                    executionResult: SINGLE_METRIC_EXECUTION_RESULT,
                    drillableItems: [{
                        identifier: 'metric.lost',
                        uri: '/gdc/md/project_id/obj/1'
                    }],
                    onFiredDrillEvent: drillEventFunction
                });

                const primaryValue = wrapper.find('.s-headline-primary-value');
                const clickEvent = { target: { dispatchEvent: jest.fn() } };
                primaryValue.simulate('click', clickEvent);

                expect(drillEventFunction).toHaveBeenCalledTimes(1);
                expect(drillEventFunction).toBeCalledWith(DRILL_EVENT_DATA_BY_MEASURE_URI);

                expect(clickEvent.target.dispatchEvent).toHaveBeenCalledTimes(1);
                const customEvent = clickEvent.target.dispatchEvent.mock.calls[0][0];
                expect(customEvent.bubbles).toBeTruthy();
                expect(customEvent.type).toEqual('drill');
                expect(customEvent.detail).toEqual(DRILL_EVENT_DATA_BY_MEASURE_URI);
            });

            it('should dispatch only drill event', () => {
                const drillEventFunction = jest.fn(() => false);

                const wrapper = createComponent({
                    executionRequest: SINGLE_URI_METRIC_EXECUTION_REQUEST,
                    executionResponse: SINGLE_METRIC_EXECUTION_RESPONSE,
                    executionResult: SINGLE_METRIC_EXECUTION_RESULT,
                    drillableItems: [{
                        identifier: 'metric.lost',
                        uri: '/gdc/md/project_id/obj/1'
                    }],
                    onFiredDrillEvent: drillEventFunction
                });

                const primaryValue = wrapper.find('.s-headline-primary-value');
                const clickEvent = { target: { dispatchEvent: jest.fn() } };
                primaryValue.simulate('click', clickEvent);

                expect(drillEventFunction).toHaveBeenCalledTimes(1);
                expect(drillEventFunction).toBeCalledWith(DRILL_EVENT_DATA_BY_MEASURE_URI);

                expect(clickEvent.target.dispatchEvent).toHaveBeenCalledTimes(0);
            });

            it('should dispatch drill event for adhoc measure by defined uri', () => {
                const drillEventFunction = jest.fn(() => false);

                const wrapper = createComponent({
                    executionRequest: SINGLE_URI_METRIC_EXECUTION_REQUEST,
                    executionResponse: SINGLE_ADHOC_METRIC_EXECUTION_RESPONSE,
                    executionResult: SINGLE_ADHOC_METRIC_EXECUTION_RESULT,
                    drillableItems: [{
                        uri: '/gdc/md/project_id/obj/1'
                    }],
                    onFiredDrillEvent: drillEventFunction
                });

                const primaryValue = wrapper.find('.s-headline-primary-value');
                const clickEvent = { target: { dispatchEvent: jest.fn() } };
                primaryValue.simulate('click', clickEvent);

                expect(drillEventFunction).toHaveBeenCalledTimes(1);
                expect(drillEventFunction).toBeCalledWith(DRILL_EVENT_DATA_BY_MEASURE_URI);
            });

            it('should dispatch drill event for adhoc measure by defined identifier', () => {
                const drillEventFunction = jest.fn(() => false);

                const wrapper = createComponent({
                    executionRequest: SINGLE_IDENTIFIER_METRIC_EXECUTION_REQUEST,
                    executionResponse: SINGLE_ADHOC_METRIC_EXECUTION_RESPONSE,
                    executionResult: SINGLE_ADHOC_METRIC_EXECUTION_RESULT,
                    drillableItems: [{
                        identifier: 'metric.lost'
                    }],
                    onFiredDrillEvent: drillEventFunction
                });

                const primaryValue = wrapper.find('.s-headline-primary-value');
                const clickEvent = { target: { dispatchEvent: jest.fn() } };
                primaryValue.simulate('click', clickEvent);

                expect(drillEventFunction).toHaveBeenCalledTimes(1);
                expect(drillEventFunction).toBeCalledWith(DRILL_EVENT_DATA_BY_MEASURE_IDENTIFIER);
            });
        });
    });
});
