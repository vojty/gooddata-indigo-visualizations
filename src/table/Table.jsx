// (C) 2007-2018 GoodData Corporation
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Measure from 'react-measure';

import TableVisualization from './TableVisualization';

export default class Table extends PureComponent {
    static propTypes = {
        containerMaxHeight: PropTypes.number,
        containerHeight: PropTypes.number,
        containerWidth: PropTypes.number
    };

    static defaultProps = {
        containerMaxHeight: null,
        containerHeight: null,
        containerWidth: null
    };

    render() {
        const { containerHeight, containerMaxHeight, containerWidth } = this.props;
        return (
            <Measure>
                {dimensions => (
                    <div className="viz-table-wrap" style={{ height: '100%', width: '100%' }}>
                        <TableVisualization
                            {...this.props}
                            containerHeight={containerHeight || dimensions.height}
                            containerMaxHeight={containerMaxHeight}
                            containerWidth={containerWidth || dimensions.width}
                        />
                    </div>
                )}
            </Measure>
        );
    }
}
