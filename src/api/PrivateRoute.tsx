import React from 'react';
import { Navigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

interface DecodedToken {
    exp: number;
    roles?: string[];
}

interface PrivateRouteProps {
    element: JSX.Element;
    requiredRoles?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element, requiredRoles }) => {
    const token = localStorage.getItem('token');

    if (token) {
        try {
            const decodedToken: DecodedToken = jwtDecode<DecodedToken>(token);
            const currentTime = Date.now() / 1000;

            if (decodedToken.exp < currentTime) {
                localStorage.removeItem('token');
                return <Navigate to="/login" replace />;
            }

            if (requiredRoles && (!decodedToken.roles || !requiredRoles.some(role => decodedToken.roles?.includes(role)))) {
                return <Navigate to="/access-denied" replace />;
            }

            return element;
        } catch (error) {
            console.error('Ошибка декодирования токена:', error);
            localStorage.removeItem('token');
            return <Navigate to="/login" replace />;
        }
    }

    return <Navigate to="/login" replace />;
};

export default PrivateRoute;
