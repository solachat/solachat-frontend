import * as React from 'react';
import {useTranslation} from 'react-i18next';
import Stack from '@mui/joy/Stack';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import {Box, Chip, IconButton, Input} from '@mui/joy';
import List from '@mui/joy/List';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ChatListItem from './ChatListItem';
import {ChatProps} from '../core/types';
import {toggleMessagesPane} from '../../utils/utils';
import LanguageSwitcher from '../core/LanguageSwitcher';
import {ColorSchemeToggle} from '../core/ColorSchemeToggle';
import {CssVarsProvider} from '@mui/joy/styles';

type ChatsPaneProps = {
    chats: ChatProps[];
    setSelectedChat: (chat: ChatProps) => void;
    selectedChatId: string;
};

export default function ChatsPane(props: ChatsPaneProps) {
    const {chats, setSelectedChat, selectedChatId} = props;
    const {t} = useTranslation();

    return (
        <CssVarsProvider>
            <Sheet
                sx={{
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    height: 'calc(100dvh - var(--Header-height))',
                    overflowY: 'auto',
                }}
            >
                <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent="space-between"
                    p={2}
                    pb={1.5}
                >
                    <Typography
                        fontSize={{xs: 'md', md: 'lg'}}
                        component="h1"
                        fontWeight="lg"
                        endDecorator={
                            <Chip
                                variant="soft"
                                color="primary"
                                size="md"
                                slotProps={{root: {component: 'span'}}}
                            >
                                4
                            </Chip>
                        }
                        sx={{mr: 'auto'}}
                    >
                        {t('Messages')}
                    </Typography>
                    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                        <LanguageSwitcher/>
                        <ColorSchemeToggle/>
                    </div>
                    <IconButton
                        variant="plain"
                        aria-label="edit"
                        color="neutral"
                        size="sm"
                        sx={{display: {xs: 'none', sm: 'unset'}}}
                    >
                        <EditNoteRoundedIcon/>
                    </IconButton>
                    <IconButton
                        variant="plain"
                        aria-label="close"
                        color="neutral"
                        size="sm"
                        onClick={() => {
                            toggleMessagesPane();
                        }}
                        sx={{display: {sm: 'none'}}}
                    >
                        <CloseRoundedIcon/>
                    </IconButton>
                </Stack>
                <Box sx={{px: 2, pb: 1.5}}>
                    <Input
                        size="sm"
                        startDecorator={<SearchRoundedIcon/>}
                        placeholder={t('Search')}
                        aria-label="Search"
                    />
                </Box>
                <List
                    sx={{
                        py: 0,
                        '--ListItem-paddingY': '0.75rem',
                        '--ListItem-paddingX': '1rem',
                    }}
                >
                    {chats.map((chat) => (
                        <ChatListItem
                            key={chat.id}
                            {...chat}
                            setSelectedChat={setSelectedChat}
                            selectedChatId={selectedChatId}
                        />
                    ))}
                </List>
            </Sheet>
        </CssVarsProvider>
    );
}
