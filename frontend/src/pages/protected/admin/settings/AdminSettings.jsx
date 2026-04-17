import React, { useEffect, useState } from "react";
import { MdNotifications, MdDarkMode, MdSecurity, MdCloudDownload, MdSchedule } from "react-icons/md";

const STORAGE_KEY = "tkh_admin_settings";

const defaultSettings = {
    theme: "system",
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: false,
    enrollmentAlerts: true,
    assignmentEscalations: true,
    autoArchiveClients: false,
    autoApproveTrainers: false,
    timezone: "Asia/Kathmandu",
    sessionTimeout: 30,
    releaseChannel: "stable",
    dataExportEmail: ""
};

const AdminSettings = () => {
    const [settings, setSettings] = useState(defaultSettings);
    const [status, setStatus] = useState(null);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setSettings(prev => ({ ...prev, ...JSON.parse(saved) }));
            } catch (err) {
                console.error("Failed to parse settings", err);
            }
        }
    }, []);

    const handleToggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        setStatus({ type: "success", text: "Preferences saved locally." });
        setTimeout(() => setStatus(null), 4000);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Admin Settings</h1>
                    <p className="text-gray-500">Control communication, automation and privacy preferences for your admin workspace.</p>
                </div>
                <div className="bg-white rounded-xl shadow px-5 py-3 flex items-center gap-3">
                    <MdSchedule className="text-yellow-500" size={26} />
                    <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">Session Timeout</p>
                        <p className="text-sm font-semibold">{settings.sessionTimeout} min</p>
                    </div>
                </div>
            </div>

            {status && (
                <div className={`p-4 rounded-lg ${status.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                    {status.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <section className="bg-white rounded-xl shadow p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                            <MdNotifications size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">Notification Preferences</h2>
                            <p className="text-sm text-gray-500">Choose when and how admins receive alerts, summaries and escalations.</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {[
                            { label: "Email notifications", key: "emailNotifications", description: "Receive invoices, payout reports and breach alerts." },
                            { label: "Push notifications", key: "pushNotifications", description: "Realtime assignment escalations on desktop & mobile." },
                            { label: "Weekly digest", key: "weeklyDigest", description: "Every Monday at 9 AM local time." },
                            { label: "New enrollment alerts", key: "enrollmentAlerts", description: "Notify when a trainer approves or rejects a client." },
                            { label: "Assignment escalations", key: "assignmentEscalations", description: "Escalate overdue tasks to admins." }
                        ].map(item => (
                            <label key={item.key} className="flex items-start justify-between gap-4 border rounded-lg p-3 hover:border-yellow-300 cursor-pointer">
                                <div>
                                    <p className="font-medium text-gray-800">{item.label}</p>
                                    <p className="text-sm text-gray-500">{item.description}</p>
                                </div>
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 text-yellow-500"
                                    checked={settings[item.key]}
                                    onChange={() => handleToggle(item.key)}
                                />
                            </label>
                        ))}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Digest destination email</label>
                            <input
                                type="email"
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                placeholder="ops@company.com"
                                value={settings.dataExportEmail}
                                onChange={(e) => handleChange("dataExportEmail", e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                            <select
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                value={settings.timezone}
                                onChange={(e) => handleChange("timezone", e.target.value)}
                            >
                                <option value="Asia/Kathmandu">Asia/Kathmandu (GMT+5:45)</option>
                                <option value="Asia/Kolkata">Asia/Kolkata (GMT+5:30)</option>
                                <option value="UTC">UTC</option>
                                <option value="America/New_York">America/New_York</option>
                                <option value="Europe/London">Europe/London</option>
                            </select>
                        </div>
                    </div>
                </section>

                <section className="bg-white rounded-xl shadow p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                            <MdDarkMode size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">Interface & Workflow</h2>
                            <p className="text-sm text-gray-500">Customize layouts, automation rules and how long sessions stay active.</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                            <select
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                value={settings.theme}
                                onChange={(e) => handleChange("theme", e.target.value)}
                            >
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                                <option value="system">Match system</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Session timeout (minutes)</label>
                            <input
                                type="number"
                                min={10}
                                max={180}
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                value={settings.sessionTimeout}
                                onChange={(e) => handleChange("sessionTimeout", Number(e.target.value))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Release channel</label>
                            <select
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                value={settings.releaseChannel}
                                onChange={(e) => handleChange("releaseChannel", e.target.value)}
                            >
                                <option value="stable">Stable</option>
                                <option value="preview">Preview</option>
                                <option value="beta">Beta</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            { label: "Auto archive inactive clients", key: "autoArchiveClients", description: "Archive client records after 60 days of inactivity." },
                            { label: "Auto approve verified trainers", key: "autoApproveTrainers", description: "Automatically approve trainers that pass document checks." }
                        ].map(item => (
                            <label key={item.key} className="flex items-start justify-between gap-4 border rounded-lg p-3 hover:border-yellow-300 cursor-pointer">
                                <div>
                                    <p className="font-medium text-gray-800">{item.label}</p>
                                    <p className="text-sm text-gray-500">{item.description}</p>
                                </div>
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 text-yellow-500"
                                    checked={settings[item.key]}
                                    onChange={() => handleToggle(item.key)}
                                />
                            </label>
                        ))}
                    </div>
                </section>

                <section className="bg-white rounded-xl shadow p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                            <MdSecurity size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">Data & Privacy</h2>
                            <p className="text-sm text-gray-500">Stay compliant with export policies and keep a traceable audit history.</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <label className="border rounded-lg p-4 flex items-start gap-3 hover:border-yellow-300 cursor-pointer">
                            <div className="p-2 rounded-full bg-yellow-50 text-yellow-600 mt-1">
                                <MdCloudDownload />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">Monthly data export</p>
                                <p className="text-sm text-gray-500">Receive a CSV of courses, products and payouts at the end of every month.</p>
                                <input
                                    type="checkbox"
                                    className="mt-3 w-5 h-5 text-yellow-500"
                                    checked={settings.monthlyExport || false}
                                    onChange={() => handleToggle("monthlyExport")}
                                />
                            </div>
                        </label>
                        <label className="border rounded-lg p-4 flex items-start gap-3 hover:border-yellow-300 cursor-pointer">
                            <div className="p-2 rounded-full bg-yellow-50 text-yellow-600 mt-1">
                                <MdSecurity />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">Login anomaly alerts</p>
                                <p className="text-sm text-gray-500">Notify all admins when logins happen from unfamiliar devices.</p>
                                <input
                                    type="checkbox"
                                    className="mt-3 w-5 h-5 text-yellow-500"
                                    checked={settings.loginAlerts || false}
                                    onChange={() => handleToggle("loginAlerts")}
                                />
                            </div>
                        </label>
                    </div>
                </section>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => setSettings(defaultSettings)}
                        className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                        Restore defaults
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                    >
                        Save preferences
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminSettings;
