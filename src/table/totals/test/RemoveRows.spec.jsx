import React from 'react';
import { mount } from 'enzyme';

import RemoveRows from '../RemoveRows';

const FIXTURE = {
    totalsWithData: [
        {
            type: 'sum',
            alias: 'Sum',
            outputMeasureIndexes: [],
            values: [null, null, 125]
        }, {
            type: 'avg',
            alias: 'Avg',
            outputMeasureIndexes: [],
            values: [null, 45.98, 12.32]
        }, {
            type: 'nat',
            alias: 'Rollup',
            outputMeasureIndexes: [],
            values: [null, 12.99, 1.008]
        }
    ]
};

describe('RemoveRows', () => {
    function render(customProps = {}) {
        const props = {
            totalsWithData: FIXTURE.totalsWithData
        };

        return mount(
            <RemoveRows {...props} {...customProps} />
        );
    }

    it('should render as many rows as totals given', () => {
        const component = render();
        expect(component.find('.indigo-totals-remove-row').length).toEqual(FIXTURE.totalsWithData.length);
    });

    it('should call passed \'onRemove\' function with specific total type', () => {
        const onRemove = jest.fn();
        const component = render({ onRemove });
        const totalType = FIXTURE.totalsWithData[1].type;

        const removeAvgButton = component.find(`Button.s-totals-rows-remove-${totalType}`);

        removeAvgButton.simulate('click');
        expect(onRemove).toBeCalledWith(totalType);
        expect(onRemove.mock.calls.length).toEqual(1);
    });
});
