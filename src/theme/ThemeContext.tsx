import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';

interface ThemeProviderProps {
    children: ReactNode;
}

const ThemeContext = createContext({
    darkMode: false,
    toggleTheme: () => {
    },
});

export const ThemeProvider: React.FC<ThemeProviderProps> = ({children}) => {
    const [darkMode, setDarkMode] = useState(() => {
        return Boolean(localStorage.getItem('darkMode') || 'false');
    });

    useEffect(() => {
        localStorage.setItem('darkMode', darkMode.toString());
    }, [darkMode]);

    const toggleTheme = () => {
        setDarkMode(!darkMode);
    };

    return (
        <ThemeContext.Provider value={{darkMode, toggleTheme}}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
