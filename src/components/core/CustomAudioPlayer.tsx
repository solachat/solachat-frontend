import React, { useState, useRef, useEffect } from 'react';
import { IconButton, Slider, Box, Typography, Tooltip } from '@mui/joy';
import { PlayArrow, Pause, VolumeUp, VolumeOff } from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function CustomAudioPlayer({ audioSrc, isSent }: { audioSrc: string; isSent: boolean }) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

    // Цветовая схема в синих оттенках
    const primaryColor = isSent ? '#1890ff' : '#40a9ff';
    const secondaryColor = isSent ? 'rgba(24,144,255,0.15)' : 'rgba(64,169,255,0.15)';

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateData = () => {
            setDuration(audio.duration);
            setCurrentTime(audio.currentTime);
        };

        audio.addEventListener('loadedmetadata', updateData);
        audio.addEventListener('ended', () => setIsPlaying(false));

        return () => {
            audio.removeEventListener('loadedmetadata', updateData);
            audio.removeEventListener('ended', () => setIsPlaying(false));
        };
    }, []);

    const togglePlayPause = () => {
        const audio = audioRef.current;
        if (!audio) return;

        isPlaying ? audio.pause() : audio.play();
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => setCurrentTime(audioRef.current?.currentTime || 0);

    const handleSeek = (_: Event, value: number | number[]) => {
        const time = Array.isArray(value) ? value[0] : value;
        audioRef.current && (audioRef.current.currentTime = time);
    };

    const handleVolumeChange = (_: Event, value: number | number[]) => {
        const vol = Array.isArray(value) ? value[0] : value;
        setVolume(vol);
        if (audioRef.current) {
            audioRef.current.volume = vol;
            setIsMuted(vol === 0);
        }
    };

    const toggleMute = () => {
        if (audioRef.current) {
            const newMuted = !isMuted;
            audioRef.current.muted = newMuted;
            setIsMuted(newMuted);
            setVolume(newMuted ? 0 : 1);
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{
                width: '100%',
                p: 1,
                borderRadius: '12px',
                bgcolor: 'transparent',
                position: 'relative',
            }}
        >
            {/* Временная шкала */}
            <Box sx={{
                position: 'relative',
                height: '4px',
                bgcolor: '#e8e8e8',
                borderRadius: '2px',
                mb: 1.5,
                overflow: 'hidden'
            }}>
                <Box
                    sx={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: `${(currentTime / duration) * 100}%`,
                        height: '100%',
                        bgcolor: primaryColor,
                        borderRadius: '2px',
                    }}
                />
            </Box>

            {/* Основные элементы управления */}
            <Box display="flex" alignItems="center" justifyContent="space-between">
                {/* Левая часть: кнопка управления и время */}
                <Box display="flex" alignItems="center" gap={1.5}>
                    <Tooltip title={isPlaying ? "Пауза" : "Воспроизвести"}>
                        <IconButton
                            variant="soft"
                            onClick={togglePlayPause}
                            sx={{
                                borderRadius: '50%',
                                bgcolor: primaryColor,
                                '&:hover': { bgcolor: `${primaryColor}cc` }
                            }}
                        >
                            {isPlaying ? (
                                <Pause sx={{ fontSize: 20, color: '#fff' }} />
                            ) : (
                                <PlayArrow sx={{ fontSize: 20, color: '#fff' }} />
                            )}
                        </IconButton>
                    </Tooltip>

                    <Typography level="body-sm" sx={{ color: '#595959' }}>
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </Typography>
                </Box>

                {/* Правая часть: управление громкостью */}
                <Box display="flex" alignItems="center" gap={1} sx={{ width: 160 }}>
                    <IconButton
                        size="sm"
                        onClick={toggleMute}
                        sx={{ color: primaryColor }}
                    >
                        {isMuted ? <VolumeOff /> : <VolumeUp />}
                    </IconButton>

                    <Slider
                        value={volume}
                        min={0}
                        max={1}
                        step={0.01}
                        onChange={handleVolumeChange}
                        sx={{
                            width: 100,
                            '--Slider-thumbSize': '12px',
                            '--Slider-trackHeight': '4px',
                            color: primaryColor,
                        }}
                    />
                </Box>
            </Box>

            <audio
                ref={audioRef}
                src={audioSrc}
                onTimeUpdate={handleTimeUpdate}
                style={{ display: 'none' }}
            />
        </Box>
    );
}
