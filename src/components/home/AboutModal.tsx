import React, {useEffect} from 'react';
import { Modal, ModalDialog, ModalClose, Typography, Box } from '@mui/joy';
import { useTranslation } from 'react-i18next';

interface AboutModalProps {
    open: boolean;
    onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ open, onClose }) => {
    const { t } = useTranslation();

    useEffect(() => {
        let scrollPosition = 0;

        if (open) {
            // Сохраняем текущую позицию прокрутки
            scrollPosition = window.pageYOffset;

            // Блокируем прокрутку и фиксируем позицию
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollPosition}px`;
            document.body.style.width = '100%'; // Чтобы избежать сдвига из-за исчезновения скроллбара
        } else {
            // Восстанавливаем прокрутку
            document.body.style.position = '';
            document.body.style.top = '';
            window.scrollTo(0, scrollPosition); // Возвращаем пользователя к его позиции
        }

        // Очистка при размонтировании
        return () => {
            document.body.style.position = '';
            document.body.style.top = '';
            window.scrollTo(0, scrollPosition);
        };
    }, [open]);

    return (
        <Modal
            open={open}
            onClose={onClose}
            sx={{
                opacity: open ? 1 : 0,
                transition: 'opacity 0.5s ease',
            }}
        >
            <ModalDialog sx={{ maxWidth: '600px' }}>
                <ModalClose onClick={onClose} />
                <Typography level="h4" fontWeight="bold" sx={{ mb: 2 }}>
                    {t('aboutSolacoinTitle')}
                </Typography>
                <Box sx={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '1rem' }}>
                    <Typography>
                        <strong>{t('welcome')}</strong> {t('description')}
                    </Typography>
                    <Typography mt={2}>
                        <strong>{t('mission')}</strong>
                    </Typography>
                    <Typography>
                        {t('missionDescription')}
                    </Typography>
                    <Typography mt={2}>
                        <strong>{t('projects')}</strong>
                    </Typography>
                    <Typography>
                        {t('projectsDescription')}
                    </Typography>
                    <Typography mt={2}>
                        1. <strong>{t('project1Title')}</strong><br />
                        {t('project1Description')}<br />
                        <strong>{t('technology')}</strong> Rust, Solana
                    </Typography>
                    <Typography mt={2}>
                        2. <strong>{t('project2Title')}</strong><br />
                        {t('project2Description')}<br />
                        <strong>{t('technology')}</strong> React.js, Solana Web3.js
                    </Typography>
                    <Typography mt={2}>
                        3. <strong>{t('project3Title')}</strong><br />
                        {t('project3Description')}<br />
                        <strong>{t('technology')}</strong> Node.js, Solana RPC API
                    </Typography>
                    <Typography mt={2}>
                        <strong>{t('contributing')}</strong>
                    </Typography>
                    <Typography>
                        {t('contributingDescription')}
                    </Typography>
                    <Typography component="ul" sx={{ pl: 2 }}>
                        <li>{t('step1')}</li>
                        <li>{t('step2')}</li>
                        <li>{t('step3')}</li>
                        <li>{t('step4')}</li>
                        <li>{t('step5')}</li>
                    </Typography>
                    <Typography mt={2}>
                        <strong>{t('contact')}</strong>
                    </Typography>
                    <Typography>
                        {t('contactDescription')}
                    </Typography>
                    <Typography>
                        {t('email')}: <a href="mailto:contact@solacoin.org">contact@solacoin.org</a>
                    </Typography>
                    <Typography mt={2}>
                        <strong>{t('license')}</strong>
                    </Typography>
                    <Typography>
                        {t('licenseDescription')}
                    </Typography>
                    <Typography mt={2}>
                        {t('finalNote')}
                    </Typography>
                </Box>
            </ModalDialog>
        </Modal>
    );
};

export default AboutModal;
