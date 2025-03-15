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
import WorkIcon from '@mui/icons-material/Work';
import Footer from "../components/home/Footer";
import Navbar from "../components/home/Navbar";
import { vacanciesData } from '../utils/vacancies';
import framesxTheme from "../theme/theme";
import {CssVarsProvider} from "@mui/joy/styles";
import {Code} from "@mui/icons-material";
import { AnimatePresence } from "framer-motion";

const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function VacanciesPage() {
    const { t } = useTranslation();
    const [openModal, setOpenModal] = useState(false);
    const [selectedVacancy, setSelectedVacancy] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const handleApply = (vacancyId?: string) => {
        if (vacancyId) setSelectedVacancy(vacancyId);
        setOpenModal(true);
    };

    return (
        <>
            <CssVarsProvider disableTransitionOnChange theme={framesxTheme}>
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

                    <List sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
                        {vacanciesData.map((vacancy) => (
                            <motion.div
                                key={vacancy.id}
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
                                                                rotate: expandedId === vacancy.id ? 180 : 0
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
                                                    onClick={() => setExpandedId(expandedId === vacancy.id ? null : vacancy.id)}
                                                >
                                                    <motion.span

                                                        style={{
                                                            display: 'inline-block',
                                                        }}
                                                    >
                                                        {expandedId === vacancy.id ? t('vacancies.hide_details') : t('vacancies.read_more')}
                                                    </motion.span>
                                                </Button>
                                            </motion.div>



                                            <AnimatePresence>
                                                {expandedId === vacancy.id && (
                                                    <motion.div
                                                        key={vacancy.id}
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
                            onClick={() => handleApply()}
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
                                            value={selectedVacancy}
                                            onChange={(_, value) => setSelectedVacancy(value)}
                                            sx={{ bgcolor: 'rgba(0, 168, 255, 0.05)' }}
                                        >
                                            {vacanciesData.map((vacancy) => (
                                                <Option key={vacancy.id} value={vacancy.id}>
                                                    {vacancy.title}
                                                </Option>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <FormControl sx={{ mb: 2 }}>
                                        <FormLabel sx={{ color: '#00a8ff' }}>{t('vacancies.full_name')}</FormLabel>
                                        <Input sx={{ bgcolor: 'rgba(0, 168, 255, 0.05)' }} />
                                    </FormControl>

                                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                        <FormControl sx={{ flex: 1 }}>
                                            <FormLabel sx={{ color: '#00a8ff' }}>{t('vacancies.contact_type')}</FormLabel>
                                            <Select defaultValue="telegram" sx={{ bgcolor: 'rgba(0, 168, 255, 0.05)' }}>
                                                <Option value="telegram">Telegram</Option>
                                                <Option value="discord">Discord</Option>
                                                <Option value="email">Email</Option>
                                            </Select>
                                        </FormControl>
                                        <FormControl sx={{ flex: 1 }}>
                                            <FormLabel sx={{ color: '#00a8ff' }}>{t('vacancies.contact_value')}</FormLabel>
                                            <Input sx={{ bgcolor: 'rgba(0, 168, 255, 0.05)' }} />
                                        </FormControl>
                                    </Box>

                                    <FormControl sx={{ mb: 2 }}>
                                        <FormLabel sx={{ color: '#00a8ff' }}>{t('vacancies.expected_salary')}</FormLabel>
                                        <Input sx={{ bgcolor: 'rgba(0, 168, 255, 0.05)' }} />
                                    </FormControl>

                                    <FormControl sx={{ mb: 2 }}>
                                        <FormLabel sx={{ color: '#00a8ff' }}>{t('vacancies.available_from')}</FormLabel>
                                        <Input type="date" sx={{ bgcolor: 'rgba(0, 168, 255, 0.05)' }} />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel sx={{ color: '#00a8ff' }}>{t('vacancies.about_you')}</FormLabel>
                                        <Textarea minRows={3} sx={{ bgcolor: 'rgba(0, 168, 255, 0.05)' }} />
                                    </FormControl>

                                    <Button
                                        fullWidth
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
