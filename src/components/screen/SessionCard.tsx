import React from 'react';
import { Box, Typography, Sheet, IconButton } from '@mui/joy';
import DevicesIcon from '@mui/icons-material/Devices';
import GoogleIcon from '@mui/icons-material/Language';
import ChromeIcon from '@mui/icons-material/Google';
import FirefoxIcon from '@mui/icons-material/LocalFireDepartment';
import SafariIcon from '@mui/icons-material/Apple';
import EdgeIcon from '@mui/icons-material/HorizontalSplit';

export interface Session {
    country: string;
    createdAt: string;
    ip: string;
    lastActiveAt: string;
    sessionId: string;
    updatedAt: string;
    userAgent: string;
    userId: number;
    isCurrent: boolean;
}

interface SessionCardProps {
    session: Session;
    onClick: () => void;
}

export const SessionCard: React.FC<SessionCardProps> = ({ session, onClick }) => {
    const parseUserAgent = (ua: string) => {
        let browser = 'Unknown';
        let version = '';
        let os = 'Unknown';

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

    const { browser, version, os } = parseUserAgent(session.userAgent);

    const getBrowserIcon = () => {
        const iconStyle = { fontSize: 28, color: '#00a8ff' };

        const iconBox = (icon: React.ReactNode) => (
            <Box
                sx={{

                    backgroundColor: 'rgba(0,168,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 42,
                    height: 42,
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


    return (
        <Sheet
            onClick={onClick}
            sx={{
                borderRadius: '16px',
                background: 'rgba(0,22,45,0.6)',
                border: '1px solid rgba(0,168,255,0.3)',
                boxShadow: '0 4px 24px rgba(0,168,255,0.1)',
                p: 2,
                cursor: 'pointer',
                position: 'relative',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {getBrowserIcon()}
                <Box>
                    <Typography sx={{ color: '#a0d4ff', fontSize: '1rem' }}>
                        {browser} {version}
                    </Typography>
                    <Typography sx={{ color: '#a0d4ff', fontSize: '0.9rem' }}>
                        {os}
                    </Typography>
                    <Typography sx={{ color: '#7fa0c0', fontSize: '0.9rem' }}>
                        {session.country}
                    </Typography>
                </Box>
            </Box>
            <Typography
                sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    color: '#a0d4ff',
                    fontSize: '0.8rem',
                }}
            >
                {new Date(session.lastActiveAt).toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit',
                })}

            </Typography>
        </Sheet>
    );
};
