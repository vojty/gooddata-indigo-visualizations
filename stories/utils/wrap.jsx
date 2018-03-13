// (C) 2007-2018 GoodData Corporation
import React from 'react';

import IntlWrapper from './IntlWrapper';

export function wrap(component, height = 600, width = 600, minHeight, minWidth, key) {
    const keyProp = key ? { key } : {};
    return (
        <IntlWrapper {...keyProp}>
            <div style={{ height, width, minHeight, minWidth, border: '1px solid pink', margin: 10 }}>
                {component}
            </div>
        </IntlWrapper>
    );
}
