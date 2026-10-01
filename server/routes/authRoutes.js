import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  deleteUser,
  getAllUsers,
  getDonorByUserId
} from '../crud.js';
import { authenticateToken, JWT_SECRET } from '../middleware/auth.js';

const router = express.Router();

function createToken(user) {
  return jwt.sign(
    {
      id: String(user._id || user.id),
      email: user.email,
      role: user.role || 'user'
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function sanitizeUser(user, donorProfile = null) {
  return {
    id: String(user._id || user.id),
    name: user.name,
    email: user.email,
    phone: user.phone || null,
    bloodGroup: user.bloodGroup || null,
    birthDate: user.birthDate || null,
    role: user.role || 'user',
    authProviders: user.authProviders || ['password'],
    emailVerified: !!user.emailVerified,
    createdAt: user.createdAt,
    donorProfile: donorProfile || null
  };
}

// [REGISTER] Email + Phone + Password + Blood Group + DOB
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, bloodGroup, birthDate } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Full name must be at least 2 characters' });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ success: false, error: 'A valid email address is required' });
    }

    if (!phone || phone.replace(/\D/g, '').length < 10) {
      return res.status(400).json({ success: false, error: 'A valid phone number with at least 10 digits is required' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await findUserByEmail(normalizedEmail);
    if (existing) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await createUser({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      bloodGroup: bloodGroup ? bloodGroup.trim() : null,
      birthDate: birthDate || null,
      passwordHash,
      authProviders: ['password'],
      role: 'user',
      emailVerified: false
    });

    const token = createToken(newUser);
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: sanitizeUser(newUser)
    });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ success: false, error: 'Failed to create account. Please try again.' });
  }
});

// [LOGIN] Email + Password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await findUserByEmail(normalizedEmail);

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    if (!user.passwordHash) {
      return res.status(400).json({
        success: false,
        error: 'This account was registered using Google. Please sign in with Google.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const donorProfile = await getDonorByUserId(user._id);
    const token = createToken(user);

    res.json({
      success: true,
      message: 'Signed in successfully',
      token,
      user: sanitizeUser(user, donorProfile)
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ success: false, error: 'Authentication error. Please try again.' });
  }
});

// [GOOGLE SIGN-IN / REGISTER]
router.post('/google', async (req, res) => {
  try {
    const { email, name, googleId, photoURL } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Google verified email is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    let user = await findUserByEmail(normalizedEmail);

    if (user) {
      // Account Linking: Ensure 'google' provider is attached
      const providers = user.authProviders || [];
      const needsUpdate = !providers.includes('google') || !user.googleId;
      if (needsUpdate) {
        const updatedProviders = providers.includes('google') ? providers : [...providers, 'google'];
        user = await updateUser(user._id, {
          authProviders: updatedProviders,
          googleId: googleId || user.googleId,
          emailVerified: true
        });
      }
    } else {
      // Create fresh user via Google verified identity
      user = await createUser({
        name: name || 'Google User',
        email: normalizedEmail,
        passwordHash: null,
        authProviders: ['google'],
        googleId: googleId || null,
        role: 'user',
        emailVerified: true
      });
    }

    const donorProfile = await getDonorByUserId(user._id);
    const token = createToken(user);

    res.json({
      success: true,
      message: 'Google authentication successful',
      token,
      user: sanitizeUser(user, donorProfile)
    });
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(500).json({ success: false, error: 'Google authentication failed. Please try again.' });
  }
});

// [VERIFY SESSION / ME]
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const donorProfile = await getDonorByUserId(user._id);
    res.json({
      success: true,
      user: sanitizeUser(user, donorProfile)
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// [UPDATE USER PROFILE - CRUD]
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;
    const updateData = {};

    if (name && typeof name === 'string' && name.trim().length >= 2) {
      updateData.name = name.trim();
    }
    if (phone !== undefined) {
      updateData.phone = phone ? phone.trim() : null;
    }
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      const normalizedEmail = email.trim().toLowerCase();
      // Check if email taken by someone else
      const existing = await findUserByEmail(normalizedEmail);
      if (existing && String(existing._id || existing.id) !== String(req.user.id)) {
        return res.status(409).json({ success: false, error: 'Email already in use by another account' });
      }
      updateData.email = normalizedEmail;
    }
    if (password && password.length >= 6) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(password, salt);
    }

    const updatedUser = await updateUser(req.user.id, updateData);
    if (!updatedUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const donorProfile = await getDonorByUserId(updatedUser._id);
    res.json({
      success: true,
      message: 'Profile updated successfully in MongoDB',
      user: sanitizeUser(updatedUser, donorProfile)
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// [GET ALL USERS - Admin / Registry]
router.get('/users', async (req, res) => {
  try {
    const allUsers = await getAllUsers();
    res.json({
      success: true,
      count: allUsers.length,
      data: allUsers.map(u => sanitizeUser(u))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// [DELETE USER ACCOUNT - CRUD]
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    const result = await deleteUser(req.user.id);
    if (!result.success) {
      return res.status(404).json({ success: false, error: 'User account not found' });
    }
    res.json({ success: true, message: 'User account deleted successfully from MongoDB' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// [LOGOUT]
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
