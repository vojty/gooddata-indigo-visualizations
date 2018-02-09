import cloneDeep from 'lodash/cloneDeep';

const LINE_WIDTH = 3;

const LINE_TEMPLATE = {
    plotOptions: {
        series: {
            marker: {
                symbol: 'circle',
                radius: 4.5
            },
            lineWidth: LINE_WIDTH,
            fillOpacity: 0.3,
            states: {
                hover: {
                    lineWidth: LINE_WIDTH + 1
                }
            },
            dataLabels: {
                style: {
                    fontWeight: 'normal'
                }
            }
        },
        column: {
            dataLabels: {}
        }
    },
    xAxis: {
        categories: []
    },
    yAxis: {
        stackLabels: {
            enabled: false
        }
    }
};

export function getLineConfiguration() {
    return cloneDeep(LINE_TEMPLATE);
}
