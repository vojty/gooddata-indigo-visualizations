// (C) 2007-2018 GoodData Corporation
import { pick } from 'lodash';
import { RIGHT } from './PositionTypes';
import { isAreaChart, isPieChart } from '../../utils/common';

export const DEFAULT_LEGEND_CONFIG = {
    enabled: true,
    position: RIGHT
};

export function shouldLegendBeEnabled(chartOptions) {
    const seriesLength = chartOptions.data.series.length;
    const { type, stacking, hasStackByAttribute } = chartOptions;
    // More than one measure or stackedBy more than one category
    const hasMoreThanOneSeries = seriesLength > 1;
    const isAreaChartWithOneSerie = isAreaChart(type) && !hasMoreThanOneSeries && !hasStackByAttribute;
    const isStacked = !isAreaChartWithOneSerie && Boolean(stacking);

    const isPieChartWithMoreThanOneCategory =
        (isPieChart(type) && chartOptions.data.series[0].data.length > 1);

    return hasMoreThanOneSeries || isPieChartWithMoreThanOneCategory || isStacked;
}

export function getLegendItems(chartOptions) {
    const legendDataSource = isPieChart(chartOptions.type)
        ? chartOptions.data.series[0].data
        : chartOptions.data.series;
    return legendDataSource.map(legendDataSourceItem => pick(legendDataSourceItem, ['name', 'color', 'legendIndex']));
}

export default function getLegend(legendConfig = {}, chartOptions) {
    const baseConfig = {
        ...DEFAULT_LEGEND_CONFIG,
        ...legendConfig
    };
    return {
        ...baseConfig,
        enabled: baseConfig.enabled && shouldLegendBeEnabled(chartOptions),
        items: getLegendItems(chartOptions)
    };
}
