export const generateRandomCode = (length: number = 6): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}; 