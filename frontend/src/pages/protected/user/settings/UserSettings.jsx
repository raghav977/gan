import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MdNotificationsNone, MdPrivacyTip, MdPalette, MdSaveAlt } from "react-icons/md";
import { selectUser, updateUser } from "../../../../store/slices/authSlice";

const STORAGE_KEY = "user_settings";

const defaultSettings = {
  profile: {
    displayName: "",
    contact: "",
    city: "Kathmandu"
  },
  preferences: {
    theme: "system",
    autoplayVideos: true,
    reminderEmails: true,
    mobilePush: false
  },
  privacy: {
    shareActivity: true,
    showProfilePublic: false,
    shareProgressWithTrainer: true
  }
};

const UserSettings = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [settings, setSettings] = useState(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      setSettings(JSON.parse(cached));
    } else if (user) {
      setSettings((prev) => ({
        ...prev,
        profile: { ...prev.profile, displayName: user.displayName || "" }
      }));
    }
  }, [user]);

  const updateSection = (section, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const togglePrivacy = (key) => {
    setSettings((prev) => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: !prev.privacy[key]
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      dispatch(updateUser({ displayName: settings.profile.displayName }));
      setSaving(false);
      setMessage({ type: "success", text: "Preferences saved locally. Connect the account settings API to persist." });
    }, 450);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Account settings</h1>
        <p className="text-gray-500">Manage how Tute Kendra Hub personalizes your workouts, reminders and visibility.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="bg-white rounded-xl shadow p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Profile & contact</h2>
            <p className="text-sm text-gray-500">This appears on trainer dashboards and booking confirmations.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Display name</label>
              <input
                type="text"
                value={settings.profile.displayName}
                onChange={(e) => updateSection("profile", "displayName", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1"
                placeholder="e.g. Raghav Dahal"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Contact number</label>
              <input
                type="text"
                value={settings.profile.contact}
                onChange={(e) => updateSection("profile", "contact", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1"
                placeholder="98-xxxx-xxxx"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">City</label>
              <input
                type="text"
                value={settings.profile.city}
                onChange={(e) => updateSection("profile", "city", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow p-6 space-y-4">
          <div className="flex items-center gap-3">
            <MdNotificationsNone className="text-yellow-500" size={26} />
            <div>
              <h2 className="text-lg font-semibold">Reminders & preferences</h2>
              <p className="text-sm text-gray-500">Control nudges for workouts, nutrition logs and course lessons.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Theme</label>
              <select
                value={settings.preferences.theme}
                onChange={(e) => updateSection("preferences", "theme", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              >
                <option value="system">Match system</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <label className="flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.preferences.autoplayVideos}
                onChange={() => updateSection("preferences", "autoplayVideos", !settings.preferences.autoplayVideos)}
                className="h-5 w-5 text-yellow-500"
              />
              <div>
                <p className="font-medium">Autoplay lesson videos</p>
                <p className="text-sm text-gray-500">Skip manual taps during workouts.</p>
              </div>
            </label>
            <label className="flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.preferences.reminderEmails}
                onChange={() => updateSection("preferences", "reminderEmails", !settings.preferences.reminderEmails)}
                className="h-5 w-5 text-yellow-500"
              />
              <div>
                <p className="font-medium">Email reminders</p>
                <p className="text-sm text-gray-500">Daily summary of workouts and nutrition.</p>
              </div>
            </label>
            <label className="flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.preferences.mobilePush}
                onChange={() => updateSection("preferences", "mobilePush", !settings.preferences.mobilePush)}
                className="h-5 w-5 text-yellow-500"
              />
              <div>
                <p className="font-medium">Mobile push notifications</p>
                <p className="text-sm text-gray-500">Works with the Tute Kendra mobile beta.</p>
              </div>
            </label>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow p-6 space-y-4">
          <div className="flex items-center gap-3">
            <MdPrivacyTip className="text-yellow-500" size={26} />
            <div>
              <h2 className="text-lg font-semibold">Privacy</h2>
              <p className="text-sm text-gray-500">Choose what your trainers and peers can view.</p>
            </div>
          </div>
          {[
            { key: "shareActivity", label: "Share workout activity", helper: "Trainers can see your daily streak" },
            { key: "showProfilePublic", label: "Allow other users to discover me", helper: "Appears in social leaderboard" },
            { key: "shareProgressWithTrainer", label: "Share progress photos", helper: "Uploads stay between you and your trainer" },
          ].map((item) => (
            <label key={item.key} className="flex items-center justify-between border rounded-lg px-4 py-3 cursor-pointer">
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-gray-500">{item.helper}</p>
              </div>
              <input
                type="checkbox"
                checked={settings.privacy[item.key]}
                onChange={() => togglePrivacy(item.key)}
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
            {saving ? "Saving..." : <><MdPalette /> <MdSaveAlt className="hidden" />Save preferences</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserSettings;
