import React from 'react';
import { Navigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

interface DecodedToken {
    exp: number; // Время истечения токена
    roles?: string[]; // Роли пользователя (если они есть)
}

interface PrivateRouteProps {
    element: JSX.Element;
    requiredRoles?: string[]; // Роли, которые нужны для доступа к этой странице
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element, requiredRoles }) => {
    const token = localStorage.getItem('token');

    if (token) {
        try {
            const decodedToken: DecodedToken = jwtDecode<DecodedToken>(token); // Декодируем токен
            const currentTime = Date.now() / 1000; // Текущее время в секундах

            // Проверяем, истёк ли токен
            if (decodedToken.exp < currentTime) {
                localStorage.removeItem('token'); // Удаляем токен, если он истёк
                return <Navigate to="/login" replace />; // Перенаправляем на страницу логина
            }

            // Проверяем, есть ли у пользователя необходимые роли для доступа
            if (requiredRoles && (!decodedToken.roles || !requiredRoles.some(role => decodedToken.roles?.includes(role)))) {
                return <Navigate to="/access-denied" replace />; // Если нет нужных прав, перенаправляем на страницу отказа в доступе
            }

            return element; // Возвращаем защищённый компонент, если всё ок
        } catch (error) {
            console.error('Ошибка декодирования токена:', error);
            localStorage.removeItem('token'); // Удаляем токен при ошибке декодирования
            return <Navigate to="/login" replace />; // Перенаправляем на страницу логина
        }
    }

    // Если токен отсутствует
    return <Navigate to="/login" replace />;
};

export default PrivateRoute;
