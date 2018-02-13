export const THREE_METRICS_EXECUTION_RESPONSE = {
    dimensions: [
        {
            headers: [
                {
                    measureGroupHeader: {
                        items: [
                            {
                                measureHeaderItem: {
                                    name: 'Lost',
                                    format: '$#,##0.00',
                                    localIdentifier: 'm1',
                                    uri: '/gdc/md/project_id/obj/1',
                                    identifier: 'metric.lost'
                                }
                            },
                            {
                                measureHeaderItem: {
                                    name: 'Found',
                                    format: '$#,##0.00',
                                    localIdentifier: 'm2',
                                    uri: '/gdc/md/project_id/obj/2',
                                    identifier: 'metric.found'
                                }
                            },
                            {
                                measureHeaderItem: {
                                    name: 'Sold',
                                    format: '#,##0.00%',
                                    localIdentifier: 'm3',
                                    uri: '/gdc/md/project_id/obj/3',
                                    identifier: 'metric.sold'
                                }
                            }
                        ]
                    }
                }
            ]
        }
    ],
    links: {
        executionResult: '/gdc/app/projects/project_id/executionResults/foo?q=bar&c=baz&dimension=a&dimension=m'
    }
};
