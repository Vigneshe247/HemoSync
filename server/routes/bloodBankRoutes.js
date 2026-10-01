import express from 'express';
import {
  createBloodBank,
  getBloodBanks,
  getBloodBankById,
  updateBloodBank,
  updateBloodBankStock,
  deleteBloodBank
} from '../crud.js';

const router = express.Router();
const VALID_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function validateBloodBankPayload(data) {
  const errors = [];
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push('Blood Bank / Hospital name is required');
  }
  if (!data.city || typeof data.city !== 'string') {
    errors.push('City / District is required');
  }
  if (!data.contact && !data.phone) {
    errors.push('Emergency contact phone number is required');
  }
  return errors;
}

// [READ] Get blood banks with filters (search, city, state, bloodGroup)
router.get('/', async (req, res) => {
  try {
    const banks = await getBloodBanks(req.query);
    res.json({ success: true, count: banks.length, data: banks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// [READ] Get single blood bank by ID
router.get('/:id', async (req, res) => {
  try {
    const bank = await getBloodBankById(req.params.id);
    if (!bank) {
      return res.status(404).json({ success: false, error: 'Blood bank not found' });
    }
    res.json({ success: true, data: bank });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// [CREATE] Add new blood bank
router.post('/', async (req, res) => {
  try {
    const errors = validateBloodBankPayload(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const bank = await createBloodBank(req.body);
    res.status(201).json({ success: true, data: bank });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// [UPDATE] Update blood bank details or full stock
router.put('/:id', async (req, res) => {
  try {
    const updated = await updateBloodBank(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Blood bank not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// [UPDATE - SPECIALIZED] Update stock for a blood bank
router.patch('/:id/stock', async (req, res) => {
  try {
    const { bloodGroup, units, stock } = req.body;
    let updates = {};

    if (stock && typeof stock === 'object') {
      updates = stock;
    } else if (bloodGroup && units !== undefined) {
      const bg = bloodGroup.toUpperCase();
      if (!VALID_BLOOD_GROUPS.includes(bg)) {
        return res.status(400).json({ success: false, error: 'Invalid blood group' });
      }
      updates[bg] = Math.max(0, parseInt(units) || 0);
    } else {
      return res.status(400).json({ success: false, error: 'Provide stock object or bloodGroup and units' });
    }

    const updated = await updateBloodBankStock(req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Blood bank not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// [DELETE] Remove blood bank
router.delete('/:id', async (req, res) => {
  try {
    const result = await deleteBloodBank(req.params.id);
    if (!result.success) {
      return res.status(404).json({ success: false, error: 'Blood bank not found' });
    }
    res.json({ success: true, message: 'Blood bank removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
