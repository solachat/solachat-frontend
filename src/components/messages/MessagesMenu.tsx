import * as React from 'react';
import IconButton from '@mui/joy/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import { useTheme } from '@mui/system';
import { deleteChat } from '../../api/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

type MessagesMenuProps = {
    chatId: number;
    token: string;
    onDeleteChat: () => void;
};

export default function MessagesMenu({ chatId, token, onDeleteChat }: MessagesMenuProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const navigate = useNavigate();

    const theme = useTheme();

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleDeleteChat = async () => {
        try {
            await deleteChat(chatId, token);
            onDeleteChat();
            // Можно убрать window.location.reload, если вы не хотите перезагружать страницу
            navigate('/');
        } catch (error) {
            console.error('Failed to delete chat:', error);
            toast.error('Failed to delete chat');
        } finally {
            handleMenuClose();
        }
    };

    return (
        <>
            <IconButton size="sm" variant="plain" color="neutral" onClick={handleMenuClick}>
                <MoreVertRoundedIcon />
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        mt: 1.5,
                        overflow: 'visible',
                        boxShadow: 'var(--joy-shadow-sm)',
                        bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : '#fff',
                        color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                        '&:before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : '#fff',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={handleDeleteChat}>
                    Delete Chat
                </MenuItem>
            </Menu>
        </>
    );
}
