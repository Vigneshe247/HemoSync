import express from 'express';
import {
  createDonor,
  getDonors,
  getDonorById,
  getDonorByUserId,
  updateDonor,
  deleteDonor
} from '../crud.js';

const router = express.Router();
const VALID_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function validateDonorPayload(data) {
  const errors = [];
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push('Name is required and must be at least 2 characters');
  }
  if (!data.bloodGroup || !VALID_BLOOD_GROUPS.includes(data.bloodGroup.toUpperCase())) {
    errors.push(`Blood group must be one of: ${VALID_BLOOD_GROUPS.join(', ')}`);
  }
  if (!data.phone || data.phone.replace(/\D/g, '').length < 10) {
    errors.push('Valid phone number with at least 10 digits is required');
  }
  if (!data.city || typeof data.city !== 'string') {
    errors.push('City/District is required');
  }
  return errors;
}

// [READ] Get blood donors with query filters
router.get('/', async (req, res) => {
  try {
    const donors = await getDonors(req.query);
    res.json({ success: true, count: donors.length, data: donors });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// [READ] Get donor profile by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const donor = await getDonorByUserId(req.params.userId);
    if (!donor) {
      return res.status(404).json({ success: false, error: 'Donor profile not found for this user' });
    }
    res.json({ success: true, data: donor });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// [READ] Get donor by ID
router.get('/:id', async (req, res) => {
  try {
    const donor = await getDonorById(req.params.id);
    if (!donor) {
      return res.status(404).json({ success: false, error: 'Donor profile not found' });
    }
    res.json({ success: true, data: donor });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// [CREATE] Register a new donor in bloodDonors collection
router.post('/', async (req, res) => {
  try {
    const errors = validateDonorPayload(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    // Check if donor profile already exists for this userId
    if (req.body.userId) {
      const existing = await getDonorByUserId(req.body.userId);
      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'A donor profile already exists for this account.'
        });
      }
    }

    const donor = await createDonor({
      ...req.body,
      bloodGroup: req.body.bloodGroup.toUpperCase()
    });
    res.status(201).json({ success: true, data: donor });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// [UPDATE] Update donor profile (e.g. toggle availability, update phone)
router.put('/:id', async (req, res) => {
  try {
    const updated = await updateDonor(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Donor not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// [DELETE] Remove donor record
router.delete('/:id', async (req, res) => {
  try {
    const result = await deleteDonor(req.params.id);
    if (!result.success) {
      return res.status(404).json({ success: false, error: 'Donor not found' });
    }
    res.json({ success: true, message: 'Donor removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
