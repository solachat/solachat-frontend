export interface UserProfile {
    username: string;
    realname: string;
    email: string;
    password: string;
    confirmPassword: string;
    persistent: boolean;
    role: string;
    shareEmail: boolean;
    country: string;
    shareCountry: boolean;
    timezone: string;
    shareTimezone: boolean;
    lastlogin: string;
    rating: number;
    wallet?: string;
}


export const mockProfileData: UserProfile = {
    username: 'johndoe',
    realname: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password',
    confirmPassword: 'password',
    persistent: false,
    role: 'Frontend Developer',
    shareEmail: true,
    country: 'US',
    shareCountry: true,
    timezone: '1',
    shareTimezone: true,
    lastlogin: '2024-06-08T14:30:00Z',
    rating: 4.9,
    wallet: '0x1234567890abcdef'
};

const mockDatabase: { [key: string]: UserProfile } = {};

export const register = async (userData: UserProfile): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (userData.password !== userData.confirmPassword) {
            return reject(new Error('Passwords do not match'));
        }

        if (mockDatabase[userData.email]) {
            return reject(new Error('User already exists'));
        }

        mockDatabase[userData.email] = userData;

        const token = btoa(JSON.stringify({email: userData.email}));

        localStorage.setItem('token', token);
        localStorage.setItem('profile', JSON.stringify(userData));

        resolve(token);
    });
};

export const login = async (email: string, password: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const user = mockDatabase[email];
        if (!user || user.password !== password) {
            return reject(new Error('Invalid credentials'));
        }

        const token = btoa(JSON.stringify({email: user.email}));

        localStorage.setItem('token', token);
        localStorage.setItem('profile', JSON.stringify(user));

        resolve(token);
    });
};

export const getProfile = async (): Promise<UserProfile | null> => {
    return new Promise((resolve) => {
        const profile = localStorage.getItem('profile');
        if (!profile) {
            resolve(null);
        } else {
            resolve(JSON.parse(profile));
        }
    });
};