import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { noop } from 'lodash';
import { Textfit } from 'react-textfit';
import { HeadlineData, HeadlineConfig } from '../proptypes/headline';
import formatItemValue from './utils/HeadlineDataItemUtils';

/**
 * The React component that renders the Headline visualisation.
 */
export default class Headline extends Component {
    static propTypes = {
        config: HeadlineConfig,
        data: HeadlineData.isRequired,
        onFiredDrillEvent: PropTypes.func,
        onAfterRender: PropTypes.func
    };

    static defaultProps = {
        config: {
            maxFontSize: 50
        },
        onFiredDrillEvent: noop,
        onAfterRender: noop
    };

    constructor(props) {
        super(props);

        this.handleClickOnPrimaryItem = this.handleClickOnPrimaryItem.bind(this);
    }

    componentDidMount() {
        this.props.onAfterRender();
    }

    componentDidUpdate() {
        this.props.onAfterRender();
    }

    fireDrillEvent(item, elementName, elementTarget) {
        const { onFiredDrillEvent } = this.props;

        if (onFiredDrillEvent) {
            const itemContext = {
                uri: item.uri,
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

    renderPrimaryItemAsValue(primaryItem) {
        const { value, isValueEmpty } = formatItemValue(primaryItem);

        const valueClassNames = classNames([
            'headline-primary-value',
            's-headline-primary-value'
        ], {
            'headline-primary-value--empty': isValueEmpty,
            's-headline-primary-value--empty': isValueEmpty
        });

        return (
            <div className={valueClassNames}>
                {value}
            </div>
        );
    }

    renderPrimaryItemAsLink(primaryItem) {
        return (
            <div
                className="headline-primary-link s-headline-primary-link-clickable"
                onClick={this.handleClickOnPrimaryItem}
            >
                {this.renderPrimaryItemAsValue(primaryItem)}
            </div>
        );
    }

    renderPrimaryItem(primaryItem) {
        return primaryItem.isDrillable
            ? this.renderPrimaryItemAsLink(primaryItem)
            : this.renderPrimaryItemAsValue(primaryItem);
    }

    render() {
        const { data: { primaryItem } } = this.props;
        const { cssStyle } = formatItemValue(primaryItem);

        return (
            <div className="headline">
                <div className="headline-primary s-headline-primary" style={cssStyle}>
                    <Textfit mode="single" max={this.props.config.maxFontSize}>
                        {this.renderPrimaryItem(primaryItem)}
                    </Textfit>
                </div>
            </div>
        );
    }
}
