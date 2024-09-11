import * as React from 'react';
import { Box, Button, Typography, Avatar } from '@mui/joy';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';

// Mock function to simulate checking authentication status
const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
    const [username, setUsername] = React.useState('');

    // It for test (Simulation user)
    // React.useEffect(() => {
    //     setTimeout(() => {
    //         setIsAuthenticated(true);
    //         setUsername('Podolsky');
    //     }, 1000);
    // }, []);

    return { isAuthenticated, username };
};

export default function Navbar() {
    const { t } = useTranslation();
    const { isAuthenticated, username } = useAuth();

    return (
        <Box
            component="nav"
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 3,
                py: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                position: 'relative',
            }}
        >
            <Box sx={{ display: 'flex', gap: 3 }}>
                <Button component={RouterLink} to="/" variant="soft" color="primary">
                    {t('home')}
                </Button>
                <Button component={RouterLink} to="/operations" variant="soft" color="primary">
                    {t('Operations')}
                </Button>
                <Button component={RouterLink} to="/contacts" variant="soft" color="primary">
                    {t('Contacts')}
                </Button>
                {isAuthenticated && (
                    <Button component={RouterLink} to="/chat" variant="soft" color="primary">
                        {t('Chat')}
                    </Button>
                )}
            </Box>
            <Box sx={{ position: 'absolute', right: 16, display: 'flex', alignItems: 'center', gap: 2 }}>
                {isAuthenticated ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar alt={username} src="/static/images/avatar/1.jpg" />
                        <Typography
                            component={RouterLink}
                            to={`/account?username=${username}`}
                            sx={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            {username}
                        </Typography>
                    </Box>
                ) : (
                    <Button component={RouterLink} to="/login" variant="outlined" color="primary">
                        {t('Login')}
                    </Button>
                )}
            </Box>
        </Box>
    );
}
