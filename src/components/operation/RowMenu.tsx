import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown, Menu, MenuButton, MenuItem, Divider, IconButton } from '@mui/joy';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';

export const RowMenu: React.FC = () => {
    const { t } = useTranslation();

    return (
        <Dropdown>
            <MenuButton
                slots={{ root: IconButton }}
                slotProps={{ root: { variant: 'plain', color: 'neutral', size: 'sm' } }}
            >
                <MoreHorizRoundedIcon />
            </MenuButton>
            <Menu size="sm" sx={{ minWidth: 140 }}>
                <MenuItem>{t('Edit')}</MenuItem>
                <MenuItem>{t('Rename')}</MenuItem>
                <MenuItem>{t('Move')}</MenuItem>
                <Divider />
                <MenuItem color="danger">{t('Delete')}</MenuItem>
            </Menu>
        </Dropdown>
    );
};
