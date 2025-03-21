import React, { useState } from "react";
import {Box, Typography, Avatar, Button, Stack, Sheet, Link, IconButton} from "@mui/joy";
import KeyIcon from "@mui/icons-material/VpnKey";
import ImageIcon from "@mui/icons-material/Image";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import LinkIcon from "@mui/icons-material/Link";
import { MessageProps } from "../core/types";
import CloseIcon from "@mui/icons-material/Close";
import {AnimatePresence, motion } from "framer-motion";

interface ChatInfoPanelProps {
    profile: {
        avatar: string;
        username?: string;
        publicKey: string;
        bio?: string;
    };
    messages: MessageProps[];
    onClose: () => void;
}

const ChatInfoPanel: React.FC<ChatInfoPanelProps> = ({ profile, messages, onClose }) => {
    const [selectedTab, setSelectedTab] = useState<"media" | "files" | "links">("media");

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imageLoading, setImageLoading] = useState<boolean>(false);

    const handleThumbnailClick = (imageUrl: string) => {
        setSelectedImage(imageUrl);
        setImageLoading(true);
    };

    const handleImageLoad = () => {
        setImageLoading(false);
    };

    return (
        <>
            <Box
                sx={{
                    height: "100dvh",
                    display: "flex",
                    flexDirection: "column",
                    background: "linear-gradient(180deg, #00162d 0%, #000d1a 100%)",
                    borderLeft: "1px solid rgba(0, 168, 255, 0.3)",
                    position: "relative",
                    overflow: 'auto',
                    '&::-webkit-scrollbar': {
                        display: 'none'
                    }
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
                    <IconButton onClick={onClose}  sx={{color: '#00a8ff', mr: 2}}>
                        <CloseIcon  sx={{fontSize: 24, color: '#a0d4ff'}}/>
                    </IconButton>
                    <Typography
                        level="h4"
                        sx={{
                            color: "#a0d4ff",
                            flexGrow: 1,
                            textShadow: "0 2px 4px rgba(0,168,255,0.3)",
                        }}
                    >
                        User Info
                    </Typography>
                </Box>

                <Box
                    sx={{
                        position: "relative",
                        borderBottom: "1px solid rgba(0,168,255,0.3)",
                        flex: "0 0 30%",
                    }}
                >
                    <Avatar
                        src={profile.avatar}
                        sx={{
                            width: "100%",
                            height: "100%",
                            borderRadius: 0,
                            objectFit: "cover",
                        }}
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
                        <Typography
                            sx={{
                                color: "#00a8ff",
                                fontSize: "1.3rem",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
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
                                <Typography sx={{ color: "#a0d4ff", fontSize: "1rem", mb: 1 }}>
                                    Public Key
                                </Typography>
                                <Typography
                                    sx={{
                                        color: "#8ab4f8",
                                        wordBreak: "break-all",
                                        fontSize: "0.9rem",
                                        lineHeight: 1.5,
                                    }}
                                >
                                    {profile.publicKey}
                                </Typography>
                            </Box>
                        </Stack>
                    </Sheet>
                </Box>

                <Stack direction="row" spacing={1} sx={{ px: 3, mb: 2 }}>
                    <Button
                        variant={selectedTab === "media" ? "solid" : "outlined"}
                        size="md"
                        onClick={() => setSelectedTab("media")}
                        startDecorator={<ImageIcon />}
                        sx={{
                            textTransform: "none",
                        }}
                    >
                        Media
                    </Button>
                    <Button
                        variant={selectedTab === "files" ? "solid" : "outlined"}
                        size="md"
                        onClick={() => setSelectedTab("files")}
                        startDecorator={<InsertDriveFileIcon />}
                        sx={{
                            textTransform: "none",
                        }}
                    >
                        Files
                    </Button>
                    <Button
                        variant={selectedTab === "links" ? "solid" : "outlined"}
                        size="md"
                        onClick={() => setSelectedTab("links")}
                        startDecorator={<LinkIcon />}
                        sx={{
                            textTransform: "none",
                        }}
                    >
                        Links
                    </Button>
                </Stack>

                {/* Контент вкладок */}
                <Box sx={{ px: 3, pb: 3, flex: 1, overflowY: "auto" }}>
                    {/* Media (только картинки) */}
                    {selectedTab === "media" && (
                        <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                            {messages
                                .filter((msg) =>
                                    Array.isArray(msg.attachment) &&
                                    msg.attachment.some((file) => file.fileType.startsWith("image"))
                                )
                                .flatMap((msg) =>
                                    msg.attachment!
                                        .filter((file) => file.fileType.startsWith("image"))
                                        .map((file, index) => (
                                            <Box
                                                key={`${msg.id}-${index}`}
                                                sx={{
                                                    width: 100,
                                                    height: 100,
                                                    overflow: "hidden",
                                                    cursor: "pointer",
                                                }}
                                                onClick={() => handleThumbnailClick(file.filePath)}
                                            >
                                                <img
                                                    src={file.filePath}
                                                    alt="Media"
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "cover",
                                                    }}
                                                />
                                            </Box>
                                        ))
                                )}
                        </Box>
                    )}


                    {/*/!* Files (файлы, кроме картинок) *!/*/}
                    {/*{selectedTab === "files" &&*/}
                    {/*    messages*/}
                    {/*        .filter((msg) => msg.attachment && !msg.attachment.fileType.startsWith("image"))*/}
                    {/*        .map((msg) => (*/}
                    {/*            <Box key={msg.id} sx={{ mb: 2 }}>*/}
                    {/*                <iframe*/}
                    {/*                    src={msg.attachment!.filePath}*/}
                    {/*                    width="100%"*/}
                    {/*                    height="150px"*/}
                    {/*                    style={{*/}
                    {/*                        borderRadius: "8px",*/}
                    {/*                        border: "none",*/}
                    {/*                    }}*/}
                    {/*                />*/}
                    {/*            </Box>*/}
                    {/*        ))}*/}

                    {/* Links (сообщения со ссылками) */}
                    {selectedTab === "links" &&
                        messages
                            .filter((msg) => msg.content && msg.content.includes("http"))
                            .map((msg) => (
                                <Link key={msg.id} href={msg.content} target="_blank" sx={{ display: "block", mb: 1 }}>
                                    🔗 {msg.content}
                                </Link>
                            ))}
                </Box>
            </Box>

            {/* Модальное окно (оверлей) с большой картинкой */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        key="overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}

                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            width: "100vw",
                            height: "100vh",
                            backgroundColor: "rgba(0,0,0,0.6)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 9999,
                            cursor: "pointer",
                        }}
                        onClick={() => setSelectedImage(null)}
                    >
                        <img
                            src={selectedImage}
                            alt="attachment"
                            onLoad={handleImageLoad}

                            style={{
                                width: "100%",
                                maxWidth: "600px",
                                maxHeight: "400px",
                                objectFit: "contain",
                                transition: 'opacity 0.3s ease',
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatInfoPanel;
