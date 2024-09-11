import React from 'react';
import {useTranslation} from 'react-i18next';
import {Table, Sheet, Checkbox, Typography, Chip, Box, Link, Avatar} from '@mui/joy';
import {
    ArrowDropDown,
    CheckRounded,
    AutorenewRounded,
    Block,
} from '@mui/icons-material';
import {RowMenu} from './RowMenu';
import {Row} from '../../utils/OperationsRowType';
import {ColorPaletteProp} from '@mui/joy/styles';

interface OrderTableProps {
    rows: Row[];
    sortedRows: Row[];
    selected: readonly string[];
    setSelected: React.Dispatch<React.SetStateAction<readonly string[]>>;
    order: 'asc' | 'desc';
    setOrder: React.Dispatch<React.SetStateAction<'asc' | 'desc'>>;
}

export const OrderTable: React.FC<OrderTableProps> = ({
                                                          rows,
                                                          sortedRows,
                                                          selected,
                                                          setSelected,
                                                          order,
                                                          setOrder,
                                                      }) => {
    const {t} = useTranslation();

    return (
        <Sheet
            className="OrderTableContainer"
            variant="outlined"
            sx={{
                display: {xs: 'none', sm: 'initial'},
                width: '100%',
                borderRadius: 'sm',
                flexShrink: 1,
                overflow: 'auto',
                minHeight: 0,
            }}
        >
            <Table
                aria-labelledby="tableTitle"
                stickyHeader
                hoverRow
                sx={{
                    '--TableCell-headBackground': 'var(--joy-palette-background-level1)',
                    '--Table-headerUnderlineThickness': '1px',
                    '--TableRow-hoverBackground': 'var(--joy-palette-background-level1)',
                    '--TableCell-paddingY': '4px',
                    '--TableCell-paddingX': '8px',
                }}
            >
                <thead>
                <tr>
                    <th style={{width: 48, textAlign: 'center', padding: '12px 6px'}}>
                        <Checkbox
                            size="sm"
                            indeterminate={
                                selected.length > 0 && selected.length !== rows.length
                            }
                            checked={selected.length === rows.length}
                            onChange={(event) => {
                                setSelected(
                                    event.target.checked ? rows.map((row) => row.id) : [],
                                );
                            }}
                            color={
                                selected.length > 0 || selected.length === rows.length
                                    ? 'primary'
                                    : undefined
                            }
                            sx={{verticalAlign: 'text-bottom'}}
                        />
                    </th>
                    <th style={{width: 120, padding: '12px 6px'}}>
                        <Link
                            underline="none"
                            color="primary"
                            component="button"
                            onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
                            fontWeight="lg"
                            endDecorator={<ArrowDropDown/>}
                            sx={{
                                '& svg': {
                                    transition: '0.2s',
                                    transform:
                                        order === 'desc' ? 'rotate(0deg)' : 'rotate(180deg)',
                                },
                            }}
                        >
                            {t('Invoice')}
                        </Link>
                    </th>
                    <th style={{width: 140, padding: '12px 6px'}}>{t('Date')}</th>
                    <th style={{width: 140, padding: '12px 6px'}}>{t('Status')}</th>
                    <th style={{width: 240, padding: '12px 6px'}}>{t('Customer')}</th>
                    <th style={{width: 140, padding: '12px 6px'}}></th>
                </tr>
                </thead>
                <tbody>
                {sortedRows.map((row) => (
                    <tr key={row.id}>
                        <td style={{textAlign: 'center', width: 120}}>
                            <Checkbox
                                size="sm"
                                checked={selected.includes(row.id)}
                                color={selected.includes(row.id) ? 'primary' : undefined}
                                onChange={(event) => {
                                    setSelected((ids) =>
                                        event.target.checked
                                            ? ids.concat(row.id)
                                            : ids.filter((itemId) => itemId !== row.id),
                                    );
                                }}
                                slotProps={{checkbox: {sx: {textAlign: 'left'}}}}
                                sx={{verticalAlign: 'text-bottom'}}
                            />
                        </td>
                        <td>
                            <Typography level="body-xs">{row.id}</Typography>
                        </td>
                        <td>
                            <Typography level="body-xs">{row.date}</Typography>
                        </td>
                        <td>
                            <Chip
                                variant="soft"
                                size="sm"
                                startDecorator={
                                    {
                                        Paid: <CheckRounded/>,
                                        Refunded: <AutorenewRounded/>,
                                        Cancelled: <Block/>,
                                    }[row.status] || null
                                }
                                color={
                                    {
                                        Paid: 'success',
                                        Refunded: 'neutral',
                                        Cancelled: 'danger',
                                    }[row.status] as ColorPaletteProp
                                }
                            >
                                {t(row.status)}
                            </Chip>
                        </td>
                        <td>
                            <Box sx={{display: 'flex', gap: 2, alignItems: 'center'}}>
                                <Avatar size="sm">{row.customer.initial}</Avatar>
                                <div>
                                    <Typography level="body-xs">{row.customer.name}</Typography>
                                    <Typography level="body-xs">{row.customer.email}</Typography>
                                </div>
                            </Box>
                        </td>
                        <td>
                            <Box sx={{display: 'flex', gap: 2, alignItems: 'center'}}>
                                <Link level="body-xs" component="button">
                                    {t('Download')}
                                </Link>
                                <RowMenu/>
                            </Box>
                        </td>
                    </tr>
                ))}
                </tbody>
            </Table>
        </Sheet>
    );
};
