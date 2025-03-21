export type UserProps = {
    id: number;
    username?: string;
    public_key: string;
    avatar: string;
    online: boolean;
    role: string;
    verified: boolean;
    lastOnline?: string;
    sessionToken?: string;
};

export interface Vacancy {
    _id: string;
    title: string;
    description: string;
    requirements: string[];
    technologies: string[];
    logo?: string;
}

export type MessageProps = {
    id: number;
    content: string;
    createdAt: string;
    unread?: boolean;
    user: UserProps;
    tempId?: number;
    pending?: boolean;
    userId: number;
    chatId: number;
    attachment?: {
        fileName: string;
        filePath: string;
        fileType: string;
    }[];

    isEdited?: boolean;
    isRead?: boolean;
    isDelivered?: boolean;
    timestamp?: string;
};

export type ChatProps = {
    id: number;
    user: UserProps;
    users: UserProps[];
    messages: MessageProps[];
    session?: {
        sessionKey: string;
    };
    isGroup?: boolean;
    isFavorite?: boolean;
    groupAvatar?: string;
    name?: string;
    avatar?: string
    lastMessage?: MessageProps;
};

export type JwtPayload = {
    id: number;
    username: string;
};

export interface Session {
    sessionId: string;
    ip: string | null;
    userAgent: string | null;
    lastActiveAt: string | null;
    isCurrent: boolean;
    device: string;
    country: string;
}
