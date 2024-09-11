import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, FormControl, FormLabel, Select, Option, Button } from '@mui/joy';

interface FiltersProps {
    filterStatus: string;
    setFilterStatus: React.Dispatch<React.SetStateAction<string>>;
    filterCategory: string;
    setFilterCategory: React.Dispatch<React.SetStateAction<string>>;
    applyFilters: () => void;
}

export const Filters: React.FC<FiltersProps> = ({
                                                    filterStatus,
                                                    setFilterStatus,
                                                    filterCategory,
                                                    setFilterCategory,
                                                    applyFilters
                                                }) => {
    const { t } = useTranslation();

    return (
        <Box>
            <FormControl size="sm">
                <FormLabel>{t('Status')}</FormLabel>
                <Select
                    size="sm"
                    placeholder={t('Filter by status')}
                    value={filterStatus}
                    onChange={(_event, newValue) => setFilterStatus(newValue ?? '')}
                    slotProps={{ button: { sx: { whiteSpace: 'nowrap' } } }}
                >
                    <Option value="">{t('All')}</Option>
                    <Option value="Paid">{t('Paid')}</Option>
                    <Option value="Pending">{t('Pending')}</Option>
                    <Option value="Refunded">{t('Refunded')}</Option>
                    <Option value="Cancelled">{t('Cancelled')}</Option>
                </Select>
            </FormControl>
            <FormControl size="sm">
                <FormLabel>{t('Category')}</FormLabel>
                <Select
                    size="sm"
                    placeholder={t('All')}
                    value={filterCategory}
                    onChange={(_event, newValue) => setFilterCategory(newValue ?? '')}
                >
                    <Option value="">{t('All')}</Option>
                    <Option value="refund">{t('Refund')}</Option>
                    <Option value="purchase">{t('Purchase')}</Option>
                    <Option value="debit">{t('Debit')}</Option>
                </Select>
            </FormControl>
            <Button onClick={applyFilters} sx={{ mt: 2 }}>
                {t('Apply Filters')}
            </Button>
        </Box>
    );
};
