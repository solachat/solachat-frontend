import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPassword from './pages/ForgotPassword';
import MyAccount from './pages/AccountPage';
import { HelmetProvider } from 'react-helmet-async';
import HomePage from './pages/HomePage';
import ContactsPage from './pages/ContactsPage';
import MyMessages from './components/messages/MyMessages';
import NotFoundPage from './pages/NotFoundPage';
import UnderConstruction from './pages/UnderConstruction';
import PrivateRoute from './api/PrivateRoute';
import MainPage from './pages/MainPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const underDevelopmentRoutes = [
    '/connect/telegram',
    '/connect/google',
];

const App: React.FC = () => {
    return (
        <HelmetProvider>
            <ThemeProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/forgotpassword" element={<ForgotPassword />} />
                        <Route path="/account" element={<MyAccount />} />
                        <Route path="/" element={<HomePage />} />
                        <Route path="/contacts" element={<ContactsPage />} />
                        <Route path="/chat" element={<PrivateRoute element={<MyMessages />} />} />
                        {underDevelopmentRoutes.map((route) => (
                            <Route path={route} element={<Navigate to="/new-feature" />} key={route} />
                        ))}
                        <Route path="*" element={<NotFoundPage />} />
                        <Route path="/new-feature" element={<UnderConstruction />} />
                        <Route path="/main" element={<MainPage />} />
                    </Routes>
                </Router>
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
            </ThemeProvider>
        </HelmetProvider>
    );
};

export default App;
