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
    padding: '8px 14px',
    borderRadius: '6px',

    transition: 'all 0.3s ease',
    color: '#a0d4ff',
    '&:hover': {
        background: 'rgba(0, 168, 255, 0.15)',
        boxShadow: '0 3px 10px rgba(0, 168, 255, 0.2)'
    },
    '& svg': {
        color: '#00a8ff',
        marginRight: '10px',
        fontSize: '20px',
    },
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
    '& .MuiPaper-root': {
        background: 'rgba(0, 22, 45, 0.98)',
        backdropFilter: 'blur(18px)',
        borderRadius: '10px',
        border: '1px solid rgba(0, 168, 255, 0.3)',
        boxShadow: '0 10px 28px rgba(0, 168, 255, 0.2)',
        minWidth: '180px',
        padding: '6px 0',
        overflow: 'hidden'
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
                        <EditIcon />
                        {t('edit')}
                    </StyledMenuItem>

                    <StyledMenuItem onClick={() => { onDelete(); onClose(); }}>
                        <DeleteIcon />
                        {t('delete')}
                    </StyledMenuItem>
                </>
            )}

            <StyledMenuItem onClick={() => { onCopy(); onClose(); }}>
                <ContentCopyIcon />
                {t('copy')}
            </StyledMenuItem>

            <StyledMenuItem onClick={() => { onForward(); onClose(); }}>
                <ForwardIcon />
                {t('forward')}
            </StyledMenuItem>
        </StyledMenu>
    );
}
