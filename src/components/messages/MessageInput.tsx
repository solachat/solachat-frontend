import * as React from 'react';
import { Editor, EditorState, RichUtils, getDefaultKeyBinding, KeyBindingUtil } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { useTranslation } from 'react-i18next';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import FormControl from '@mui/joy/FormControl';
import { IconButton, Stack } from '@mui/joy';
import FormatBoldRoundedIcon from '@mui/icons-material/FormatBoldRounded';
import FormatItalicRoundedIcon from '@mui/icons-material/FormatItalicRounded';
import StrikethroughSRoundedIcon from '@mui/icons-material/StrikethroughSRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import FormatUnderlinedRoundedIcon from '@mui/icons-material/FormatUnderlinedRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { sendMessage } from '../../api/api';

const { hasCommandModifier } = KeyBindingUtil;

export type MessageInputProps = {
    chatId: number;
    textAreaValue: string;
    setTextAreaValue: (value: string) => void;
    onSubmit: (newMessage: any) => void;
};

export default function MessageInput(props: MessageInputProps) {
    const { t } = useTranslation();
    const { setTextAreaValue, onSubmit, chatId } = props;
    const [editorState, setEditorState] = React.useState(() =>
        EditorState.createEmpty()
    );
    const editorRef = React.useRef<Editor | null>(null);

    const handleEditorChange = (newState: EditorState) => {
        setEditorState(newState);
        const currentContent = newState.getCurrentContent().getPlainText();
        setTextAreaValue(currentContent);
    };

    const handleKeyCommand = (command: string, editorState: EditorState) => {
        if (command === 'submit-message') {
            handleClick();
            return 'handled';
        }
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            setEditorState(newState);
            return 'handled';
        }
        return 'not-handled';
    };

    const keyBindingFn = (e: React.KeyboardEvent): string | null => {
        if (e.key === 'Enter' && !e.shiftKey) {
            return 'submit-message';
        }
        return getDefaultKeyBinding(e);
    };

    const onBoldClick = () => {
        setEditorState(RichUtils.toggleInlineStyle(editorState, 'BOLD'));
    };

    const onItalicClick = () => {
        setEditorState(RichUtils.toggleInlineStyle(editorState, 'ITALIC'));
    };

    const onUnderlineClick = () => {
        setEditorState(RichUtils.toggleInlineStyle(editorState, 'UNDERLINE'));
    };

    const onStrikethroughClick = () => {
        setEditorState(RichUtils.toggleInlineStyle(editorState, 'STRIKETHROUGH'));
    };

    const onBulletListClick = () => {
        setEditorState(RichUtils.toggleBlockType(editorState, 'unordered-list-item'));
    };

    const handleClick = async () => {
        if (!chatId || isNaN(chatId)) {
            console.error('Invalid chatId:', chatId);
            return;
        }

        if (props.textAreaValue.trim() !== '') {
            const token = localStorage.getItem('token');
            try {
                const newMessage = await sendMessage(chatId, props.textAreaValue, token as string);

                setTextAreaValue('');
                setEditorState(EditorState.createEmpty());
            } catch (error) {
                console.error('Ошибка при отправке сообщения:', error);
            }
        }
    };

    return (
        <Box sx={{ px: 2, pb: 3 }}>
            <FormControl>
                <Box
                    sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: '4px',
                        padding: '8px',
                        minHeight: '100px',
                        cursor: 'text',
                        textAlign: 'left', // Или "right", если хочешь выравнивание вправо
                    }}
                    onClick={() => {
                        editorRef.current?.focus();
                    }}
                >
                    <Editor
                        editorState={editorState}
                        handleKeyCommand={handleKeyCommand}
                        keyBindingFn={keyBindingFn}
                        onChange={handleEditorChange}
                        placeholder={t('Type something here…')}
                        ref={editorRef}
                    />
                </Box>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    flexGrow={1}
                    sx={{
                        py: 1,
                        pr: 1,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <div>
                        <IconButton size="sm" variant="plain" color="neutral" onClick={onBoldClick}>
                            <FormatBoldRoundedIcon />
                        </IconButton>
                        <IconButton size="sm" variant="plain" color="neutral" onClick={onItalicClick}>
                            <FormatItalicRoundedIcon />
                        </IconButton>
                        <IconButton size="sm" variant="plain" color="neutral" onClick={onUnderlineClick}>
                            <FormatUnderlinedRoundedIcon />
                        </IconButton>
                        <IconButton size="sm" variant="plain" color="neutral" onClick={onStrikethroughClick}>
                            <StrikethroughSRoundedIcon />
                        </IconButton>
                        <IconButton size="sm" variant="plain" color="neutral" onClick={onBulletListClick}>
                            <FormatListBulletedRoundedIcon />
                        </IconButton>
                    </div>
                    <Button
                        size="sm"
                        color="primary"
                        sx={{ alignSelf: 'center', borderRadius: 'sm' }}
                        endDecorator={<SendRoundedIcon />}
                        onClick={handleClick}
                    >
                        {t('Send')}
                    </Button>
                </Stack>
            </FormControl>
        </Box>
    );
}
