import React, {useState, useRef, useCallback} from 'react';
import PropTypes from 'prop-types';

import {changeOpacity, makeStyleFromTheme} from 'mattermost-redux/utils/theme_utils';
import TextareaAutosize from 'react-textarea-autosize';

import CompleteButton from '../buttons/complete';
import AcceptButton from '../buttons/accept';
import {
    canComplete,
    canRemove,
    canAccept,
    canBump,
    handleFormattedTextClick,
} from '../../utils';
import CompassIcon from '../icons/compassIcons';
import Menu from '../../widget/menu';
import MenuItem from '../../widget/menuItem';
import MenuWrapper from '../../widget/menuWrapper';
import Button from '../../widget/buttons/button';

const PostUtils = window.PostUtils; // import the post utilities

function TodoItem(props) {
    const {issue, theme, siteURL, accept, complete, list, remove, bump, openTodoToast, openAssigneeModal, setEditingTodo, editIssue} = props;
    const [done, setDone] = useState(false);
    const [editTodo, setEditTodo] = useState(false);
    const [message, setMessage] = useState(issue.message);
    const [description, setDescription] = useState(issue.description);
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const [hidden, setHidden] = useState(false);
    const date = new Date(issue.create_at);
    const year = date.getFullYear();
    const month = MONTHS[date.getMonth()];
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = '0' + date.getMinutes();
    const seconds = '0' + date.getSeconds();
    const formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    const formattedDate = month + ' ' + day + ', ' + year;

    const style = getStyle(theme);

    const handleClick = (e) => handleFormattedTextClick(e);

    const htmlFormattedMessage = PostUtils.formatText(issue.message, {
        siteURL,
    });

    const htmlFormattedDescription = PostUtils.formatText(issue.description, {
        siteURL,
    });

    const issueMessage = PostUtils.messageHtmlToComponent(htmlFormattedMessage);
    const issueDescription = PostUtils.messageHtmlToComponent(htmlFormattedDescription);

    let listPositionMessage = '';
    let createdMessage = 'Created ';
    if (issue.user) {
        if (issue.list === '') {
            createdMessage = 'Sent to ' + issue.user;
            listPositionMessage =
                'Accepted. On position ' + (issue.position + 1) + '.';
        } else if (issue.list === 'in') {
            createdMessage = 'Sent to ' + issue.user;
            listPositionMessage =
                'In Inbox on position ' + (issue.position + 1) + '.';
        } else if (issue.list === 'out') {
            createdMessage = 'Received from ' + issue.user;
            listPositionMessage = '';
        }
    }

    const listDiv = (
        <div
            className='light'
            style={style.subtitle}
        >
            {listPositionMessage}
        </div>
    );

    const acceptButton = (
        <AcceptButton
            issueId={issue.id}
            accept={accept}
        />
    );

    const onKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            saveEditedTodo();
        }

        if (e.key === 'Escape') {
            setEditTodo(false);
        }
    };

    const actionButtons = (
        <div className='todo-action-buttons'>
            {canAccept(list) && acceptButton}
        </div>
    );

    const completeTimeout = useRef(null);
    const removeTimeout = useRef(null);

    const completeToast = useCallback(() => {
        openTodoToast({icon: 'check', message: 'Todo completed', undo: undoCompleteTodo});

        setHidden(true);

        completeTimeout.current = setTimeout(() => {
            complete(issue.id);
        }, 5000);
    }, [complete, openTodoToast, issue]);

    const undoRemoveTodo = () => {
        clearTimeout(removeTimeout.current);
        setHidden(false);
    };

    const undoCompleteTodo = () => {
        clearTimeout(completeTimeout.current);
        setHidden(false);
        setDone(false);
    };

    const completeButton = (
        <CompleteButton
            active={done}
            theme={theme}
            issueId={issue.id}
            markAsDone={() => setDone(true)}
            completeToast={completeToast}
        />
    );

    const removeTodo = useCallback(() => {
        openTodoToast({icon: 'trash-can-outline', message: 'Todo deleted', undo: undoRemoveTodo});
        setHidden(true);
        removeTimeout.current = setTimeout(() => {
            remove(issue.id);
        }, 5000);
    }, [remove, issue.id, openTodoToast]);

    const saveEditedTodo = () => {
        setEditTodo(false);
        editIssue(issue.id, message, description);
    };

    const editAssignee = () => {
        openAssigneeModal('');
        setEditingTodo(issue.id);
    };

    return (
        <div
            key={issue.id}
            className={`todo-item ${done ? 'todo-item--done' : ''} ${hidden ? 'todo-item--hidden' : ''} `}
        >
            <div style={style.todoTopContent}>
                <div className='todo-item__content'>
                    {(canComplete(list)) && completeButton}
                    <div style={style.itemContent}>
                        {editTodo && (
                            <div>
                                <TextareaAutosize
                                    style={style.textareaResizeMessage}
                                    placeholder='Enter a title'
                                    value={message}
                                    autoFocus={true}
                                    onKeyDown={(e) => onKeyDown(e)}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                                <TextareaAutosize
                                    style={style.textareaResizeDescription}
                                    placeholder='Enter a description'
                                    value={description}
                                    onKeyDown={(e) => onKeyDown(e)}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                        )}

                        {!editTodo && (
                            <div
                                className='todo-text'
                                onClick={handleClick}
                            >
                                {issueMessage}
                                <div style={style.description}>{issueDescription}</div>
                                {(canRemove(list, issue.list) ||
                                canComplete(list) ||
                                canAccept(list)) &&
                                actionButtons}
                                {(issue.user) && (
                                    <div
                                        className='light'
                                        style={style.subtitle}
                                    >
                                        {createdMessage + ' on ' + formattedDate + ' at ' + formattedTime}
                                    </div>
                                )}
                                {listPositionMessage && listDiv}
                            </div>
                        )}
                    </div>
                </div>
                {!editTodo && (
                    <MenuWrapper>
                        <button className='todo-item__dots'>
                            <CompassIcon icon='dots-vertical'/>
                        </button>
                        <Menu position='left'>
                            {canAccept(list) && (
                                <MenuItem
                                    action={() => accept(issue.id)}
                                    text='Accept todo'
                                    icon='check'
                                />
                            )}
                            {canBump(list, issue.list) && (
                                <MenuItem
                                    text='Bump'
                                    icon='bell-outline'
                                    action={() => bump(issue.id)}
                                />
                            )}
                            <MenuItem
                                text='Edit todo'
                                icon='pencil-outline'
                                action={() => setEditTodo(true)}
                                shortcut='e'
                            />
                            <MenuItem
                                text='Assign to…'
                                icon='account-plus-outline'
                                action={editAssignee}
                                shortcut='a'
                            />
                            {canRemove(list, issue.list) && (
                                <MenuItem
                                    action={removeTodo}
                                    text='Delete todo'
                                    icon='trash-can-outline'
                                    shortcut='d'
                                />
                            )}
                        </Menu>
                    </MenuWrapper>
                )}
            </div>
            {editTodo &&
            (
                <div
                    className='todoplugin-button-container'
                    style={style.buttons}
                >
                    <Button
                        emphasis='tertiary'
                        size='small'
                        onClick={() => setEditTodo(false)}
                    >
                        {'Cancel'}
                    </Button>
                    <Button
                        emphasis='primary'
                        size='small'
                        onClick={saveEditedTodo}
                    >
                        {'Save'}
                    </Button>
                </div>
            )}
        </div>
    );
}

