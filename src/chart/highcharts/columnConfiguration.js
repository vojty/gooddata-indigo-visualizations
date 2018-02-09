import cloneDeep from 'lodash/cloneDeep';

import { MAX_POINT_WIDTH } from './commonConfiguration';

const COLUMN_TEMPLATE = {
    chart: {
        type: 'column'
    },
    plotOptions: {
        column: {
            dataLabels: {
                enabled: true,
                crop: false,
                overflow: 'none',
                padding: 2
            },
            maxPointWidth: MAX_POINT_WIDTH
        },
        series: {
            states: {
                hover: {
                    enabled: false
                }
            }
        }
    },
    yAxis: {
        stackLabels: {
            enabled: true
        }
    }
};

export function getColumnConfiguration() {
    return cloneDeep(COLUMN_TEMPLATE);
}
