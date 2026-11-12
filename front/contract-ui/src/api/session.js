const SESSION_KEYS = ["accessToken", "refreshToken", "userEmail", "userName"];

export const clearSession = () => {
  SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
};
