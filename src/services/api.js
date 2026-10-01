import { INITIAL_DONORS, INITIAL_REQUESTS, INITIAL_BLOOD_BANKS, INITIAL_CAMPS } from '../data/initialData';

// API base resolution: Custom URL > Environment variable > Local proxy '/api'
function getApiBase() {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('neoblood_custom_api_url');
    if (custom && custom.trim()) {
      return custom.trim().replace(/\/$/, '');
    }
  }
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
  }
  return '/api';
}

function getAuthHeader() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('neoblood_jwt_token') : null;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// -------------------------------------------------------------
// LOCAL RESILIENT STORAGE (Client-side fallback for Firebase Hosting)
// -------------------------------------------------------------
const LS_KEYS = {
  DONORS: 'neoblood_store_donors',
  REQUESTS: 'neoblood_store_requests',
  BLOOD_BANKS: 'neoblood_store_bloodbanks',
  CAMPS: 'neoblood_store_camps',
  USERS: 'neoblood_store_users'
};

if (typeof window !== 'undefined') {
  const version = 'hemosync_clean_v3';
  if (localStorage.getItem('hemosync_clean_version') !== version) {
    localStorage.removeItem('neoblood_store_donors');
    localStorage.removeItem('neoblood_store_requests');
    localStorage.removeItem('neoblood_users_v1');
    localStorage.removeItem('neoblood_requests_v1');
    localStorage.setItem('hemosync_clean_version', version);
  }
}

function getLocalStore(key, initialFallback) {
  if (typeof window === 'undefined') return initialFallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(initialFallback));
      return initialFallback;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : initialFallback;
  } catch (e) {
    return initialFallback;
  }
}

function setLocalStore(key, data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }
}

// Low-level fetch wrapper with timeout
async function safeFetchJson(url, options = {}, timeoutMs = 4000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers = {
      'Accept': 'application/json',
      ...(options.headers || {})
    };
    const res = await fetch(url, { ...options, headers, signal: controller.signal });
    clearTimeout(timeoutId);

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await res.text();
      throw new Error(`API returned non-JSON (${res.status}): ${text.slice(0, 100)}`);
    }

    const json = await res.json();
    if (!res.ok || json.success === false) {
      throw new Error(json.error || json.errors?.join(', ') || `Request failed with status ${res.status}`);
    }
    return json;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// -------------------------------------------------------------
