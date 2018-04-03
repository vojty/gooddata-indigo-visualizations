// (C) 2007-2018 GoodData Corporation
import React, { Component } from 'react';
import { unescape } from 'lodash';
import PropTypes from 'prop-types';

import { isLineChart, isAreaChart } from '../../utils/common';

const VISIBLE_COLOR = '#6D7680';
const DISABLED_COLOR = '#CCCCCC';

export default class LegendItem extends Component {
    static propTypes = {
        item: PropTypes.shape({
            name: PropTypes.string.isRequired,
            color: PropTypes.string.isRequired,
            isVisible: PropTypes.bool
        }).isRequired,
        onItemClick: PropTypes.func.isRequired,
        chartType: PropTypes.string.isRequired,
        width: PropTypes.number
    };

    static defaultProps = {
        width: null
    };

    render() {
        const { item, chartType, width } = this.props;

        const enableBorderRadius = isLineChart(chartType) || isAreaChart(chartType);

        const iconStyle = {
            borderRadius: enableBorderRadius ? '50%' : 'none',
            backgroundColor: item.isVisible ? item.color : DISABLED_COLOR
        };

        const nameStyle = {
            color: item.isVisible ? VISIBLE_COLOR : DISABLED_COLOR
        };

        const style = width ? { width: `${width}px` } : {};

        return (
            <div
                style={style}
                className="series-item"
                onClick={() => this.props.onItemClick(item)}
            >
                <div className="series-icon" style={iconStyle} />
                <div
                    className="series-name"
                    style={nameStyle}
                    title={unescape(item.name)}
                >{item.name}
                </div>
            </div>
        );
    }
}
