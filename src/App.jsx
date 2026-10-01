import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Navbar from './components/Navbar';
import AnnouncementBanner from './components/AnnouncementBanner';
import HomeTab from './components/HomeTab';

import AboutTab from './components/AboutTab';
import DashboardTab from './components/DashboardTab';
import CreateRequestTab from './components/CreateRequestTab';
import MapTab from './components/MapTab';
import AuthModal from './components/AuthModal';
import OnboardingModal from './components/OnboardingModal';
import Toast from './components/Toast';
import Footer from './components/Footer';
import { api } from './services/api';
import { INITIAL_HOSPITALS } from './data/initialData';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  // Active user session (User Account from MongoDB Atlas)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('neoblood_session_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Data stored in MongoDB database
  const [donors, setDonors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [bloodBanks, setBloodBanks] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [dbError, setDbError] = useState(false);

  // In-memory notifications and toasts
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);

  // Modals state: Distinct AuthModal vs DonorModal
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' or 'register'
  const [isDonorModalOpen, setIsDonorModalOpen] = useState(false);

  // Toast Helper
  const addToast = (title, message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const handleDismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Notification management handlers
  const handleMarkNotifRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearAllNotifs = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Synchronize targeted notifications whenever requests or currentUser update
  useEffect(() => {
    if (!requests || requests.length === 0) return;
    const myId = currentUser?.id || currentUser?._id || currentUser?.donorProfile?._id || currentUser?.donorProfile?.uid;
    const myName = currentUser?.name?.toLowerCase().trim();
    const myEmail = currentUser?.email?.toLowerCase().trim();

    const loadedNotifs = [];
    requests.forEach(r => {
      // Check if targeted to specific pointed-out donor(s)
      const hasTargets = r.isTargeted || (r.targetDonorIds && r.targetDonorIds.length > 0) || (r.targetDonorNames && r.targetDonorNames.length > 0);
      if (!hasTargets) return;
      if (r.status !== 'OPEN' && r.status !== 'PLEDGED') return;

      // If user is logged in, verify if user is one of the targeted donors; if no user or demoing, show targeted requests so user can test the notification bell immediately
      const isTargetedToMe = !currentUser || (
        (myId && r.targetDonorIds && r.targetDonorIds.some(id => String(id) === String(myId))) ||
        (myName && r.targetDonorNames && r.targetDonorNames.some(n => n?.toLowerCase().trim() === myName)) ||
        (myEmail && r.targetDonorEmails && r.targetDonorEmails.some(e => e?.toLowerCase().trim() === myEmail)) ||
        (currentUser.role === 'donor')
      );

      if (isTargetedToMe) {
        loadedNotifs.push({
          id: 'req-notif-' + (r._id || r.requestId),
          requestId: r._id || r.requestId,
          type: 'targeted_request',
          title: `🚨 Direct Request for ${r.targetDonorNames?.join(', ') || 'Pointed Donor'}`,
          patientName: r.patientName,
          bloodGroup: r.bloodGroup,
          unitsRequired: r.unitsRequired,
          hospitalName: r.hospitalName,
          city: r.city,
          mobile: r.mobile,
          emergencyLevel: r.emergencyLevel,
          targetDonorNames: r.targetDonorNames,
          message: `Patient ${r.patientName} urgently needs ${r.unitsRequired} unit(s) of ${r.bloodGroup} at ${r.hospitalName}, ${r.city}.`,
          request: r,
          read: r.status === 'PLEDGED',
          createdAt: r.createdAt ? new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'
        });
      }
    });

    if (loadedNotifs.length > 0) {
      setNotifications(prev => {
        const existingReqIds = new Set(prev.map(n => n.requestId || n.id));
        const newItems = loadedNotifs.filter(n => !existingReqIds.has(n.requestId || n.id));
        return [...newItems, ...prev];
      });
    }
  }, [requests, currentUser]);

  // Load data seamlessly (Live MongoDB backend if connected, or persistent cloud storage)
  const loadDatabaseData = async (isBackgroundSync = false) => {
    if (!isBackgroundSync) setLoadingData(true);
    try {
      const [fetchedDonors, fetchedRequests, fetchedBanks] = await Promise.all([
        api.getDonors(),
        api.getRequests(),
        api.getBloodBanks()
      ]);
      if (fetchedDonors) setDonors(fetchedDonors);
      if (fetchedRequests) setRequests(fetchedRequests);
      if (fetchedBanks) setBloodBanks(fetchedBanks);
      setDbError(false);
    } catch (err) {
      console.warn("Data sync notice:", err);
      // Fallback in api.js guarantees valid arrays, keep dbError false
      setDbError(false);
    } finally {
      if (!isBackgroundSync) setLoadingData(false);
    }
  };


  // Check existing session via token on mount
  useEffect(() => {
    api.getMe().then(user => {
      if (user) {
        setCurrentUser(user);
      }
    }).catch(() => {});
  }, []);

  // Initial data load
  useEffect(() => {
    loadDatabaseData();
  }, []);

  // Background polling sync every 20 seconds for real-time updates across multiple clients
  useEffect(() => {
    const interval = setInterval(() => {
      loadDatabaseData(true);
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  // Sync user session to sessionStorage
  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('neoblood_session_user', JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem('neoblood_session_user');
    }
  }, [currentUser]);

  // Auth Open Handlers
  const handleOpenSignIn = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  const handleOpenRegister = () => {
    setAuthModalMode('register');
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (user, message) => {
    setCurrentUser(user);
    addToast('Authentication Success', message, 'success');
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}
  };

  const handleLogoutClick = () => {
    api.logout();
    setCurrentUser(null);
    setActiveTab('home');
    addToast('Logged Out', 'You have been successfully logged out.', 'info');
  };

  // Open "Become a Blood Donor" form (separate from User Account)
  const handleOpenBecomeDonor = () => {
    if (!currentUser) {
      setAuthModalMode('register');
      setIsAuthModalOpen(true);
      addToast('Account Required', 'Please register or sign in first to create a donor profile.', 'info');
      return;
    }
    setIsDonorModalOpen(true);
  };

  // Save Donor Profile in MongoDB Atlas 'bloodDonors' collection
  const handleSaveDonorProfile = async (donorData) => {
    const tempId = 'temp-' + Date.now();
    const optimisticDonor = {
      _id: tempId,
      uid: tempId,
      userId: currentUser?.id || currentUser?._id,
      ...donorData
    };

    // Optimistic UI updates
    setDonors(prev => [optimisticDonor, ...prev]);
    setIsDonorModalOpen(false);

    try {
      const savedDonor = await api.createDonor({
        ...donorData,
        userId: currentUser?.id || currentUser?._id
      });

      setCurrentUser(prev => ({
        ...prev,
        role: 'donor',
        donorProfile: savedDonor
      }));

      addToast('Donor Profile Created', `Congratulations ${savedDonor.name}! Saved in MongoDB Atlas bloodDonors.`, 'success');
      try {
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}

      await loadDatabaseData(true);
    } catch (err) {
      setDonors(prev => prev.filter(d => d._id !== tempId));
      addToast('Donor Registration Error', err.message || 'Could not save donor to MongoDB Atlas.', 'error');
    }
  };

  // Toggle Donor Availability with Optimistic Update & Rollback
  const handleToggleAvailability = async (newStatus) => {
    if (!currentUser) return;
    const donorProfile = currentUser.donorProfile || donors.find(d =>
      d.userId === currentUser.id || d.userId === currentUser._id || d.email === currentUser.email
    );
    if (!donorProfile) {
      handleOpenBecomeDonor();
      return;
    }

    const donorId = donorProfile._id || donorProfile.uid;
    const previousStatus = donorProfile.availability ?? donorProfile.isAvailable;

    // Optimistic Update
    setDonors(prev => prev.map(d =>
      (d._id === donorId || d.uid === donorId) ? { ...d, availability: newStatus, isAvailable: newStatus } : d
    ));
    if (currentUser.donorProfile) {
      setCurrentUser(prev => ({
        ...prev,
        donorProfile: { ...prev.donorProfile, availability: newStatus, isAvailable: newStatus }
      }));
    }

    try {
      await api.updateDonor(donorId, { availability: newStatus, isAvailable: newStatus });
      addToast(
        'Status Synchronized',
        newStatus ? 'Marked AVAILABLE in MongoDB Atlas.' : 'Marked UNAVAILABLE in MongoDB Atlas.',
        'info'
      );
    } catch (err) {
      // Rollback on failure
      setDonors(prev => prev.map(d =>
        (d._id === donorId || d.uid === donorId) ? { ...d, availability: previousStatus, isAvailable: previousStatus } : d
      ));
      addToast('Update Failed', 'Failed to update MongoDB status. Rolled back.', 'error');
    }
  };

  // Pledge Donation with Optimistic Update & Rollback
  const handleAcceptRequest = async (requestId) => {
    if (!currentUser) {
      handleOpenSignIn();
      return;
    }

    const originalRequests = [...requests];
    setRequests(prev => prev.map(r => {
      const isMatch = r._id === requestId || r.requestId === requestId;
      if (isMatch) {
        return {
          ...r,
          acceptedDonorId: currentUser.id || currentUser.uid,
          acceptedDonorName: currentUser.name,
          status: 'PLEDGED'
        };
      }
      return r;
    }));

    try {
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
    } catch (e) {}
    addToast('Pledge Submitted', 'Your pledge has been saved to MongoDB Atlas!', 'success');

    try {
      await api.pledgeRequest(requestId, currentUser.id || currentUser.uid, currentUser.name);
      await loadDatabaseData(true);
    } catch (err) {
      setRequests(originalRequests);
      addToast('Pledge Failed', 'Could not record pledge in MongoDB. Rolled back.', 'error');
    }
  };

  // Create Blood Request (Broadcast or Targeted)
  const handleCreateRequest = async (newReqData) => {
    const tempId = 'temp-req-' + Date.now();
    const optimisticReq = {
      _id: tempId,
      requestId: tempId,
      createdAt: new Date().toISOString(),
      status: 'OPEN',
      acceptedDonorId: null,
      acceptedDonorName: null,
      ...newReqData
    };

    setRequests(prev => [optimisticReq, ...prev]);
    setActiveTab('home');

    // If targeted to specific pointed-out donor(s), create an immediate notification for their bell icon
    if (newReqData.isTargeted) {
      const targetNames = newReqData.targetDonorNames?.join(', ') || 'Pointed Donor(s)';
      const targetedNotif = {
        id: 'notif-' + Date.now(),
        requestId: tempId,
        type: 'targeted_request',
        title: `🚨 Direct Request for ${targetNames}`,
        patientName: newReqData.patientName,
        bloodGroup: newReqData.bloodGroup,
        unitsRequired: newReqData.unitsRequired,
        hospitalName: newReqData.hospitalName,
        city: newReqData.city,
        mobile: newReqData.mobile,
        emergencyLevel: newReqData.emergencyLevel,
        targetDonorNames: newReqData.targetDonorNames,
        message: `Patient ${newReqData.patientName} urgently needs ${newReqData.unitsRequired} unit(s) of ${newReqData.bloodGroup} at ${newReqData.hospitalName}, ${newReqData.city}.`,
        request: optimisticReq,
        read: false,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setNotifications(prev => [targetedNotif, ...prev]);
    }

    try {
      const created = await api.createRequest({
        ...newReqData,
        requestId: 'req-' + Date.now(),
        email: currentUser?.email || newReqData.email || null
      });

      if (newReqData.isTargeted) {
        const targetNames = newReqData.targetDonorNames?.join(', ') || 'Pointed Donor(s)';
        addToast('Direct Request Delivered', `Request for ${newReqData.patientName} sent to ${targetNames}'s notification bell!`, 'success');
      } else {
        addToast('Broadcast Published', 'Emergency request broadcasted live in MongoDB Atlas and on this page!', 'success');
      }

      await loadDatabaseData(true);
    } catch (err) {
      setRequests(prev => prev.filter(r => r._id !== tempId));
      addToast('Request Failed', 'Could not save request to MongoDB: ' + err.message, 'error');
    }
  };

  // Blood Banks CRUD Handlers
  const handleCreateBloodBank = async (bankData) => {
    try {
      const created = await api.createBloodBank(bankData);
      setBloodBanks(prev => [created, ...prev]);
      addToast('Blood Bank Created', `Successfully added ${created.name} to MongoDB Atlas!`, 'success');
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
      await loadDatabaseData(true);
    } catch (err) {
      addToast('Creation Error', err.message || 'Could not save blood bank.', 'error');
      throw err;
    }
  };

  const handleUpdateBloodBank = async (id, updateData) => {
    try {
      const updated = await api.updateBloodBank(id, updateData);
      setBloodBanks(prev => prev.map(b => (b._id === id || b.id === id) ? updated : b));
      addToast('Stock & Details Updated', `${updated.name} updated in MongoDB Atlas!`, 'success');
      await loadDatabaseData(true);
    } catch (err) {
      addToast('Update Error', err.message || 'Could not update blood bank.', 'error');
      throw err;
    }
  };

  const handleDeleteBloodBank = async (id) => {
    try {
      await api.deleteBloodBank(id);
      setBloodBanks(prev => prev.filter(b => b._id !== id && b.id !== id));
      addToast('Blood Bank Removed', 'Blood bank deleted from MongoDB.', 'info');
      await loadDatabaseData(true);
    } catch (err) {
      addToast('Delete Error', err.message || 'Could not delete blood bank.', 'error');
    }
  };

  // Donors CRUD Handlers
  const handleCreateDonor = async (donorData) => {
    try {
      const created = await api.createDonor({
        ...donorData,
        userId: currentUser?.id || currentUser?._id
      });
      setDonors(prev => [created, ...prev]);
      if (currentUser) {
        setCurrentUser(prev => ({
          ...prev,
          role: 'donor',
          donorProfile: created
        }));
      }
      addToast('Donor Registered', `Welcome ${created.name}! Saved in MongoDB bloodDonors.`, 'success');
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}
      await loadDatabaseData(true);
    } catch (err) {
      addToast('Registration Error', err.message || 'Could not register donor.', 'error');
      throw err;
    }
  };

  const handleUpdateDonor = async (id, updateData) => {
    try {
      const updated = await api.updateDonor(id, updateData);
      setDonors(prev => prev.map(d => (d._id === id || d.uid === id) ? updated : d));
      if (currentUser?.donorProfile && (currentUser.donorProfile._id === id || currentUser.donorProfile.uid === id)) {
        setCurrentUser(prev => ({ ...prev, donorProfile: updated }));
      }
      addToast('Donor Profile Updated', 'Changes saved to MongoDB bloodDonors.', 'success');
      await loadDatabaseData(true);
    } catch (err) {
      addToast('Update Error', err.message || 'Could not update donor.', 'error');
      throw err;
    }
  };

  const handleDeleteDonor = async (id) => {
    try {
      await api.deleteDonor(id);
      setDonors(prev => prev.filter(d => d._id !== id && d.uid !== id));
      if (currentUser?.donorProfile && (currentUser.donorProfile._id === id || currentUser.donorProfile.uid === id)) {
        setCurrentUser(prev => ({ ...prev, donorProfile: null }));
      }
      addToast('Donor Removed', 'Donor record removed from MongoDB.', 'info');
      await loadDatabaseData(true);
    } catch (err) {
      addToast('Delete Error', err.message || 'Could not delete donor.', 'error');
    }
  };

  // Requests CRUD Handlers
  const handleUpdateRequest = async (id, updateData) => {
    try {
      const updated = await api.updateRequest(id, updateData);
      setRequests(prev => prev.map(r => (r._id === id || r.requestId === id) ? updated : r));
      addToast('Request Updated', 'Changes saved to MongoDB requests collection.', 'success');
      await loadDatabaseData(true);
    } catch (err) {
      addToast('Update Error', err.message || 'Could not update request.', 'error');
    }
  };

  const handleDeleteRequest = async (id) => {
    try {
      await api.deleteRequest(id);
      setRequests(prev => prev.filter(r => r._id !== id && r.requestId !== id));
      addToast('Request Cancelled', 'Request removed from MongoDB.', 'info');
      await loadDatabaseData(true);
    } catch (err) {
      addToast('Delete Error', err.message || 'Could not delete request.', 'error');
    }
  };

  // User Account Profile CRUD Handlers
  const handleUpdateUserProfile = async (formData) => {
    try {
      const updatedUser = await api.updateUserProfile(formData);
      setCurrentUser(prev => ({
        ...prev,
        ...updatedUser
      }));
      addToast('Profile Updated', 'Your profile details have been saved in MongoDB Atlas.', 'success');
      await loadDatabaseData(true);
    } catch (err) {
      addToast('Profile Update Error', err.message || 'Could not update profile.', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.deleteUserAccount();
      setCurrentUser(null);
      addToast('Account Deleted', 'Your account has been deleted from MongoDB.', 'info');
      setActiveTab('home');
      await loadDatabaseData(true);
    } catch (err) {
      addToast('Account Deletion Error', err.message || 'Could not delete account.', 'error');
    }
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          loadDatabaseData(true);
        }}
        currentUser={currentUser}
        onSignInClick={handleOpenSignIn}
        onRegisterClick={handleOpenRegister}
        onBecomeDonorClick={handleOpenBecomeDonor}
        onLogoutClick={handleLogoutClick}
        notifications={notifications}
        onAcceptRequest={handleAcceptRequest}
        onMarkNotifRead={handleMarkNotifRead}
        onClearAllNotifs={handleClearAllNotifs}
      />

      {/* Red Announcement Banner */}
      <AnnouncementBanner />

      {/* Main Content Area */}
      <main className="main-content">
        {activeTab === 'home' && (
          <HomeTab
            currentUser={currentUser}
            donors={donors}
            requests={requests}
            loadingData={loadingData}
            dbError={dbError}
            onRetryConnection={() => loadDatabaseData(false)}
            onAcceptRequest={handleAcceptRequest}
            onOpenCreateRequest={() => setActiveTab('create-request')}
            onSignInClick={handleOpenSignIn}
            onRegisterClick={handleOpenRegister}
            onBecomeDonorClick={handleOpenBecomeDonor}
            onLoginClick={handleOpenSignIn}
            onSubmitRequest={handleCreateRequest}
          />
        )}

        {activeTab === 'about' && (
          <AboutTab />
        )}

        {activeTab === 'dashboard' && (
          <DashboardTab
            currentUser={currentUser}
            donors={donors}
            requests={requests}
            onToggleAvailability={handleToggleAvailability}
            onBecomeDonor={handleOpenBecomeDonor}
            onOpenCreateRequest={() => setActiveTab('create-request')}
            onSignInClick={handleOpenSignIn}
            onRegisterClick={handleOpenRegister}
            onDeleteRequest={handleDeleteRequest}
            onUpdateRequest={handleUpdateRequest}
            onDeleteDonor={handleDeleteDonor}
            onUpdateDonor={handleUpdateDonor}
            onUpdateUserProfile={handleUpdateUserProfile}
            onDeleteAccount={handleDeleteAccount}
          />
        )}

        {activeTab === 'create-request' && (
          <CreateRequestTab
            currentUser={currentUser}
            donors={donors}
            onSubmitRequest={handleCreateRequest}
            onCancel={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'map' && (
          <MapTab
            donors={donors}
            requests={requests}
            hospitals={INITIAL_HOSPITALS}
          />
        )}
      </main>


      {/* Footer */}
      <Footer />

      {/* Authentication Modal (Sign In vs Register with Google & Email/Password) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Become a Blood Donor Modal (Collection: bloodDonors) */}
      <OnboardingModal
        isOpen={isDonorModalOpen}
        onClose={() => setIsDonorModalOpen(false)}
        onSave={handleSaveDonorProfile}
        currentUser={currentUser}
      />

      {/* Toast Notifications */}
      <Toast
        toasts={toasts}
        onDismiss={handleDismissToast}
      />
    </div>
  );
}
