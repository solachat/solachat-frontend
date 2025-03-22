import {jwtDecode} from "jwt-decode";
import {Session} from "../components/core/types";
import { getCachedSessionsIndexedDB } from '../utils/sessionIndexedDB';
import api from '../api/axiosConfig';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { encryptMessage } from '../utils/encryption'; // ты реализуешь свою encryption
import { getSessionKey } from '../utils/sessionIndexedDB'; // ключ сессии от IndexedDB

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const VACANCIES_API_URL = process.env.VACANCIES_API_URL || 'http://localhost:5000';

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
        console.log("✅ Серверный ответ получен, обновляем кэш.");
        return response.data;
    } catch (error: any) {
        console.warn("⚠️ Ошибка сервера, используем кэш:", error.response?.data || error.message);
        return null;
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
                validateStatus: (status) => status < 500,
            }
        );
        console.log("📥 typeof response.status:", typeof response.status, response.status);

        console.log("📥 Ответ от сервера (sendMessage):", response);

        return response;

    } catch (error) {
        console.error('❌ Ошибка отправки сообщения:', error);
        throw new Error('Could not send message');
    }
};


export const sendMessageViaSecuLine = async (
    chatId: number,
    messageText: string,
    senderPublicKey: string,
    sessionId: string,
    ws: WebSocket
) => {
    try {
        // 1. Получаем ключ сессии (shared key)
        const sessionKey = await getSessionKey(sessionId);
        if (!sessionKey) throw new Error('Session key not found');

        // 2. Шифруем сообщение
        const { encrypted, nonce } = await encryptMessage(messageText, sessionKey);

        // 3. Объединяем nonce + ciphertext
        const payload = new Uint8Array([...nonce, ...encrypted]);

        // 4. Создаём пакет
        const packet = {
            message_id: uuidv4(),
            chat_id: chatId,
            sender: senderPublicKey,
            timestamp: new Date().toISOString(),
            msg_type: 'Message',
            payload: Array.from(payload), // будет сериализовано как JSON-массив
            ack_id: null,
            retry_count: 0,
        };

        // 5. Отправляем в WebSocket
        ws.send(JSON.stringify(packet));

        console.log('📤 SecuPacket отправлен через WebSocket');
    } catch (error) {
        console.error('❌ Ошибка при отправке зашифрованного сообщения:', error);
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
    } catch (error) {
        console.error('Failed to update user status:', error);
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
        return data;
    } catch (error) {
        console.error('Error deleting chat:', error);
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
        return response.data;
    } catch (error) {
        console.error('Error adding users to group:', error);
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
        return response.data;
    } catch (error) {
        console.error('Error assigning role:', error);
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

        const response = await axios.post(`${API_URL}/api/chats/group`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const groupId = response.data.id;
        return groupId;
    } catch (error) {
        console.error('Error creating group:', error);
        return null;
    }
};

export const removeUserFromChat = async (chatId: number, userId: number, token: string) => {
    try {
        const response = await axios.post(
            `${API_URL}/api/chats/${chatId}/kick-user`,
            { userIdToKick: userId },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error removing user:', error);
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


        const response = await axios.put(`${API_URL}/api/chats/${chatId}/settings`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data;
    } catch (error) {
        console.error('Error updating chat settings:', error);
        throw error;
    }
};

export const deleteMessage = async (messageId: number) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authorization token is missing');

        const response = await axios.delete(`${API_URL}/api/messages/messages/${messageId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data;
    } catch (error) {
        console.error('Error deleting message:', error);
        throw new Error('Could not delete message');
    }
};

export const initiateCall = async (fromUserId: number | null, toUserId: number | null) => {
    try {
        const response = await axios.post(`${API_URL}/api/calls/initiate`, {
            fromUserId,
            toUserId,
        });
        return response.data;
    } catch (error) {
        console.error('Error initiating call:', error);
        throw error;
    }
};

export const endCall = async (fromUserId: number | null, toUserId: number | null, callId: number | null) => {
    try {
        const response = await axios.post(`${API_URL}/api/calls/reject`, {
            fromUserId,
            toUserId,
            callId,
        });
        return response.data;
    } catch (error) {
        console.error('Error cancelling call:', error);
        throw error;
    }
};

export const acceptCall = async (fromUserId: number | null, toUserId: number | null, callId: number | null) => {
    try {
        const response = await axios.post(`${API_URL}/api/calls/answer`, {
            fromUserId,
            toUserId,
            callId,
        });
        return response.data;
    } catch (error) {
        console.error('Error accepting call:', error);
        throw error;
    }
};

export const initiateGroupCall = async (fromUserId: number, participantUserIds: number[], token: string) => {
    try {
        const response = await axios.post(
            `${API_URL}/api/calls/group/initiate`,
            {
                fromUserId,
                participantUserIds,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error initiating group call:', error);
        throw new Error('Could not initiate group call');
    }
};

export const rejectCall = async (fromUserId: number | null, toUserId: number | null, callId: number | null) => {
    try {
        const response = await axios.post(`${API_URL}/api/calls/reject`, {
            fromUserId,
            toUserId,
            callId,
        });
        return response.data;
    } catch (error) {
        console.error('Error rejecting call:', error);
        throw error;
    }
};

export const updateMessageStatus = async (messageId: number, updates: { isRead: boolean }, token: string) => {
    try {
        const response = await axios.put(
            `${API_URL}/api/messages/${messageId}/read`,
            updates,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error updating message status:', error);
        throw error;
    }
};

export const createFavoriteChat = async (token: string) => {
    try {
        if (!token) {
            throw new Error('Authorization token is missing');
        }

        const response = await axios.post(
            `${API_URL}/api/chats/chats/favorite`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error creating or retrieving favorite chat:', error.response?.data || error.message);
        } else {
            console.error('Unexpected error creating or retrieving favorite chat:', error);
        }
        throw new Error('Could not create or retrieve favorite chat');
    }
};

export const setupTotp = async (token: string): Promise<{ secret: string; otpauthUrl: string }> => {
    try {
        const response = await axios.post(
            `${API_URL}/api/users/setup-totp`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error setting up TOTP:', error);
        throw error;
    }
};


export const verifyTotp = async (totpCode: string, token: string): Promise<{ success: boolean }> => {
    try {
        const response = await axios.post(
            `${API_URL}/api/users/verify-totp`,
            { totpCode },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error verifying TOTP:', error);
        throw error;
    }
};

export const fetchVacancies = async () => {
    try {
        const response = await fetch(`${VACANCIES_API_URL}/api/vacancies`);
        if (!response.ok) {
            throw new Error("Ошибка при загрузке вакансий");
        }
        return await response.json();
    } catch (error) {
        console.error("Ошибка при получении списка вакансий:", error);
        return [];
    }
};


export const postVacancy = async (vacancyData: any) => {
    try {
        const response = await fetch(`${VACANCIES_API_URL}/api/vacancies`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(vacancyData),
        });

        if (!response.ok) throw new Error("Ошибка при добавлении вакансии");
        return await response.json();
    } catch (error) {
        console.error("Ошибка при отправке вакансии:", error);
        throw error;
    }
};

export const applyForVacancy = async (formData: any) => {
    if (!formData.vacancyId) {
        throw new Error("vacancyId отсутствует!");
    }
    try {
        const response = await fetch(`${VACANCIES_API_URL}/api/applications/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error("Ошибка отправки заявки");
        return await response.json();
    } catch (error) {
        console.error("Ошибка при отправке заявки:", error);
        throw error;
    }
};

export const updateUserProfile = async (publicKey: string, newUsername: string, aboutMe: string, token: string) => {
    try {
        const response = await axios.put(
            `${API_URL}/api/users/profile/${publicKey}`,
            { newUsername, aboutMe },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        localStorage.setItem('token', response.data.token);
        return response.data.user;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
};

export const checkUsernameAvailability = async (username: string) => {
    try {
        const response = await axios.get(`${API_URL}/api/users/check-username/${username}`);
        return response.data.available;
    } catch (error) {
        console.error('Error checking username:', error);
        return false;
    }
};

export const getSessions = async (userId: number, token: string): Promise<Session[]> => {
    try {
        const cachedSessions = await getCachedSessionsIndexedDB();
        const sessionId = cachedSessions && cachedSessions.length > 0 ? cachedSessions[0].sessionId : '';

        const response = await axios.get(`${API_URL}/api/sessions/${userId}/${sessionId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        console.log("📥 Ответ от сервера (getSessions):", response.data);
        return response.data as Session[];
    } catch (error) {
        console.error("Error fetching sessions:", error);
        throw error;
    }
};

export const deleteSessionById = async (sessionId: string, token: string) => {
    try {
        const response = await axios.delete(`${API_URL}/api/sessions/${sessionId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data.message;
    } catch (error) {
        console.error("Error deleting session:", error);
        throw error;
    }
};

export const deleteAllOtherSessions = async (token: string, sessionId: string) => {
    try {
        const response = await axios.delete(`${API_URL}/api/sessions?sessionId=${sessionId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data.message;
    } catch (error) {
        console.error("Error deleting other sessions:", error);
        throw error;
    }
};
