import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, Link, Stack, Button, Divider } from '@mui/joy';
import { useTranslation } from 'react-i18next';
import EmailIcon from '@mui/icons-material/Email';
import AboutModal from './AboutModal';

const Footer: React.FC = () => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const footerLinks = [
        { title: t('footer.product'), links: [
                { text: t('footer.features'), url: '#features' },
                { text: t('footer.security'), url: '#security' },
                { text: t('footer.download'), url: '#download' }
            ]},
        { title: t('footer.company'), links: [
                { text: t('footer.about'), url: '#', action: handleOpen },
                { text: t('footer.blog'), url: '/blog' },
                { text: t('footer.careers'), url: '/careers' }
            ]},
        { title: t('footer.legal'), links: [
                { text: t('footer.privacy'), url: '/privacy' },
                { text: t('footer.terms'), url: '/terms' },
                { text: t('footer.compliance'), url: '/compliance' }
            ]}
    ];

    const socialLinks = [
        { icon: '/img/social/github.svg', url: 'https://github.com/solachat' },
        { icon: '/img/social/twitter.svg', url: 'https://twitter.com/solachat' }
    ];

    const SocialLinkCard = ({ icon, url }: { icon: string; url: string }) => (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
                href={url}
                target="_blank"
                rel="noopener"
                sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0, 168, 255, 0.1)',
                    border: '2px solid rgba(0, 168, 255, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        background: 'rgba(0, 168, 255, 0.2)',
                        borderColor: '#00a8ff'
                    },
                    '@media (max-width: 600px)': {
                        width: 48,
                        height: 48
                    }
                }}
            >
                <img
                    src={icon}
                    alt=""
                    style={{
                        width: 28,
                        height: 28,
                        filter: 'brightness(2)'
                    }}
                />
            </Link>
        </motion.div>
    );

    return (
        <Box
            component="footer"
            sx={{
                background: 'linear-gradient(180deg, #0a192f 0%, #061021 100%)',
                color: 'white',
                py: 5,
                px: { xs: 2, md: 6 },
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `
                        radial-gradient(circle at 10% 20%, rgba(0, 168, 255, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 90% 80%, rgba(0, 168, 255, 0.1) 0%, transparent 50%)
                    `,
                    zIndex: 0
                }}
            />

            <Box
                sx={{
                    maxWidth: 1400,
                    mx: 'auto',
                    position: 'relative',
                    zIndex: 1
                }}
            >
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={6}
                    divider={
                        <Divider
                            orientation="vertical"
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.1)',
                                height: 'auto',
                                display: { xs: 'none', md: 'block' }
                            }}
                        />
                    }
                >
                    <Box sx={{ flex: 1 }}>
                        <Stack spacing={3}>
                            <motion.div whileHover={{ scale: 1.05 }}>
                                <img
                                    src="favicon.ico"
                                    alt="DarkChat"
                                    style={{ width: 60, height: 60 }}
                                />
                            </motion.div>
                            <Typography
                                fontSize={20}
                                sx={{
                                    lineHeight: 1.4,
                                    background: 'linear-gradient(45deg, #00a8ff 30%, #007bff 90%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}
                            >
                                {t('footer.slogan')}
                            </Typography>
                            <Button
                                variant="outlined"
                                sx={{
                                    width: 'fit-content',
                                    borderColor: '#00a8ff',
                                    color: '#00a8ff',
                                    '&:hover': {
                                        bgcolor: 'rgba(0, 168, 255, 0.1)'
                                    }
                                }}
                                onClick={handleOpen}
                            >
                                {t('footer.learnMore')}
                            </Button>
                        </Stack>
                    </Box>

                    {footerLinks.map((section, index) => (
                        <Box key={index} sx={{ flex: 1 }}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                whileHover={{
                                    scale: 1.05,
                                    textShadow: '0 0 15px rgba(0,168,255,0.5)',
                                    transition: { duration: 0.2 }
                                }}
                                viewport={{ once: true, margin: "-30px" }}
                            >
                                <Typography
                                    component={motion.div}
                                    whileHover={{ color: '#00d8ff' }}
                                    fontWeight="bold"
                                    mb={3}
                                    sx={{
                                        fontSize: 18,
                                        color: '#00a8ff',

                                        transition: 'color 0.3s ease',
                                    }}
                                >
                                    {section.title}
                                </Typography>
                            </motion.div>
                            <Stack spacing={2}>
                                {section.links.map((link, idx) => (
                                    <motion.div
                                        key={idx}
                                        whileHover={{ x: 5 }}
                                    >
                                        <Link
                                            href={link.url}
                                            onClick={link.action}
                                            sx={{
                                                color: 'inherit',
                                                textDecoration: 'none',
                                                opacity: 0.8,
                                                '&:hover': {
                                                    opacity: 1,
                                                    textDecoration: 'underline',
                                                    textUnderlineOffset: '4px'
                                                }
                                            }}
                                        >
                                            {link.text}
                                        </Link>
                                    </motion.div>
                                ))}
                            </Stack>
                        </Box>
                    ))}

                    <Box sx={{ flex: 1 }}>
                        <Typography
                            fontWeight="bold"
                            mb={3}
                            sx={{
                                fontSize: 18,
                                color: '#00a8ff'
                            }}
                        >
                            {t('footer.community')}
                        </Typography>

                        {/* Email Block */}
                        <motion.div whileHover={{ scale: 1.02 }}>
                            <Link
                                href="mailto:support@solachat.org"
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    mb: 4,
                                    p: 1.5,
                                    borderRadius: '8px',
                                    background: 'rgba(0, 168, 255, 0.1)',
                                    border: '1px solid rgba(0, 168, 255, 0.3)',
                                    transition: 'all 0.3s ease',
                                    textDecoration: 'none',
                                    color: 'white',
                                    '&:hover': {
                                        background: 'rgba(0, 168, 255, 0.2)',
                                        borderColor: '#00a8ff'
                                    }
                                }}
                            >
                                <EmailIcon sx={{
                                    color: '#00a8ff',
                                    fontSize: 32,
                                    flexShrink: 0
                                }} />
                                <Typography sx={{
                                    fontSize: '0.95rem',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    support@solachat.org
                                </Typography>
                            </Link>
                        </motion.div>

                        {/* Social Links */}
                        <Stack
                            direction="row"
                            spacing={2}
                            flexWrap="wrap"
                            gap={2}
                            sx={{ mt: 2 }}
                        >
                            {socialLinks.map((social, idx) => (
                                <SocialLinkCard key={idx} icon={social.icon} url={social.url} />
                            ))}
                        </Stack>
                    </Box>
                </Stack>

                <Typography
                    textAlign="center"
                    mt={6}
                    sx={{
                        opacity: 0.7,
                        fontSize: 14
                    }}
                >
                    © {new Date().getFullYear()} DarkChat. {t('footer.rightsReserved')}
                    <br />
                    {t('footer.madeWith')} ❤️ {t('footer.team')}
                </Typography>
            </Box>

            <AboutModal open={open} onClose={handleClose} />
        </Box>
    );
};

export default Footer;
