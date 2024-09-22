import * as React from 'react';
import Box from '@mui/joy/Box';
import Stack from '@mui/joy/Stack';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import { MessageProps } from '../core/types';

type ChatBubbleProps = MessageProps & {
    variant: 'sent' | 'received';
};

export default function ChatBubble(props: ChatBubbleProps) {
    const { content, variant, createdAt } = props;
    const isSent = variant === 'sent';
    const formattedTime = new Date(createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: isSent ? 'flex-end' : 'flex-start',
                mb: 1,
            }}
        >
            <Sheet
                color={isSent ? 'primary' : 'neutral'}
                variant={isSent ? 'solid' : 'soft'}
                sx={{
                    position: 'relative',
                    maxWidth: '95%',
                    minWidth: 'auto',
                    padding: '8px 20px',
                    borderRadius: '16px',
                    borderTopRightRadius: isSent ? 0 : '16px',
                    borderTopLeftRadius: isSent ? '16px' : 0,
                    backgroundColor: isSent
                        ? 'var(--joy-palette-primary-solidBg)'
                        : 'background.body',
                    color: isSent
                        ? 'var(--joy-palette-common-white)'
                        : 'var(--joy-palette-text-primary)',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                    flexGrow: 0,
                    display: 'inline-block',
                }}
            >
                {/* Контент сообщения */}
                <Typography
                    sx={{
                        color: isSent
                            ? 'var(--joy-palette-common-white)'
                            : 'var(--joy-palette-text-primary)',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        whiteSpace: 'pre-wrap',
                        marginBottom: '8px', // Отступ снизу для контента
                    }}
                >
                    {content}
                </Typography>

                {/* Время сообщения */}
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="flex-end"
                    spacing={0.5}
                    sx={{ position: 'absolute', bottom: 2, right: 10 }} // Отступы справа и снизу
                >
                    <Typography
                        sx={{
                            fontSize: '12px',
                            color: isSent
                                ? 'var(--joy-palette-common-white)'
                                : 'var(--joy-palette-text-secondary)',
                        }}
                    >
                        {formattedTime}
                    </Typography>
                </Stack>
            </Sheet>
        </Box>
    );
}
