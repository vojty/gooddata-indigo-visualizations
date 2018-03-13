// (C) 2007-2018 GoodData Corporation
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { noop, pick } from 'lodash';

import Table from './Table';
import DrillableItem from '../proptypes/DrillableItem';
import { getHeaders, getRows, validateTableProportions, getTotalsWithData } from './utils/dataTransformation';
import { getSortInfo, getSortItem } from './utils/sort';
import {
    ExecutionRequestPropTypes,
    ExecutionResponsePropTypes,
    ExecutionResultPropTypes
} from '../proptypes/execution';
import { TotalsPropTypes } from '../proptypes/totals';

function renderDefaultTable(props) {
    return <Table {...props} />;
}

export default class TableTransformation extends Component {
    static propTypes = {
        afterRender: PropTypes.func,
        totals: TotalsPropTypes,
        totalsEditAllowed: PropTypes.bool,
        onTotalsEdit: PropTypes.func,
        config: PropTypes.object,
        drillableItems: PropTypes.arrayOf(PropTypes.shape(DrillableItem)),
        executionRequest: ExecutionRequestPropTypes.isRequired,
        executionResponse: ExecutionResponsePropTypes.isRequired,
        executionResult: ExecutionResultPropTypes.isRequired,
        height: PropTypes.number,
        maxHeight: PropTypes.number,
        onFiredDrillEvent: PropTypes.func,
        onSortChange: PropTypes.func,
        tableRenderer: PropTypes.func,
        width: PropTypes.number,
        lastAddedTotalType: PropTypes.string,
        onLastAddedTotalRowHighlightPeriodEnd: PropTypes.func
    };

    static defaultProps = {
        afterRender: noop,
        totals: [],
        totalsEditAllowed: false,
        onTotalsEdit: noop,
        config: {},
        drillableItems: [],
        height: undefined,
        maxHeight: undefined,
        onFiredDrillEvent: noop,
        onSortChange: noop,
        tableRenderer: renderDefaultTable,
        width: undefined,
        lastAddedTotalType: '',
        onLastAddedTotalRowHighlightPeriodEnd: noop
    };

    render() {
        const {
            config,
            drillableItems,
            executionRequest,
            executionResponse,
            executionResult,
            height,
            maxHeight,
            onFiredDrillEvent,
            onSortChange,
            width,
            totals,
            totalsEditAllowed,
            onTotalsEdit,
            afterRender,
            lastAddedTotalType,
            onLastAddedTotalRowHighlightPeriodEnd
        } = this.props;

        const headers = getHeaders(executionResponse);
        const rows = getRows(executionResult);
        const totalsWithData = getTotalsWithData(totals, executionResult);

        validateTableProportions(headers, rows);

        const sortItem = getSortItem(executionRequest);
        const { sortBy, sortDir } = getSortInfo(sortItem, headers);

        const tableProps = {
            ...pick(config, ['rowsPerPage', 'onMore', 'onLess', 'sortInTooltip', 'stickyHeaderOffset']),
            afterRender,
            totalsWithData,
            totalsEditAllowed,
            onTotalsEdit,
            drillableItems,
            executionRequest,
            headers,
            onFiredDrillEvent,
            onSortChange,
            rows,
            sortBy,
            sortDir,
            lastAddedTotalType,
            onLastAddedTotalRowHighlightPeriodEnd
        };

        if (height) {
            tableProps.containerHeight = height;
        }

        if (maxHeight) {
            tableProps.containerMaxHeight = maxHeight;
        }

        if (width) {
            tableProps.containerWidth = width;
        }

        return this.props.tableRenderer(tableProps);
    }
}
