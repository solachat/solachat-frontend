import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Sheet, Modal } from '@mui/joy';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import DevicesIcon from '@mui/icons-material/Devices';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useTranslation } from 'react-i18next';
import { Session, SessionCard } from './SessionCard';
import {deleteAllOtherSessions, deleteSessionById} from '../../api/api';
import GoogleIcon from '@mui/icons-material/Language';
import ChromeIcon from '@mui/icons-material/Google';
import FirefoxIcon from '@mui/icons-material/LocalFireDepartment';
import SafariIcon from '@mui/icons-material/Apple';
import EdgeIcon from '@mui/icons-material/HorizontalSplit';
import {AnimatePresence, motion } from 'framer-motion';

interface SessionsScreenProps {
    sessions: Session[];
    onBack: () => void;
}

export default function SessionsScreen({ sessions, onBack }: SessionsScreenProps) {
    const { t, i18n } = useTranslation();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [sessionsState, setSessionsState] = useState<Session[]>(sessions);


    const parseUserAgent = (ua: string) => {
        let browser = 'Unknown Browser';
        let version = '';
        let os = 'Unknown OS';

        if (/Chrome\/(\d+)/.test(ua) && !/Edg/.test(ua)) {
            browser = 'Chrome';
            version = ua.match(/Chrome\/(\d+)/)?.[1] || '';
        } else if (/Firefox\/(\d+)/.test(ua)) {
            browser = 'Firefox';
            version = ua.match(/Firefox\/(\d+)/)?.[1] || '';
        } else if (/Edg\/(\d+)/.test(ua)) {
            browser = 'Edge';
            version = ua.match(/Edg\/(\d+)/)?.[1] || '';
        } else if (/Safari\/(\d+)/.test(ua) && /Version\/(\d+)/.test(ua)) {
            browser = 'Safari';
            version = ua.match(/Version\/(\d+)/)?.[1] || '';
        }

        if (ua.includes('Windows')) os = 'Windows';
        else if (ua.includes('Mac OS') || ua.includes('Macintosh')) os = 'macOS';
        else if (ua.includes('Linux')) os = 'Linux';

        return { browser, version, os };
    };

    const getBrowserIcon = (browser: string, size: number = 28) => {
        const iconStyle = { fontSize: size, color: '#00a8ff' };
        const iconBox = (icon: React.ReactNode) => (
            <Box
                sx={{
                    backgroundColor: 'rgba(0,168,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: size + 14, // немного больше под размер
                    height: size + 14,

                }}
            >
                {icon}
            </Box>
        );

        switch (browser) {
            case 'Chrome':
                return iconBox(<ChromeIcon sx={iconStyle} />);
            case 'Firefox':
                return iconBox(<FirefoxIcon sx={{ ...iconStyle, color: '#f57c00' }} />);
            case 'Safari':
                return iconBox(<SafariIcon sx={iconStyle} />);
            case 'Edge':
                return iconBox(<EdgeIcon sx={{ ...iconStyle, color: '#5eb1ff' }} />);
            default:
                return iconBox(<DevicesIcon sx={iconStyle} />);
        }
    };


    const handleTerminateSession = async (sessionId: string) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            await deleteSessionById(sessionId, token);
            setModalOpen(false);
            setSelectedSession(null);

            const updated = sessionsState.filter((s) => s.sessionId !== sessionId);
            setSessionsState(updated);
        } catch (e) {
            console.error('❌ Не удалось завершить сеанс:', e);
        }
    };

    const handleTerminateOtherSessions = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token || !currentSession?.sessionId) return;

            await deleteAllOtherSessions(token, currentSession.sessionId);

            const updated = sessionsState.filter((s) => s.isCurrent);
            setSessionsState(updated);
        } catch (e) {
            console.error('❌ Не удалось завершить другие сеансы:', e);
        }
    };



    useEffect(() => {
        setSessionsState(sessions);
    }, [sessions]);

    const currentSession = sessionsState.find((s) => s.isCurrent);
    const otherSessions = sessionsState.filter((s) => !s.isCurrent);

    const formatLastActive = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();

        const isToday = date.toDateString() === now.toDateString();
        if (isToday) {
            return date.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' });
        }

        const isThisWeek = date > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (isThisWeek) {
            return date.toLocaleDateString(i18n.language, { weekday: 'long' });
        }

        return date.toLocaleDateString(i18n.language, { day: '2-digit', month: 'short' });
    };


    return (
        <Box
            sx={{
                height: '100dvh',
                background: 'linear-gradient(180deg, #00162d 0%, #000d1a 100%)',
                overflow: 'auto',
            }}
        >
            {/* Хедер */}
            <Box
                sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    borderBottom: '1px solid rgba(0,168,255,0.3)',
                    background: 'rgba(0,22,45,0.9)',
                }}
            >
                <IconButton onClick={onBack} sx={{ color: '#00a8ff', mr: 2 }}>
                    <ArrowBackIcon sx={{ fontSize: 24, color: '#a0d4ff' }} />
                </IconButton>
                <Typography
                    level="h4"
                    sx={{
                        color: '#a0d4ff',
                        flexGrow: 1,
                        textShadow: '0 2px 4px rgba(0,168,255,0.3)',
                    }}
                >
                    {t('devices')}
                </Typography>
            </Box>

            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {currentSession && (
                    <Sheet
                        sx={{
                            borderRadius: '16px',
                            background: 'rgba(0,22,45,0.6)',
                            border: '1px solid rgba(0,168,255,0.3)',
                            boxShadow: '0 4px 24px rgba(0,168,255,0.1)',
                            p: 2,
                        }}
                    >
                        <Typography sx={{ fontWeight: 'bold', mb: 1 }}>
                            {t('this_device')}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {getBrowserIcon(parseUserAgent(currentSession.userAgent).browser)}
                            <Box>
                                <Typography sx={{ color: '#a0d4ff', fontSize: '1rem' }}>
                                    {parseUserAgent(currentSession.userAgent).browser} {parseUserAgent(currentSession.userAgent).version}
                                </Typography>
                                <Typography sx={{ color: '#a0d4ff', fontSize: '0.9rem' }}>
                                    {parseUserAgent(currentSession.userAgent).os}
                                </Typography>
                                <Typography sx={{ color: '#7fa0c0', fontSize: '0.9rem' }}>
                                    – {currentSession.country}
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ mt: 2 }}>
                            <IconButton
                                onClick={handleTerminateOtherSessions}
                                sx={{
                                    color: '#ff5050',
                                    border: '1px solid #ff5050',
                                    borderRadius: '8px',
                                    p: 1,
                                }}
                            >
                                <ExitToAppIcon sx={{ fontSize: 20, mr: 1 }} />
                                <Typography sx={{ fontSize: '0.9rem' }}>
                                    {t('terminate_other_sessions')}
                                </Typography>
                            </IconButton>
                        </Box>
                    </Sheet>
                )}

                {otherSessions.map((session) => (
                    <SessionCard
                        key={session.sessionId}
                        session={session}
                        onClick={() => {
                            setSelectedSession(session);
                            setModalOpen(true);
                        }}
                    />
                ))}
            </Box>

            {/* Модальное окно для подробной информации о сессии */}
            {selectedSession && (
                <AnimatePresence>
                    {modalOpen && (
                        <Modal
                            open={modalOpen}
                            onClose={() => setModalOpen(false)}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}

                            >
                    <Sheet
                        sx={{
                            width: 350,
                            p: 2,
                            borderRadius: '16px',
                            background: 'rgba(0,22,45,0.95)',
                            border: '1px solid rgba(0,168,255,0.4)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                        }}
                    >
                        {/* Header */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <IconButton onClick={() => setModalOpen(false)}>
                                    <CloseIcon sx={{ fontSize: 22, color: '#a0d4ff' }} />
                                </IconButton>
                                <Typography sx={{ color: '#a0d4ff', fontSize: '1.1rem', fontWeight: 'bold' }}>
                                    {t('session')}
                                </Typography>
                            </Box>
                            <IconButton
                                onClick={() => handleTerminateSession(selectedSession.sessionId)}
                                sx={{
                                    background: '#ff5050',
                                    '&:hover': { background: '#ff2d2d' },
                                    borderRadius: '8px',
                                    px: 2,
                                    py: 1,
                                }}
                            >
                                <Typography sx={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>
                                    {t('terminate_session')}
                                </Typography>
                            </IconButton>
                        </Box>

                        {/* OS & Date block */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            {getBrowserIcon(parseUserAgent(selectedSession.userAgent).browser, 60)}
                            <Typography sx={{ color: '#a0d4ff', fontSize: '1rem' }}>
                                {parseUserAgent(selectedSession.userAgent).os}
                            </Typography>
                            <Typography sx={{ color: '#a0d4ff', fontSize: '0.9rem' }}>
                                {new Date(selectedSession.lastActiveAt).toLocaleString()}
                            </Typography>
                        </Box>


                        {/* Info Card */}
                        <Sheet
                            sx={{
                                mt: 1,
                                p: 2,
                                borderRadius: '12px',
                                background: 'rgba(0,30,60,0.6)',
                                border: '1px solid rgba(0,168,255,0.2)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1.5,
                            }}
                        >
                            <Box>
                                <Typography sx={{ color: '#7fa0c0', fontSize: '0.85rem' }}>{t('browser')}</Typography>
                                <Typography sx={{ color: '#a0d4ff', fontSize: '1rem' }}>
                                    {parseUserAgent(selectedSession.userAgent).browser} {parseUserAgent(selectedSession.userAgent).version}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography sx={{ color: '#7fa0c0', fontSize: '0.85rem' }}>{t('ip_address')}</Typography>
                                <Typography sx={{ color: '#a0d4ff', fontSize: '1rem' }}>
                                    {selectedSession.ip}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography sx={{ color: '#7fa0c0', fontSize: '0.85rem' }}>{t('geolocation')}</Typography>
                                <Typography sx={{ color: '#a0d4ff', fontSize: '1rem' }}>
                                    {selectedSession.country}
                                </Typography>
                            </Box>
                        </Sheet>

                        {/* Notice */}
                        <Typography sx={{ color: '#7fa0c0', fontSize: '0.75rem', textAlign: 'center', mt: 1 }}>
                            {t('geolocation_info')}
                        </Typography>
                    </Sheet>
                            </motion.div>
                </Modal>
            )}
                </AnimatePresence>
            )}
        </Box>
    );
}
