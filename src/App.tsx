import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import {ThemeProvider} from './theme/ThemeContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPassword from './pages/ForgotPassword';
import MyAccount from './pages/AccountPage';
import OperationsPage from './pages/OperationsPage';
import {HelmetProvider} from 'react-helmet-async';
import HomePage from './pages/HomePage';
import ContactsPage from './pages/ContactsPage';
import MyMessages from './components/messages/MyMessages';

const App: React.FC = () => {
    return (
        <HelmetProvider>
            <ThemeProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<LoginPage/>}/>
                        <Route path="/register" element={<RegisterPage/>}/>
                        <Route path="/forgotpassword" element={<ForgotPassword/>}/>
                        <Route path="/account" element={<MyAccount/>}/>
                        <Route path="/operations" element={<OperationsPage/>}/>
                        <Route path="/" element={<HomePage/>}/>
                        <Route path="/contacts" element={<ContactsPage/>}/>
                        <Route path="/chat" element={<MyMessages/>}/>
                    </Routes>
                </Router>
            </ThemeProvider>
        </HelmetProvider>
    );
};

export default App;
