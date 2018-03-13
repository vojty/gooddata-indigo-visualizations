// (C) 2007-2018 GoodData Corporation
import PropTypes from 'prop-types';

const TotalItemPropType = {
    type: PropTypes.oneOf(['sum', 'max', 'min', 'avg', 'med', 'nat']).isRequired,
    outputMeasureIndexes: PropTypes.arrayOf(PropTypes.number).isRequired,
    alias: PropTypes.string
};

export const TotalsPropTypes = PropTypes.arrayOf(PropTypes.shape(TotalItemPropType));

const TotalItemWithDataPropType = {
    ...TotalItemPropType,
    values: PropTypes.array.isRequired
};

export const TotalsWithDataPropTypes = PropTypes.arrayOf(PropTypes.shape(TotalItemWithDataPropType));
