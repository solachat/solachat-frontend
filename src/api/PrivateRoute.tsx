import React from 'react';
import { Navigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

interface PrivateRouteProps {
    element: JSX.Element;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element }) => {
    const token = localStorage.getItem('token');

    if (token) {
        try {
            const decodedToken: any = jwtDecode(token);

            const currentTime = Date.now() / 1000;
            if (decodedToken.exp < currentTime) {
                localStorage.removeItem('token');
                return <Navigate to="/login" />;
            }

            return element;
        } catch (error) {
            console.error('Ошибка декодирования токена:', error);
            return <Navigate to="/login" />;
        }
    }

    return <Navigate to="/login" />;
};

export default PrivateRoute;
