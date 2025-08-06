import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FaEnvelope, FaSms } from 'react-icons/fa';

const ToggleSwitch = ({ label, checked, onChange, name }) => (
    <div className="flex items-center justify-between py-2">
        <span className="text-gray-600 dark:text-gray-300">{label}</span>
        <button 
            onClick={() => onChange({ target: { name, value: !checked } })}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${checked ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}/>
        </button>
    </div>
);

export default function NotificationPreferences() {
    const { user } = useSelector((state) => state.auth);
    const [preferences, setPreferences] = useState({
        email: { loginAlerts: true, passwordChanges: true, systemUpdates: true },
        sms: { loginAlerts: false, passwordChanges: false },
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.notificationPreferences) {
            setPreferences(user.notificationPreferences);
        }
    }, [user]);

    const handlePreferenceChange = async ({ target: { name, value } }) => {
        const [channel, key] = name.split('.');
        const updatedPrefs = { 
            ...preferences, 
            [channel]: { ...preferences[channel], [key]: value } 
        };
        setPreferences(updatedPrefs);

        setLoading(true);
        try {
            await api.put(`/auth/preferences/${user._id}`, { preferences: updatedPrefs });
            toast.success('Preferences updated!');
        } catch (error) {
            toast.error('Failed to update preferences.');
            // Revert UI on failure
            setPreferences(preferences);
        }
        setLoading(false);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-6">Notification Preferences</h2>
            
            <div className="space-y-6">
                {/* Email Preferences */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2 flex items-center gap-2"><FaEnvelope /> Email Notifications</h3>
                    <div className="pl-4 border-l-2 border-indigo-200 dark:border-indigo-800">
                        <ToggleSwitch label="Login Alerts" name="email.loginAlerts" checked={preferences.email.loginAlerts} onChange={handlePreferenceChange} />
                        <ToggleSwitch label="Password Changes" name="email.passwordChanges" checked={preferences.email.passwordChanges} onChange={handlePreferenceChange} />
                        <ToggleSwitch label="System Updates" name="email.systemUpdates" checked={preferences.email.systemUpdates} onChange={handlePreferenceChange} />
                    </div>
                </div>

                {/* SMS Preferences */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2 flex items-center gap-2"><FaSms /> SMS Notifications</h3>
                     <div className="pl-4 border-l-2 border-indigo-200 dark:border-indigo-800">
                        <ToggleSwitch label="Login Alerts" name="sms.loginAlerts" checked={preferences.sms.loginAlerts} onChange={handlePreferenceChange} />
                        <ToggleSwitch label="Password Changes" name="sms.passwordChanges" checked={preferences.sms.passwordChanges} onChange={handlePreferenceChange} />
                    </div>
                </div>
            </div>
            {loading && <p className='text-sm text-gray-500 mt-4'>Updating...</p>}
        </div>
    );
}
