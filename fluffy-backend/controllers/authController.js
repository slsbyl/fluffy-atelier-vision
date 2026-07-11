import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'node:crypto';

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'a-very-long-and-secure-secret-for-dev', { expiresIn: process.env.JWT_EXPIRES_IN || '90d' });
};

export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const newUser = await User.create({ name, email, password, role });
    const token = signToken(newUser._id);
    newUser.password = undefined;
    res.status(201).json({ status: 'success', token, data: { user: newUser } });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Please provide email and password' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({ status: 'error', message: 'Incorrect email or password' });
    }
    const token = signToken(user._id);
    user.password = undefined;
    res.json({ status: 'success', token, data: { user } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Login failed' });
  }
};

export const forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.json({ status: 'success', message: 'If user exists, a token has been sent.' });
        }
        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        const resetURL = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
        
        const message = `Forgot your password? Click the link to reset: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_APP_PASSWORD }
            });
            await transporter.sendMail({
                from: 'Fluffy Store <no-reply@fluffy.com>',
                to: user.email,
                subject: 'Your password reset token (valid for 10 min)',
                text: message,
            });
            res.json({ status: 'success', message: 'Token sent to email!' });
        } catch (err) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ status: 'error', message: 'There was an error sending the email. Try again later!' });
        }
    } catch (err) {
        res.status(500).json({ status: 'error', message: 'Something went wrong' });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });

        if (!user) {
            return res.status(400).json({ status: 'error', message: 'Token is invalid or has expired' });
        }
        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        const token = signToken(user._id);
        res.json({ status: 'success', token });
    } catch (err) {
        res.status(500).json({ status: 'error', message: 'Something went wrong' });
    }
};