import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { noop } from 'lodash';

import Button from '@gooddata/goodstrap/lib/Button/Button';

import { TOTALS_ADD_ROW_HEIGHT } from '../TableVisualization';
import { TotalsWithDataPropTypes } from '../../proptypes/totals';

const LAST_ADDED_TOTAL_ROW_HIGHLIGHT_PERIOD = 1000;

export default class RemoveRows extends Component {
    static propTypes = {
        onRemove: PropTypes.func,
        lastAddedTotalType: PropTypes.string,
        onLastAddedTotalRowHighlightPeriodEnd: PropTypes.func,
        totalsWithData: TotalsWithDataPropTypes
    };

    static defaultProps = {
        onRemove: noop,
        lastAddedTotalType: '',
        onLastAddedTotalRowHighlightPeriodEnd: noop,
        totalsWithData: []
    };

    constructor(props) {
        super(props);

        this.setWrapperRef = this.setWrapperRef.bind(this);
    }

    getWrapperRef() {
        return this.wrapperRef;
    }

    setWrapperRef(ref) {
        this.wrapperRef = ref;
    }

    renderRow(total) {
        const { onRemove, lastAddedTotalType } = this.props;

        const islastAddedTotalType = total.type === lastAddedTotalType;

        const classNames = cx(
            'indigo-totals-remove-row',
            `totals-remove-row-${total.type}`,
            { 'last-added': islastAddedTotalType }
        );

        return (
            <div className={classNames} key={`totals-row-overlay-${total.type}`}>
                <Button
                    className={cx(`s-totals-rows-remove-${total.type}`, 'indigo-totals-row-remove-button')}
                    onClick={() => { onRemove(total.type); }}
                />
            </div>
        );
    }

    render() {
        const { totalsWithData, lastAddedTotalType } = this.props;

        const style = { bottom: `${TOTALS_ADD_ROW_HEIGHT}px` };

        if (lastAddedTotalType.length) {
            setTimeout(this.props.onLastAddedTotalRowHighlightPeriodEnd, LAST_ADDED_TOTAL_ROW_HIGHLIGHT_PERIOD);
        }

        return (
            <div className="indigo-totals-remove" style={style} ref={this.setWrapperRef}>
                {totalsWithData.map(total => this.renderRow(total))}
            </div>
        );
    }
}
