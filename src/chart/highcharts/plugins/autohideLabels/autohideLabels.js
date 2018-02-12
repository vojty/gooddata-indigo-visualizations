import { getChartType } from '../../helpers';
import { COLUMN_CHART, BAR_CHART } from '../../../../VisualizationTypes';
import autohideColumnLabels from './autohideColumnLabels';
import autohideBarLabels from './autohideBarLabels';

const autohideLabels = (Highcharts) => {
    Highcharts.wrap(Highcharts.Chart.prototype, 'hideOverlappingLabels', function(proceed, labels) { // eslint-disable-line
        const chart = this;
        const chartType = getChartType(this);

        if (chartType === COLUMN_CHART) {
            autohideColumnLabels(chart);
            return;
        }
        if (chartType === BAR_CHART) {
            autohideBarLabels(chart);
            return;
        }
        proceed.call(this, labels);
    });
};

export default autohideLabels;
