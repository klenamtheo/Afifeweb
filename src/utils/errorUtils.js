/**
 * Maps Firebase Auth error codes to user-friendly messages.
 * @param {object|string} error - The error object or error code string.
 * @returns {string} A user-friendly error message.
 */
export const getAuthErrorMessage = (error) => {
    const code = typeof error === 'string' ? error : error?.code;

    switch (code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            return "Incorrect email or password.";
        case 'auth/email-already-in-use':
            return "This email is already registered.";
        case 'auth/weak-password':
            return "Password is too weak. It should be at least 6 characters.";
        case 'auth/too-many-requests':
            return "Too many failed attempts. Please try again later.";
        case 'auth/network-request-failed':
            return "Network error. Please check your internet connection.";
        case 'auth/invalid-email':
            return "Please enter a valid email address.";
        case 'auth/operation-not-allowed':
            return "This operation is currently disabled. Contact support.";
        case 'auth/requires-recent-login':
            return "Please log in again to verify your identity.";
        default:
            return error?.message || "An unexpected error occurred. Please try again.";
    }
};
