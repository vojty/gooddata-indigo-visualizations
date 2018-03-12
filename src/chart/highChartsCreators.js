// (C) 2007-2018 GoodData Corporation
import { merge, get } from 'lodash';
import invariant from 'invariant';
import {
    DEFAULT_SERIES_LIMIT,
    DEFAULT_CATEGORIES_LIMIT,
    getCommonConfiguration
} from './highcharts/commonConfiguration';

import {
    stringifyChartTypes
} from '../utils/common';

import { getLineConfiguration } from './highcharts/lineConfiguration';
import { getBarConfiguration } from './highcharts/barConfiguration';
import { getColumnConfiguration } from './highcharts/columnConfiguration';
import { getCustomizedConfiguration } from './highcharts/customConfiguration';
import { getPieConfiguration } from './highcharts/pieConfiguration';
import { getAreaConfiguration } from './highcharts/areaConfiguration';
import { LINE_CHART, BAR_CHART, COLUMN_CHART, PIE_CHART, AREA_CHART } from '../VisualizationTypes';

const chartConfigurationMap = {
    [LINE_CHART]: getLineConfiguration,
    [BAR_CHART]: getBarConfiguration,
    [COLUMN_CHART]: getColumnConfiguration,
    [PIE_CHART]: getPieConfiguration,
    [AREA_CHART]: getAreaConfiguration
};

export function getHighchartsOptions(chartOptions, drillConfig) {
    const getConfigurationByType = chartConfigurationMap[chartOptions.type];
    invariant(getConfigurationByType, `visualisation type ${chartOptions.type} is invalid (valid types: ${stringifyChartTypes()}).`);
    return merge({},
        getCommonConfiguration(chartOptions, drillConfig),
        getConfigurationByType(),
        getCustomizedConfiguration(chartOptions)
    );
}

export function isDataOfReasonableSize(chartData, limits) {
    const seriesLimit = get(limits, 'series', DEFAULT_SERIES_LIMIT);
    const categoriesLimit = get(limits, 'categories', DEFAULT_CATEGORIES_LIMIT);
    return chartData.series.length <= seriesLimit &&
        chartData.categories.length <= categoriesLimit;
}
