import React, { useState, useEffect } from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { 
  Bell, 
  BellOff, 
  Mail, 
  Smartphone, 
  Clock, 
  Moon, 
  Sun,
  Save,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';

const NotificationPreferences: React.FC = () => {
  const { preferences, updatePreferences, loading } = useNotifications();
  const [formData, setFormData] = useState({
    appointmentNotifications: true,
    bidUpdateNotifications: true,
    priceDropNotifications: true,
    messageNotifications: true,
    systemNotifications: true,
    marketingNotifications: false,
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    quietDays: [] as number[],
    digestNotifications: false,
    digestFrequencyHours: 24
  });
  const [saving, setSaving] = useState(false);

  // Initialize form data when preferences load
  useEffect(() => {
    if (preferences) {
      setFormData({
        appointmentNotifications: preferences.appointmentNotifications,
        bidUpdateNotifications: preferences.bidUpdateNotifications,
        priceDropNotifications: preferences.priceDropNotifications,
        messageNotifications: preferences.messageNotifications,
        systemNotifications: preferences.systemNotifications,
        marketingNotifications: preferences.marketingNotifications,
        pushNotifications: preferences.pushNotifications,
        emailNotifications: preferences.emailNotifications,
        smsNotifications: preferences.smsNotifications,
        quietHoursEnabled: preferences.quietHoursEnabled,
        quietHoursStart: preferences.quietHoursStart,
        quietHoursEnd: preferences.quietHoursEnd,
        quietDays: preferences.quietDays,
        digestNotifications: preferences.digestNotifications,
        digestFrequencyHours: preferences.digestFrequencyHours
      });
    }
  }, [preferences]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name === 'quietDays') {
      const dayValue = parseInt(value);
      setFormData(prev => ({
        ...prev,
        quietDays: prev.quietDays.includes(dayValue)
          ? prev.quietDays.filter(d => d !== dayValue)
          : [...prev.quietDays, dayValue]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value) : value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!preferences) return;

    setSaving(true);
    try {
      const updatedPreferences = {
        ...preferences,
        ...formData,
        quietHoursStart: formData.quietHoursStart,
        quietHoursEnd: formData.quietHoursEnd,
        quietDays: formData.quietDays
      };

      await updatePreferences(updatedPreferences);
      toast.success('Notification preferences updated successfully!');
    } catch (error: any) {
      toast.error(`Failed to update preferences: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (preferences) {
      setFormData({
        appointmentNotifications: preferences.appointmentNotifications,
        bidUpdateNotifications: preferences.bidUpdateNotifications,
        priceDropNotifications: preferences.priceDropNotifications,
        messageNotifications: preferences.messageNotifications,
        systemNotifications: preferences.systemNotifications,
        marketingNotifications: preferences.marketingNotifications,
        pushNotifications: preferences.pushNotifications,
        emailNotifications: preferences.emailNotifications,
        smsNotifications: preferences.smsNotifications,
        quietHoursEnabled: preferences.quietHoursEnabled,
        quietHoursStart: preferences.quietHoursStart,
        quietHoursEnd: preferences.quietHoursEnd,
        quietDays: preferences.quietDays,
        digestNotifications: preferences.digestNotifications,
        digestFrequencyHours: preferences.digestFrequencyHours
      });
    }
  };

  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <Bell className="w-6 h-6 text-blue-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-800">Notification Preferences</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Notification Types */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Notification Types</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="appointmentNotifications"
                name="appointmentNotifications"
                checked={formData.appointmentNotifications}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="appointmentNotifications" className="text-sm font-medium text-gray-700">
                Appointment notifications
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="bidUpdateNotifications"
                name="bidUpdateNotifications"
                checked={formData.bidUpdateNotifications}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="bidUpdateNotifications" className="text-sm font-medium text-gray-700">
                Bid update notifications
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="priceDropNotifications"
                name="priceDropNotifications"
                checked={formData.priceDropNotifications}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="priceDropNotifications" className="text-sm font-medium text-gray-700">
                Price drop notifications
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="messageNotifications"
                name="messageNotifications"
                checked={formData.messageNotifications}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="messageNotifications" className="text-sm font-medium text-gray-700">
                Message notifications
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="systemNotifications"
                name="systemNotifications"
                checked={formData.systemNotifications}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="systemNotifications" className="text-sm font-medium text-gray-700">
                System notifications
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="marketingNotifications"
                name="marketingNotifications"
                checked={formData.marketingNotifications}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="marketingNotifications" className="text-sm font-medium text-gray-700">
                Marketing notifications
              </label>
            </div>
          </div>
        </div>

        {/* Delivery Methods */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Delivery Methods</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="pushNotifications"
                name="pushNotifications"
                checked={formData.pushNotifications}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="pushNotifications" className="text-sm font-medium text-gray-700 flex items-center">
                <Bell className="w-4 h-4 mr-2" />
                Push notifications
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="emailNotifications"
                name="emailNotifications"
                checked={formData.emailNotifications}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="emailNotifications" className="text-sm font-medium text-gray-700 flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                Email notifications
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="smsNotifications"
                name="smsNotifications"
                checked={formData.smsNotifications}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="smsNotifications" className="text-sm font-medium text-gray-700 flex items-center">
                <Smartphone className="w-4 h-4 mr-2" />
                SMS notifications
              </label>
            </div>
          </div>
        </div>

        {/* Quiet Hours */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Moon className="w-5 h-5 mr-2" />
            Quiet Hours
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="quietHoursEnabled"
                name="quietHoursEnabled"
                checked={formData.quietHoursEnabled}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="quietHoursEnabled" className="text-sm font-medium text-gray-700">
                Enable quiet hours
              </label>
            </div>

            {formData.quietHoursEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-7">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start time
                  </label>
                  <input
                    type="time"
                    name="quietHoursStart"
                    value={formData.quietHoursStart}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End time
                  </label>
                  <input
                    type="time"
                    name="quietHoursEnd"
                    value={formData.quietHoursEnd}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quiet days (optional)
                  </label>
                  <div className="grid grid-cols-7 gap-2">
                    {daysOfWeek.map((day) => (
                      <label key={day.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="quietDays"
                          value={day.value}
                          checked={formData.quietDays.includes(day.value)}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-600">{day.label.slice(0, 3)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Digest Notifications */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Digest Notifications
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="digestNotifications"
                name="digestNotifications"
                checked={formData.digestNotifications}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="digestNotifications" className="text-sm font-medium text-gray-700">
                Group notifications into digest
              </label>
            </div>

            {formData.digestNotifications && (
              <div className="ml-7">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Digest frequency
                </label>
                <select
                  name="digestFrequencyHours"
                  value={formData.digestFrequencyHours}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={1}>Every hour</option>
                  <option value={6}>Every 6 hours</option>
                  <option value={12}>Every 12 hours</option>
                  <option value={24}>Daily</option>
                  <option value={168}>Weekly</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </button>
          
          <button
            type="submit"
            disabled={saving}
            className={`px-6 py-2 rounded-md text-white font-medium flex items-center ${
              saving
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NotificationPreferences;
