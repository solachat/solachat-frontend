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
                mb: { xs: 1, sm: 1.5 },
                px: 1.5,
            }}
        >
            <Sheet
                color={isSent ? 'primary' : 'neutral'}
                variant={isSent ? 'solid' : 'soft'}
                sx={{
                    position: 'relative',
                    maxWidth: { xs: '85%', sm: '100%' },
                    padding: { xs: '6px 10px', sm: '10px 16px' },
                    borderRadius: '12px',
                    borderTopRightRadius: isSent ? 0 : '12px',
                    borderTopLeftRadius: isSent ? '12px' : 0,
                    backgroundColor: isSent
                        ? 'var(--joy-palette-primary-solidBg)'
                        : 'background.body',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                }}
            >
                {/* Контент сообщения */}
                <Typography
                    sx={{
                        fontSize: { xs: '12px', sm: '14px' },
                        color: isSent
                            ? 'var(--joy-palette-common-white)'
                            : 'var(--joy-palette-text-primary)',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        whiteSpace: 'pre-wrap',
                        marginBottom: '4px',
                    }}
                >
                    {content}
                </Typography>

                {/* Время сообщения */}
                <Stack
                    direction={isSent ? 'row-reverse' : 'row'}
                    spacing={1.5}
                    sx={{ position: 'absolute', bottom: 1, right: 8 }}
                >
                    <Typography
                        sx={{
                            fontSize: { xs: '10px', sm: '12px' },
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
