import React, { useState, useRef, useEffect } from 'react';
import { IconButton, Slider, Box, Typography } from '@mui/joy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

export default function CustomAudioPlayer({ audioSrc, isSent }: { audioSrc: string, isSent: boolean }) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);

    const playerColor = isSent ? '#76baff' : '#34a853'; // Динамический цвет плеера

    useEffect(() => {
        // Устанавливаем продолжительность аудиофайла после загрузки метаданных
        const handleLoadedMetadata = () => {
            if (audioRef.current) {
                setDuration(audioRef.current.duration);
            }
        };

        const audio = audioRef.current;
        if (audio) {
            audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        }

        return () => {
            if (audio) {
                audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            }
        };
    }, []);

    // Обработчик воспроизведения/паузы
    const togglePlayPause = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    // Обновление текущего времени аудио
    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleSliderChange = (event: Event, newValue: number | number[]) => {
        if (audioRef.current) {
            audioRef.current.currentTime = Array.isArray(newValue) ? newValue[0] : newValue;
        }
    };

    const handleVolumeChange = (event: Event, newValue: number | number[]) => {
        const newVolume = Array.isArray(newValue) ? newValue[0] : newValue;
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
    };

    // Формат времени для отображения
    const formatTime = (time: number) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', backgroundColor: '#2e2e2e', padding: '10px', borderRadius: '8px' }}>
            {/* Иконка воспроизведения / паузы */}
            <IconButton onClick={togglePlayPause} sx={{ color: playerColor }}>
                {isPlaying ? <PauseIcon sx={{ fontSize: 32 }} /> : <PlayArrowIcon sx={{ fontSize: 32 }} />}
            </IconButton>
            {/* Ползунок времени */}
            <Slider
                value={currentTime}
                max={duration}
                onChange={handleSliderChange}
                sx={{
                    flexGrow: 1,
                    mx: 2,
                    color: playerColor, // Цвет ползунка в зависимости от отправителя/получателя
                    '& .MuiSlider-thumb': {
                        width: '12px',
                        height: '12px',
                        backgroundColor: '#ffffff',
                        border: `2px solid ${playerColor}`,
                    },
                    '& .MuiSlider-track': {
                        height: '4px',
                        backgroundColor: playerColor,
                    },
                    '& .MuiSlider-rail': {
                        height: '4px',
                        backgroundColor: '#cccccc',
                    },
                }}
            />
            {/* Текущее время / Продолжительность */}
            <Typography sx={{ color: '#ffffff', minWidth: '50px' }}>
                {formatTime(currentTime)} / {formatTime(duration)}
            </Typography>
            {/* Ползунок громкости */}
            <VolumeUpIcon sx={{ ml: 2, color: playerColor }} />
            <Slider
                value={volume}
                min={0}
                max={1}
                step={0.01}
                onChange={handleVolumeChange}
                sx={{
                    width: '100px',
                    color: playerColor,
                    '& .MuiSlider-thumb': {
                        width: '12px',
                        height: '12px',
                        backgroundColor: '#ffffff',
                        border: `2px solid ${playerColor}`,
                    },
                    '& .MuiSlider-track': {
                        height: '4px',
                        backgroundColor: playerColor,
                    },
                    '& .MuiSlider-rail': {
                        height: '4px',
                        backgroundColor: '#cccccc',
                    },
                }}
            />
            <audio
                ref={audioRef}
                src={audioSrc}
                onTimeUpdate={handleTimeUpdate}
                style={{ display: 'none' }}
            />
        </Box>
    );
}
