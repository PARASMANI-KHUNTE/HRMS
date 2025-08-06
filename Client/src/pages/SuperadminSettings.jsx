import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FaUserEdit, FaLock, FaCamera, FaPalette, FaHistory, FaCogs, FaUserCircle } from 'react-icons/fa';
import { login } from '../store/slices/authSlice';
import { toggleTheme } from '../store/slices/themeSlice';
import NotificationPreferences from '../components/NotificationPreferences';
import { Link } from 'react-router-dom';

export default function SuperadminSettings() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.theme);

  const [profileData, setProfileData] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profilePicture, setProfilePicture] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingPicture, setLoadingPicture] = useState(false);
  const [appSettings, setAppSettings] = useState({ siteName: '', maintenanceMode: false, allowPublicRegistration: false });
  const [siteLogo, setSiteLogo] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
    const fetchAppSettings = async () => {
      try {
        const res = await api.get('/settings');
        setAppSettings(res.data);
      } catch (error) {
        toast.error('Failed to load application settings.');
      }
    };
    fetchAppSettings();
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handlePictureChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAppSettings(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleLogoChange = (e) => {
    setSiteLogo(e.target.files[0]);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      const res = await api.put('/auth/update', { _id: user._id, ...profileData });
      dispatch(login({ token: localStorage.getItem('token'), user: res.data.user }));
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile.');
    }
    setLoadingProfile(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    setLoadingPassword(true);
    try {
      await api.post('/auth/change-password', {
        userId: user._id,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password.');
    }
    setLoadingPassword(false);
  };

  const handlePictureSubmit = async (e) => {
    e.preventDefault();
    if (!profilePicture) {
      toast.error('Please select a picture to upload.');
      return;
    }
    setLoadingPicture(true);
    const formData = new FormData();
    formData.append('file', profilePicture);

    try {
      const res = await api.post('/auth/user/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      dispatch(login({ token: localStorage.getItem('token'), user: res.data.user }));
      toast.success('Profile picture updated!');
      setProfilePicture(null); // Clear the file input
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload picture.');
    }
    setLoadingPicture(false);
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setLoadingSettings(true);
    const formData = new FormData();
    formData.append('siteName', appSettings.siteName);
    formData.append('maintenanceMode', appSettings.maintenanceMode);
    formData.append('allowPublicRegistration', appSettings.allowPublicRegistration);
    if (siteLogo) {
      formData.append('logo', siteLogo);
    }

    try {
      const res = await api.put('/settings', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setAppSettings(res.data);
      toast.success('Application settings updated successfully!');
      setSiteLogo(null); // Clear file input
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update settings.');
    }
    setLoadingSettings(false);
  };

  return (
    <div className="bg-gray-50 p-8 rounded-xl shadow-lg space-y-12">
      <h1 className="text-3xl font-bold text-indigo-800 dark:text-indigo-300">Settings</h1>

      {/* Profile Picture Settings */}
      <div className="bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-gray-700 mb-6 flex items-center gap-3"><FaCamera className="text-indigo-600"/> Profile Picture</h2>
        <div className="flex items-center gap-6">
                    {user?.profilePicture ? (
            <img src={user.profilePicture} alt="Profile" className="w-24 h-24 rounded-full object-cover"/>
          ) : (
            <FaUserCircle className="w-24 h-24 text-gray-300"/>
          )}
          <form onSubmit={handlePictureSubmit} className="flex items-center gap-4">
            <input type="file" onChange={handlePictureChange} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
            <button type="submit" disabled={loadingPicture || !profilePicture} className="px-6 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-semibold disabled:bg-indigo-400">
              {loadingPicture ? 'Uploading...' : 'Upload'}
            </button>
          </form>
        </div>
      </div>

      {/* Profile Settings */}
      <div className="bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-gray-700 mb-6 flex items-center gap-3"><FaUserEdit className="text-indigo-600"/> Profile Information</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <input type="text" name="firstName" value={profileData.firstName} onChange={handleProfileChange} placeholder="First Name" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" required />
                 <input type="text" name="lastName" value={profileData.lastName} onChange={handleProfileChange} placeholder="Last Name" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" required />
            </div>
            <input type="email" name="email" value={profileData.email} onChange={handleProfileChange} placeholder="Email Address" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" readOnly />
            <input type="text" name="phone" value={profileData.phone} onChange={handleProfileChange} placeholder="Phone Number" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" required />
            <div className="flex justify-end pt-4">
                <button type="submit" disabled={loadingProfile} className="px-8 py-3 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-semibold disabled:bg-indigo-400">
                    {loadingProfile ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
      </div>

      {/* Appearance Settings */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-6 flex items-center gap-3"><FaPalette className="text-indigo-600"/> Appearance</h2>
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-300">Dark Mode</span>
          <button onClick={() => dispatch(toggleTheme())} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-200'}`}>
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`}/>
          </button>
        </div>
      </div>

      {/* Notification Preferences */}
      <NotificationPreferences />

      {/* System & Security */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-6 flex items-center gap-3"><FaCogs className="text-indigo-600"/> System & Security</h2>
        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Audit Log</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">View system-wide activity and track important events.</p>
          </div>
          <Link to="/superadmin/audit-logs" className="px-6 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-semibold flex items-center gap-2">
            <FaHistory />
            <span>View Logs</span>
          </Link>
        </div>
      </div>

      {/* Application Configuration */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-6 flex items-center gap-3"><FaCogs className="text-indigo-600"/> Application Configuration</h2>
        <form onSubmit={handleSettingsSubmit} className="space-y-6">
            <div>
                <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Site Name</label>
                <input
                    type="text"
                    name="siteName"
                    id="siteName"
                    value={appSettings.siteName}
                    onChange={handleSettingsChange}
                    className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>
            <div>
                <label htmlFor="siteLogo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Site Logo</label>
                <div className="mt-1 flex items-center gap-4">
                    {appSettings.siteLogo && <img src={appSettings.siteLogo} alt="Site Logo" className="h-12 w-12 rounded-full object-cover" />}
                    <input
                        type="file"
                        name="siteLogo"
                        id="siteLogo"
                        onChange={handleLogoChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
                    />
                </div>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Maintenance Mode</span>
                <button
                    type="button"
                    onClick={() => handleSettingsChange({ target: { name: 'maintenanceMode', type: 'checkbox', checked: !appSettings.maintenanceMode } })}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${appSettings.maintenanceMode ? 'bg-indigo-600' : 'bg-gray-200'}`}
                >
                    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${appSettings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`}/>
                </button>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Allow Public Registration</span>
                <button
                    type="button"
                    onClick={() => handleSettingsChange({ target: { name: 'allowPublicRegistration', type: 'checkbox', checked: !appSettings.allowPublicRegistration } })}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${appSettings.allowPublicRegistration ? 'bg-indigo-600' : 'bg-gray-200'}`}
                >
                    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${appSettings.allowPublicRegistration ? 'translate-x-6' : 'translate-x-1'}`}/>
                </button>
            </div>
            <div className="flex justify-end pt-4">
                <button type="submit" disabled={loadingSettings} className="px-8 py-3 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-semibold disabled:bg-indigo-400">
                    {loadingSettings ? 'Saving...' : 'Save Settings'}
                </button>
            </div>
        </form>
      </div>

      {/* Password Settings */}
      <div className="bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-gray-700 mb-6 flex items-center gap-3"><FaLock className="text-indigo-600"/> Change Password</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} placeholder="Current Password" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" required />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} placeholder="New Password" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" required />
                <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} placeholder="Confirm New Password" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" required />
            </div>
            <div className="flex justify-end pt-4">
                <button type="submit" disabled={loadingPassword} className="px-8 py-3 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-semibold disabled:bg-indigo-400">
                    {loadingPassword ? 'Updating...' : 'Update Password'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}
