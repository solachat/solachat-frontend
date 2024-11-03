import * as React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ForwardIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
    '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        transition: 'background-color 0.3s ease',
    },
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.875rem',
    color: '#fff',
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
    '& .MuiPaper-root': {
        background: '#4F6D7A',
        minWidth: '160px',
        borderRadius: '3px',
    },
}));

type ContextMenuProps = {
    anchorPosition?: { top: number; left: number };
    onEdit: () => void;
    onCopy: () => void;
    onForward: () => void;
    onDelete: () => void;
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
    const { t } = useTranslation();

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
                        {t('edit')}
                    </StyledMenuItem>
                    <StyledMenuItem onClick={() => { onDelete(); onClose(); }}>
                        <DeleteIcon sx={{ marginRight: 1 }} />
                        {t('delete')}
                    </StyledMenuItem>
                </>
            )}
            <StyledMenuItem onClick={() => { onCopy(); onClose(); }}>
                <ContentCopyIcon sx={{ marginRight: 1 }} />
                {t('copy')}
            </StyledMenuItem>
            <StyledMenuItem onClick={() => { onForward(); onClose(); }}>
                <ForwardIcon sx={{ marginRight: 1 }} />
                {t('forward')}
            </StyledMenuItem>
        </StyledMenu>
    );
}
