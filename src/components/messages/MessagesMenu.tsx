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
        height: '36px', // Уменьшено с 40px
        borderRadius: '6px', // Уменьшено с 8px
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
            backgroundColor: 'rgba(0, 168, 255, 0.12)', // Уменьшена прозрачность
            boxShadow: '0 2px 8px rgba(0, 168, 255, 0.15)', // Уменьшена тень
            transform: 'translateX(3px)', // Уменьшено смещение
            '& .MuiSvgIcon-root': {
                transform: 'scale(1.05)', // Уменьшено увеличение
                filter: 'drop-shadow(0 1px 2px rgba(0,168,255,0.25))'
            }
        }
    };

    const iconSx = {
        marginRight: 1, // Уменьшено с 1.5
        color: '#00a8ff',
        transition: 'all 0.2s ease',
        fontSize: '20px' // Уменьшено с 22px
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
        onClose();
    };

    const handleAddContact = () => {
        onClose();
    };

    return (
        <Sheet
            className="MessageMenu"
            sx={{
                position: 'absolute',
                right: 0,
                top: '100%',
                mt: 0.5, // Уменьшено с 1
                borderRadius: '10px', // Уменьшено с 12px
                background: 'rgba(0, 22, 45, 0.98)',
                backdropFilter: 'blur(20px)', // Уменьшено с 24px
                border: '1px solid rgba(0, 168, 255, 0.3)', // Уменьшена прозрачность
                boxShadow: '0 8px 24px rgba(0, 168, 255, 0.2)', // Уменьшена тень
                minWidth: '180px', // Уменьшено с 200px
                p: 1, // Уменьшено с 1.5
                transformOrigin: 'top right',
                transition: 'opacity 0.15s ease, transform 0.15s ease',
                opacity: isOpen ? 1 : 0,
                transform: isOpen ? 'scale(1)' : 'scale(0.97)',
                visibility: isOpen ? 'visible' : 'hidden',
                zIndex: 9999
            }}
        >
            <Box sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5, // Уменьшено с 1
                '& .MuiListItem-root': {
                    position: 'relative',
                    '&:not(:last-child)::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: 10, // Уменьшено с 12
                        right: 10, // Уменьшено с 12
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent 0%, rgba(0,168,255,0.15) 50%, transparent 100%)' // Уменьшена прозрачность
                    }
                }
            }}>
                <ListItem>
                    <ListItemButton onClick={handleBlockUser} sx={hoverSx}>
                        <BlockIcon sx={iconSx} />
                        <ListItemContent>
                            <Typography level="title-sm" sx={{
                                color: '#a0d4ff',
                                fontSize: '13px', // Уменьшено с 14px
                                letterSpacing: '0.2px' // Уменьшено с 0.3px
                            }}>
                                {t("Block User")}
                            </Typography>
                        </ListItemContent>
                    </ListItemButton>
                </ListItem>

                <ListItem>
                    <ListItemButton onClick={handleAddContact} sx={hoverSx}>
                        <PersonAddIcon sx={iconSx} />
                        <ListItemContent>
                            <Typography level="title-sm" sx={{
                                color: '#a0d4ff',
                                fontSize: '13px',
                                letterSpacing: '0.2px'
                            }}>
                                {t("Add Contact")}
                            </Typography>
                        </ListItemContent>
                    </ListItemButton>
                </ListItem>

                <Divider sx={{
                    my: 0.5, // Уменьшено с 1
                    bgcolor: 'rgba(0, 168, 255, 0.15)', // Уменьшена прозрачность
                    '&::before, &::after': {
                        background: 'linear-gradient(90deg, transparent 0%, rgba(0,168,255,0.3) 50%, transparent 100%)' // Уменьшена прозрачность
                    }
                }} />

                <ListItem>
                    <ListItemButton onClick={handleDeleteChat} sx={{
                        ...hoverSx,
                        '&:hover': {
                            backgroundColor: 'rgba(255, 50, 50, 0.12)', // Уменьшена прозрачность
                            boxShadow: '0 2px 8px rgba(255, 50, 50, 0.15)', // Уменьшена тень
                            '& .MuiSvgIcon-root': {
                                color: '#ff4040', // Изменен оттенок
                                filter: 'drop-shadow(0 1px 2px rgba(255,50,50,0.25))'
                            }
                        }
                    }}>
                        <DeleteIcon sx={{ ...iconSx, color: '#ff6060' }} />
                        <ListItemContent>
                            <Typography sx={{
                                color: '#ff6060',
                                fontSize: '13px',
                                letterSpacing: '0.2px',
                                fontWeight: 'bold'
                            }}>
                                {t("Delete Chat")}
                            </Typography>
                        </ListItemContent>
                    </ListItemButton>
                </ListItem>
            </Box>
        </Sheet>
    );
}