const getStyle = makeStyleFromTheme((theme) => {
    return {
        container: {
            padding: '8px 20px',
            display: 'flex',
            alignItems: 'flex-start',
        },
        itemContent: {
            width: '100%',
            display: 'flex',
            alignItems: 'center',
        },
        todoTopContent: {
            display: 'flex',
            justifyContent: 'space-between',
            flex: 1,
        },
        issueTitle: {
            color: theme.centerChannelColor,
            lineHeight: 1.7,
            fontWeight: 'bold',
        },
        subtitle: {
            marginTop: '4px',
            fontStyle: 'italic',
            fontSize: '13px',
        },
        message: {
            width: '100%',
            overflowWrap: 'break-word',
            whiteSpace: 'pre-wrap',
        },
        description: {
            marginTop: 4,
            fontSize: 12,
            color: changeOpacity(theme.centerChannelColor, 0.72),
        },
        buttons: {
            padding: '10px 0',
        },
        textareaResizeMessage: {
            border: 0,
            padding: 0,
            fontSize: 14,
            width: '100%',
            backgroundColor: 'transparent',
            resize: 'none',
            boxShadow: 'none',
        },
        textareaResizeDescription: {
            fontSize: 12,
            color: changeOpacity(theme.centerChannelColor, 0.72),
            marginTop: 1,
            border: 0,
            padding: 0,
            width: '100%',
            backgroundColor: 'transparent',
            resize: 'none',
            boxShadow: 'none',
        },
    };
});

TodoItem.propTypes = {
    remove: PropTypes.func.isRequired,
    issue: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
    siteURL: PropTypes.string.isRequired,
    complete: PropTypes.func.isRequired,
    accept: PropTypes.func.isRequired,
    bump: PropTypes.func.isRequired,
    list: PropTypes.string.isRequired,
    editIssue: PropTypes.func.isRequired,
    openAssigneeModal: PropTypes.func.isRequired,
    setEditingTodo: PropTypes.func.isRequired,
    openTodoToast: PropTypes.func.isRequired,
};

export default TodoItem;
