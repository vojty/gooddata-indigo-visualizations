// (C) 2007-2018 GoodData Corporation
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { noop } from 'lodash';
import ResponsiveText from './ResponsiveText';
import { HeadlineData } from '../proptypes/headline';
import formatItemValue from './utils/HeadlineDataItemUtils';

export default class Headline extends Component {
    static propTypes = {
        data: HeadlineData.isRequired,
        onFiredDrillEvent: PropTypes.func,
        onAfterRender: PropTypes.func
    };

    static defaultProps = {
        onFiredDrillEvent: noop,
        onAfterRender: noop
    };

    constructor(props) {
        super(props);

        this.handleClickOnPrimaryItem = this.handleClickOnPrimaryItem.bind(this);
        this.handleClickOnSecondaryItem = this.handleClickOnSecondaryItem.bind(this);
    }

    componentDidMount() {
        this.props.onAfterRender();
    }

    componentDidUpdate() {
        this.props.onAfterRender();
    }

    getDrillableClasses(isDrillable) {
        return isDrillable
            ? [
                'is-drillable',
                's-is-drillable'
            ]
            : [];
    }

    getPrimaryItemClasses(primaryItem) {
        return classNames([
            'headline-primary-item',
            's-headline-primary-item',
            ...this.getDrillableClasses(primaryItem.isDrillable)
        ]);
    }

    getSecondaryItemClasses(secondaryItem) {
        return classNames([
            'gd-flex-item',
            'headline-compare-section-item',
            'headline-secondary-item',
            's-headline-secondary-item',
            ...this.getDrillableClasses(secondaryItem.isDrillable)
        ]);
    }

    getValueWrapperClasses(formattedItem) {
        return classNames([
            'headline-value-wrapper',
            's-headline-value-wrapper'
        ], {
            'headline-value--empty': formattedItem.isValueEmpty,
            's-headline-value--empty': formattedItem.isValueEmpty
        });
    }

    fireDrillEvent(item, elementName, elementTarget) {
        const { onFiredDrillEvent } = this.props;

        if (onFiredDrillEvent) {
            const itemContext = {
                localIdentifier: item.localIdentifier,
                value: item.value,
                element: elementName
            };

            onFiredDrillEvent(itemContext, elementTarget);
        }
    }

    handleClickOnPrimaryItem(event) {
        const { data: { primaryItem } } = this.props;

        this.fireDrillEvent(primaryItem, 'primaryValue', event.target);
    }

    handleClickOnSecondaryItem(event) {
        const { data: { secondaryItem } } = this.props;

        this.fireDrillEvent(secondaryItem, 'secondaryValue', event.target);
    }

    renderTertiaryItem() {
        const { data: { tertiaryItem } } = this.props;
        const formattedItem = formatItemValue(tertiaryItem);

        return (
            <div className="gd-flex-item headline-compare-section-item headline-tertiary-item s-headline-tertiary-item">
                <div className={this.getValueWrapperClasses(formattedItem)}>
                    {formattedItem.value}
                </div>
                <div className="headline-title-wrapper s-headline-title-wrapper">
                    {tertiaryItem.title}
                </div>
            </div>
        );
    }

    renderSecondaryItem() {
        const { data: { secondaryItem } } = this.props;

        const formattedItem = formatItemValue(secondaryItem);
        const valueClickCallback = secondaryItem.isDrillable ? this.handleClickOnSecondaryItem : null;

        const secondaryValue = secondaryItem.isDrillable
            ? this.renderHeadlineItemAsLink(formattedItem)
            : this.renderHeadlineItemAsValue(formattedItem);

        return (
            <div
                className={this.getSecondaryItemClasses(secondaryItem)}
                onClick={valueClickCallback}
                style={formattedItem.cssStyle}
            >
                <div className="headline-value-wrapper s-headline-value-wrapper">
                    <ResponsiveText>
                        {secondaryValue}
                    </ResponsiveText>
                </div>
                <div className="headline-title-wrapper s-headline-title-wrapper">
                    {secondaryItem.title}
                </div>
            </div>
        );
    }

    renderCompareItems() {
        const { data: { secondaryItem } } = this.props;

        if (!secondaryItem) {
            return null;
        }

        return (
            <div className="gd-flex-container headline-compare-section">
                {this.renderTertiaryItem()}
                {this.renderSecondaryItem()}
            </div>
        );
    }

    renderHeadlineItem(item, formattedItem) {
        return item.isDrillable
            ? this.renderHeadlineItemAsLink(formattedItem)
            : this.renderHeadlineItemAsValue(formattedItem);
    }

    renderHeadlineItemAsValue(formattedItem) {
        const valueClassNames = classNames([
            'headline-value',
            's-headline-value'
        ], {
            'headline-value--empty': formattedItem.isValueEmpty,
            's-headline-value--empty': formattedItem.isValueEmpty
        });

        return (
            <div className={valueClassNames}>
                {formattedItem.value}
            </div>
        );
    }

    renderHeadlineItemAsLink(formattedItem, itemType) {
        return (
            <div className="headline-item-link s-headline-item-link">
                {this.renderHeadlineItemAsValue(formattedItem, itemType)}
            </div>
        );
    }

    renderPrimaryItem() {
        const { data: { primaryItem } } = this.props;
        const formattedItem = formatItemValue(primaryItem);

        const valueClickCallback = primaryItem.isDrillable ? this.handleClickOnPrimaryItem : null;

        return (
            <div
                className={this.getPrimaryItemClasses(primaryItem)}
                style={formattedItem.cssStyle}
            >
                <ResponsiveText>
                    <div className="headline-value-wrapper" onClick={valueClickCallback}>
                        {this.renderHeadlineItem(primaryItem, formattedItem)}
                    </div>
                </ResponsiveText>
            </div>
        );
    }

    render() {
        return (
            <div className="headline">
                {this.renderPrimaryItem()}
                {this.renderCompareItems()}
            </div>
        );
    }
}
