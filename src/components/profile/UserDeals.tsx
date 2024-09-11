import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Modal, ModalDialog, ModalClose, Button, Input, Divider } from '@mui/joy';
import { Filters } from '../operation/Filters';
import { useNavigate } from 'react-router-dom';

interface UserDealsProps {
    username: string;
    currentUser: string;
}

const UserDeals: React.FC<UserDealsProps> = ({ username, currentUser }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [search, setSearch] = React.useState('');
    const [filterStatus, setFilterStatus] = React.useState('');
    const [filterCategory, setFilterCategory] = React.useState('');
    const [openFilters, setOpenFilters] = React.useState(false);

    const applyFilters = () => {
        navigate(`/operations?username=${username}&status=${filterStatus}&category=${filterCategory}&search=${search}`);
        setOpenFilters(false);
    };

    const isCurrentUser = username === currentUser;

    return (
        <Box>
            <Box sx={{ mb: 2, textAlign: 'center' }}>
                <Typography level="title-md">
                    {isCurrentUser ? t('My trades') : t(`${username}'s trades`)}
                </Typography>
                <Typography level="body-sm">
                    {isCurrentUser ? t('Review your trades') : t('Review trades')}
                </Typography>
            </Box>
            <Divider />
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2 }}>
                <Input
                    placeholder={t('search') || 'Search'}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ maxWidth: 300 }}
                />
                <Button onClick={() => setOpenFilters(true)} sx={{ ml: 2 }}>
                    {t('Filters')}
                </Button>
            </Box>
            <Modal open={openFilters} onClose={() => setOpenFilters(false)}>
                <ModalDialog color="primary" layout="center" size="md" variant="outlined">
                    <ModalClose />
                    <Typography>{t('Filter Options')}</Typography>
                    <Filters
                        filterStatus={filterStatus}
                        setFilterStatus={setFilterStatus}
                        filterCategory={filterCategory}
                        setFilterCategory={setFilterCategory}
                        applyFilters={applyFilters}
                    />
                </ModalDialog>
            </Modal>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button variant="outlined" color="primary" onClick={() => navigate('/')}>
                    {t('Home')}
                </Button>
                <Button variant="solid" color="success" onClick={() => applyFilters()}>
                    {t('Open')}
                </Button>
            </Box>
        </Box>
    );
};

export default UserDeals;
