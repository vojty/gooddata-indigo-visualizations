export const THREE_METRICS_EXECUTION_REQUEST = {
    afm: {
        measures: [
            {
                localIdentifier: 'm1',
                definition: {
                    measure: {
                        item: {
                            uri: '/gdc/md/project_id/obj/1'
                        }
                    }
                }
            },
            {
                localIdentifier: 'm2',
                definition: {
                    measure: {
                        item: {
                            identifier: 'metric.found'
                        }
                    }
                }
            }
        ]
    },
    resultSpec: {
        dimensions: [
            {
                itemIdentifiers: ['measureGroup']
            }
        ]
    }
};
