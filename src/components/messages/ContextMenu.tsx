import * as React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ForwardIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete'; // Импортируем иконку удаления
import { styled } from '@mui/material/styles';

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
    '&:hover': {
        backgroundColor: theme.palette.primary.main,
        transition: 'background-color 0.3s ease',
    },
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.875rem',
    color: '#fff',
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
    '& .MuiPaper-root': {
        background: 'linear-gradient(135deg, #76baff, #4778e2)',
        minWidth: '160px',
        borderRadius: '8px',
    },
}));

type ContextMenuProps = {
    anchorPosition?: { top: number; left: number };
    onEdit: () => void;
    onCopy: () => void;
    onForward: () => void;
    onDelete: () => void; // Добавляем обработчик для удаления
    onClose: () => void;
    open: boolean;
    currentUserId: number;
    messageCreatorId: number;
};

export default function ContextMenu({
                                        anchorPosition,
                                        onEdit,
                                        onCopy,
                                        onForward,
                                        onDelete,
                                        onClose,
                                        open,
                                        currentUserId,
                                        messageCreatorId,
                                    }: ContextMenuProps) {
    return (
        <StyledMenu
            anchorReference="anchorPosition"
            anchorPosition={anchorPosition}
            open={open}
            onClose={onClose}
        >
            {currentUserId === messageCreatorId && (
                <>
                    <StyledMenuItem onClick={() => { onEdit(); onClose(); }}>
                        <EditIcon sx={{ marginRight: 1 }} />
                        Edit
                    </StyledMenuItem>
                    <StyledMenuItem onClick={() => { onDelete(); onClose(); }}>
                        <DeleteIcon sx={{ marginRight: 1 }} />
                        Delete
                    </StyledMenuItem>
                </>
            )}
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
