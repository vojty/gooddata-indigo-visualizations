// (C) 2007-2018 GoodData Corporation
import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { screenshotWrap } from '@gooddata/test-storybook';
import Headline from '../src/headline/Headline';
import { wrap } from './utils/wrap';

import '../src/styles/headline.scss';
import HeadlineTransformation from '../src/headline/HeadlineTransformation';
import {
    SINGLE_URI_METRIC_EXECUTION_REQUEST,
    SINGLE_METRIC_EXECUTION_RESPONSE,
    SINGLE_METRIC_EXECUTION_RESULT
} from '../src/headline/test/fixtures/one_measure';

storiesOf('Headline components/Headline', module)
    .add('Simple', () =>
        screenshotWrap(
            wrap(
                <Headline
                    data={{
                        primaryItem: {
                            uri: 'myId',
                            value: '42225.01',
                            title: 'Sum of Clicks'
                        }
                    }}
                    onAfterRender={action('onAfterRender')}
                />,
                100, 250)
        )
    )
    .add('Formatted', () =>
        screenshotWrap(
            wrap(
                <Headline
                    data={{
                        primaryItem: {
                            uri: 'myId',
                            value: '666429.405',
                            format: '[color=9c46b5][backgroundColor=d2ccde]$#,##0.00 group',
                            title: 'Yearly Earnings',
                            isDrillable: false
                        }
                    }}
                    onAfterRender={action('onAfterRender')}
                />,
                100, 700)
        )
    )
    .add('Formatted with drilling', () =>
        screenshotWrap(
            wrap(
                <Headline
                    data={{
                        primaryItem: {
                            localIdentifier: 'myId',
                            value: '6664.405',
                            format: '[color=9c46b5] $#,##0.00 group',
                            title: 'Yearly Earnings',
                            isDrillable: true
                        }
                    }}
                    onAfterRender={action('onAfterRender')}
                    onFiredDrillEvent={action('onFiredDrillEvent')}
                />,
                100, 700)
        )
    )
    .add('Invalid value - default formatting', () =>
        screenshotWrap(
            wrap(
                <Headline
                    data={{
                        primaryItem: {
                            uri: 'myId',
                            value: 'invalid-value',
                            title: 'Sum of Clicks'
                        }
                    }}
                    onAfterRender={action('onAfterRender')}
                />,
                100, 250)
        )
    )
    .add('Invalid value - custom formatting', () =>
        screenshotWrap(
            wrap(
                <Headline
                    data={{
                        primaryItem: {
                            uri: 'myId',
                            value: null,
                            title: 'Sum of Clicks',
                            format: '[=null]EMPTY'
                        }
                    }}
                    onAfterRender={action('onAfterRender')}
                />,
                100, 250)
        )
    )
    .add('Drillable primary value', () =>
        screenshotWrap(
            wrap(
                <Headline
                    data={{
                        primaryItem: {
                            uri: 'myId',
                            value: '53336',
                            title: 'Sum of Clicks',
                            isDrillable: true
                        }
                    }}
                    onAfterRender={action('onAfterRender')}
                    onFiredDrillEvent={action('onFiredDrillEvent')}
                />,
                100, 250)
        )
    )
    .add('Drillable primary invalid value', () =>
        screenshotWrap(
            wrap(
                <Headline
                    data={{
                        primaryItem: {
                            uri: 'myId',
                            value: null,
                            title: 'Sum of Clicks',
                            isDrillable: true
                        }
                    }}
                    onAfterRender={action('onAfterRender')}
                    onFiredDrillEvent={action('onFiredDrillEvent')}
                />,
                100, 250)
        )
    );

storiesOf('Headline components/HeadlineTransformation', module)
    .add('Drillable primary value', () =>
        screenshotWrap(
            wrap(
                <HeadlineTransformation
                    executionRequest={SINGLE_URI_METRIC_EXECUTION_REQUEST}
                    executionResponse={SINGLE_METRIC_EXECUTION_RESPONSE}
                    executionResult={SINGLE_METRIC_EXECUTION_RESULT}
                    drillableItems={[{
                        identifier: 'metric.lost',
                        uri: '/gdc/md/project_id/obj/1'
                    }]}
                    onFiredDrillEvent={action('onFiredDrillEvent')}
                    onAfterRender={action('onAfterRender')}
                />,
                100, 350)
        )
    );
