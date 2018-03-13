// (C) 2007-2018 GoodData Corporation
import cx from 'classnames';
import { colors2Object, numberFormat } from '@gooddata/numberjs';
import styleVariables from '../../styles/variables';

import { ALIGN_LEFT, ALIGN_RIGHT } from '../constants/align';

export function getColumnAlign(header) {
    return (header.type === 'measure') ? ALIGN_RIGHT : ALIGN_LEFT;
}

export function getCellClassNames(rowIndex, columnKey, isDrillable) {
    return cx(
        {
            'gd-cell-drillable': isDrillable
        },
        `s-cell-${rowIndex}-${columnKey}`,
        's-table-cell'
    );
}

export function getStyledLabel(header, cellContent, applyColor = true) {
    if (header.type !== 'measure') {
        return { style: {}, label: cellContent.name };
    }

    const numberInString = cellContent === null ? '' : parseFloat(cellContent);
    const formattedNumber = numberFormat(numberInString, header.format);
    const { label: origLabel, color } = colors2Object(formattedNumber);

    let style;
    let label;
    if (origLabel === '') {
        label = '–';
        style = {
            color: styleVariables.gdColorStateBlank,
            fontWeight: 'bold'
        };
    } else {
        style = (color && applyColor) ? { color } : {};
        label = origLabel;
    }

    return { style, label };
}
