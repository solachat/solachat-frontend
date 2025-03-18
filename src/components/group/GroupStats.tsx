import * as React from 'react';
import { Box, Stack, Typography } from '@mui/joy';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import PhotoIcon from '@mui/icons-material/Photo';
import VideoIcon from '@mui/icons-material/VideoLibrary';
import FileIcon from '@mui/icons-material/InsertDriveFile';
import LinkIcon from '@mui/icons-material/Link';
import MicIcon from '@mui/icons-material/Mic';
import GifIcon from '@mui/icons-material/Gif';
import { useTranslation } from 'react-i18next';

export default function GroupStats() {
    const { t } = useTranslation();

    return (
        <Box sx={{ padding: '16px 24px' }}>
            <Stack direction="column" spacing={2}>
                <StatItem icon={<BookmarkIcon />} text={t('Saved Messages')} count={2} />
                <StatItem icon={<PhotoIcon />} text={t('Photos')} count={786} />
                <StatItem icon={<VideoIcon />} text={t('Videos')} count={114} />
                <StatItem icon={<FileIcon />} text={t('Files')} count={3} />
                <StatItem icon={<MicIcon />} text={t('Voice Messages')} count={128} />
                <StatItem icon={<LinkIcon />} text={t('Links')} count={83} />
                <StatItem icon={<GifIcon />} text={t('GIFs')} count={140} />
            </Stack>
        </Box>
    );
}

type StatItemProps = {
    icon: React.ReactNode;
    text: string;
    count: number;
};

function StatItem({ icon, text, count }: StatItemProps) {
    return (
        <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" gap={1}>
                {icon}
                <Typography>{text}</Typography>
            </Stack>
            <Typography>{count}</Typography>
        </Stack>
    );
}
