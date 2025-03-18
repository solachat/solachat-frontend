import * as React from 'react';
import Box from '@mui/joy/Box';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import ListItemContent from '@mui/joy/ListItemContent';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ChatIcon from '@mui/icons-material/Chat';
import ContactsIcon from '@mui/icons-material/Contacts';
import SettingsIcon from '@mui/icons-material/Settings';
import BugReportIcon from '@mui/icons-material/BugReport';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    setActiveScreen: (screen: 'chats' | 'settings') => void;
}

export default function Sidebar({ isOpen, setActiveScreen }: SidebarProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [selectedNav, setSelectedNav] = React.useState<string>();

    const handleSelect = (nav: string, callback?: () => void) => {
        setSelectedNav(nav);
        if (callback) callback();
    };

    const hoverSx = {
        height: '40px',
        borderRadius: '8px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
            backgroundColor: 'rgba(0, 168, 255, 0.15)',
            boxShadow: '0 4px 12px rgba(0, 168, 255, 0.2)',
            transform: 'translateX(4px)'
        },
        '&.Mui-selected': {
            background: 'linear-gradient(45deg, rgba(0,168,255,0.2) 30%, rgba(0,118,255,0.1) 90%)',
            borderLeft: '3px solid #00a8ff',
            boxShadow: '0 4px 16px rgba(0, 168, 255, 0.25)'
        }
    };

    const iconSx = (isSelected: boolean) => ({
        marginRight: 1,
        color: isSelected ? '#00e5ff' : '#00a8ff',
        transition: 'all 0.3s ease',
        fontSize: { xs: '20px', sm: '22px' },
        filter: isSelected ? 'drop-shadow(0 2px 4px rgba(0,168,255,0.4))' : 'none'
    });

    return (
        <Sheet
            className="Sidebar"
            sx={{
                position: { xs: 'fixed', md: 'sticky' },
                transform: isOpen ? 'translateX(0)' : { xs: 'translateX(-100%)', md: 'none' },
                transition: 'transform 0.4s, width 0.4s',
                zIndex: 10,
                height: { xs: '30vh', md: 'auto' },
                p: 1.5,
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                width: { xs: '260px', md: '200px' },
                background: 'rgba(0, 22, 45, 0.95)',
                backdropFilter: 'blur(24px)',
                borderRight: '1px solid rgba(0, 168, 255, 0.3)',
                boxShadow: '4px 0 24px rgba(0, 168, 255, 0.15)',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 10% 50%, rgba(0,168,255,0.1) 0%, transparent 60%)',
                    pointerEvents: 'none'
                }
            }}
        >
            <Box sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                '& .MuiListItem-root': {
                    position: 'relative',
                    '&:not(:last-child)::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: 12,
                        right: 12,
                        top: 'calc(100% + 4px)',
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent 0%, rgba(0,168,255,0.2) 50%, transparent 100%)'
                    }
                }
            }}>
                {/*<ListItem>*/}
                {/*    <ListItemButton*/}
                {/*        selected={selectedNav === 'saved-messages'}*/}
                {/*        onClick={() => handleSelect('saved-messages', () => navigate('/saved-messages'))}*/}
                {/*        sx={hoverSx}*/}
                {/*    >*/}
                {/*        <ChatIcon sx={iconSx(selectedNav === 'saved-messages')} />*/}
                {/*        <ListItemContent>*/}
                {/*            <Typography level="title-sm" sx={{*/}
                {/*                color: '#a0d4ff',*/}
                {/*                fontSize: '14px',*/}
                {/*                letterSpacing: '0.3px'*/}
                {/*            }}>*/}
                {/*                {t('Saved Messages')}*/}
                {/*            </Typography>*/}
                {/*        </ListItemContent>*/}
                {/*    </ListItemButton>*/}
                {/*</ListItem>*/}

                <ListItem>
                    <ListItemButton
                        selected={selectedNav === 'contacts'}
                        onClick={() => handleSelect('contacts', () => navigate('/contacts'))}
                        sx={hoverSx}
                    >
                        <ContactsIcon sx={iconSx(selectedNav === 'contacts')} />
                        <ListItemContent>
                            <Typography level="title-sm" sx={{
                                color: '#a0d4ff',
                                fontSize: '14px',
                                letterSpacing: '0.3px'
                            }}>
                                {t('Contacts')}
                            </Typography>
                        </ListItemContent>
                    </ListItemButton>
                </ListItem>

                <ListItem>
                    <ListItemButton
                        selected={selectedNav === 'settings'}
                        onClick={() => handleSelect('settings', () => setActiveScreen('settings'))}
                        sx={hoverSx}
                    >
                        <SettingsIcon sx={iconSx(selectedNav === 'settings')} />
                        <ListItemContent>
                            <Typography level="title-sm" sx={{
                                color: '#a0d4ff',
                                fontSize: '14px',
                                letterSpacing: '0.3px'
                            }}>
                                {t('Settings')}
                            </Typography>
                        </ListItemContent>
                    </ListItemButton>
                </ListItem>

                <ListItem>
                    <ListItemButton
                        selected={selectedNav === 'report-bug'}
                        onClick={() => handleSelect('report-bug', () => navigate('/report-bug'))}
                        sx={hoverSx}
                    >
                        <BugReportIcon sx={iconSx(selectedNav === 'report-bug')} />
                        <ListItemContent>
                            <Typography level="title-sm" sx={{
                                color: '#a0d4ff',
                                fontSize: '14px',
                                letterSpacing: '0.3px'
                            }}>
                                {t('Report a Bug')}
                            </Typography>
                        </ListItemContent>
                    </ListItemButton>
                </ListItem>
            </Box>

            <Box sx={{
                marginLeft: 'auto',
                marginRight: 'auto',
                mb: 1,
                px: 1.5,
                py: 0.5,
                borderRadius: '6px',
                background: 'rgba(0, 168, 255, 0.1)',
                boxShadow: '0 2px 8px rgba(0, 168, 255, 0.1)'
            }}>
                <Typography sx={{
                    textAlign: 'center',
                    fontSize: '11px',
                    color: '#00a8ff',
                    fontWeight: 'bold',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase'
                }}>
                    SolaChat Web A 0.1.0
                </Typography>
            </Box>
        </Sheet>
    );
}
