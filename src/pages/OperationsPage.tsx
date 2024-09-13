import React, {useState, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {
    CssVarsProvider,
    Box,
    Button,
    Input,
    IconButton,
    Modal,
    ModalDialog,
    ModalClose,
    Typography,
    Sheet,
    FormControl,
    FormLabel
} from '@mui/joy';
import {Search as SearchIcon, FilterAlt as FilterAltIcon} from '@mui/icons-material';
import {Header} from "../components/core/ColorSchemeToggle";
import CssBaseline from "@mui/joy/CssBaseline";
import GlobalStyles from "@mui/joy/GlobalStyles";
import {OrderTable} from '../components/operation/OrderTable';
import {Filters} from '../components/operation/Filters';
import {Pagination} from '../components/operation/Pagination';
import {rows as initialRows} from '../utils/OperationsRowType';
import LanguageSwitcher from '../components/core/LanguageSwitcher';
import {Helmet} from "react-helmet-async";

type Order = 'asc' | 'desc';

function descendingComparator<T>(a: T, b: T, orderBy: keyof T): number {
    if (b[orderBy] < a[orderBy]) return -1;
    if (b[orderBy] > a[orderBy]) return 1;
    return 0;
}

function getComparator<Key extends keyof any>(
    order: Order,
    orderBy: Key
): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number): T[] {
    return array
        .map((el, index) => [el, index] as [T, number])
        .sort((a, b) => {
            const order = comparator(a[0], b[0]);
            return order !== 0 ? order : a[1] - b[1];
        })
        .map(([el]) => el);
}

export const OperationsPage: React.FC = () => {
    const {t} = useTranslation();
    const [order, setOrder] = useState<Order>('desc');
    const [selected, setSelected] = useState<readonly string[]>([]);
    const [open, setOpen] = useState(false);

    const [search, setSearch] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [filterCategory, setFilterCategory] = useState<string>('');
    const [filterCustomer, setFilterCustomer] = useState<string>('');

    const [tempSearch, setTempSearch] = useState<string>('');
    const [tempFilterStatus, setTempFilterStatus] = useState<string>('');
    const [tempFilterCategory, setTempFilterCategory] = useState<string>('');
    const [tempFilterCustomer, setTempFilterCustomer] = useState<string>('');

    const [rows, setRows] = useState(initialRows);

    useEffect(() => {
        // Имитация добавления новой операции через 5 секунд
        const timer = setTimeout(() => {
            setRows(prevRows => [
                ...prevRows,
                {
                    id: `INV-${prevRows.length + 1}`,
                    date: 'Mar 3, 2023',
                    status: 'Paid',
                    customer: {
                        initial: 'N',
                        name: 'New Customer',
                        email: 'new.customer@example.com'
                    },
                    category: 'New Category'
                }
            ]);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    const comparator = React.useMemo(() => getComparator(order, 'id'), [order]);

    const filteredRows = React.useMemo(() => {
        return rows.filter((row) => {
            return (
                (search ? row.id.toLowerCase().includes(search.toLowerCase()) ||
                    row.customer.name.toLowerCase().includes(search.toLowerCase()) ||
                    row.customer.email.toLowerCase().includes(search.toLowerCase()) : true) &&
                (filterStatus ? row.status === filterStatus : true) &&
                (filterCategory ? row.category === filterCategory : true) &&
                (filterCustomer ? row.customer.name === filterCustomer : true)
            );
        });
    }, [search, filterStatus, filterCategory, filterCustomer, rows]);

    const sortedRows = React.useMemo(() => stableSort(filteredRows, comparator), [filteredRows, comparator]);

    const applyFilters = () => {
        setSearch(tempSearch);
        setFilterStatus(tempFilterStatus);
        setFilterCategory(tempFilterCategory);
        setFilterCustomer(tempFilterCustomer);
        setOpen(false);
    };

    return (
        <CssVarsProvider>
            <Helmet>
                <title>{t('title.operationsPage')}</title>
            </Helmet>
            <CssBaseline/>
            <GlobalStyles
                styles={{
                    ':root': {
                        '--Form-maxWidth': '800px',
                        '--Transition-duration': '0.4s',
                    },
                }}
            />
            <Header/>
            <Box sx={{padding: 2, maxWidth: '1200px', margin: '0 auto'}}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                    }}
                >
                    <Typography level="h1" component="div">
                        {t('Orders')}
                    </Typography>
                    <Button onClick={() => setOpen(true)}>
                        {t('Filters')}
                    </Button>
                </Box>
                <Sheet
                    className="SearchAndFilters-mobile"
                    sx={{
                        display: {xs: 'flex', sm: 'none'},
                        my: 1,
                        gap: 1,
                    }}
                >
                    <Input
                        size="sm"
                        placeholder={t('Search')}
                        startDecorator={<SearchIcon/>}
                        value={tempSearch}
                        onChange={(e) => setTempSearch(e.target.value)}
                        sx={{flexGrow: 1}}
                    />
                    <IconButton
                        size="sm"
                        variant="outlined"
                        color="neutral"
                        onClick={() => setOpen(true)}
                    >
                        <FilterAltIcon/>
                    </IconButton>
                </Sheet>
                <Box
                    className="SearchAndFilters-tabletUp"
                    sx={{
                        borderRadius: 'sm',
                        py: 2,
                        display: {xs: 'none', sm: 'flex'},
                        flexWrap: 'wrap',
                        gap: 1.5,
                        '& > *': {
                            minWidth: {xs: '120px', md: '160px'},
                        },
                    }}
                >
                    <FormControl sx={{flex: 1}} size="sm">
                        <FormLabel>{t('Search for order')}</FormLabel>
                        <Input
                            size="sm"
                            placeholder={t('Search')}
                            startDecorator={<SearchIcon/>}
                            value={tempSearch}
                            onChange={(e) => setTempSearch(e.target.value)}
                        />
                    </FormControl>
                </Box>
                <OrderTable
                    rows={rows}
                    sortedRows={sortedRows}
                    selected={selected}
                    setSelected={setSelected}
                    order={order}
                    setOrder={setOrder}
                />

                <Box sx={{display: 'flex', justifyContent: 'center', mt: 2}}>
                    <Pagination/>
                </Box>

                <Modal open={open} onClose={() => setOpen(false)}>
                    <ModalDialog color="primary" layout="center" size="md" variant="outlined">
                        <ModalClose/>
                        <Typography>{t('Filter Options')}</Typography>
                        <Filters
                            filterStatus={tempFilterStatus}
                            setFilterStatus={setTempFilterStatus}
                            filterCategory={tempFilterCategory}
                            setFilterCategory={setTempFilterCategory}
                            applyFilters={applyFilters}
                        />
                    </ModalDialog>
                </Modal>
            </Box>
        </CssVarsProvider>
    );
};

export default OperationsPage;
