import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Typography,
    Button,
    Sheet,
    Chip,
    Modal,
    ModalClose,
    ModalDialog,
    FormControl,
    FormLabel,
    Input,
    Select,
    Option,
    Textarea,
    List,
    Avatar
} from '@mui/joy';
import { motion } from 'framer-motion';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Footer from "../components/home/Footer";
import Navbar from "../components/home/Navbar";

import framesxTheme from "../theme/theme";
import {CssVarsProvider} from "@mui/joy/styles";
import {Code} from "@mui/icons-material";
import { AnimatePresence } from "framer-motion";
import {Helmet} from "react-helmet-async";
import {applyForVacancy, fetchVacancies} from "../api/api";
import {Vacancy} from "../components/core/types";

const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function VacanciesPage() {
    const { t } = useTranslation();
    const [openModal, setOpenModal] = useState(false);
    const [selectedVacancy, setSelectedVacancy] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [vacancies, setVacancies] = useState<Vacancy[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        fullName: '',
        contactType: 'telegram',
        contactValue: '',
        expectedSalary: '',
        availableFrom: '',
        aboutYou: '',
        vacancyId: ''
    });


    React.useEffect(() => {
        const loadVacancies = async () => {
            setLoading(true);
            const data = await fetchVacancies();
            setVacancies(data);
            setLoading(false);
        };
        loadVacancies();
    }, []);


    const handleApply = async () => {
        if (!selectedVacancy) return alert("Select a vacancy!");
        try {
            await applyForVacancy({ ...formData, vacancyId: selectedVacancy });
            alert("Заявка отправлена успешно!");
            setOpenModal(false);
            setFormData({
                fullName: "",
                contactType: "telegram",
                contactValue: "",
                expectedSalary: "",
                availableFrom: "",
                aboutYou: "",
                vacancyId: "",
            });

            const updatedVacancies = await fetchVacancies();
            setVacancies(updatedVacancies);
        } catch (error: any) {
            alert("Error sending request: " + (error.message || error));
        }
    };

    const SkeletonLoader = () => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[...Array(3)].map((_, i) => (
                <motion.div key={i} variants={fadeIn}>
                    <Sheet sx={{
                        p: 3,
                        borderRadius: 'lg',
                        background: 'rgba(255,255,255,0.05)',
                        height: 150,
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    }}/>
                </motion.div>
            ))}
        </Box>
    );

    return (
        <>
            <CssVarsProvider disableTransitionOnChange theme={framesxTheme}>
                <Helmet>
                    <title>SolaChat {t('navbar.vacancies')}</title>
                </Helmet>
            <Navbar />
            <Box sx={{
                minHeight: '100vh',
                py: 8,
                px: 2,
                background: 'radial-gradient(circle at center, #0a192f 0%, #081428 100%)'
            }}>
                <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
                    <Typography
                        component={motion.div}
                        initial="hidden"
                        animate="visible"
                        variants={fadeIn}
                        level="h1"
                        sx={{
                            textAlign: 'center',
                            mb: 6,
                            background: 'linear-gradient(45deg, #00a8ff 30%, #007bff 90%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontSize: 'clamp(2rem, 5vw, 3rem)',
                            fontWeight: 700
                        }}
                    >
                        {t('vacancies.title')}
                    </Typography>

                    {loading ? (
                        <SkeletonLoader />
                    ) : (
                    <List sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
                        {vacancies.map((vacancy) =>  (
                            <motion.div
                                key={vacancy._id}
                                initial="hidden"
                                animate="visible"
                                variants={fadeIn}
                            >
                                <Sheet
                                    sx={{
                                        p: 3,
                                        borderRadius: 'lg',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        backdropFilter: 'blur(20px)',
                                        border: '1px solid rgba(0, 168, 255, 0.3)',
                                        boxShadow: '0 8px 32px rgba(0, 168, 255, 0.2)',
                                        transition: 'transform 0.3s ease',
                                        '&:hover': { transform: 'translateY(-3px)' }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', gap: 3, alignItems: 'start' }}>
                                        <Avatar
                                            variant="soft"
                                            color="primary"
                                            sx={{
                                                width: 56,
                                                height: 56,
                                                bgcolor: 'rgba(0, 168, 255, 0.1)'
                                            }}
                                        >
                                            <Code sx={{width: 30, height: 30}} />
                                        </Avatar>

                                        <Box sx={{flex: 1}}>
                                            <Typography
                                                level="h4"
                                                sx={{color: '#00a8ff', mb: 1, fontWeight: 700}}
                                            >
                                                {vacancy.title}
                                            </Typography>

                                            <motion.div whileTap={{scale: 0.95}}>
                                                <Button
                                                    variant="plain"
                                                    endDecorator={
                                                        <motion.div
                                                            animate={{
                                                                rotate: expandedId === vacancy._id ? 180 : 0
                                                            }}
                                                            transition={{duration: 0.3}}
                                                        >
                                                            <ExpandMoreIcon/>
                                                        </motion.div>
                                                    }
                                                    sx={{
                                                        color: 'rgba(255,255,255,0.8)',
                                                        p: 0,
                                                        minWidth: 'auto',
                                                        display: 'inline-flex',
                                                        '&:hover': {bgcolor: 'transparent'}
                                                    }}
                                                    onClick={() => setExpandedId(expandedId === vacancy._id ? null : vacancy._id)}
                                                >
                                                    <motion.span

                                                        style={{
                                                            display: 'inline-block',
                                                        }}
                                                    >
                                                        {expandedId === vacancy._id ? t('vacancies.hide_details') : t('vacancies.read_more')}
                                                    </motion.span>
                                                </Button>
                                            </motion.div>



                                            <AnimatePresence>
                                                {expandedId === vacancy._id && (
                                                    <motion.div
                                                        key={vacancy._id}
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.4, ease: "easeInOut" }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                mt: 2,
                                                                display: 'grid',
                                                                gridTemplateColumns: { md: '1fr 1fr' },
                                                                gap: 4
                                                            }}
                                                        >
                                                            <Box>
                                                                <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
                                                                    {vacancy.description}
                                                                </Typography>

                                                                <Typography sx={{ color: '#00a8ff', mb: 1 }}>
                                                                    {t('vacancies.technologies')}
                                                                </Typography>
                                                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                                    {vacancy.technologies.map((tech, index) => (
                                                                        <Chip key={index} variant="soft" color="primary">
                                                                            {tech}
                                                                        </Chip>
                                                                    ))}
                                                                </Box>
                                                            </Box>

                                                            <Box>
                                                                <Typography sx={{ color: '#00a8ff', mb: 1 }}>
                                                                    {t('vacancies.requirements')}
                                                                </Typography>
                                                                <ul
                                                                    style={{
                                                                        color: 'rgba(255,255,255,0.8)',
                                                                        paddingLeft: 20,
                                                                        margin: 0
                                                                    }}
                                                                >
                                                                    {vacancy.requirements.map((req, index) => (
                                                                        <li key={index}>{req}</li>
                                                                    ))}
                                                                </ul>
                                                            </Box>
                                                        </Box>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </Box>
                                    </Box>
                                </Sheet>
                            </motion.div>
                        ))}
                    </List>
                    )}

                    <Box sx={{textAlign: 'center', mt: 6}}>
                        <Button
                            size="lg"
                            endDecorator={<NavigateNextIcon/>}
                            sx={{
                                bgcolor: 'rgba(0, 168, 255, 0.3)',
                                color: '#00a8ff',
                                px: 6,
                                '&:hover': {bgcolor: 'rgba(0, 168, 255, 0.4)'}
                            }}
                            onClick={() => setOpenModal(true)}
                        >
                            {t('vacancies.apply_all')}
                        </Button>
                    </Box>
                </Box>
            </Box>


                <AnimatePresence>
                    {openModal && (
                        <Modal open={openModal} onClose={() => setOpenModal(false)}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    height: "100vh"
                                }}
                            >
                                <ModalDialog
                                    sx={{
                                        width: 600,
                                        maxWidth: '100%',
                                        background: 'rgba(0, 22, 45, 0.95)',
                                        border: '1px solid rgba(0, 168, 255, 0.3)',
                                        boxShadow: '0 10px 30px rgba(0, 168, 255, 0.2)',
                                        borderRadius: '12px',
                                        p: 3
                                    }}
                                >
                                    <ModalClose sx={{ color: '#00a8ff' }} />
                                    <Typography level="h3" sx={{ color: '#00a8ff', mb: 3 }}>
                                        {t('vacancies.apply_title')}
                                    </Typography>

                                    <FormControl sx={{ mb: 2 }}>
                                        <FormLabel sx={{ color: '#00a8ff' }}>{t('vacancies.select_vacancy')}</FormLabel>
                                        <Select
                                            value={selectedVacancy ?? ""}
                                            onChange={(_, value) => setSelectedVacancy(value ?? "")}
                                            defaultValue=""
                                            slotProps={{
                                                listbox: {
                                                    sx: {
                                                        bgcolor: 'rgba(0, 22, 45, 0.95)',
                                                        border: '1px solid rgba(0, 168, 255, 0.3)',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 10px 30px rgba(0, 168, 255, 0.2)'
                                                    }
                                                }
                                            }}
                                            sx={{
                                                bgcolor: 'rgba(0, 168, 255, 0.1)',
                                                color: '#00a8ff',
                                                '&:hover': { bgcolor: 'rgba(0, 168, 255, 0.15)' }
                                            }}
                                        >
                                            {vacancies.map((vacancy) => (
                                                <Option
                                                    key={vacancy._id}
                                                    value={vacancy._id}
                                                    sx={{
                                                        bgcolor: 'transparent',
                                                        color: '#00a8ff',
                                                        '&[aria-selected="true"]': {
                                                            bgcolor: 'rgba(0, 168, 255, 0.2) !important',
                                                            color: 'white'
                                                        },
                                                        '&:hover': {
                                                            bgcolor: 'rgba(0, 168, 255, 0.3)',
                                                            color: 'white'
                                                        }
                                                    }}
                                                >
                                                    {vacancy.title}
                                                </Option>
                                            ))}
                                        </Select>
                                    </FormControl>


                                    <FormControl sx={{ mb: 2 }}>
                                        <FormLabel sx={{ color: '#00a8ff' }}>{t('vacancies.full_name')}</FormLabel>
                                        <Input
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            sx={{ bgcolor: 'rgba(0, 168, 255, 0.1)', color: '#00a8ff' }}
                                        />
                                    </FormControl>

                                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                        <FormControl sx={{ flex: 1 }}>
                                            <FormLabel sx={{ color: '#00a8ff' }}>{t('vacancies.contact_type')}</FormLabel>
                                            <Select
                                                value={formData.contactType}
                                                onChange={(event, value) => {
                                                    if (value) {
                                                        setFormData((prev) => ({ ...prev, contactType: value }));
                                                    }
                                                }}
                                                defaultValue="telegram"
                                                slotProps={{
                                                    listbox: {
                                                        sx: {
                                                            bgcolor: 'rgba(0, 22, 45, 0.95)',
                                                            border: '1px solid rgba(0, 168, 255, 0.3)',
                                                            borderRadius: '8px',
                                                            boxShadow: '0 10px 30px rgba(0, 168, 255, 0.2)'
                                                        }
                                                    }
                                                }}
                                                sx={{
                                                    bgcolor: 'rgba(0, 168, 255, 0.1)',
                                                    color: '#00a8ff',
                                                    '&:hover': { bgcolor: 'rgba(0, 168, 255, 0.15)' }
                                                }}
                                            >
                                                <Option
                                                    value="telegram"
                                                    sx={{
                                                        bgcolor: 'transparent',
                                                        color: '#00a8ff',
                                                        '&[aria-selected="true"]': {
                                                            bgcolor: 'rgba(0, 168, 255, 0.2) !important',
                                                            color: 'white'
                                                        },
                                                        '&:hover': {
                                                            bgcolor: 'rgba(0, 168, 255, 0.3)',
                                                            color: 'white'
                                                        }
                                                    }}
                                                >
                                                    Telegram
                                                </Option>
                                                <Option
                                                    value="discord"
                                                    sx={{
                                                        bgcolor: 'transparent',
                                                        color: '#00a8ff',
                                                        '&[aria-selected="true"]': {
                                                            bgcolor: 'rgba(0, 168, 255, 0.2) !important',
                                                            color: 'white'
                                                        },
                                                        '&:hover': {
                                                            bgcolor: 'rgba(0, 168, 255, 0.3)',
                                                            color: 'white'
                                                        }
                                                    }}
                                                >
                                                    Discord
                                                </Option>
                                                <Option
                                                    value="email"
                                                    sx={{
                                                        bgcolor: 'transparent',
                                                        color: '#00a8ff',
                                                        '&[aria-selected="true"]': {
                                                            bgcolor: 'rgba(0, 168, 255, 0.2) !important',
                                                            color: 'white'
                                                        },
                                                        '&:hover': {
                                                            bgcolor: 'rgba(0, 168, 255, 0.3)',
                                                            color: 'white'
                                                        }
                                                    }}
                                                >
                                                    Email
                                                </Option>
                                            </Select>
                                        </FormControl>
                                        <FormControl sx={{ flex: 1 }}>
                                            <FormLabel sx={{ color: '#00a8ff' }}>{t('vacancies.contact_value')}</FormLabel>
                                            <Input onChange={(e) => setFormData({ ...formData, contactValue: e.target.value })}
                                                   sx={{ bgcolor: 'rgba(0, 168, 255, 0.1)', color: '#00a8ff' }} />
                                        </FormControl>
                                    </Box>

                                    <FormControl sx={{ mb: 2 }}>
                                        <FormLabel sx={{ color: '#00a8ff' }}>{t('vacancies.expected_salary')}</FormLabel>
                                        <Input
                                            type="text"
                                            onKeyDown={(e) => {
                                                if (!/[\d]/.test(e.key) && e.key !== 'Backspace') {
                                                    e.preventDefault();
                                                }
                                            }}
                                            onChange={(e) => setFormData({ ...formData, expectedSalary: e.target.value })}
                                            sx={{ bgcolor: 'rgba(0, 168, 255, 0.1)', color: '#00a8ff' }}
                                        />
                                    </FormControl>


                                    <FormControl sx={{ mb: 2 }}>
                                        <FormLabel sx={{ color: '#00a8ff' }}>{t('vacancies.available_from')}</FormLabel>
                                        <Input onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })} type="date" sx={{ bgcolor: 'rgba(0, 168, 255, 0.1)', color: '#00a8ff' }} />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel sx={{ color: '#00a8ff' }}>{t('vacancies.about_you')}</FormLabel>
                                        <Textarea minRows={3} sx={{ bgcolor: 'rgba(0, 168, 255, 0.1)', color: '#00a8ff' }} onChange={(e) => setFormData({ ...formData, aboutYou: e.target.value })} />
                                    </FormControl>

                                    <Button
                                        fullWidth
                                        onClick={handleApply}
                                        sx={{
                                            mt: 3,
                                            bgcolor: 'rgba(0, 168, 255, 0.3)',
                                            color: '#00a8ff',
                                            '&:hover': { bgcolor: 'rgba(0, 168, 255, 0.4)' }
                                        }}
                                    >
                                        {t('vacancies.submit_application')}
                                    </Button>
                                </ModalDialog>
                            </motion.div>
                        </Modal>
                    )}
                </AnimatePresence>

                <Footer />
            </CssVarsProvider>
        </>
    );
}
