import axios, { AxiosError } from 'axios';

const API_URL =  process.env.REACT_APP_API_URL || 'http://localhost:4000';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Включает отправку cookies при запросах
});

// 📌 Глобальный перехватчик ошибок
api.interceptors.response.use(
    response => response,
    (error: AxiosError) => {
        if (error.response) {
            const { status } = error.response;

            if (status === 401) {
                console.warn("🔒 Сессия истекла, выходим...");
                localStorage.removeItem('token');
                window.location.href = '/login'; // Можно заменить на showModal()
            }
            else if (status === 403) {
                console.warn("🚫 Доступ запрещён");
                alert("У вас нет прав для выполнения этого действия.");
            }
            else if (status >= 500) {
                console.error("🔥 Ошибка сервера, попробуйте позже.");
                alert("Ошибка на сервере, попробуйте позже.");
            }
        } else {
            console.error("🌐 Ошибка сети:", error.message);
        }

        return Promise.reject(error);
    }
);

export default api;
