// (C) 2007-2018 GoodData Corporation
export const data = {
    isLoaded: true,
    headers: [{
        type: 'attrLabel',
        id: 'closed.aag81lMifn6q',
        uri: '/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/324',
        title: 'Year (Closed)'
    }, {
        type: 'metric',
        id: 'aaYh6Voua2yj',
        uri: '/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/13465',
        title: 'aaa <b># of Open Opps.',
        format: '#,##0'
    }, {
        type: 'metric',
        id: 'afdV48ABh8CN',
        uri: '/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/2825',
        title: '# of Opportunities',
        format: '#,##0'
    }],
    rawData: [
        [
            {
                id: '2010',
                name: '2010'
            },
            '30',
            '1324'
        ],
        [
            {
                id: '2011',
                name: '2011'
            },
            '74',
            '2703'
        ],
        [
            {
                id: '2012',
                name: '2012'
            },
            '735',
            '1895'
        ]
    ],
    isLoading: false
};

export const config = {
    type: 'line',
    buckets: {
        measures: [
            {
                measure: {
                    type: 'metric',
                    objectUri: '/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/13465',
                    metricAttributeFilters: [],
                    showInPercent: false,
                    showPoP: false,
                    format: '#,##0',
                    sorts: []
                }
            },
            {
                measure: {
                    type: 'metric',
                    objectUri: '/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/2825',
                    metricAttributeFilters: [],
                    showInPercent: false,
                    showPoP: false,
                    format: '#,##0',
                    sorts: []
                }
            }
        ],
        categories: [
            {
                category: {
                    type: 'date',
                    collection: 'attribute',
                    displayForm: '/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/324',
                    dateFilterSettings: {
                        granularity: 'GDC.time.year'
                    }
                }
            }
        ],
        filters: [
            {
                dateFilterSettings: {
                    granularity: 'GDC.time.year',
                    dataSet: '/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/324'
                }
            }
        ]
    }
};
