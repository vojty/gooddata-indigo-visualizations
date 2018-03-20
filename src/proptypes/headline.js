// (C) 2007-2018 GoodData Corporation
import PropTypes from 'prop-types';

const HeadlineDataItem = PropTypes.shape({
    localIdentifier: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    value: PropTypes.string,
    format: PropTypes.string,
    isDrillable: PropTypes.bool
});

export const HeadlineData = PropTypes.shape({
    primaryItem: HeadlineDataItem.isRequired,
    secondaryItem: HeadlineDataItem,
    tertiaryItem: HeadlineDataItem
});
