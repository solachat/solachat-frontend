import * as React from 'react';
import Box from '@mui/joy/Box';
import Divider from '@mui/joy/Divider';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import ListItemContent from '@mui/joy/ListItemContent';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';
import { useTranslation } from 'react-i18next';
import BlockIcon from '@mui/icons-material/Block';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import { deleteChat } from '../../api/api';
import { toast } from 'react-toastify';

interface MessagesMenuProps {
    isOpen: boolean;
    onClose: () => void;
    chatId: number;
    token: string;
    onDeleteChat: () => void;
}

export default function MessagesMenu({
                                         isOpen,
                                         onClose,
                                         chatId,
                                         token,
                                         onDeleteChat,
                                     }: MessagesMenuProps) {
    const { t } = useTranslation();
    const [selectedNav, setSelectedNav] = React.useState<string>();

    const handleSelect = (nav: string, callback?: () => void) => {
        setSelectedNav(nav);
        if (callback) callback();
    };

    const hoverSx = {
        height: '32px',
        borderRadius: '8px',
        transition: 'background-color 0.1s ease',
        '&:hover': {
            backgroundColor: 'rgba(76, 175, 80, 0.2)',
        },
    };

    const handleDeleteChat = async () => {
        try {
            await deleteChat(chatId, token);
            onDeleteChat();
        } catch (error) {
            console.error('Failed to delete chat:', error);
            toast.error('Failed to delete chat');
        } finally {
            onClose();
        }
    };

    const handleBlockUser = () => {
        // Реализуйте логику блокировки пользователя
        onClose();
    };

    const handleAddContact = () => {
        // Реализуйте логику добавления контакта
        onClose();
    };

    return (
        <Sheet
            className="MessageMenu"
            sx={{
                position: { xs: 'fixed', md: 'sticky' },
                transform: isOpen ? 'translateX(0)' : { xs: 'translateX(-100%)', md: 'none' },
                transition: 'transform 0.4s, width 0.4s',
                zIndex: 10,
                height: { xs: '80vh', md: '100%' },
                p: 2,
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                borderRight: '1px solid',
                borderColor: 'divider',
                width: { xs: '240px', md: '120px' },
                outline: 'none',
                border: 'none',
                borderRadius: '12px',
            }}
        >
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <ListItem>
                    <ListItemButton onClick={handleBlockUser} sx={hoverSx}>
                        <BlockIcon sx={{  marginRight: 1 }} />
                        <ListItemContent>
                            <Typography level="title-sm">{t("Block User")}</Typography>
                        </ListItemContent>
                    </ListItemButton>
                </ListItem>
                <ListItem>
                    <ListItemButton onClick={handleAddContact} sx={hoverSx}>
                        <PersonAddIcon sx={{ marginRight: 1 }} />
                        <ListItemContent>
                            <Typography level="title-sm">{t("Add Contact")}</Typography>
                        </ListItemContent>
                    </ListItemButton>
                </ListItem>
                <Divider sx={{ maxWidth: '100%' }} />
                <ListItem>
                    <ListItemButton onClick={handleDeleteChat} sx={hoverSx}>
                        <DeleteIcon sx={{ marginRight: 1 }} />
                        <ListItemContent>
                            <Typography sx={{ color: 'red' }}>
                                {t("Delete Chat")}
                            </Typography>
                        </ListItemContent>
                    </ListItemButton>
                </ListItem>
            </Box>
        </Sheet>
    );
}
