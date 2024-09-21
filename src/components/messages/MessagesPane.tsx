import * as React from 'react';
import Box from '@mui/joy/Box';
import Sheet from '@mui/joy/Sheet';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import AvatarWithStatus from './AvatarWithStatus';
import ChatBubble from './ChatBubble';
import MessageInput from './MessageInput';
import MessagesPaneHeader from './MessagesPaneHeader';
import { ChatProps, MessageProps, UserProps } from '../core/types';
import { useState, useEffect } from 'react';

type MessagesPaneProps = {
    chat: ChatProps | null;
};

export default function MessagesPane(props: MessagesPaneProps) {
    const { chat } = props;

    const [chatMessages, setChatMessages] = useState<MessageProps[]>(chat?.messages || []);
    const [textAreaValue, setTextAreaValue] = useState('');

    useEffect(() => {
        if (chat) {
            setChatMessages(chat.messages || []);
        }
    }, [chat]);

    // Проверка на наличие пользователей в чате
    if (!chat || !chat.users || chat.users.length === 0) {
        return (
            <Sheet
                sx={{
                    height: { xs: 'calc(100dvh - var(--Header-height))', lg: '100dvh' },
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'background.level1',
                }}
            >
                <Typography sx={{ textAlign: 'center' }}>
                    Start to communicate!
                </Typography>
            </Sheet>
        );
    }

    // Берем первого пользователя как отправителя (если это приватный чат)
    const sender: UserProps | undefined = chat.users.length > 0 ? chat.users[0] : undefined;

    return (
        <Sheet
            sx={{
                height: { xs: 'calc(100dvh - var(--Header-height))', md: '100dvh' },
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'background.level1',
            }}
        >
            <MessagesPaneHeader sender={sender} />
            <Box
                sx={{
                    flex: 1, // Этот элемент займет все доступное пространство
                    display: 'flex',
                    flexDirection: 'column-reverse', // Сообщения будут прокручиваться снизу вверх
                    px: 2,
                    py: 3,
                    overflowY: 'auto', // Скроллинг, если сообщений слишком много
                    minHeight: 0, // Убираем ограничения по минимальной высоте
                }}
            >
                <Stack spacing={2} justifyContent="flex-end">
                    {chatMessages.length > 0 ? (
                        chatMessages.map((message: MessageProps, index: number) => {
                            const isYou = message.sender === 'You';

                            // Если сообщение отправлено "You", avatar и online не нужны
                            const messageSender = !isYou ? message.sender as UserProps : null;

                            return (
                                <Stack
                                    key={index}
                                    direction="row"
                                    spacing={2}
                                    flexDirection={isYou ? 'row-reverse' : 'row'}
                                >
                                    {!isYou && messageSender && (
                                        <AvatarWithStatus
                                            online={messageSender.online}
                                            src={messageSender.avatar}
                                        />
                                    )}
                                    <ChatBubble variant={isYou ? 'sent' : 'received'} {...message} />
                                </Stack>
                            );
                        })
                    ) : (
                        <Typography sx={{ textAlign: 'center', mt: 2 }}>
                            No messages yet.
                        </Typography>
                    )}
                </Stack>
            </Box>
            <MessageInput
                textAreaValue={textAreaValue}
                setTextAreaValue={setTextAreaValue}
                onSubmit={() => {
                    const newId = chatMessages.length + 1;
                    const newMessage: MessageProps = {
                        id: newId.toString(),
                        sender: { id: 1, realname: 'You', username: 'you', avatar: '', online: true },
                        content: textAreaValue,
                        timestamp: 'Just now',
                    };
                    setChatMessages([...chatMessages, newMessage]);
                    setTextAreaValue('');
                }}
            />
        </Sheet>
    );
}
