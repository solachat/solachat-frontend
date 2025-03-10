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
import { DarkModeSwitch } from './ColorSchemeToggle';

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
        height: '32px',
        borderRadius: '8px',
        transition: 'background-color 0.1s ease',
        '&:hover': {
            backgroundColor: 'rgba(76, 175, 80, 0.2)',
        },
    };

    return (
        <Sheet
            className="Sidebar"
            sx={{
                position: { xs: 'fixed', md: 'sticky' },
                transform: isOpen ? 'translateX(0)' : { xs: 'translateX(-100%)', md: 'none' },
                transition: 'transform 0.4s, width 0.4s',
                zIndex: 10,
                height: { xs: '60vh', md: 'auto' },
                p: 2,
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                borderRight: '1px solid',
                borderColor: 'divider',
                width: { xs: '280px', md: '220px' },
                outline: 'none',
                border: 'none',
                borderRadius: '12px',
            }}
        >
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <ListItem>
                    <ListItemButton
                        selected={selectedNav === 'saved-messages'}
                        onClick={() =>
                            handleSelect('saved-messages', () => navigate('/saved-messages'))
                        }
                        sx={hoverSx}
                    >
                        <ChatIcon sx={{ marginRight: 1 }} />
                        <ListItemContent>
                            <Typography level="title-sm">{t('Saved Messages')}</Typography>
                        </ListItemContent>
                    </ListItemButton>
                </ListItem>

                <ListItem>
                    <ListItemButton
                        selected={selectedNav === 'contacts'}
                        onClick={() => handleSelect('contacts', () => navigate('/contacts'))}
                        sx={hoverSx}
                    >
                        <ContactsIcon sx={{ marginRight: 1 }} />
                        <ListItemContent>
                            <Typography level="title-sm">{t('Contacts')}</Typography>
                        </ListItemContent>
                    </ListItemButton>
                </ListItem>

                <ListItem>
                    <ListItemButton
                        selected={selectedNav === 'settings'}
                        onClick={() =>
                            handleSelect('settings', () => setActiveScreen('settings'))
                        }
                        sx={hoverSx}
                    >
                        <SettingsIcon sx={{ marginRight: 1 }} />
                        <ListItemContent>
                            <Typography level="title-sm">{t('Settings')}</Typography>
                        </ListItemContent>
                    </ListItemButton>
                </ListItem>

                <ListItem>
                    <ListItemButton
                        selected={selectedNav === 'report-bug'}
                        onClick={() =>
                            handleSelect('report-bug', () => navigate('/report-bug'))
                        }
                        sx={hoverSx}
                    >
                        <BugReportIcon sx={{ marginRight: 1 }} />
                        <ListItemContent>
                            <Typography level="title-sm">{t('Report a Bug')}</Typography>
                        </ListItemContent>
                    </ListItemButton>
                </ListItem>

                <ListItem>
                    <ListItemButton sx={hoverSx}>
                        <DarkModeSwitch />
                    </ListItemButton>
                </ListItem>
            </Box>

            <Box sx={{ marginLeft: 'auto', marginRight: 'auto', mb: 1, zIndex: 10001 }}>
                <Typography sx={{ textAlign: 'center', fontSize: '12px', color: 'text.secondary' }}>
                    Dark Chat Web 0.1.0
                </Typography>
            </Box>
        </Sheet>
    );
}
