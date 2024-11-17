import React from 'react';
import Popover from '@mui/material/Popover';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import { useTheme } from '@mui/material/styles';

type EmojiPickerPopoverProps = {
    onEmojiSelect: (emoji: string) => void;
    anchorEl: HTMLElement | null;
    onClose: () => void;
};

const emojiList = ["😀", "😂", "🥰", "😍", "🤔", "😎", "😢", "😡", "👍", "👏", "🙏", "🎉", "🥳", "💪", "💖", "🌟", "🔥", "✨", "🎁", "🌈"];

export default function EmojiPickerPopover({ onEmojiSelect, anchorEl, onClose }: EmojiPickerPopoverProps) {
    const isOpen = Boolean(anchorEl);
    const theme = useTheme();

    return (
        <Popover
            open={isOpen}
            anchorEl={anchorEl}
            onClose={onClose}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'center',
            }}
            transformOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
        >
            <Box sx={{
                width: 200,
                padding: '10px',
                borderRadius: '8px',
                backgroundColor: theme.palette.background.paper,
                boxShadow: theme.shadows[3],
                color: theme.palette.text.primary,
            }}>
                <Typography sx={{ marginBottom: '8px', fontWeight: 'bold', color: theme.palette.text.primary }}>
                    Эмодзи
                </Typography>

                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '4px',
                        maxHeight: '180px',
                        overflowY: 'auto',
                        paddingRight: '6px',
                        '&::-webkit-scrollbar': {
                            width: '8px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: theme.palette.action.selected,
                            borderRadius: '4px',
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                            backgroundColor: theme.palette.action.hover,
                        },
                        '&::-webkit-scrollbar-track': {
                            backgroundColor: theme.palette.background.default,
                        },
                    }}
                >
                    {emojiList.map((emoji, index) => (
                        <Box
                            key={index}
                            onClick={() => onEmojiSelect(emoji)}
                            sx={{
                                cursor: 'pointer',
                                fontSize: '20px',
                                padding: '4px',
                                borderRadius: '4px',
                                '&:hover': { backgroundColor: theme.palette.action.hover }
                            }}
                        >
                            {emoji}
                        </Box>
                    ))}
                </Box>
            </Box>
        </Popover>
    );
}