// UNIFIED API SERVICE (Live MongoDB Atlas + Client Storage Fallback)
// -------------------------------------------------------------
export const api = {
  // Connection state tracker
  isBackendConnected: false,

  setCustomApiUrl(url) {
    if (typeof window !== 'undefined') {
      if (url && url.trim()) {
        localStorage.setItem('neoblood_custom_api_url', url.trim());
      } else {
        localStorage.removeItem('neoblood_custom_api_url');
      }
    }
  },

  getCustomApiUrl() {
    return typeof window !== 'undefined' ? localStorage.getItem('neoblood_custom_api_url') || '' : '';
  },

  // Authentication
  async register({ name, email, phone, password, bloodGroup, birthDate }) {
    const apiBase = getApiBase();
    try {
      const json = await safeFetchJson(`${apiBase}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password, bloodGroup, birthDate })
      });
      if (json.token) localStorage.setItem('neoblood_jwt_token', json.token);
      this.isBackendConnected = true;
      return json;
    } catch (err) {
      // Local fallback registration
      const users = getLocalStore(LS_KEYS.USERS, []);
      const existing = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
      if (existing) throw new Error('An account with this email already exists.');

      const newUser = {
        _id: 'user-' + Date.now(),
        id: 'user-' + Date.now(),
        name,
        email: email.toLowerCase(),
        phone,
        bloodGroup: bloodGroup || 'O+',
        birthDate: birthDate || null,
        role: 'user',
        authProviders: ['password'],
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      setLocalStore(LS_KEYS.USERS, users);
      return { success: true, user: newUser, token: 'local-token-' + Date.now() };
    }
  },

  async login({ email, password }) {
    const apiBase = getApiBase();
    try {
      const json = await safeFetchJson(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (json.token) localStorage.setItem('neoblood_jwt_token', json.token);
      this.isBackendConnected = true;
      return json;
    } catch (err) {
      // Local fallback login
      const users = getLocalStore(LS_KEYS.USERS, []);
      const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
      if (user) {
        return { success: true, user, token: 'local-token-' + Date.now() };
      }
      // Create guest session user if not present locally
      const guestUser = {
        _id: 'user-' + Date.now(),
        id: 'user-' + Date.now(),
        name: email.split('@')[0],
        email: email.toLowerCase(),
        role: 'user',
        authProviders: ['password']
      };
      users.push(guestUser);
      setLocalStore(LS_KEYS.USERS, users);
      return { success: true, user: guestUser, token: 'local-token-' + Date.now() };
    }
  },

  async googleAuth({ email, name, googleId, photoURL }) {
    const apiBase = getApiBase();
    try {
      const json = await safeFetchJson(`${apiBase}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, googleId, photoURL })
      });
      if (json.token) localStorage.setItem('neoblood_jwt_token', json.token);
      this.isBackendConnected = true;
      return json;
    } catch (err) {
      const users = getLocalStore(LS_KEYS.USERS, []);
      let user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
      if (!user) {
        user = {
          _id: googleId || 'google-' + Date.now(),
          id: googleId || 'google-' + Date.now(),
          name,
          email,
          photoURL,
          role: 'user',
          authProviders: ['google']
        };
        users.push(user);
        setLocalStore(LS_KEYS.USERS, users);
      }
      return { success: true, user };
    }
  },

  async getMe() {
    const token = localStorage.getItem('neoblood_jwt_token');
    if (!token) return null;
    const apiBase = getApiBase();
    try {
      const json = await safeFetchJson(`${apiBase}/auth/me`, {
        headers: { ...getAuthHeader() }
      }, 2500);
      this.isBackendConnected = true;
      return json.user;
    } catch (e) {
      return null;
    }
  },

  logout() {
    localStorage.removeItem('neoblood_jwt_token');
  },

  // User Profile
  async updateUserProfile(userData) {
    const apiBase = getApiBase();
    try {
      const json = await safeFetchJson(`${apiBase}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(userData)
      });
      this.isBackendConnected = true;
      return json.user;
    } catch (e) {
      const users = getLocalStore(LS_KEYS.USERS, []);
      const index = users.findIndex(u => u.email === userData.email || u.id === userData.id);
      if (index !== -1) {
        users[index] = { ...users[index], ...userData };
        setLocalStore(LS_KEYS.USERS, users);
        return users[index];
      }
      return userData;
    }
  },

  async deleteUserAccount() {
    const apiBase = getApiBase();
    try {
      await safeFetchJson(`${apiBase}/auth/account`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() }
      });
    } catch (e) {}
    localStorage.removeItem('neoblood_jwt_token');
    return { success: true };
  },

  async getAllUsers() {
    const apiBase = getApiBase();
    try {
      const json = await safeFetchJson(`${apiBase}/auth/users`, {
        headers: { ...getAuthHeader() }
      });
      this.isBackendConnected = true;
      return json.data || [];
    } catch (e) {
      return getLocalStore(LS_KEYS.USERS, []);
    }
  },

  // Donors CRUD (Collection: bloodDonors)
  async getDonors(params = {}) {
    const apiBase = getApiBase();
    const query = new URLSearchParams(params).toString();
    try {
      const json = await safeFetchJson(`${apiBase}/donors${query ? '?' + query : ''}`, {
        headers: { ...getAuthHeader() }
      }, 3500);
      if (Array.isArray(json.data)) {
        setLocalStore(LS_KEYS.DONORS, json.data);
        this.isBackendConnected = true;
        return json.data;
      }
    } catch (err) {
      // Backend not running/unreachable -> fallback to persistent local store
    }
    return getLocalStore(LS_KEYS.DONORS, INITIAL_DONORS);
  },

  async createDonor(donorData) {
    const apiBase = getApiBase();
    try {
      const json = await safeFetchJson(`${apiBase}/donors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(donorData)
      });
      this.isBackendConnected = true;
      if (json.data) {
        const donors = getLocalStore(LS_KEYS.DONORS, INITIAL_DONORS);
        setLocalStore(LS_KEYS.DONORS, [json.data, ...donors]);
        return json.data;
      }
    } catch (err) {}

    // Fallback local save
    const tempId = 'donor-' + Date.now();
    const newDonor = {
      _id: tempId,
      uid: tempId,
      ...donorData,
      isAvailable: donorData.isAvailable ?? true,
      availability: donorData.availability ?? true,
      createdAt: new Date().toISOString()
    };
    const donors = getLocalStore(LS_KEYS.DONORS, INITIAL_DONORS);
    setLocalStore(LS_KEYS.DONORS, [newDonor, ...donors]);
    return newDonor;
  },

  async updateDonor(id, updateData) {
    const apiBase = getApiBase();
    try {
      const json = await safeFetchJson(`${apiBase}/donors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(updateData)
      });
      this.isBackendConnected = true;
      if (json.data) {
        const donors = getLocalStore(LS_KEYS.DONORS, INITIAL_DONORS).map(d =>
          (d._id === id || d.uid === id) ? json.data : d
        );
        setLocalStore(LS_KEYS.DONORS, donors);
        return json.data;
      }
    } catch (err) {}

    const donors = getLocalStore(LS_KEYS.DONORS, INITIAL_DONORS);
    const updated = donors.map(d => (d._id === id || d.uid === id) ? { ...d, ...updateData } : d);
    setLocalStore(LS_KEYS.DONORS, updated);
    return updated.find(d => d._id === id || d.uid === id) || { _id: id, ...updateData };
  },

  async deleteDonor(id) {
    const apiBase = getApiBase();
    try {
      await safeFetchJson(`${apiBase}/donors/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() }
      });
      this.isBackendConnected = true;
    } catch (err) {}

    const donors = getLocalStore(LS_KEYS.DONORS, INITIAL_DONORS).filter(d => d._id !== id && d.uid !== id);
    setLocalStore(LS_KEYS.DONORS, donors);
    return { success: true };
  },

  // Requests CRUD (Collection: requests)
  async getRequests(params = {}) {
    const apiBase = getApiBase();
    const query = new URLSearchParams(params).toString();
    try {
      const json = await safeFetchJson(`${apiBase}/requests${query ? '?' + query : ''}`, {
        headers: { ...getAuthHeader() }
      }, 3500);
      if (Array.isArray(json.data)) {
        setLocalStore(LS_KEYS.REQUESTS, json.data);
        this.isBackendConnected = true;
        return json.data;
      }
    } catch (err) {}
    return getLocalStore(LS_KEYS.REQUESTS, INITIAL_REQUESTS);
  },

  async getRequestById(id) {
    const requests = await this.getRequests();
    return requests.find(r => r._id === id || r.requestId === id) || null;
  },

  async createRequest(reqData) {
    const apiBase = getApiBase();
    try {
      const json = await safeFetchJson(`${apiBase}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(reqData)
      });
      this.isBackendConnected = true;
      if (json.data) {
        const requests = getLocalStore(LS_KEYS.REQUESTS, INITIAL_REQUESTS);
        setLocalStore(LS_KEYS.REQUESTS, [json.data, ...requests]);
        return json.data;
      }
    } catch (err) {}

    const tempId = 'req-' + Date.now();
    const newReq = {
      _id: tempId,
      requestId: tempId,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      acceptedDonorId: null,
      acceptedDonorName: null,
      ...reqData
    };
    const requests = getLocalStore(LS_KEYS.REQUESTS, INITIAL_REQUESTS);
    setLocalStore(LS_KEYS.REQUESTS, [newReq, ...requests]);
    return newReq;
  },

  async updateRequest(id, updateData) {
    const apiBase = getApiBase();
    try {
      const json = await safeFetchJson(`${apiBase}/requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(updateData)
      });
      this.isBackendConnected = true;
      if (json.data) {
        const requests = getLocalStore(LS_KEYS.REQUESTS, INITIAL_REQUESTS).map(r =>
          (r._id === id || r.requestId === id) ? json.data : r
        );
        setLocalStore(LS_KEYS.REQUESTS, requests);
        return json.data;
      }
    } catch (err) {}

    const requests = getLocalStore(LS_KEYS.REQUESTS, INITIAL_REQUESTS);
    const updated = requests.map(r => (r._id === id || r.requestId === id) ? { ...r, ...updateData } : r);
    setLocalStore(LS_KEYS.REQUESTS, updated);
    return updated.find(r => r._id === id || r.requestId === id) || { _id: id, ...updateData };
  },

  async pledgeRequest(id, donorId, donorName) {
    const apiBase = getApiBase();
    try {
      const json = await safeFetchJson(`${apiBase}/requests/${id}/pledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ donorId, donorName })
      });
      this.isBackendConnected = true;
      if (json.data) {
        const requests = getLocalStore(LS_KEYS.REQUESTS, INITIAL_REQUESTS).map(r =>
          (r._id === id || r.requestId === id) ? json.data : r
        );
        setLocalStore(LS_KEYS.REQUESTS, requests);
        return json.data;
      }
    } catch (err) {}

    const requests = getLocalStore(LS_KEYS.REQUESTS, INITIAL_REQUESTS);
    const updated = requests.map(r => {
      if (r._id === id || r.requestId === id) {
        return {
          ...r,
          status: 'PLEDGED',
          acceptedDonorId: donorId,
          acceptedDonorName: donorName
        };
      }
      return r;
    });
    setLocalStore(LS_KEYS.REQUESTS, updated);
    return updated.find(r => r._id === id || r.requestId === id);
  },

  async deleteRequest(id) {
    const apiBase = getApiBase();
    try {
      await safeFetchJson(`${apiBase}/requests/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() }
      });
      this.isBackendConnected = true;
    } catch (err) {}

    const requests = getLocalStore(LS_KEYS.REQUESTS, INITIAL_REQUESTS).filter(r => r._id !== id && r.requestId !== id);
    setLocalStore(LS_KEYS.REQUESTS, requests);
    return { success: true };
  },

  // Blood Banks CRUD (Collection: bloodBanks)
  async getBloodBanks(params = {}) {
    const apiBase = getApiBase();
    const query = new URLSearchParams(params).toString();
    try {
      const json = await safeFetchJson(`${apiBase}/bloodbanks${query ? '?' + query : ''}`, {
        headers: { ...getAuthHeader() }
      }, 3500);
      if (Array.isArray(json.data) && json.data.length > 0) {
        setLocalStore(LS_KEYS.BLOOD_BANKS, json.data);
        this.isBackendConnected = true;
        return json.data;
      }
    } catch (err) {}
    return getLocalStore(LS_KEYS.BLOOD_BANKS, INITIAL_BLOOD_BANKS);
  },

  async getBloodBankById(id) {
    const banks = await this.getBloodBanks();
    return banks.find(b => b._id === id || b.id === id) || null;
  },

  async createBloodBank(bankData) {
    const apiBase = getApiBase();
    try {
      const json = await safeFetchJson(`${apiBase}/bloodbanks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(bankData)
      });
      this.isBackendConnected = true;
      if (json.data) {
        const banks = getLocalStore(LS_KEYS.BLOOD_BANKS, INITIAL_BLOOD_BANKS);
        setLocalStore(LS_KEYS.BLOOD_BANKS, [json.data, ...banks]);
        return json.data;
      }
    } catch (err) {}

    const tempId = 'bb-' + Date.now();
    const newBank = {
      _id: tempId,
      id: tempId,
      verified: true,
      createdAt: new Date().toISOString(),
      ...bankData
    };
    const banks = getLocalStore(LS_KEYS.BLOOD_BANKS, INITIAL_BLOOD_BANKS);
    setLocalStore(LS_KEYS.BLOOD_BANKS, [newBank, ...banks]);
    return newBank;
  },

  async updateBloodBank(id, updateData) {
    const apiBase = getApiBase();
    try {
      const json = await safeFetchJson(`${apiBase}/bloodbanks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(updateData)
      });
      this.isBackendConnected = true;
      if (json.data) {
        const banks = getLocalStore(LS_KEYS.BLOOD_BANKS, INITIAL_BLOOD_BANKS).map(b =>
          (b._id === id || b.id === id) ? json.data : b
        );
        setLocalStore(LS_KEYS.BLOOD_BANKS, banks);
        return json.data;
      }
    } catch (err) {}

    const banks = getLocalStore(LS_KEYS.BLOOD_BANKS, INITIAL_BLOOD_BANKS);
    const updated = banks.map(b => (b._id === id || b.id === id) ? { ...b, ...updateData } : b);
    setLocalStore(LS_KEYS.BLOOD_BANKS, updated);
    return updated.find(b => b._id === id || b.id === id) || { _id: id, ...updateData };
  },

  async updateBloodBankStock(id, { bloodGroup, units, stock }) {
    const apiBase = getApiBase();
    try {
      const json = await safeFetchJson(`${apiBase}/bloodbanks/${id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ bloodGroup, units, stock })
      });
      this.isBackendConnected = true;
      return json.data;
    } catch (err) {}

    const banks = getLocalStore(LS_KEYS.BLOOD_BANKS, INITIAL_BLOOD_BANKS);
    const updated = banks.map(b => {
      if (b._id === id || b.id === id) {
        const currentGroups = { ...(b.availableBloodGroups || {}) };
        if (bloodGroup && units !== undefined) currentGroups[bloodGroup] = units;
        if (stock) Object.assign(currentGroups, stock);
        return { ...b, availableBloodGroups: currentGroups };
      }
      return b;
    });
    setLocalStore(LS_KEYS.BLOOD_BANKS, updated);
    return updated.find(b => b._id === id || b.id === id);
  },

  async deleteBloodBank(id) {
    const apiBase = getApiBase();
    try {
      await safeFetchJson(`${apiBase}/bloodbanks/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() }
      });
      this.isBackendConnected = true;
    } catch (err) {}

    const banks = getLocalStore(LS_KEYS.BLOOD_BANKS, INITIAL_BLOOD_BANKS).filter(b => b._id !== id && b.id !== id);
    setLocalStore(LS_KEYS.BLOOD_BANKS, banks);
    return { success: true };
  },

  // Donation Camps CRUD
  async getCamps(params = {}) {
    const apiBase = getApiBase();
    const query = new URLSearchParams(params).toString();
    try {
      const json = await safeFetchJson(`${apiBase}/camps${query ? '?' + query : ''}`, {
        headers: { ...getAuthHeader() }
      }, 3500);
      if (Array.isArray(json.data) && json.data.length > 0) {
        setLocalStore(LS_KEYS.CAMPS, json.data);
        this.isBackendConnected = true;
        return json.data;
      }
    } catch (err) {}
    return getLocalStore(LS_KEYS.CAMPS, INITIAL_CAMPS);
  },

  async createCamp(campData) {
    const apiBase = getApiBase();
    try {
      const json = await safeFetchJson(`${apiBase}/camps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(campData)
      });
      this.isBackendConnected = true;
      if (json.data) {
        const camps = getLocalStore(LS_KEYS.CAMPS, INITIAL_CAMPS);
        setLocalStore(LS_KEYS.CAMPS, [json.data, ...camps]);
        return json.data;
      }
    } catch (err) {}

    const tempId = 'camp-' + Date.now();
    const newCamp = { _id: tempId, id: tempId, ...campData };
    const camps = getLocalStore(LS_KEYS.CAMPS, INITIAL_CAMPS);
    setLocalStore(LS_KEYS.CAMPS, [newCamp, ...camps]);
    return newCamp;
  },

  async registerForCamp(id) {
    const apiBase = getApiBase();
    try {
      const json = await safeFetchJson(`${apiBase}/camps/${id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
      });
      this.isBackendConnected = true;
      return json.data;
    } catch (err) {}

    const camps = getLocalStore(LS_KEYS.CAMPS, INITIAL_CAMPS);
    const updated = camps.map(c => {
      if (c._id === id || c.id === id) {
        return { ...c, registeredCount: (c.registeredCount || 0) + 1 };
      }
      return c;
    });
    setLocalStore(LS_KEYS.CAMPS, updated);
    return updated.find(c => c._id === id || c.id === id);
  },

  async deleteCamp(id) {
    const apiBase = getApiBase();
    try {
      await safeFetchJson(`${apiBase}/camps/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() }
      });
      this.isBackendConnected = true;
    } catch (err) {}

    const camps = getLocalStore(LS_KEYS.CAMPS, INITIAL_CAMPS).filter(c => c._id !== id && c.id !== id);
    setLocalStore(LS_KEYS.CAMPS, camps);
    return { success: true };
  },

  // Server & Database Health
  async getHealth() {
    const apiBase = getApiBase();
    try {
      const json = await safeFetchJson(`${apiBase}/health`, {}, 2500);
      this.isBackendConnected = true;
      return json;
    } catch (e) {
      this.isBackendConnected = false;
      return {
        status: 'fallback',
        service: 'HemoSync Client Cloud Storage',
        database: { connected: true, source: 'Client Persistent Storage' },
        timestamp: new Date().toISOString()
      };
    }
  }
};
