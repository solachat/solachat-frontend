import * as React from 'react';
import Sheet from '@mui/joy/Sheet';
import MessagesPane from './MessagesPane';
import ChatsPane from './ChatsPane';
import { ChatProps } from '../core/types';
import { useParams, useNavigate } from 'react-router-dom';
import { chats as initialChats } from '../../utils/data';
import { loadChatsFromStorage, saveChatsToStorage } from '../../utils/utils';

export default function MyProfile() {
    const [chats, setChats] = React.useState<ChatProps[]>(loadChatsFromStorage());
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const currentUser = { id: 1 };

    React.useEffect(() => {
        if (!chats.length) {
            setChats(initialChats);
            saveChatsToStorage(initialChats);
        }
    }, [chats]);

    const selectedChat = chats.find((chat) => chat.id === id) || chats[0];

    const setSelectedChat = (chat: ChatProps) => {
        navigate(`/chat?id=${chat.id}`);
    };

    React.useEffect(() => {
        const handleActivity = () => {
            console.log('User is active');
        };

        const handleInactivity = () => {
            console.log('User is inactive');
        };

        const timeout = setTimeout(handleInactivity, 2 * 60 * 1000);

        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('keypress', handleActivity);

        return () => {
            clearTimeout(timeout);
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('keypress', handleActivity);
        };
    }, []);

    if (!selectedChat) {
        return <div>Loading...</div>;
    }

    return (
        <Sheet
            sx={{
                flex: 1,
                width: '100%',
                mx: 'auto',
                pt: { xs: 'var(--Header-height)', sm: 0 },
                display: 'grid',
                gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'minmax(min-content, min(30%, 400px)) 1fr',
                },
            }}
        >
            <Sheet
                sx={{
                    position: { xs: 'fixed', sm: 'sticky' },
                    transform: {
                        xs: 'translateX(calc(100% * (var(--MessagesPane-slideIn, 0) - 1)))',
                        sm: 'none',
                    },
                    transition: 'transform 0.4s, width 0.4s',
                    zIndex: 100,
                    width: '100%',
                    top: 52,
                }}
            >
                {selectedChat ? (
                    <ChatsPane
                        chats={chats}
                        selectedChatId={selectedChat.id}
                        setSelectedChat={setSelectedChat}
                        currentUser={currentUser}
                    />
                ) : (
                    <div>Loading chats...</div>
                )}
            </Sheet>
            {selectedChat ? (
                <MessagesPane chat={selectedChat} />
            ) : (
                <div>Loading messages...</div>
            )}
        </Sheet>
    );
}
