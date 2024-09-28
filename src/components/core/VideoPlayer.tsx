import * as React from 'react';
import { useState } from 'react';
import Box from '@mui/joy/Box';
import IconButton from '@mui/joy/IconButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import Typography from '@mui/joy/Typography';

type VideoPlayerProps = {
    src: string;
    poster?: string;
    fileName: string;
};

export default function VideoPlayer({ src, poster, fileName }: VideoPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const videoRef = React.useRef<HTMLVideoElement>(null);

    const handlePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleFullscreen = () => {
        if (videoRef.current) {
            if (isFullscreen) {
                document.exitFullscreen();
            } else {
                videoRef.current.requestFullscreen();
            }
            setIsFullscreen(!isFullscreen);
        }
    };

    return (
        <Box sx={{ width: '100%', maxWidth: '500px', position: 'relative' }}>
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                style={{ width: '100%', borderRadius: '8px' }}
                controls
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            >
                Ваш браузер не поддерживает видеоформат.
            </video>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography>{fileName}</Typography>
                <Box>
                    <IconButton onClick={handlePlayPause}>
                        {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                    </IconButton>
                    <IconButton onClick={handleFullscreen}>
                        <FullscreenIcon />
                    </IconButton>
                </Box>
            </Box>
        </Box>
    );
}
