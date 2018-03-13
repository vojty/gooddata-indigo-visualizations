// (C) 2007-2018 GoodData Corporation
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { noop } from 'lodash';
import {
    ExecutionRequestPropTypes,
    ExecutionResponsePropTypes,
    ExecutionResultPropTypes
} from '../proptypes/execution';
import DrillableItem from '../proptypes/DrillableItem';
import Headline from './Headline';
import {
    applyDrillableItems,
    buildDrillEventData,
    fireDrillEvent,
    getData
} from './utils/HeadlineTransformationUtils';
import { HeadlineConfig } from '../proptypes/headline';

/**
 * The React component that handles the transformation of the execution objects into the data accepted by the {Headline}
 * React component that this components wraps. It also handles the propagation of the drillable items to the component
 * and drill events out of it.
 */
export default class HeadlineTransformation extends Component {
    static propTypes = {
        executionRequest: ExecutionRequestPropTypes.isRequired,
        executionResponse: ExecutionResponsePropTypes.isRequired,
        executionResult: ExecutionResultPropTypes.isRequired,

        drillableItems: PropTypes.arrayOf(PropTypes.shape(DrillableItem)),

        config: HeadlineConfig,

        onFiredDrillEvent: PropTypes.func,
        onAfterRender: PropTypes.func
    };

    static defaultProps = {
        drillableItems: [],
        config: {
            maxFontSize: 50
        },
        onFiredDrillEvent: noop,
        onAfterRender: noop
    };

    constructor(props) {
        super(props);

        this.handleFiredDrillEvent = this.handleFiredDrillEvent.bind(this);
    }

    handleFiredDrillEvent(item, target) {
        const { onFiredDrillEvent, executionRequest, executionResponse } = this.props;
        const drillEventData = buildDrillEventData(item, executionRequest, executionResponse);

        fireDrillEvent(onFiredDrillEvent, drillEventData, target);
    }

    render() {
        const {
            executionRequest,
            executionResponse,
            executionResult,
            drillableItems,
            config,
            onAfterRender
        } = this.props;

        const data = getData(executionRequest, executionResponse, executionResult);
        const dataWithUpdatedDrilling = applyDrillableItems(data, drillableItems, executionRequest);

        return (
            <Headline
                config={config}
                data={dataWithUpdatedDrilling}
                onFiredDrillEvent={this.handleFiredDrillEvent}
                onAfterRender={onAfterRender}
            />
        );
    }
}
