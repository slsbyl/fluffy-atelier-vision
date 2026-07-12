import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';
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
            // To prevent user enumeration, we send a generic success message.
            return res.json({ status: 'success', message: 'If an account with that email exists, a password reset link has been sent.' });
        }
        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        const resetURL = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
        
        // --- Send Email via Resend ---
        try {
            if (!process.env.RESEND_API_KEY) {
                throw new Error('Resend API key is not configured on the server.');
            }
            const resend = new Resend(process.env.RESEND_API_KEY);

            const emailHtml = `
              <div dir="rtl" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #fdfcff; color: #555; max-width: 600px; margin: 20px auto; border: 1px solid #fdeef5; border-radius: 12px; overflow: hidden;">
                <div style="background-color: #fdeef5; padding: 25px; text-align: center;">
                  <h1 style="margin: 0; color: #c77da7; font-weight: 500; letter-spacing: 2px; font-size: 24px;">FLUFFY</h1>
                </div>
                <div style="padding: 30px 35px;">
                  <h2 style="margin-top: 0; color: #333; font-size: 20px; font-weight: 600;">طلب إعادة تعيين كلمة المرور</h2>
                  <p style="font-size: 15px; line-height: 1.7;">مرحباً ${user.name},</p>
                  <p style="font-size: 15px; line-height: 1.7;">لقد تلقينا طلبًا لإعادة تعيين كلمة المرور لحسابك. اضغط على الزر أدناه لإعادة تعيينها. هذا الرابط صالح لمدة 10 دقائق فقط.</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetURL}" target="_blank" style="background-color: #c77da7; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 14px; display: inline-block;">إعادة تعيين كلمة المرور</a>
                  </div>
                  <p style="font-size: 15px; line-height: 1.7;">إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد الإلكتروني بأمان.</p>
                </div>
                <div style="background-color: #f8f9fa; color: #999; text-align: center; padding: 20px; font-size: 12px; border-top: 1px solid #fdeef5;">
                  <p style="margin: 0;">&copy; ${new Date().getFullYear()} Fluffy Store. جميع الحقوق محفوظة.</p>
                </div>
              </div>
            `;

            await resend.emails.send({
                from: 'Fluffy Store <onboarding@resend.dev>',
                to: user.email,
                subject: 'إعادة تعيين كلمة المرور الخاصة بك في Fluffy',
                html: emailHtml,
            });

            res.json({ status: 'success', message: 'Token sent to email!' });
        } catch (err) {
            console.error("Failed to send password reset email:", err);
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ status: 'error', message: 'There was an error sending the email. Try again later!' });
        }
    } catch (err) {
        console.error("Forgot password main error:", err);
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