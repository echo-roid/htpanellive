const TOKEN_KEY = 'travel_guide_token';
const GUIDE_KEY = 'travel_guide_info';

export const saveGuideAuth = (token, guide) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(GUIDE_KEY, JSON.stringify(guide));
};

export const getGuideToken = () => localStorage.getItem(TOKEN_KEY);

export const getGuideInfo = () => {
    const raw = localStorage.getItem(GUIDE_KEY);
    return raw ? JSON.parse(raw) : null;
};

export const clearGuideAuth = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(GUIDE_KEY);
};

export const isGuideLoggedIn = () => !!getGuideToken();

// Axios auth header helper
export const guideAuthHeader = () => {
    const token = getGuideToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};