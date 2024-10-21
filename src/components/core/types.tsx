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
    id: string;
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
};

export type JwtPayload = {
    id: number;
    username: string;
};
