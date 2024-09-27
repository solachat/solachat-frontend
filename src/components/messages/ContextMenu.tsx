import * as React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ForwardIcon from '@mui/icons-material/Send';
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
    onClose: () => void;
    open: boolean;
};

export default function ContextMenu({
                                        anchorPosition,
                                        onEdit,
                                        onCopy,
                                        onForward,
                                        onClose,
                                        open,
                                    }: ContextMenuProps) {
    return (
        <StyledMenu
            anchorReference="anchorPosition"
            anchorPosition={anchorPosition}
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
