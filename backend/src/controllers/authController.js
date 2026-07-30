import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/db.js';

export async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields (name, email, password, role) are required' });
    }

    const allowedRoles = ['student', 'instructor', 'recruiter', 'admin'];
    if (!allowedRoles.includes(role.toLowerCase())) {
      return res.status(400).json({ message: `Role must be one of: ${allowedRoles.join(', ')}` });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email address is already registered' });
    }

    const user = await User.create({ name, email, password, role });

    // Instantly return the user and access token for seamless onboarding UX
    const token = generateToken(user);

    res.status(201).json({
      message: 'Registration successful! Verification email has been simulated.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified,
        verification_token: user.verification_token
      },
      token
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: 'Login successful!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified
      },
      token
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyEmail(req, res, next) {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    const success = await User.verifyEmail(token);
    if (!success) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    res.status(200).json({ message: 'Email verified successfully!' });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      // Security best practice: Do not disclose whether the email exists, but we can return success with simulated message
      return res.status(200).json({ message: 'If that email exists, a password reset link has been sent!' });
    }

    const resetToken = uuidv4();
    await User.setResetToken(email, resetToken);

    res.status(200).json({
      message: 'Password reset token has been generated successfully.',
      reset_token: resetToken // Exposing in JSON for effortless client-side simulation
    });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    const success = await User.resetPassword(token, password);
    if (!success) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    res.status(200).json({ message: 'Password has been reset successfully!' });
  } catch (err) {
    next(err);
  }
}

export async function googleLogin(req, res, next) {
  try {
    const { email, name, role, google_id } = req.body;
    if (!email || !name) {
      return res.status(400).json({ message: 'Google authentication fields missing' });
    }

    let user = await User.findByEmail(email);
    if (!user) {
      // Create new federated user
      const assignedRole = role || 'student';
      // Mock random password for OAuth signup
      const randomPassword = uuidv4();
      user = await User.create({ name, email, password: randomPassword, role: assignedRole });

      // Auto-verify OAuth accounts
      const sqlUpdate = 'UPDATE users SET is_verified = 1 WHERE id = ?';
      await db.run(sqlUpdate, [user.id]);
      user.is_verified = 1;
    }

    const token = generateToken(user);

    res.status(200).json({
      message: 'Google Sign-In successful!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified
      },
      token
    });
  } catch (err) {
    next(err);
  }
}

export async function getCurrentUser(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const profile = await User.getProfile(user.id, user.role);

    res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified
      },
      profile
    });
  } catch (err) {
    next(err);
  }
}
