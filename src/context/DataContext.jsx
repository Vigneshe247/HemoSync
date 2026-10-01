import React, { createContext, useContext, useState, useEffect } from 'react';

const REQUESTS_STORAGE_KEY = 'neoblood_requests_v1';

const DEFAULT_BLOOD_BANKS = [
  {
    id: 'bb-1',
    name: 'City General Central Blood Bank',
    address: '123 Medical Parkway, Downtown',
    city: 'New York',
    contact: '(555) 019-2831',
    operatingHours: '24/7 Emergency Service',
    distanceKm: 2.4,
    availableBloodGroups: { 'A+': 18, 'A-': 4, 'B+': 14, 'B-': 3, 'AB+': 8, 'AB-': 2, 'O+': 28, 'O-': 6 }
  },
  {
    id: 'bb-2',
    name: 'Red Cross Regional Center',
    address: '456 Healthcare Blvd, North District',
    city: 'New York',
    contact: '(555) 028-4920',
    operatingHours: 'Mon-Sat: 8:00 AM - 9:00 PM',
    distanceKm: 5.1,
    availableBloodGroups: { 'A+': 32, 'A-': 9, 'B+': 22, 'B-': 6, 'AB+': 12, 'AB-': 4, 'O+': 45, 'O-': 12 }
  },
  {
    id: 'bb-3',
    name: 'Metro Care Community Blood Hub',
    address: '789 Westside Avenue, Suite 100',
    city: 'Los Angeles',
    contact: '(555) 039-1122',
    operatingHours: '24/7 Emergency Service',
    distanceKm: 3.8,
    availableBloodGroups: { 'A+': 12, 'A-': 2, 'B+': 8, 'B-': 1, 'AB+': 5, 'AB-': 1, 'O+': 15, 'O-': 2 }
  },
  {
    id: 'bb-4',
    name: 'St. Jude Blood & Platelet Center',
    address: '320 Hope Street, Medical District',
    city: 'Chicago',
    contact: '(555) 048-5566',
    operatingHours: 'Mon-Sun: 7:00 AM - 10:00 PM',
    distanceKm: 4.2,
    availableBloodGroups: { 'A+': 20, 'A-': 5, 'B+': 16, 'B-': 4, 'AB+': 7, 'AB-': 2, 'O+': 30, 'O-': 7 }
  }
];

const DEFAULT_REQUESTS = [];

const DEFAULT_CAMPS = [
  {
    id: 'camp-1',
    title: 'City Hall Community Life Drive',
    location: 'Metropolitan Civic Center Plaza',
    city: 'New York',
    date: '2026-10-05',
    time: '09:00 AM - 04:00 PM',
    organizer: 'Red Cross & City Health Dept',
    registeredCount: 84
  },
  {
    id: 'camp-2',
    title: 'University Campus Youth Blood Camp',
    location: 'Student Union Pavilion, Gate 4',
    city: 'Los Angeles',
    date: '2026-10-12',
    time: '10:00 AM - 05:00 PM',
    organizer: 'Rotary Club International',
    registeredCount: 120
  },
  {
    id: 'camp-3',
    title: 'Corporate Park Lifesaver Weekend',
    location: 'Tech Valley Atrium, 500 Silicon Way',
    city: 'Chicago',
    date: '2026-10-18',
    time: '08:30 AM - 03:30 PM',
    organizer: 'HemoSync Alliance',
    registeredCount: 65
  }
];

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [bloodRequests, setBloodRequests] = useState(() => {
    const saved = localStorage.getItem(REQUESTS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing requests', e);
      }
    }
    localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(DEFAULT_REQUESTS));
    return DEFAULT_REQUESTS;
  });

  const [bloodBanks] = useState(DEFAULT_BLOOD_BANKS);
  const [camps, setCamps] = useState(DEFAULT_CAMPS);

  useEffect(() => {
    localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(bloodRequests));
  }, [bloodRequests]);

  const addRequest = (newReq) => {
    const requestItem = {
      ...newReq,
      id: 'req-' + Math.random().toString(36).substring(2, 9),
      status: 'pending',
      pledgesCount: 0,
      pledgedByIds: [],
      createdAt: new Date().toISOString()
    };
    setBloodRequests((prev) => [requestItem, ...prev]);
    return requestItem;
  };

  const pledgeDonation = (requestId, userId) => {
    setBloodRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          // Prevent duplicate pledges from the same user
          const alreadyPledged = (req.pledgedByIds || []).includes(userId);
          if (alreadyPledged) return req;
          return {
            ...req,
            pledgesCount: req.pledgesCount + 1,
            pledgedByIds: [...(req.pledgedByIds || []), userId]
          };
        }
        return req;
      })
    );
  };

  const deleteRequest = (requestId) => {
    setBloodRequests((prev) => prev.filter((req) => req.id !== requestId));
  };

  const hasPledged = (requestId, userId) => {
    const req = bloodRequests.find((r) => r.id === requestId);
    return req ? (req.pledgedByIds || []).includes(userId) : false;
  };

  const fulfillRequest = (requestId) => {
    setBloodRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          return { ...req, status: req.status === 'fulfilled' ? 'pending' : 'fulfilled' };
        }
        return req;
      })
    );
  };

  const registerForCamp = (campId) => {
    setCamps((prev) =>
      prev.map((c) => {
        if (c.id === campId) {
          return { ...c, registeredCount: c.registeredCount + 1 };
        }
        return c;
      })
    );
  };

  return (
    <DataContext.Provider
      value={{
        bloodRequests,
        bloodBanks,
        camps,
        addRequest,
        pledgeDonation,
        fulfillRequest,
        registerForCamp,
        deleteRequest,
        hasPledged
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
