import * as React from 'react';
import GlobalStyles from '@mui/joy/GlobalStyles';
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

// Импорт иконок
import QuestionAnswerRoundedIcon from '@mui/icons-material/QuestionAnswerRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import CallRoundedIcon from '@mui/icons-material/CallRounded';
import VideoLibraryRoundedIcon from '@mui/icons-material/VideoLibraryRounded';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {UserProps} from "./types";
import {ColorSchemeToggle} from "./ColorSchemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";

interface DecodedToken {
    username: string;
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

export default function Sidebar() {
    const [userData, setUserData] = React.useState<{ username: string; avatar: string } | null>(null);
    const { t } = useTranslation();
    const [isGroupModalOpen, setIsGroupModalOpen] = React.useState(false);

    React.useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded: DecodedToken = jwtDecode(token);
                if (!userData) {
                    setUserData({
                        username: decoded.username,
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

    const handleCreateGroupClick = () => {
        setIsGroupModalOpen(true);
    };

    const handleCloseGroupModal = () => {
        setIsGroupModalOpen(false);
    };

    const handleCreateGroup = async (groupName: string, avatar?: File | null, selectedUsers?: UserProps[]) => {
        console.log('Group created with name:', groupName);
        console.log('Selected users:', selectedUsers);
        console.log('Avatar:', avatar);


        setIsGroupModalOpen(false);
    };

    return (
        <>
            <Sheet
                className="Sidebar"
                sx={{
                    position: { xs: 'fixed', md: 'sticky' },
                    transform: {
                        xs: 'translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1)))',
                        md: 'none',
                    },
                    transition: 'transform 0.4s, width 0.4s',
                    zIndex: 10000,
                    height: 'auto',
                    top: 0,
                    p: 1,
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    width: '180px',
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2, marginLeft: '5px', marginBottom: '0px', marginTop: '5px' }}>
                    <Avatar
                        variant="outlined"
                        size="lg"
                        sx={{ width: 50, height: 50 }}
                        src={userData.avatar || 'https://via.placeholder.com/80'}
                    />
                    <Typography level="title-sm" sx={{ mt: 1 }}>
                        {userData.username}
                    </Typography>
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
                        {/* Music section */}
                        <ListItem>
                            <ListItemButton>
                                <MusicNoteRoundedIcon />
                                <ListItemContent>
                                    <Typography level="title-sm">{t('Music')}</Typography>
                                </ListItemContent>
                            </ListItemButton>
                        </ListItem>

                        {/* Call section */}
                        <ListItem>
                            <ListItemButton>
                                <CallRoundedIcon />
                                <ListItemContent>
                                    <Typography level="title-sm">{t('Call')}</Typography>
                                </ListItemContent>
                            </ListItemButton>
                        </ListItem>

                        {/* Clips section */}
                        <ListItem>
                            <ListItemButton>
                                <VideoLibraryRoundedIcon />
                                <ListItemContent>
                                    <Typography level="title-sm">{t('Clips')}</Typography>
                                </ListItemContent>
                            </ListItemButton>
                        </ListItem>

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
                                            href={`/account?username=${userData.username}`}
                                        >
                                            {t('myProfile')}
                                        </ListItemButton>
                                    </ListItem>
                                    <ListItem>
                                        <ListItemButton component="a" href="/register">
                                            {t('Create a new user')}
                                        </ListItemButton>
                                    </ListItem>
                                </List>
                            </Toggler>
                        </ListItem>
                    </List>
                </Box>
            </Sheet>

            <GroupChatModal
                open={isGroupModalOpen}
                onClose={handleCloseGroupModal}
            />
        </>
    );
}
