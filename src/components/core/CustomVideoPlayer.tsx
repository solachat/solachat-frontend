import React, { useRef, useState } from 'react';
import Box from '@mui/joy/Box';
import IconButton from '@mui/joy/IconButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import Slider from '@mui/joy/Slider';

type CustomVideoPlayerProps = {
    src: string;
    poster?: string;
    autoPlay?: boolean; // Добавляем свойство autoPlay
};

export default function CustomVideoPlayer({ src, poster, autoPlay = false }: CustomVideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(autoPlay); // Начинаем воспроизведение, если autoPlay = true
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(1);
    const [progress, setProgress] = useState(0);

    const togglePlayPause = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleMute = () => {
        if (!videoRef.current) return;
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const handleVolumeChange = (event: Event, newValue: number | number[]) => {
        const volume = Array.isArray(newValue) ? newValue[0] : newValue;
        setVolume(volume);
        if (videoRef.current) {
            videoRef.current.volume = volume;
        }
    };

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
        setProgress(progress);
    };

    const handleProgressChange = (event: Event, newValue: number | number[]) => {
        if (!videoRef.current) return;
        const seekTo = Array.isArray(newValue) ? newValue[0] : newValue;
        videoRef.current.currentTime = (seekTo / 100) * videoRef.current.duration;
        setProgress(seekTo);
    };

    const handleFullscreen = () => {
        if (!videoRef.current) return;
        if (videoRef.current.requestFullscreen) {
            videoRef.current.requestFullscreen();
        }
    };

    return (
        <Box sx={{ position: 'relative', width: '100%', maxWidth: '500px', borderRadius: '12px', overflow: 'hidden' }}>
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                autoPlay={autoPlay} // Используем свойство autoPlay
                onTimeUpdate={handleTimeUpdate}
                style={{ width: '100%', borderRadius: '12px' }}
                onEnded={() => setIsPlaying(false)}
                controls
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'rgba(0, 0, 0, 0.6)',
                    color: '#fff',
                    padding: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <IconButton onClick={togglePlayPause} sx={{ color: 'white', padding: '8px' }}>
                    {isPlaying ? <PauseIcon sx={{ fontSize: '24px' }} /> : <PlayArrowIcon sx={{ fontSize: '24px' }} />}
                </IconButton>

                <Slider
                    value={progress}
                    onChange={handleProgressChange}
                    sx={{
                        flex: 1,
                        mx: 2,
                        color: 'white',
                        '& .MuiSlider-thumb': {
                            color: 'white',
                            width: '12px',
                            height: '12px',
                        },
                        '& .MuiSlider-track': {
                            height: '4px',
                        },
                    }}
                />

                <IconButton onClick={handleMute} sx={{ color: 'white', padding: '8px' }}>
                    {isMuted || volume === 0 ? <VolumeOffIcon sx={{ fontSize: '24px' }} /> : <VolumeUpIcon sx={{ fontSize: '24px' }} />}
                </IconButton>
                <Slider
                    value={volume}
                    onChange={handleVolumeChange}
                    min={0}
                    max={1}
                    step={0.1}
                    sx={{
                        width: 100,
                        color: 'white',
                        '& .MuiSlider-thumb': {
                            color: 'white',
                            width: '12px',
                            height: '12px',
                        },
                        '& .MuiSlider-track': {
                            height: '4px',
                        },
                    }}
                />

                <IconButton onClick={handleFullscreen} sx={{ color: 'white', padding: '8px' }}>
                    <FullscreenIcon sx={{ fontSize: '24px' }} />
                </IconButton>
            </Box>
        </Box>
    );
}
