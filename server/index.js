import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import donorRoutes from './routes/donorRoutes.js';
import bloodBankRoutes from './routes/bloodBankRoutes.js';
import campRoutes from './routes/campRoutes.js';
import { getDatabaseStatus, loadEnvConfig } from './db.js';
import {
  createRequest,
  getRequests,
  getRequestById,
  updateRequest,
  pledgeRequest,
  deleteRequest
} from './crud.js';

loadEnvConfig();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const VALID_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function validateRequestPayload(data) {
  const errors = [];
  if (!data.patientName || typeof data.patientName !== 'string' || data.patientName.trim().length < 2) {
    errors.push('Patient name is required (minimum 2 characters)');
  }
  if (!data.bloodGroup || !VALID_BLOOD_GROUPS.includes(data.bloodGroup.toUpperCase())) {
    errors.push(`Blood group must be one of: ${VALID_BLOOD_GROUPS.join(', ')}`);
  }
  if (!data.hospitalName || typeof data.hospitalName !== 'string' || data.hospitalName.trim().length < 2) {
    errors.push('Hospital name is required');
  }
  if (!data.city || typeof data.city !== 'string') {
    errors.push('City/District is required');
  }
  const rawMobile = data.mobile || data.phone || '';
  const digits = String(rawMobile).replace(/\D/g, '');
  if (!digits || digits.length < 10) {
    errors.push('Valid 10-digit contact mobile number is required');
  }
  const units = parseInt(data.unitsRequired || data.units);
  if (isNaN(units) || units < 1 || units > 20) {
    errors.push('Units required must be between 1 and 20');
  }
  return errors;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'HemoSync MongoDB API',
    database: getDatabaseStatus(),
    timestamp: new Date().toISOString()
  });
});

/* ==========================================================================
   AUTHENTICATION ROUTES (/api/auth)
   ========================================================================== */
app.use('/api/auth', authRoutes);

/* ==========================================================================
   BLOOD DONORS ROUTES (/api/donors)
   ========================================================================== */
app.use('/api/donors', donorRoutes);

/* ==========================================================================
   BLOOD BANKS ROUTES (/api/bloodbanks)
   ========================================================================== */
app.use('/api/bloodbanks', bloodBankRoutes);

/* ==========================================================================
   BLOOD CAMPS ROUTES (/api/camps)
   ========================================================================== */
app.use('/api/camps', campRoutes);


/* ==========================================================================
   BLOOD REQUESTS ENDPOINTS (/api/requests)
   ========================================================================== */

// [CREATE] Post a new blood request
app.post('/api/requests', async (req, res) => {
  try {
    const errors = validateRequestPayload(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const request = await createRequest({
      ...req.body,
      bloodGroup: req.body.bloodGroup.toUpperCase()
    });
    res.status(201).json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// [READ] Get blood requests with filters
app.get('/api/requests', async (req, res) => {
  try {
    const requests = await getRequests(req.query);
    res.json({ success: true, count: requests.length, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// [READ] Single request by id
app.get('/api/requests/:id', async (req, res) => {
  try {
    const request = await getRequestById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }
    res.json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// [UPDATE] Update request
app.put('/api/requests/:id', async (req, res) => {
  try {
    const updated = await updateRequest(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// [UPDATE] Pledge donation to request
app.post('/api/requests/:id/pledge', async (req, res) => {
  try {
    const { donorId, donorName } = req.body;
    if (!donorId || !donorName) {
      return res.status(400).json({ success: false, error: 'donorId and donorName are required' });
    }

    const updated = await pledgeRequest(req.params.id, donorId, donorName);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// [DELETE] Remove request
app.delete('/api/requests/:id', async (req, res) => {
  try {
    const result = await deleteRequest(req.params.id);
    if (!result.success) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }
    res.json({ success: true, message: 'Request removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Global 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Start Express Server
if (process.env.NODE_ENV !== 'production' || !process.env.FUNCTION_NAME) {
  app.listen(PORT, () => {
    console.log(`HemoSync Backend API server running on http://localhost:${PORT}`);
  });
}

export default app;
export { app };
