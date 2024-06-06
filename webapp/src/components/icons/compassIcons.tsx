// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import './compassIcons.scss';

type Props = {
    icon: string,
    className?: string,
}

export default function CompassIcon(props: Props): JSX.Element {
    // All compass icon classes start with icon,
    // so not expecting that prefix in props.
    return (
        <i
            className={`CompassIcon Icon icon-${props.icon} ${props.className}`}
        />
    );
}
