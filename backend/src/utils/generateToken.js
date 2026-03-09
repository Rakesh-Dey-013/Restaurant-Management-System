import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });

    // Set JWT as HTTP-only cookie
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000, // Convert days to milliseconds
    });

    return token;
};

export default generateToken;