import React, { useState, useMemo } from "react";
import {
    Box,
    Typography,
    Avatar,
    IconButton,
    Sheet,
    Stack,
    Button,
} from "@mui/joy";
import CloseIcon from "@mui/icons-material/Close";
import KeyIcon from "@mui/icons-material/VpnKey";
import { AnimatePresence } from "framer-motion";
import ImageViewer from "./ImageViewer";
import DownloadIcon from "@mui/icons-material/Download";
import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded";
import { TFunction } from "i18next";
import {useTranslation} from "react-i18next";

interface ChatInfoPanelProps {
    profile: {
        avatar: string;
        username?: string;
        publicKey: string;
        bio?: string;
    };
    messages: any[];
    onClose: () => void;
}

const ChatInfoPanel: React.FC<ChatInfoPanelProps> = ({ profile, messages, onClose }) => {
    const [selectedTab, setSelectedTab] = useState("media");
    const [viewerOpen, setViewerOpen] = useState(false);
    const [initialIndex, setInitialIndex] = useState<number>(0);
    const { t, i18n } = useTranslation();

    const imageList = useMemo(() =>
            messages
                .filter(msg => Array.isArray(msg.attachment))
                .flatMap(msg =>
                    msg.attachment
                        .filter((f: { fileType: string }) => f.fileType.startsWith("image"))
                        .map((f: { filePath: string }) => f.filePath)
                ),
        [messages]
    );

    const handleThumbnailClick = (src: string) => {
        const index = imageList.findIndex(i => i === src);
        if (index !== -1) {
            setInitialIndex(index);
            setViewerOpen(true);
        }
    };

    const formatLocalizedDate = (rawDate: string | Date, t: TFunction): string => {
        const date = new Date(rawDate);
        const now = new Date();

        const isToday = date.toDateString() === now.toDateString();
        const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === date.toDateString();

        const locale = i18n.language === "ru" ? "ru-RU" : "en-US";

        const time = date.toLocaleTimeString(locale, {
            hour: "2-digit",
            minute: "2-digit",
        });

        if (isToday) return t("atTime", { date: t("today"), time });
        if (isYesterday) return t("atTime", { date: t("yesterday"), time });

        const formattedDate = date.toLocaleDateString(locale, {
            day: "numeric",
            month: "short",
        });

        return t("atTime", { date: formattedDate, time });
    };

    const formattedDateTooltip = new Date().toLocaleString(i18n.language, {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });

    React.useEffect(() => {
        if (viewerOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [viewerOpen]);

    return (
        <Box
            sx={{
                height: "100dvh",
                display: "flex",
                flexDirection: "column",
                background: "linear-gradient(180deg, #00162d 0%, #000d1a 100%)",
                borderLeft: "1px solid rgba(0, 168, 255, 0.3)",
                overflowY: "auto",
                '&::-webkit-scrollbar': { display: 'none' },
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    p: 2,
                    borderBottom: "1px solid rgba(0,168,255,0.3)",
                    background: "rgba(0,22,45,0.9)",
                    backdropFilter: "blur(12px)",
                }}
            >
                <IconButton onClick={onClose} sx={{ color: '#00a8ff', mr: 2 }}>
                    <CloseIcon sx={{ fontSize: 24, color: '#a0d4ff' }} />
                </IconButton>
                <Typography level="h4" sx={{ color: "#a0d4ff", flexGrow: 1 }}>
                    User Info
                </Typography>
            </Box>

            <Box sx={{ position: "relative", borderBottom: "1px solid rgba(0,168,255,0.3)", flex: "0 0 30%" }}>
                <Avatar
                    src={profile.avatar}
                    sx={{ width: "100%", height: "100%", borderRadius: 0, objectFit: "cover" }}
                />
                <Box
                    sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: "linear-gradient(transparent 0%, rgba(0,22,45,0.9) 100%)",
                        p: 2,
                    }}
                >
                    <Typography sx={{ color: "#00a8ff", fontSize: "1.3rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {profile.username || profile.publicKey}
                    </Typography>
                    {profile.bio && (
                        <Typography
                            sx={{
                                color: "#a0d4ff",
                                fontSize: "0.9rem",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                            }}
                        >
                            {profile.bio}
                        </Typography>
                    )}
                </Box>
            </Box>

            <Box sx={{ p: 3 }}>
                <Sheet
                    sx={{
                        borderRadius: "12px",
                        background: "rgba(0,22,45,0.6)",
                        border: "1px solid rgba(0,168,255,0.3)",
                        p: 3,
                    }}
                >
                    <Stack direction="row" alignItems="center">
                        <KeyIcon sx={{ color: "#00a8ff", mr: 1, fontSize: 32 }} />
                        <Box>
                            <Typography sx={{ color: "#a0d4ff", fontSize: "1rem", mb: 1 }}>Public Key</Typography>
                            <Typography sx={{ color: "#8ab4f8", wordBreak: "break-all", fontSize: "0.9rem", lineHeight: 1.5 }}>
                                {profile.publicKey}
                            </Typography>
                        </Box>
                    </Stack>
                </Sheet>
            </Box>

            <Stack
                direction="row"
                spacing={0}
                sx={{
                    px: 3,
                }}
            >
                {["media", "files", "links"].map((tab) => {
                    const isActive = selectedTab === tab;

                    return (
                        <Button
                            key={tab}
                            variant="plain"
                            onClick={() => setSelectedTab(tab)}
                            sx={{
                                textTransform: 'none',
                                borderRadius: 0,
                                flex: 1,
                                justifyContent: 'center',
                                fontWeight: isActive ? 600 : 400,
                                borderBottom: isActive ? '2px solid #00a8ff' : '2px solid transparent',
                                color: isActive ? '#00a8ff' : '#a0d4ff',
                                transition: 'all 0.2s ease-in-out',
                                py: 1.5,
                                minWidth: 0,
                                borderTopLeftRadius: '8px',
                                borderTopRightRadius: '8px',
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 168, 255, 0.05)',
                                    borderTopLeftRadius: '8px',
                                    borderTopRightRadius: '8px',
                                },
                            }}
                        >
                            {t(`tabs.${tab}`)}
                        </Button>
                    );
                })}
            </Stack>


            <Box>
                {selectedTab === "media" && (
                    imageList.length === 0 ? (
                        <Typography sx={{ color: '#888', mt: 2 }}></Typography>
                    ) : (
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
                            {imageList.map((src: string, index: number) => (
                                <Box
                                    key={index}
                                    sx={{ width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', cursor: 'pointer' }}
                                    onClick={() => handleThumbnailClick(src)}
                                >
                                    <img src={src} alt="media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </Box>
                            ))}
                        </Box>
                    )
                )}
                {selectedTab === "files" &&
                    messages
                        .filter((msg) =>
                            Array.isArray(msg.attachment) &&
                            msg.attachment.some((file: { fileType: string }) => !file.fileType.startsWith("image"))
                        )
                        .flatMap((msg) =>
                            msg.attachment
                                .filter((file: { fileType: string }) => !file.fileType.startsWith("image"))
                                .map((file: { filePath: string, fileName: string, fileSize: number, createdAt: string }, index: number) => (
                                    <Box
                                        key={`${msg.id}-${index}`}
                                        sx={{
                                            width: '100%',
                                            p: '8px',
                                            maxWidth: '300px',
                                            mb: 1,
                                        }}
                                    >
                                        <Stack
                                            direction="row"
                                            spacing={1.5}
                                            sx={{
                                                alignItems: 'center',
                                                width: '100%',
                                                position: 'relative',
                                                textDecoration: 'none',
                                            }}
                                            component="a"
                                            href={file.filePath}
                                            download={file.fileName}
                                        >
                                            <Box
                                                sx={{
                                                    position: 'relative',
                                                    flexShrink: 0,
                                                    width: '48px',
                                                    height: '48px',
                                                    cursor: 'pointer',
                                                    '&:hover .download-icon': {
                                                        opacity: 1,
                                                        visibility: 'visible',
                                                    },
                                                    '&:hover .file-type': {
                                                        opacity: 0,
                                                        visibility: 'hidden',
                                                    },
                                                }}
                                            >
                                                <InsertDriveFileRoundedIcon
                                                    sx={{
                                                        fontSize: '48px',
                                                        color: '#a0d4ff',
                                                        width: '100%',
                                                        height: '100%',
                                                    }}
                                                />

                                                <Typography
                                                    className="file-type"
                                                    sx={{
                                                        position: 'absolute',
                                                        top: '50%',
                                                        left: '50%',
                                                        transform: 'translate(-50%, -50%)',
                                                        fontSize: '14px',
                                                        fontWeight: '700',
                                                        color: 'white',
                                                        textShadow: '0 1px 3px rgba(0, 0, 0, 0.4)',
                                                        transition: 'all 0.2s ease',
                                                        textTransform: 'uppercase',
                                                        pointerEvents: 'none',
                                                        userSelect: 'none',
                                                    }}
                                                >
                                                    {(() => {
                                                        const ext = file.fileName.split('.').pop()?.toUpperCase();
                                                        return ext && ext.length > 5 ? ext.slice(0, 4) + '…' : ext;
                                                    })()}
                                                </Typography>

                                                <DownloadIcon
                                                    className="download-icon"
                                                    sx={{
                                                        position: 'absolute',
                                                        top: '50%',
                                                        left: '50%',
                                                        transform: 'translate(-50%, -50%)',
                                                        fontSize: '24px',
                                                        opacity: 0,
                                                        visibility: 'hidden',
                                                        color: 'white',
                                                        transition: 'all 0.2s ease',
                                                        bgcolor: 'rgba(0, 0, 0, 0.3)',
                                                        borderRadius: '50%',
                                                        p: '4px',
                                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                                                        pointerEvents: 'none',
                                                    }}
                                                />
                                            </Box>

                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography
                                                    sx={{
                                                        fontSize: '13px',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        color: '#a0d4ff',
                                                        pl: 1,
                                                        pr: 1,
                                                        textDecoration: 'none',
                                                    }}
                                                >
                                                    {file.fileName}
                                                </Typography>
                                                <Typography
                                                    sx={{
                                                        fontSize: '11px',
                                                        color: '#a0d4ff',
                                                        pl: 1,
                                                        pr: 1,
                                                        textDecoration: 'none',
                                                    }}
                                                >
                                                    {formatLocalizedDate(file.createdAt, t)}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Box>
                                ))
                        )}
                {selectedTab === "links" &&
                    messages
                        .filter((msg) =>
                            typeof msg.content === "string" &&
                            msg.content.startsWith("http")
                        )
                        .map((msg, index) => {
                            const url = msg.content.trim();
                            let hostname = "";
                            try {
                                hostname = new URL(url).hostname;
                            } catch (e) {
                                return null;
                            }

                            const favicon = `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${url}&size=64`;

                            const title = hostname.replace("www.", "").split(".")[0];

                            return (
                                <Box
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 1,
                                        mb: 1,
                                        px: 2,
                                        py: 1,
                                        borderBottom: '1px solid rgba(0,168,255,0.1)',
                                    }}
                                >
                                    <Avatar
                                        src={favicon}
                                        variant="soft"
                                        sx={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 8,
                                            flexShrink: 0,
                                        }}
                                    />
                                    <Box sx={{  minWidth: 0 }}>
                                        <Typography
                                            sx={{
                                                fontSize: '14px',
                                                color: '#a0d4ff',
                                                fontWeight: 500,
                                                mb: 0.5,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {title.charAt(0).toUpperCase() + title.slice(1)}
                                        </Typography>


                                        <Typography
                                            component="a"
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            sx={{
                                                fontSize: '12px',
                                                color: '#4ab3ff',
                                                textDecoration: 'none',
                                                wordBreak: 'break-all',
                                                '&:hover': {
                                                    textDecoration: 'underline',
                                                },
                                            }}
                                        >
                                            {url}
                                        </Typography>
                                    </Box>
                                </Box>
                            );
                        })}

            </Box>

            <AnimatePresence>
                <ImageViewer
                    open={viewerOpen}
                    imageSrcList={imageList}
                    initialIndex={initialIndex}
                    senderAvatar={profile.avatar}
                    senderPublicKey={profile.publicKey}
                    date={formattedDateTooltip}
                    onClose={() => setViewerOpen(false)}
                />
            </AnimatePresence>
        </Box>
    );
};

export default ChatInfoPanel;
