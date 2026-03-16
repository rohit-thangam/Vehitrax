export const ROLES = {
    ADMIN: 'admin',
    SECURITY: 'security'
};

export const loginUser = (username, password) => {
    if (username === 'admin' && password === 'admin') {
        const user = {
            name: 'Admin User',
            role: ROLES.ADMIN,
            designation: 'System Administrator'
        };
        localStorage.setItem('currentUser', JSON.stringify(user));
        return { success: true, user };
    }

    if (username === 'security' && password === 'security') {
        const user = {
            name: 'Security Guard',
            role: ROLES.SECURITY,
            designation: 'Gate Security'
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
