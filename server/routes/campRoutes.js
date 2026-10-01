import express from 'express';
import {
  createCamp,
  getCamps,
  getCampById,
  updateCamp,
  registerForCamp,
  deleteCamp
} from '../crud.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const camps = await getCamps(req.query);
    res.json({ success: true, count: camps.length, data: camps });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const camp = await getCampById(req.params.id);
    if (!camp) return res.status(404).json({ success: false, error: 'Camp not found' });
    res.json({ success: true, data: camp });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const camp = await createCamp(req.body);
    res.status(201).json({ success: true, data: camp });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updated = await updateCamp(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Camp not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/:id/register', async (req, res) => {
  try {
    const updated = await registerForCamp(req.params.id);
    if (!updated) return res.status(404).json({ success: false, error: 'Camp not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await deleteCamp(req.params.id);
    if (!result.success) return res.status(404).json({ success: false, error: 'Camp not found' });
    res.json({ success: true, message: 'Camp removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
