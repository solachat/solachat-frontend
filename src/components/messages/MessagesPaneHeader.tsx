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
import { useTranslation } from "react-i18next";
import MessagesMenu from './MessagesMenu';

type MessagesPaneHeaderProps = {
    sender?: UserProps;
    chatId: number;
    isGroup?: boolean;
    chatName?: string;
    groupAvatar?: string;
};

export default function MessagesPaneHeader({ sender, chatId, isGroup, chatName, groupAvatar }: MessagesPaneHeaderProps) {
    const { t } = useTranslation();

    const handleDeleteChat = () => {
        console.log("Chat deleted");
    };

    const userToken = localStorage.getItem('token');

    return (
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
            <Stack
                direction="row"
                spacing={{ xs: 1, md: 2 }}
                sx={{ alignItems: 'center' }}
            >
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
                <Avatar size="lg" src={isGroup ? groupAvatar : sender?.avatar} />
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
                                    startDecorator={
                                        <CircleIcon sx={{ fontSize: 8 }} color="success" />
                                    }
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
                >
                    {t('call')}
                </Button>
                <Button
                    color="neutral"
                    variant="outlined"
                    size="sm"
                    sx={{ display: { xs: 'none', md: 'inline-flex' } }}
                    onClick={() => window.location.href = `/account?username=${sender?.username}`}
                >
                    {t('viewprofile')}
                </Button>
                <MessagesMenu
                    chatId={chatId}
                    token={userToken || ''}
                    onDeleteChat={handleDeleteChat}
                />
            </Stack>
        </Stack>
    );
}
