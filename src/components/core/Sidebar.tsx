import * as React from 'react';
import Avatar from '@mui/joy/Avatar';
import Box from '@mui/joy/Box';
import Divider from '@mui/joy/Divider';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemButton, { listItemButtonClasses } from '@mui/joy/ListItemButton';
import ListItemContent from '@mui/joy/ListItemContent';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';
import { jwtDecode } from 'jwt-decode';
import { useTranslation } from 'react-i18next';
import GroupChatModal from '../group/GroupChatModal';
import { useNavigate } from 'react-router-dom';
import QuestionAnswerRoundedIcon from '@mui/icons-material/QuestionAnswerRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { DarkModeSwitch } from './ColorSchemeToggle';
import { LanguageSwitcherWithText } from "./LanguageSwitcher";
import { createFavoriteChat } from '../../api/api';
import {useState} from "react";

interface DecodedToken {
    publicKey: string;
    avatar: string;
    exp: number;
}

function Toggler(props: {
    defaultExpanded?: boolean;
    children: React.ReactNode;
    renderToggle: (params: {
        open: boolean;
        setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    }) => React.ReactNode;
}) {
    const { defaultExpanded = false, renderToggle, children } = props;
    const [open, setOpen] = React.useState(defaultExpanded);
    return (
        <React.Fragment>
            {renderToggle({ open, setOpen })}
            <Box
                sx={[
                    {
                        display: 'grid',
                        transition: '0.2s ease',
                        '& > *': {
                            overflow: 'hidden',
                        },
                    },
                    open ? { gridTemplateRows: '1fr' } : { gridTemplateRows: '0fr' },
                ]}
            >
                {children}
            </Box>
        </React.Fragment>
    );
}

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const [userData, setUserData] = React.useState<{ publicKey: string; avatar: string; } | null>(null);
    const { t } = useTranslation();
    const [isGroupModalOpen, setIsGroupModalOpen] = React.useState(false);
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);

    const handleToggle = () => {
        setIsExpanded(!isExpanded);
    };

    React.useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded: DecodedToken = jwtDecode(token);
                if (!userData) {
                    setUserData({
                        publicKey: decoded.publicKey,
                        avatar: decoded.avatar,
                    });
                }
            } catch (error) {
                console.error('Ошибка декодирования токена:', error);
            }
        }
    }, []);

    if (!userData) {
        return null;
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleCreateGroupClick = () => {
        setIsGroupModalOpen(true);
    };

    const handleCloseGroupModal = () => {
        setIsGroupModalOpen(false);
    };

    const handleCreateFavoriteChat = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const favoriteChat = await createFavoriteChat(token);
            } catch (error) {
                console.error('Error creating favorite chat:', error);
            }
        }
    };

    return (
        <>
            <Sheet
                className="Sidebar"
                sx={{
                    position: { xs: 'fixed', md: 'sticky' },
                    transform: isOpen ? 'translateX(0)' : { xs: 'translateX(-100%)', md: 'none' },
                    transition: 'transform 0.4s, width 0.4s',
                    zIndex: 10,
                    height: { xs: '100vh', md: 'auto' },
                    p: 1,
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    width: { xs: '240px', md: '180px' },
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', mb: 0, padding: 0, alignItems: 'flex-start' }}>
                    <Avatar
                        variant="outlined"
                        size="lg"
                        sx={{ width: 50, height: 50 }}
                        src={userData.avatar || 'https://via.placeholder.com/80'}
                    />
                    <Box
                        onClick={handleToggle}
                        sx={{
                            mb: 0,
                            maxHeight: isExpanded ? '500px' : '20px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'max-height 0.3s ease',
                            width: '100%',
                        }}
                    >
                        <Typography
                            level="title-sm"
                            sx={{
                                wordBreak: 'break-all',
                            }}
                        >
                            {userData.publicKey}
                        </Typography>
                    </Box>
                </Box>


                <Divider />

                <Box
                    sx={{
                        minHeight: 0,
                        overflow: 'hidden auto',
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        [`& .${listItemButtonClasses.root}`]: {
                            gap: 1.5,
                        },
                    }}
                >
                    <List
                        size="sm"
                        sx={{
                            gap: 1,
                            '--List-nestedInsetStart': '30px',
                            '--ListItem-radius': (theme) => theme.vars.radius.sm,
                        }}
                    >
                        {/* Messages section */}
                        <ListItem nested>
                            <Toggler
                                renderToggle={({ open, setOpen }) => (
                                    <ListItemButton onClick={() => setOpen(!open)}>
                                        <QuestionAnswerRoundedIcon />
                                        <ListItemContent>
                                            <Typography level="title-sm">{t('Messages')}</Typography>
                                        </ListItemContent>
                                        <KeyboardArrowDownIcon
                                            sx={[
                                                open
                                                    ? {
                                                        transform: 'rotate(180deg)',
                                                    }
                                                    : {
                                                        transform: 'none',
                                                    },
                                            ]}
                                        />
                                    </ListItemButton>
                                )}
                            >
                                <List sx={{ gap: 0.5 }}>
                                    <ListItem sx={{ mt: 0.5 }}>
                                        <ListItemButton component="a" href="/chat">
                                            {t('myMessages')}
                                        </ListItemButton>
                                    </ListItem>
                                    <ListItem>
                                        <ListItemButton onClick={handleCreateGroupClick}>
                                            {t('Create a Group')}
                                        </ListItemButton>
                                    </ListItem>
                                    {/*<ListItem>*/}
                                    {/*    <ListItemButton onClick={handleCreateFavoriteChat}>*/}
                                    {/*        {t('Saved Messages')}*/}
                                    {/*    </ListItemButton>*/}
                                    {/*</ListItem>*/}
                                </List>
                            </Toggler>
                        </ListItem>

                        {/* Users section */}
                        <ListItem nested>
                            <Toggler
                                renderToggle={({ open, setOpen }) => (
                                    <ListItemButton onClick={() => setOpen(!open)}>
                                        <GroupRoundedIcon />
                                        <ListItemContent>
                                            <Typography level="title-sm">{t('Users')}</Typography>
                                        </ListItemContent>
                                        <KeyboardArrowDownIcon
                                            sx={[
                                                open
                                                    ? {
                                                        transform: 'rotate(180deg)',
                                                    }
                                                    : {
                                                        transform: 'none',
                                                    },
                                            ]}
                                        />
                                    </ListItemButton>
                                )}
                            >
                                <List sx={{ gap: 0.5 }}>
                                    <ListItem sx={{ mt: 0.5 }}>
                                        <ListItemButton
                                            component="a"
                                            href={`/${userData.publicKey}`}
                                        >
                                            {t('myProfile')}
                                        </ListItemButton>
                                    </ListItem>
                                    <ListItem>
                                        <ListItemButton component="a" href="/register">
                                            {t('Create a new user')}
                                        </ListItemButton>
                                    </ListItem>
                                    <ListItem>
                                        <ListItemButton onClick={handleLogout}>
                                            {t('Logout')}
                                        </ListItemButton>
                                    </ListItem>
                                </List>
                            </Toggler>
                        </ListItem>
                    </List>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ marginLeft: 'auto', marginRight: 'auto', mb: 2, zIndex: 10001 }}>
                    <DarkModeSwitch />
                    <LanguageSwitcherWithText />
                </Box>

            </Sheet>

            <GroupChatModal
                open={isGroupModalOpen}
                onClose={handleCloseGroupModal}
            />
        </>
    );
}
