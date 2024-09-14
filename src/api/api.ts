import axios from 'axios';

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

export const createPrivateChat = async (currentUserId: number, userId: number) => {
    try {
        const response = await axios.post(`${API_URL}/api/chats/private`, {
            user1Id: currentUserId,
            user2Id: userId,
        });
        return response.data;
    } catch (error) {
        console.error('Error creating private chat:', error);
        throw new Error('Could not create chat');
    }
};

export const fetchChatsFromServer = async (userId: string) => {
    try {
        const response = await axios.get(`${API_URL}/api/chats?userId=${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching chats:', error);
        return [];
    }
};
