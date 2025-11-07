"use client";

import React, { useEffect, useState } from "react";
import { useNotifications } from "@/context/NotificationContext";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

type NotificationPreferences = {
  appointmentConfirmations: boolean;
  bidUpdates: boolean;
  priceDrops: boolean;
  newMessages: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
};

const NotificationPreferences: React.FC = () => {
  const { preferences, updatePreferences, registerToken } = useNotifications();
  const [localPrefs, setLocalPrefs] = useState(preferences);

  useEffect(() => {
    setLocalPrefs(preferences);
  }, [preferences]);

  const handleToggle = async (key: keyof NotificationPreferences) => {
    if (!localPrefs) return;

    const newPrefs = { ...localPrefs, [key]: !localPrefs[key] };
    setLocalPrefs(newPrefs);
    await updatePreferences({ [key]: newPrefs[key] as boolean });
  };

  const handleEnablePush = async () => {
    await registerToken();
  };

  if (!localPrefs) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <p className="text-gray-500">Loading preferences...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Notification Preferences</h2>
      </div>

      <div className="space-y-6">
        {/* Push Notifications Toggle */}
        <div className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Push Notifications</h3>
              <p className="text-sm text-gray-500 mt-1">
                Receive push notifications on your device
              </p>
            </div>
            <div className="flex items-center gap-3">
              {localPrefs.pushNotifications ? (
                <span className="text-sm text-green-600 font-medium">Enabled</span>
              ) : (
                <Button onClick={handleEnablePush} size="sm" variant="outline">
                  Enable
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Notification Types */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Notification Types</h3>

          <PreferenceToggle
            label="Appointment Confirmations"
            description="Get notified when your appointments are confirmed"
            checked={localPrefs.appointmentConfirmations}
            onChange={() => handleToggle("appointmentConfirmations")}
          />

          <PreferenceToggle
            label="Bid Updates"
            description="Receive updates about bids on your listings"
            checked={localPrefs.bidUpdates}
            onChange={() => handleToggle("bidUpdates")}
          />

          <PreferenceToggle
            label="Price Drops"
            description="Alert me when prices drop on cars I'm interested in"
            checked={localPrefs.priceDrops}
            onChange={() => handleToggle("priceDrops")}
          />

          <PreferenceToggle
            label="New Messages"
            description="Notify me about new messages"
            checked={localPrefs.newMessages}
            onChange={() => handleToggle("newMessages")}
          />

          <PreferenceToggle
            label="Email Notifications"
            description="Receive email notifications in addition to push"
            checked={localPrefs.emailNotifications}
            onChange={() => handleToggle("emailNotifications")}
          />
        </div>
      </div>
    </div>
  );
};

interface PreferenceToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

const PreferenceToggle: React.FC<PreferenceToggleProps> = ({
  label,
  description,
  checked,
  onChange,
}) => {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{label}</h4>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? "bg-blue-600" : "bg-gray-300"
        }`}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
};

export default NotificationPreferences;

