import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ascendiq_super_secret_jwt_key_2026';

export function generateToken(user) {
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}
