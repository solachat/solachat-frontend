export type UserProps = {
    id: number;
    realname: string;
    username: string;
    avatar: string;
    online: boolean;
};

export type MessageProps = {
    id: string;
    content: string;
    createdAt: string;
    unread?: boolean;
    user: UserProps;
    userId: number;
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
};

export type JwtPayload = {
    id: number;
    username: string;
};
