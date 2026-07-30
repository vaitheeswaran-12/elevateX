import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export class User {
  static async findByEmail(email) {
    try {
      const sql = 'SELECT * FROM users WHERE email = ?';
      const user = await db.get(sql, [email.toLowerCase().trim()]);
      return user || null;
    } catch (err) {
      console.error('Error finding user by email:', err);
      throw err;
    }
  }

  static async findById(id) {
    try {
      const sql = 'SELECT * FROM users WHERE id = ?';
      const user = await db.get(sql, [id]);
      return user || null;
    } catch (err) {
      console.error('Error finding user by ID:', err);
      throw err;
    }
  }

  static async create({ name, email, password, role }) {
    try {
      const id = uuidv4();
      const passwordHash = await bcrypt.hash(password, 10);
      const verificationToken = uuidv4(); // standard verification token simulation

      const sqlUser = `
        INSERT INTO users (id, name, email, password_hash, role, is_verified, verification_token)
        VALUES (?, ?, ?, ?, ?, 0, ?)
      `;
      await db.run(sqlUser, [
        id,
        name,
        email.toLowerCase().trim(),
        passwordHash,
        role.toLowerCase(),
        verificationToken
      ]);

      // Create empty profile or company profile depending on role
      if (role === 'recruiter') {
        const sqlCompany = `
          INSERT INTO company_profiles (id, user_id, company_name, about, location)
          VALUES (?, ?, ?, '', '')
        `;
        await db.run(sqlCompany, [uuidv4(), id, `${name}'s Company`]);
      } else {
        const sqlProfile = `
          INSERT INTO profiles (id, user_id, about, skills, education, experience, projects)
          VALUES (?, ?, '', '[]', '[]', '[]', '[]')
        `;
        await db.run(sqlProfile, [uuidv4(), id]);
      }

      return { id, name, email, role, is_verified: 0, verification_token: verificationToken };
    } catch (err) {
      console.error('Error creating user:', err);
      throw err;
    }
  }

  static async verifyEmail(token) {
    try {
      const sqlFind = 'SELECT * FROM users WHERE verification_token = ?';
      const user = await db.get(sqlFind, [token]);
      if (!user) return false;

      const sqlUpdate = 'UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?';
      await db.run(sqlUpdate, [user.id]);
      return true;
    } catch (err) {
      console.error('Error verifying email:', err);
      throw err;
    }
  }

  static async setResetToken(email, token) {
    try {
      const sql = 'UPDATE users SET reset_token = ? WHERE email = ?';
      const result = await db.run(sql, [token, email.toLowerCase().trim()]);
      return result.changes > 0;
    } catch (err) {
      console.error('Error setting reset token:', err);
      throw err;
    }
  }

  static async resetPassword(token, newPassword) {
    try {
      const sqlFind = 'SELECT * FROM users WHERE reset_token = ?';
      const user = await db.get(sqlFind, [token]);
      if (!user) return false;

      const newHash = await bcrypt.hash(newPassword, 10);
      const sqlUpdate = 'UPDATE users SET password_hash = ?, reset_token = NULL WHERE id = ?';
      await db.run(sqlUpdate, [newHash, user.id]);
      return true;
    } catch (err) {
      console.error('Error resetting password:', err);
      throw err;
    }
  }

  static async getProfile(userId, role) {
    try {
      if (role === 'recruiter') {
        const sql = 'SELECT * FROM company_profiles WHERE user_id = ?';
        return await db.get(sql, [userId]) || null;
      } else {
        const sql = 'SELECT * FROM profiles WHERE user_id = ?';
        return await db.get(sql, [userId]) || null;
      }
    } catch (err) {
      console.error('Error getting user profile:', err);
      throw err;
    }
  }
}
