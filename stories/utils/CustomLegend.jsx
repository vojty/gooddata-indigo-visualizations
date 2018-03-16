import React, { PureComponent } from 'react';
import { screenshotWrap } from '@gooddata/test-storybook';

import ChartTransformation from '../../src/chart/ChartTransformation';
import { barChartWith3MetricsAndViewByAttribute } from '../test_data/fixtures';
import { wrap } from './wrap';

export default class CustomLegend extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            legendItems: null
        };
    }

    renderTriangle(color) {
        const style = {
            width: 0,
            height: 0,
            borderTop: '10px solid transparent',
            borderLeft: `20px solid ${color}`,
            borderBottom: '10px solid transparent',
            marginRight: '5px'
        };
        return (
            <div style={style} />
        );
    }

    renderLegend() {
        const { legendItems } = this.state;
        return (
            <div className="custom-legend">
                {legendItems.map((item, i) => {
                    const { color } = item;
                    return (
                        <div
                            key={i} // eslint-disable-line react/no-array-index-key
                            onClick={item.onClick}
                            style={{ display: 'flex', padding: '5px 0', cursor: 'pointer' }}
                        >
                            {this.renderTriangle(color)}
                            <span style={{ color }}>{item.name}</span>
                        </div>
                    );
                })}
            </div>
        );
    }

    render() {
        const dataSet = barChartWith3MetricsAndViewByAttribute;
        return screenshotWrap(
            <div>
                {this.state.legendItems && this.renderLegend()}
                {wrap(
                    <ChartTransformation
                        config={{
                            type: 'column',
                            legend: {
                                enabled: false
                            }
                        }}
                        {...dataSet}
                        onDataTooLarge={f => f}
                        onLegendReady={(data) => {
                            this.setState(data);
                        }}
                    />
                )}
            </div>
        );
    }
}
