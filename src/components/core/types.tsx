export type UserProps = {
    id: number;
    realname: string;
    username: string;
    avatar: string;
    online: boolean;
    role: string;
    verified: boolean;
};

export type MessageProps = {
    id: number;
    content: string;
    createdAt: string;
    unread?: boolean;
    user: UserProps;
    userId: number;
    chatId: number;
    attachment?: {
        fileName: string;
        filePath: string;
        type: string;
    };
    isEdited?: boolean;
    isRead?: boolean;
    isDelivered?: boolean;
};

export type ChatProps = {
    id: number;
    user: UserProps;
    users: UserProps[];
    messages: MessageProps[];
    isGroup?: boolean;
    groupAvatar?: string;
    name?: string;
    avatar?: string
    lastMessage?: MessageProps;
};

export type JwtPayload = {
    id: number;
    username: string;
};
