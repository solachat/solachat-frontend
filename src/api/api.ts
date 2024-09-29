import axios from 'axios';
import { toast } from 'react-toastify';
import {jwtDecode} from "jwt-decode";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export const searchUsers = async (searchTerm: string) => {
    try {
        const response = await axios.get(`${API_URL}/api/users/search?searchTerm=${searchTerm}`);
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

export const sendMessage = async (chatId: number, formData: FormData, token: string) => {
    try {
        const response = await axios.post(
            `${API_URL}/api/messages/${chatId}`,
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    } catch (error) {
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

export const uploadFileToChat = async (chatId: number, formData: FormData, token: string) => {
    try {
        formData.append('chatId', chatId.toString());

        console.log('ChatId:', chatId);
        const response = await axios.post(
            `${API_URL}/api/messages/${chatId}/upload`,
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        toast.success('File uploaded successfully!');
        return response.data;
    } catch (error) {
        console.error('Error uploading file:', error);
        toast.error('Failed to upload file');
        throw error;
    }
};

export const deleteChat = async (chatId: number, token: string) => {
    try {
        const response = await fetch(`${API_URL}/api/chats/${chatId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to delete chat');
        }

        const data = await response.json();
        toast.success('Chat deleted successfully');
        return data;
    } catch (error) {
        console.error('Error deleting chat:', error);
        toast.error('Failed to delete chat');
        throw new Error('Could not delete chat');
    }
};


export const editMessage = async (messageId: number, content: string, token: string) => {
    try {
        const response = await axios.put(
            `${API_URL}/api/messages/${messageId}`,
            { content },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        console.log('Message edited successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error editing message:', error);
        throw new Error('Could not edit message');
    }
};

export const addUsersToGroupChat = async (chatId: number, newUserIds: number[], token: string) => {
    try {
        const response = await axios.post(
            `${API_URL}/api/chats/${chatId}/add-users`,
            {
                chatId,
                newUserIds
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        toast.success('Users added to group successfully');
        return response.data;
    } catch (error) {
        console.error('Error adding users to group:', error);
        toast.error('Failed to add users');
        throw error;
    }
};

export const assignRoleInChat = async (chatId: number, userId: number, role: 'admin' | 'member', token: string) => {
    try {
        const response = await axios.post(
            `${API_URL}/api/chats/${chatId}/assign-role`,
            {
                userIdToAssign: userId,
                role
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        toast.success('Role assigned successfully');
        return response.data;
    } catch (error) {
        console.error('Error assigning role:', error);
        toast.error('Failed to assign role');
        throw error;
    }
};

export const createGroupChat = async (
    groupName: string,
    avatar?: File | null,
    selectedUserIds?: number[]
): Promise<number | null> => {
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token is missing');

        const decodedToken: any = jwtDecode(token);
        const creatorId = decodedToken.id;

        const allUserIds = [...(selectedUserIds || []), creatorId].filter((id, index, self) => self.indexOf(id) === index);

        const formData = new FormData();
        formData.append('groupName', groupName);
        if (avatar) {
            formData.append('avatar', avatar);
        }

        allUserIds.forEach(id => formData.append('selectedUsers[]', id.toString()));

        console.log('Отправляемые данные:', {
            groupName,
            avatar,
            selectedUsers: allUserIds,
        });

        const response = await axios.post(`${API_URL}/api/chats/group`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const groupId = response.data.id;
        console.log('Group created with ID:', groupId);
        return groupId;
    } catch (error) {
        console.error('Error creating group:', error);
        toast.error('Failed to create group');
        return null;
    }
};

export const removeUserFromChat = async (chatId: number, userId: number, token: string) => {
    try {
        console.log("Отправляем запрос с данными:", { chatId, userIdToKick: userId });
        const response = await axios.post(
            `${API_URL}/api/chats/${chatId}/kick-user`,
            { userIdToKick: userId },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        toast.success('User removed successfully');
        return response.data;
    } catch (error) {
        console.error('Error removing user:', error);
        toast.error('Failed to remove user');
        throw error;
    }
};

export const updateChatSettings = async (chatId: number, groupName?: string, avatar?: File | null) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token is missing');

        const formData = new FormData();
        if (groupName) {
            formData.append('groupName', groupName);
        }
        if (avatar) {
            formData.append('avatar', avatar);
        }

        console.log('Chat settings being sent:', { groupName, avatar });

        const response = await axios.put(`${API_URL}/api/chats/${chatId}/settings`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        toast.success('Chat settings updated successfully!');
        return response.data;
    } catch (error) {
        console.error('Error updating chat settings:', error);
        toast.error('Failed to update chat settings');
        throw error;
    }
};



//
// console.log('Отправляемые данные:', {
//     groupName,
//     avatar,
//     selectedUsers: selectedUserIds,
// });
