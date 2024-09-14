import * as React from 'react';
import Box from '@mui/joy/Box';
import ListDivider from '@mui/joy/ListDivider';
import ListItem from '@mui/joy/ListItem';
import ListItemButton, { ListItemButtonProps } from '@mui/joy/ListItemButton';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import CircleIcon from '@mui/icons-material/Circle';
import AvatarWithStatus from './AvatarWithStatus';
import { ChatProps, MessageProps, UserProps } from '../core/types';
import { createPrivateChat } from '../../api/api';

type ChatListItemProps = ListItemButtonProps & {
    id: string;
    unread?: boolean;
    sender: UserProps;
    messages: MessageProps[];
    selectedChatId?: string;
    setSelectedChat: (chat: ChatProps) => void;
    currentUserId: number;
    chats: ChatProps[]; // Убедитесь, что `chats` передается как массив
};

export default function ChatListItem(props: ChatListItemProps) {
    const { id, sender, messages, selectedChatId, setSelectedChat, currentUserId, chats } = props;
    const selected = selectedChatId === id;
    const hasMessages = Array.isArray(messages) && messages.length > 0;

    const existingChat = Array.isArray(chats)
        ? chats.find((chat: ChatProps) =>
            chat.users.some((user: UserProps) => user.id === sender.id)
        )
        : null;

    const handleClick = async () => {
        if (existingChat) {
            console.log('Chat already exists:', existingChat);
            setSelectedChat(existingChat); // Переключаемся на существующий чат
        } else {
            console.log('Creating chat for users:', currentUserId, 'and', sender.id);
            const token = localStorage.getItem('token');
            if (token) {
                const newChat = await createPrivateChat(currentUserId, sender.id, token);
                if (newChat) {
                    console.log('New chat created:', newChat);
                    setSelectedChat(newChat); // Переключаемся на новый чат
                } else {
                    console.error('Failed to create a new chat.');
                }
            } else {
                console.error('Token is missing');
            }
        }
    };

    return (
        <React.Fragment>
            <ListItem>
                <ListItemButton
                    onClick={handleClick}
                    selected={selected}
                    color="neutral"
                    sx={{
                        flexDirection: 'column',
                        alignItems: 'initial',
                        gap: 1,
                    }}
                >
                    <Stack direction="row" spacing={1.5}>
                        <AvatarWithStatus online={sender.online} src={sender.avatar} size="md" />
                        <Box sx={{ flex: 1 }}>
                            <Typography level="body-md">{sender.realname || 'No Name'}</Typography>
                            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                                {sender.username || 'No Username'}
                            </Typography>
                        </Box>
                        {hasMessages && (
                            <Box
                                sx={{
                                    lineHeight: 1.5,
                                    textAlign: 'right',
                                }}
                            >
                                {messages[0].unread && (
                                    <CircleIcon sx={{ fontSize: 12 }} color="primary" />
                                )}
                                <Typography
                                    level="body-xs"
                                    display={{ xs: 'none', md: 'block' }}
                                    noWrap
                                >
                                    {messages[0].timestamp || 'No Timestamp'}
                                </Typography>
                            </Box>
                        )}
                    </Stack>
                    {hasMessages && (
                        <Typography
                            level="body-sm"
                            sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: '2',
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {messages[0].content || 'No Messages'}
                        </Typography>
                    )}
                </ListItemButton>
            </ListItem>
            <ListDivider sx={{ margin: 0 }} />
        </React.Fragment>
    );
}
