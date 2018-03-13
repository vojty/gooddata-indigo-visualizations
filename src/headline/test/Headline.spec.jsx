// (C) 2007-2018 GoodData Corporation
import React from 'react';
import { noop } from 'lodash';
import { mount } from 'enzyme';
import Headline from '../Headline';

describe('Headline', () => {
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
        return mount(<Headline {...props} />);
    }

    it('should call after render callback on componentDidMount & componentDidUpdate', () => {
        const onAfterRender = jest.fn();
        const wrapper = createComponent({
            onAfterRender,
            data: {
                primaryItem: {
                    localIdentifier: 'm1',
                    title: 'Some metric',
                    value: '42'
                }
            }
        });

        expect(onAfterRender).toHaveBeenCalledTimes(1);

        wrapper.setProps({
            data: {
                primaryItem: {
                    localIdentifier: 'm1',
                    title: 'Some metric',
                    value: '43'
                }
            }
        });

        expect(onAfterRender).toHaveBeenCalledTimes(2);
    });

    it('should not produce any event upon click when fire handler is set but primary value is not drillable', () => {
        const onFiredDrillEvent = jest.fn();
        const wrapper = createComponent({
            onFiredDrillEvent,
            data: {
                primaryItem: {
                    localIdentifier: 'm1',
                    title: 'Some metric',
                    value: '42'
                }
            }
        });

        const primaryValue = wrapper.find('.s-headline-primary-value');
        primaryValue.simulate('click');

        expect(onFiredDrillEvent).toHaveBeenCalledTimes(0);
    });

    it('should produce correct event upon click when fire handler is set and primary value is drillable', () => {
        const onFiredDrillEvent = jest.fn();
        const wrapper = createComponent({
            onFiredDrillEvent,
            data: {
                primaryItem: {
                    localIdentifier: 'm1',
                    title: 'Some metric',
                    value: '42',
                    isDrillable: true
                }
            }
        });

        const primaryValue = wrapper.find('.s-headline-primary-value');
        primaryValue.simulate('click', { target: 'elementTarget' });

        expect(onFiredDrillEvent).toBeCalledWith({
            localIdentifier: 'm1',
            value: '42',
            element: 'primaryValue'
        }, 'elementTarget');
    });

    it('should have primary value written out as link even when the drillable value is invalid', () => {
        const onFiredDrillEvent = jest.fn();
        const wrapper = createComponent({
            onFiredDrillEvent,
            data: {
                primaryItem: {
                    localIdentifier: 'm1',
                    title: 'Some metric',
                    value: null,
                    isDrillable: true
                }
            }
        });

        const primaryValueLink = wrapper.find('.s-headline-primary-link-clickable');
        const primaryValueText = wrapper.find('.s-headline-primary-value').text();

        primaryValueLink.simulate('click', { target: 'elementTarget' });

        expect(primaryValueLink.exists()).toBe(true);
        expect(primaryValueText).toEqual('–');

        expect(onFiredDrillEvent).toHaveBeenCalledTimes(1);
        expect(onFiredDrillEvent).toBeCalledWith({
            localIdentifier: 'm1',
            value: null,
            element: 'primaryValue'
        }, 'elementTarget');
    });

    it('should have primary value written out as dash when empty string is provided', () => {
        const wrapper = createComponent({
            data: {
                primaryItem: {
                    localIdentifier: 'm1',
                    title: 'Some metric',
                    value: ''
                }
            }
        });

        const primaryValueText = wrapper.find('.s-headline-primary-value').text();

        expect(primaryValueText).toEqual('–');
    });

    it('should have primary value written out as dash when null is provided', () => {
        const wrapper = createComponent({
            data: {
                primaryItem: {
                    localIdentifier: 'm1',
                    title: 'Some metric',
                    value: null
                }
            }
        });

        const primaryValueText = wrapper.find('.s-headline-primary-value').text();

        expect(primaryValueText).toEqual('–');
    });

    it('should have primary value written out as specified in format when null value and format is provided', () => {
        const wrapper = createComponent({
            data: {
                primaryItem: {
                    localIdentifier: 'm1',
                    title: 'Some metric',
                    value: null,
                    format: '[=null]EMPTY'
                }
            }
        });

        const primaryValueText = wrapper.find('.s-headline-primary-value').text();

        expect(primaryValueText).toEqual('EMPTY');
    });

    it('should have primary value written out as dash when undefined is provided', () => {
        const wrapper = createComponent({
            data: {
                primaryItem: {
                    localIdentifier: 'm1',
                    title: 'Some metric',
                    value: undefined
                }
            }
        });

        const primaryValueText = wrapper.find('.s-headline-primary-value').text();

        expect(primaryValueText).toEqual('–');
    });

    it('should have primary value written out as dash when non number string is provided', () => {
        const wrapper = createComponent({
            data: {
                primaryItem: {
                    localIdentifier: 'm1',
                    title: 'Some metric',
                    value: 'xyz'
                }
            }
        });

        const primaryValueText = wrapper.find('.s-headline-primary-value').text();

        expect(primaryValueText).toEqual('–');
    });

    it('should have primary value written out as it is when positive number string is provided without format', () => {
        const wrapper = createComponent({
            data: {
                primaryItem: {
                    localIdentifier: 'm1',
                    title: 'Some metric',
                    value: '1234567890'
                }
            }
        });

        const primaryValueText = wrapper.find('.s-headline-primary-value').text();

        expect(primaryValueText).toEqual('1234567890');
    });

    it('should have primary value written out as it is when negative number string is provided without format', () => {
        const wrapper = createComponent({
            data: {
                primaryItem: {
                    localIdentifier: 'm1',
                    title: 'Some metric',
                    value: '-12345678'
                }
            }
        });

        const primaryValueText = wrapper.find('.s-headline-primary-value').text();

        expect(primaryValueText).toEqual('-12345678');
    });

    it('should have style applied on primary value when format is provided', () => {
        const wrapper = createComponent({
            data: {
                primaryItem: {
                    localIdentifier: 'm1',
                    title: 'Some metric',
                    value: '1666.105',
                    format: '[color=9c46b5][backgroundColor=d2ccde]$#,##0.00'
                }
            }
        });

        const primaryValueText = wrapper.find('.s-headline-primary-value').text();
        const primaryValueStyle = wrapper.find('.s-headline-primary').prop('style');

        expect(primaryValueText).toEqual('$1,666.11');
        expect(primaryValueStyle).toHaveProperty('color', '#9c46b5');
        expect(primaryValueStyle).toHaveProperty('backgroundColor', '#d2ccde');
    });

    it('should not have "empty" style applied on primary value when value is valid', () => {
        const wrapper = createComponent({
            data: {
                primaryItem: {
                    localIdentifier: 'm1',
                    title: 'Some metric',
                    value: '42'
                }
            }
        });

        const emptyValueElement = wrapper.find('.s-headline-primary-value--empty');
        const primaryValueText = wrapper.find('.s-headline-primary-value').text();

        expect(emptyValueElement.exists()).toEqual(false);
        expect(primaryValueText).toEqual('42');
    });

    it('should have "empty" style applied on primary value when value is invalid', () => {
        const wrapper = createComponent({
            data: {
                primaryItem: {
                    localIdentifier: 'm1',
                    title: 'Some metric',
                    value: 'invalid-value'
                }
            }
        });

        const emptyValueElement = wrapper.find('.s-headline-primary-value--empty');
        const primaryValueText = wrapper.find('.s-headline-primary-value').text();

        expect(emptyValueElement.exists()).toEqual(true);
        expect(primaryValueText).toEqual('–');
    });
});
