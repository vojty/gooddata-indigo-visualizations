import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { noop } from 'lodash';

import List from '@gooddata/goodstrap/lib/List/List';
import Dropdown, { DropdownBody } from '@gooddata/goodstrap/lib/Dropdown/Dropdown';

import { TOTALS_TYPES_DROPDOWN_WIDTH } from '../TableVisualization';
import DropdownItem from './DropdownItem';
import TableTotalsAddButton from './AddTotalButton';
import { getAddTotalDropdownAlignPoints, shouldShowAddTotalButton } from './utils';

export default class AddTotal extends Component {
    static propTypes = {
        dataSource: PropTypes.object.isRequired,
        header: PropTypes.object.isRequired,
        columnIndex: PropTypes.number.isRequired,
        headersCount: PropTypes.number.isRequired,
        addingMoreTotalsEnabled: PropTypes.bool.isRequired,
        onDropdownOpenStateChanged: PropTypes.func,
        onWrapperHover: PropTypes.func,
        onButtonHover: PropTypes.func,
        onAddTotalsRow: PropTypes.func
    };

    static defaultProps = {
        onDropdownOpenStateChanged: noop,
        onWrapperHover: noop,
        onButtonHover: noop,
        onAddTotalsRow: noop
    };

    constructor() {
        super();

        this.state = {
            dropdownOpened: false
        };
    }

    componentWillUnmount() {
        if (this.state.dropdownOpened) {
            this.onOpenStateChanged(this.props.columnIndex, false);
        }
    }

    onOpenStateChanged(columnIndex, isOpened) {
        this.setState({
            dropdownOpened: isOpened
        });

        this.props.onDropdownOpenStateChanged(columnIndex, isOpened);
    }

    render() {
        const {
            dataSource,
            header,
            columnIndex,
            headersCount,
            onAddTotalsRow,
            onWrapperHover,
            onButtonHover,
            addingMoreTotalsEnabled
        } = this.props;

        const isFirstColumn = (columnIndex === 0);
        const isLastColumn = (columnIndex === headersCount - 1);

        const showAddTotalButton = shouldShowAddTotalButton(header, isFirstColumn, addingMoreTotalsEnabled);
        const dropdownAlignPoint = getAddTotalDropdownAlignPoints(isLastColumn);

        const wrapperClassNames = cx('indigo-totals-add-wrapper', { 'dropdown-active': this.state.dropdownOpened });
        const bodyClassName = cx('indigo-totals-select-type-list', { 'arrow-align-right': isLastColumn });

        const wrapperEvents = {
            onMouseEnter: () => {
                onWrapperHover(columnIndex, true);
            },
            onMouseLeave: () => {
                onWrapperHover(columnIndex, false);
            }
        };

        const addButtonProps = {
            hidden: !showAddTotalButton,
            onClick: () => {
                this.onOpenStateChanged(columnIndex, true);
            },
            onMouseEnter: () => {
                onButtonHover(true);
            },
            onMouseLeave: () => {
                onButtonHover(false);
            }
        };

        return (
            <div className={wrapperClassNames} {...wrapperEvents}>
                <Dropdown
                    onOpenStateChanged={opened => this.onOpenStateChanged(columnIndex, opened)}
                    alignPoints={[dropdownAlignPoint]}
                    button={
                        <TableTotalsAddButton {...addButtonProps} />
                    }
                    body={
                        <DropdownBody
                            List={List}
                            dataSource={dataSource}
                            width={TOTALS_TYPES_DROPDOWN_WIDTH}
                            className={bodyClassName}
                            rowItem={
                                <DropdownItem onSelect={item => onAddTotalsRow(columnIndex, item.type)} />
                            }
                        />
                    }
                />
            </div>
        );
    }
}
