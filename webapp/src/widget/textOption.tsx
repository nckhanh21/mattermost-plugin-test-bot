// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {MenuOptionProps} from './menuItem';

type TextOptionProps = MenuOptionProps & {
    icon?: React.ReactNode,
    rightIcon?: React.ReactNode,
    className?: string
}

function TextOption(props:TextOptionProps): JSX.Element {
    const {name, icon, rightIcon} = props;
    let className = 'MenuOption TextOption menu-option';

    if (props.className) {
        className += ' ' + props.className;
    }

    const buttonClick = (e: any) => {
        e.target.dispatchEvent(new Event('menuItemClicked'));
        props.onClick(props.id);
    };

    return (
        <div
            role='button'
            aria-label={name}
            className={className}
            onClick={buttonClick}
        >
            {icon ?? <div className='menu-option-icon'/>}
            <div className='menu-name'>{name}</div>
            {rightIcon ?? <div className='menu-option-icon'/>}
        </div>
    );
}

export default React.memo(TextOption);
