import PropTypes from 'prop-types';

export const HeadlineConfig = PropTypes.shape({
    maxFontSize: PropTypes.number
});

const HeadlineDataItem = PropTypes.shape({
    uri: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    value: PropTypes.string,
    format: PropTypes.string,
    isDrillable: PropTypes.bool
});

export const HeadlineData = PropTypes.shape({
    primaryItem: HeadlineDataItem.isRequired
});
