
export const valdateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
    }


export const isEmpty = (value) => {
    return !value || value.trim() === "";
};

export const isValidPhone = (phone) => {
    return /^[0-9]{7,15}$/.test(phone);
};

export const minLength = (value, len) => {
    return value && value.trim().length >= len;
};

export const validateFields = (fields) => {
    const errors = {};

    for (const key in fields) {
        if (!fields[key]) {
            errors[key] = `${key} is required`;
        }
    }

    return errors;
};