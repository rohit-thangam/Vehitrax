export const ROLES = {
    ADMIN: 'admin',
    SECURITY: 'security'
};

export const loginUser = (username, password) => {
    if (username === 'admin' && password === 'admin') {
        const user = {
            id: 'ADM-001',
            username: 'admin',
            name: 'Rohit Admin',
            role: ROLES.ADMIN,
            designation: 'System Administrator',
            email: 'admin@vehitrax.com',
            department: 'IT & Management'
        };
        localStorage.setItem('currentUser', JSON.stringify(user));
        return { success: true, user };
    }

    if (username === 'security' && password === 'security') {
        const user = {
            id: 'SEC-8472',
            username: 'security',
            name: 'Ramesh Singh',
            role: ROLES.SECURITY,
            designation: 'Gate Security',
            email: 'gate1@vehitrax.com',
            department: 'Operations'
        };
        localStorage.setItem('currentUser', JSON.stringify(user));
        return { success: true, user };
    }

    return { success: false, message: 'Invalid credentials' };
};

export const logoutUser = () => {
    localStorage.removeItem('currentUser');
};

export const getCurrentUser = () => {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
};
