import React from 'react';
import PropTypes from 'prop-types';

import {
    makeStyleFromTheme,
    changeOpacity,
} from 'mattermost-redux/utils/theme_utils';

import FullScreenModal from '../modals/modals.jsx';

import './root.scss';
import AutocompleteSelector from '../user_selector/autocomplete_selector.tsx';

const PostUtils = window.PostUtils;

export default class Root extends React.Component {
    static propTypes = {
        visible: PropTypes.bool.isRequired,
        message: PropTypes.string.isRequired,
        postID: PropTypes.string.isRequired,
        close: PropTypes.func.isRequired,
        submit: PropTypes.func.isRequired,
        theme: PropTypes.object.isRequired,
        autocompleteUsers: PropTypes.func.isRequired,
    };
    constructor(props) {
        super(props);

        this.state = {
            message: null,
            sendTo: null,
            attachToThread: false,
            previewMarkdown: false,
        };
    }

    static getDerivedStateFromProps(props, state) {
        if (props.visible && state.message == null) {
            return {message: props.message};
        }
        if (!props.visible && (state.message != null || state.sendTo != null)) {
            return {
                message: null,
                sendTo: null,
                attachToThread: false,
                previewMarkdown: false,
            };
        }
        return null;
    }

    handleAttachChange = (e) => {
        const value = e.target.checked;
        if (value !== this.state.attachToThread) {
            this.setState({
                attachToThread: value,
            });
        }
    };

    submit = () => {
        const {submit, close, postID} = this.props;
        const {message, sendTo, attachToThread} = this.state;
        if (attachToThread) {
            submit(message, sendTo, postID);
        } else {
            submit(message, sendTo);
        }

        close();
    };

    render() {
        const {visible, theme, close} = this.props;

        if (!visible) {
            return null;
        }

        const {message} = this.state;

        const style = getStyle(theme);
        const activeClass = 'btn btn-primary';
        const inactiveClass = 'btn';
        const writeButtonClass = this.state.previewMarkdown ?
            inactiveClass :
            activeClass;
        const previewButtonClass = this.state.previewMarkdown ?
            activeClass :
            inactiveClass;

        return (
            <FullScreenModal
                show={visible}
                onClose={close}
            >
                <div
                    style={style.modal}
                    className='ToDoPluginRootModal'
                >
                    <h1>{'Add a Todo'}</h1>
                    <div className='todoplugin-issue'>
                        <h2>{'Todo Message'}</h2>
                        <div className='btn-group'>
                            <button
                                className={writeButtonClass}
                                onClick={() => {
                                    this.setState({previewMarkdown: false});
                                }}
                            >
                                {'Write'}
                            </button>
                            <button
                                className={previewButtonClass}
                                onClick={() => {
                                    this.setState({previewMarkdown: true});
                                }}
                            >
                                {'Preview'}
                            </button>
                        </div>
                        {this.state.previewMarkdown ? (
                            <div
                                className='todoplugin-input'
                                style={style.markdown}
                            >
                                {PostUtils.messageHtmlToComponent(
                                    PostUtils.formatText(this.state.message),
                                )}
                            </div>
                        ) : (
                            <textarea
                                className='todoplugin-input'
                                style={style.textarea}
                                value={message}
                                onChange={(e) =>
                                    this.setState({message: e.target.value})
                                }
                            />
                        )}
                    </div>
                    {this.props.postID && (
                        <div className='todoplugin-add-to-thread'>
                            <input
                                type='checkbox'
                                checked={this.state.attachToThread}
                                onChange={this.handleAttachChange}
                            />
                            <b>{' Add to thread'}</b>
                            <div className='help-text'>
                                {
                                    ' Select to have the Todo Bot respond to the thread when the attached todo is added, modified or completed.'
                                }
                            </div>
                        </div>
                    )}
                    <div>
                        <AutocompleteSelector
                            id='send_to_user'
                            loadOptions={this.props.autocompleteUsers}
                            onSelected={(selected) =>
                                this.setState({sendTo: selected?.username})
                            }
                            label={'Send to user'}
                            helpText={
                                'Select a user if you want to send this todo.'
                            }
                            placeholder={''}
                            theme={theme}
                        />
                    </div>
                    <div className='todoplugin-button-container'>
                        <button
                            className={'btn btn-primary'}
                            style={
                                message ? style.button : style.inactiveButton
                            }
                            onClick={this.submit}
                            disabled={!message}
                        >
                            {'Add Todo'}
                        </button>
                    </div>
                    <div className='todoplugin-divider'/>
                    <div className='todoplugin-clarification'>
                        <div className='todoplugin-question'>
                            {'What does this do?'}
                        </div>
                        <div className='todoplugin-answer'>
                            {
                                'Adding a Todo will add an issue to your Todo list. You will get daily reminders about your Todo issues until you mark them as complete.'
                            }
                        </div>
                        <div className='todoplugin-question'>
                            {'How is this different from flagging a post?'}
                        </div>
                        <div className='todoplugin-answer'>
                            {
                                'Todo issues are disconnected from posts. You can generate Todo issues from posts but they have no other assoication to the posts. This allows for a cleaner Todo list that does not rely on post history or someone else not deleting or editing the post.'
                            }
                        </div>
                    </div>
                </div>
            </FullScreenModal>
        );
    }
}

const getStyle = makeStyleFromTheme((theme) => {
    return {
        modal: {
            color: changeOpacity(theme.centerChannelColor, 0.88),
        },
        textarea: {
            backgroundColor: theme.centerChannelBg,
        },
        helpText: {
            color: changeOpacity(theme.centerChannelColor, 0.64),
        },
        button: {
            color: theme.buttonColor,
            backgroundColor: theme.buttonBg,
        },
        inactiveButton: {
            color: changeOpacity(theme.buttonColor, 0.88),
            backgroundColor: changeOpacity(theme.buttonBg, 0.32),
        },
        markdown: {
            minHeight: '149px',
            fontSize: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'end',
        },
    };
});
