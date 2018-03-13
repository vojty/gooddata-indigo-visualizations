// (C) 2007-2018 GoodData Corporation
import { range, unzip, isNumber } from 'lodash';

function generateRawData(fns, length) {
    const data = [x => ({ id: x, name: x.toString() }), ...fns].map((fn) => {
        return range(1, length + 1).map((n) => {
            const res = fn(n);

            return isNumber(res) ? `${res}` : res;
        });
    });

    return unzip(data);
}

export function createMock(type, fnsConfig, length) {
    const fns = fnsConfig.map(config => config.fn);
    const rawData = generateRawData(fns, length);
    const metricHeaders = fnsConfig.map((config, i) => {
        const n = i + 1;
        return {
            type: 'metric',
            id: n.toString(),
            uri: `/gdc/md/${n}`,
            title: config.title,
            format: '#,##0.00'
        };
    });

    const config = {
        type,
        buckets: {
            categories: [
                {
                    category: {
                        collection: 'attribute',
                        displayForm: '/gdc/md/attr'
                    }
                }
            ]
        }
    };

    return {
        data: {
            rawData,
            headers: [
                {
                    type: 'attrLabel',
                    id: 'attr',
                    uri: '/gdc/md/attr',
                    title: 'N'
                },
                ...metricHeaders
            ],
            isLoading: false,
            isLoaded: true
        },
        config
    };
}
