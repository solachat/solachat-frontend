import * as React from 'react';
import Avatar from '@mui/joy/Avatar';
import Button from '@mui/joy/Button';
import Chip from '@mui/joy/Chip';
import IconButton from '@mui/joy/IconButton';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import CircleIcon from '@mui/icons-material/Circle';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import PhoneInTalkRoundedIcon from '@mui/icons-material/PhoneInTalkRounded';
import { UserProps } from '../core/types';
import { toggleMessagesPane } from '../../utils/utils';
import { useTranslation } from 'react-i18next';
import MessagesMenu from './MessagesMenu';
import GroupInfoModal from '../group/GroupInfoModal';
import { jwtDecode } from 'jwt-decode';
import CallModal from './CallModal'; // Импортируем компонент CallModal

type MessagesPaneHeaderProps = {
    sender?: UserProps;
    chatId: number;
    isGroup?: boolean;
    chatName?: string;
    groupAvatar?: string;
    members?: UserProps[];
};

const getMemberLabel = (count: number, locale: string = 'en') => {
    if (locale === 'ru') {
        if (count % 10 === 1 && count % 100 !== 11) {
            return 'участник';
        } else if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) {
            return 'участника';
        } else {
            return 'участников';
        }
    } else {
        return count === 1 ? 'member' : 'members';
    }
};

export default function MessagesPaneHeader({
                                               sender,
                                               chatId,
                                               isGroup,
                                               chatName,
                                               groupAvatar,
                                               members = [],
                                           }: MessagesPaneHeaderProps) {
    const { t, i18n } = useTranslation();
    const [isGroupModalOpen, setIsGroupModalOpen] = React.useState(false);
    const [isCallModalOpen, setIsCallModalOpen] = React.useState(false); // Состояние для модального окна звонка
    const [currentUserId, setCurrentUserId] = React.useState<number | null>(null);
    const [ws, setWs] = React.useState<WebSocket | null>(null); // WebSocket соединение

    React.useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken: { id: number } = jwtDecode(token);
            setCurrentUserId(decodedToken.id);
        }

        // Открытие WebSocket соединения при инициализации компонента
        const websocket = new WebSocket('ws://localhost:4005/ws');
        websocket.onopen = () => {
            console.log('WebSocket connected');
        };
        websocket.onclose = () => {
            console.log('WebSocket disconnected');
        };
        websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        setWs(websocket);

        return () => {
            websocket.close(); // Закрываем WebSocket при размонтировании компонента
        };
    }, []);

    const userToken = localStorage.getItem('token');
    const receiverId = sender?.id; // Получаем ID получателя для звонка

    return (
        <>
            <Stack
                direction="row"
                sx={{
                    justifyContent: 'space-between',
                    py: { xs: 2, md: 2 },
                    px: { xs: 1, md: 2 },
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'background.body',
                }}
            >
                <Stack direction="row" spacing={{ xs: 1, md: 2 }} sx={{ alignItems: 'center' }}>
                    <IconButton
                        variant="plain"
                        color="neutral"
                        size="sm"
                        sx={{
                            display: { xs: 'inline-flex', sm: 'none' },
                        }}
                        onClick={() => toggleMessagesPane()}
                    >
                        <ArrowBackIosNewRoundedIcon />
                    </IconButton>
                    <Avatar
                        size="lg"
                        src={isGroup ? groupAvatar || 'path/to/default-group-avatar.jpg' : sender?.avatar}
                        alt={isGroup ? chatName : sender?.realname}
                    />
                    <div>
                        <Typography
                            fontWeight="lg"
                            fontSize="lg"
                            component="h2"
                            noWrap
                            endDecorator={
                                !isGroup && sender?.online ? (
                                    <Chip
                                        variant="outlined"
                                        size="sm"
                                        color="neutral"
                                        sx={{
                                            borderRadius: 'sm',
                                        }}
                                        startDecorator={<CircleIcon sx={{ fontSize: 8 }} color="success" />}
                                        slotProps={{ root: { component: 'span' } }}
                                    >
                                        Online
                                    </Chip>
                                ) : undefined
                            }
                            sx={{ fontWeight: 'lg', fontSize: 'lg' }}
                        >
                            {isGroup ? chatName : sender?.realname}
                        </Typography>

                        {isGroup && (
                            <Typography level="body-sm">
                                {members.length} {getMemberLabel(members.length, i18n.language)}
                            </Typography>
                        )}
                        {!isGroup && <Typography level="body-sm">{sender?.username}</Typography>}
                    </div>
                </Stack>
                <Stack spacing={1} direction="row" alignItems="center">
                    <Button
                        startDecorator={<PhoneInTalkRoundedIcon />}
                        color="neutral"
                        variant="outlined"
                        size="sm"
                        sx={{
                            display: { xs: 'none', md: 'inline-flex' },
                        }}
                        onClick={() => setIsCallModalOpen(true)} // Открываем модальное окно при нажатии
                    >
                        {t('call')}
                    </Button>
                    {isGroup ? (
                        <Button
                            color="neutral"
                            variant="outlined"
                            size="sm"
                            sx={{ display: { xs: 'none', md: 'inline-flex' } }}
                            onClick={() => setIsGroupModalOpen(true)}
                        >
                            {t('Information')}
                        </Button>
                    ) : (
                        <Button
                            color="neutral"
                            variant="outlined"
                            size="sm"
                            sx={{ display: { xs: 'none', md: 'inline-flex' } }}
                            onClick={() => (window.location.href = `/account?username=${sender?.username}`)}
                        >
                            {t('viewprofile')}
                        </Button>
                    )}
                    <MessagesMenu chatId={chatId} token={userToken || ''} onDeleteChat={() => console.log('Chat deleted')} />
                </Stack>
            </Stack>
            {isGroup && currentUserId !== null && (
                <GroupInfoModal
                    open={isGroupModalOpen}
                    onClose={() => setIsGroupModalOpen(false)}
                    groupName={chatName || 'Group'}
                    groupAvatar={groupAvatar || ''}
                    users={members}
                    currentUserId={currentUserId}
                    chatId={chatId}
                    token={userToken || ''}
                />
            )}
            {/* Модальное окно для звонка */}
            {sender && ws && (
                <CallModal
                    open={isCallModalOpen}
                    onClose={() => setIsCallModalOpen(false)}
                    sender={sender}
                    receiverId={receiverId!} // передаем ID получателя
                    isGroup={isGroup}
                    ws={ws} // Передаем WebSocket соединение
                />
            )}
        </>
    );
}
