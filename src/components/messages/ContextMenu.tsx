import * as React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy'; // Иконка для копирования
import ForwardIcon from '@mui/icons-material/Send'; // Иконка для пересылки
import { styled } from '@mui/material/styles';

// Стили для MenuItem
const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
    '&:hover': {
        backgroundColor: theme.palette.primary.main, // Цвет фона при наведении
        transition: 'background-color 0.3s ease', // Плавный переход цвета
    },
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.875rem', // Увеличение размера шрифта
    color: '#fff', // Цвет текста
}));

// Стили для меню
const StyledMenu = styled(Menu)(({ theme }) => ({
    '& .MuiPaper-root': {
        background: 'linear-gradient(135deg, #76baff, #4778e2)', // Градиентный фон
        minWidth: '160px',
        borderRadius: '8px',
    },
}));

type ContextMenuProps = {
    onEdit: () => void;
    onCopy: () => void;
    onForward: () => void;
    onClose: () => void;
    anchorEl: null | HTMLElement;
    open: boolean;
};

export default function ContextMenu({ onEdit, onCopy, onForward, onClose, anchorEl, open }: ContextMenuProps) {
    return (
        <StyledMenu
            anchorEl={anchorEl}
            open={open}
            onClose={onClose}
        >
            <StyledMenuItem onClick={() => { onEdit(); onClose(); }}>
                <EditIcon sx={{ marginRight: 1 }} />
                Edit
            </StyledMenuItem>
            <StyledMenuItem onClick={() => { onCopy(); onClose(); }}>
                <ContentCopyIcon sx={{ marginRight: 1 }} />
                Copy
            </StyledMenuItem>
            <StyledMenuItem onClick={() => { onForward(); onClose(); }}>
                <ForwardIcon sx={{ marginRight: 1 }} />
                Forward
            </StyledMenuItem>
        </StyledMenu>
    );
}
