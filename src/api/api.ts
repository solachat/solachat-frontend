import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export const searchUsers = async (searchTerm: string) => {
    try {
        const response = await axios.get(`${API_URL}/api/users/search?username=${searchTerm}`);
        return response.data;
    } catch (error) {
        console.error('Error searching users:', error);
        return [];
    }
};

export const createPrivateChat = async (currentUserId: number, userId: number, token: string) => {
    try {
        console.log("Creating chat between:", currentUserId, "and", userId);

        if (!token) {
            throw new Error('Authorization token is missing');
        }

        const response = await axios.post(
            `${API_URL}/api/chats/private`,
            {
                user1Id: currentUserId,
                user2Id: userId,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        console.log("Chat created successfully:", response.data);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error creating private chat:', error.response?.data || error.message);
        } else {
            console.error('Unexpected error creating private chat:', error);
        }
        throw new Error('Could not create chat');
    }
};

export const fetchChatWithMessages = async (chatId: number, token: string) => {
    try {
        const response = await axios.get(`${API_URL}/api/chats/${chatId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error fetching chat with messages:', error.response?.data || error.message);
        } else {
            console.error('Unexpected error fetching chat with messages:', error);
        }
        throw new Error('Could not fetch chat with messages');
    }
};

export const fetchChatsFromServer = async (userId: number, token: string) => {
    try {
        const response = await axios.post(
            `${API_URL}/api/chats/chats`,
            { userId },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        console.log('Chats fetched successfully:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching chats:', error.response?.data || error.message);
        return [];
    }
};

export const sendMessage = async (chatId: number, content: string, token: string) => {
    try {
        const response = await axios.post(
            `${API_URL}/api/messages/${chatId}`,
            { content },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        toast.error('Failed to send message');
        console.error('Error sending message:', error);
        throw new Error('Could not send message');
    }
};

export const updateUserStatus = async (userId: number, isOnline: boolean, token: string) => {
    if (!token) {
        throw new Error('Authorization token is missing');
    }

    try {
        await axios.post(
            `${API_URL}/api/users/update-status`,
            {
                userId,
                isOnline,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        console.log(`User status updated to ${isOnline ? 'online' : 'offline'}`);
    } catch (error) {
        console.error('Failed to update user status:', error);
        toast.error('Failed to update user status');
        throw error;
    }
};
