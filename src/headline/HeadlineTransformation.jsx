// (C) 2007-2018 GoodData Corporation
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
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
    getHeadlineData
} from './utils/HeadlineTransformationUtils';

/**
 * The React component that handles the transformation of the execution objects into the data accepted by the {Headline}
 * React component that this components wraps. It also handles the propagation of the drillable items to the component
 * and drill events out of it.
 */
class HeadlineTransformation extends Component {
    static propTypes = {
        executionRequest: ExecutionRequestPropTypes.isRequired,
        executionResponse: ExecutionResponsePropTypes.isRequired,
        executionResult: ExecutionResultPropTypes.isRequired,

        drillableItems: PropTypes.arrayOf(PropTypes.shape(DrillableItem)),

        onFiredDrillEvent: PropTypes.func,
        onAfterRender: PropTypes.func,

        intl: intlShape.isRequired
    };

    static defaultProps = {
        drillableItems: [],
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
            intl,
            executionRequest,
            executionResponse,
            executionResult,
            drillableItems,
            onAfterRender
        } = this.props;

        const data = getHeadlineData(executionResponse, executionResult, intl);
        const dataWithUpdatedDrilling = applyDrillableItems(data, drillableItems, executionRequest);

        return (
            <Headline
                data={dataWithUpdatedDrilling}
                onFiredDrillEvent={this.handleFiredDrillEvent}
                onAfterRender={onAfterRender}
            />
        );
    }
}

export default injectIntl(HeadlineTransformation);
