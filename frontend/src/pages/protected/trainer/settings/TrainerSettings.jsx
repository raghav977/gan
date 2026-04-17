import { useEffect, useState } from "react";
import { MdNotifications, MdCalendarToday, MdSecurity, MdSave, MdCloudUpload } from "react-icons/md";

const STORAGE_KEY = "trainer_settings";

const defaultSettings = {
  notifications: {
    newClient: true,
    assignmentUpdates: true,
    payoutAlerts: true,
    weeklyDigest: false,
  },
  availability: {
    timezone: "Asia/Kathmandu",
    sessionLength: "45",
    maxClients: "12",
    autoAccept: false,
  },
  security: {
    twoFactor: false,
    deviceAlerts: true,
    shareCalendar: false,
  }
};

const TrainerSettings = () => {
  const [settings, setSettings] = useState(defaultSettings);
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      setSettings(JSON.parse(cached));
    }
  }, []);

  const toggleSetting = (section, key) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: !prev[section][key]
      }
    }));
  };

  const handleChange = (section, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setSaving(false);
      setMessage({ type: "success", text: "Trainer settings saved locally. Wire up the trainer settings API when available." });
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-gray-500">Central control for notifications, availability, billing and security.</p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-yellow-400 text-yellow-600"
          onClick={() => setSettings(defaultSettings)}
        >
          <MdCloudUpload /> Reset defaults
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="bg-white rounded-xl shadow p-6 space-y-4">
          <div className="flex items-center gap-3">
            <MdNotifications className="text-yellow-500" size={26} />
            <div>
              <h2 className="font-semibold">Notification preferences</h2>
              <p className="text-sm text-gray-500">Decide how we notify you about new leads, assignments and payouts.</p>
            </div>
          </div>
          {[
            { key: "newClient", label: "New enrollment requests" },
            { key: "assignmentUpdates", label: "Todo progress & submissions" },
            { key: "payoutAlerts", label: "Payout confirmations" },
            { key: "weeklyDigest", label: "Weekly performance digest" },
          ].map((item) => (
            <label
              key={item.key}
              className="flex items-center justify-between border rounded-lg px-4 py-3 hover:bg-gray-50 cursor-pointer"
            >
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-gray-500">{item.key === "weeklyDigest" ? "Summary every Monday" : "Send instantly"}</p>
              </div>
              <input
                type="checkbox"
                className="h-5 w-5 text-yellow-500"
                checked={settings.notifications[item.key]}
                onChange={() => toggleSetting("notifications", item.key)}
              />
            </label>
          ))}
        </section>

        <section className="bg-white rounded-xl shadow p-6 space-y-4">
          <div className="flex items-center gap-3">
            <MdCalendarToday className="text-yellow-500" size={26} />
            <div>
              <h2 className="font-semibold">Availability & sessions</h2>
              <p className="text-sm text-gray-500">Keep booking cards accurate across the app and chat bot.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Timezone</label>
              <select
                value={settings.availability.timezone}
                onChange={(e) => handleChange("availability", "timezone", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              >
                <option value="Asia/Kathmandu">Asia/Kathmandu (GMT+5:45)</option>
                <option value="Asia/Kolkata">Asia/Kolkata (GMT+5:30)</option>
                <option value="Asia/Dubai">Asia/Dubai (GMT+4:00)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Session length (minutes)</label>
              <input
                type="number"
                min="15"
                value={settings.availability.sessionLength}
                onChange={(e) => handleChange("availability", "sessionLength", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Max active clients</label>
              <input
                type="number"
                min="1"
                value={settings.availability.maxClients}
                onChange={(e) => handleChange("availability", "maxClients", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />
            </div>
            <label className="flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.availability.autoAccept}
                onChange={() => toggleSetting("availability", "autoAccept")}
                className="h-5 w-5 text-yellow-500"
              />
              <div>
                <p className="font-medium">Auto-accept workout reviews</p>
                <p className="text-sm text-gray-500">Great for evergreen training plans.</p>
              </div>
            </label>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow p-6 space-y-4">
          <div className="flex items-center gap-3">
            <MdSecurity className="text-yellow-500" size={26} />
            <div>
              <h2 className="font-semibold">Security</h2>
              <p className="text-sm text-gray-500">Protect payouts and private training logs.</p>
            </div>
          </div>
          {[
            { key: "twoFactor", label: "Two-factor authentication", helper: "SMS prompts on risky sign-ins" },
            { key: "deviceAlerts", label: "Device change alerts", helper: "Email anytime a new device logs in" },
            { key: "shareCalendar", label: "Share availability with AI assistant", helper: "Lets the chatbot auto-schedule consults" }
          ].map((item) => (
            <label key={item.key} className="flex items-center justify-between border rounded-lg px-4 py-3 cursor-pointer">
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-gray-500">{item.helper}</p>
              </div>
              <input
                type="checkbox"
                checked={settings.security[item.key]}
                onChange={() => toggleSetting("security", item.key)}
                className="h-5 w-5 text-yellow-500"
              />
            </label>
          ))}
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-60 flex items-center gap-2"
          >
            {saving ? "Saving..." : <><MdSave /> Save settings</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TrainerSettings;
