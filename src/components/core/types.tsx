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
        type: string;
        size: string;
    };
};

export type ChatProps = {
    id: string;
    user: UserProps;
    users: UserProps[];
    messages: MessageProps[];
};

export type JwtPayload = {
    id: number;
    username: string;
};
