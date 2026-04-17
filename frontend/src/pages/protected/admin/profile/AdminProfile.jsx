import React, { useEffect, useState } from "react";
import { MdEmail, MdPhone, MdPerson, MdSecurity, MdUpdate } from "react-icons/md";
import { getAdminProfile, updateAdminProfile } from "../../../../api/admin.user";

const initialPasswords = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
};

const AdminProfile = () => {
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({ username: "", email: "", contact: "" });
    const [passwords, setPasswords] = useState(initialPasswords);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setMessage(null);
            const res = await getAdminProfile();
            const data = res.data || res;
            setProfile(data);
            setFormData({
                username: data?.username || "",
                email: data?.email || "",
                contact: data?.contact || ""
            });
        } catch (err) {
            setMessage({ type: "error", text: err.message || "Failed to fetch profile" });
        } finally {
            setLoading(false);
        }
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswords(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);

        if (passwords.newPassword && passwords.newPassword !== passwords.confirmPassword) {
            setMessage({ type: "error", text: "New passwords do not match" });
            return;
        }

        const payload = { ...formData };
        if (passwords.newPassword) {
            payload.currentPassword = passwords.currentPassword;
            payload.newPassword = passwords.newPassword;
        }

        try {
            setSaving(true);
            const res = await updateAdminProfile(payload);
            const data = res.data || res;
            setProfile(data);
            setMessage({ type: "success", text: res.message || "Profile updated successfully" });
            setPasswords(initialPasswords);
        } catch (err) {
            setMessage({ type: "error", text: err.message || "Failed to update profile" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Admin Profile</h1>
                    <p className="text-gray-500">Review your account details and keep them up to date.</p>
                </div>
                <div className="bg-white rounded-lg shadow px-4 py-3 flex items-center gap-3">
                    <MdUpdate className="text-yellow-500" size={24} />
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Last updated</p>
                        <p className="text-sm font-medium text-gray-800">{new Date(profile?.updatedAt || profile?.createdAt || Date.now()).toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-lg ${message.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                    {message.text}
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-yellow-100 text-yellow-600 p-3 rounded-full">
                            <MdPerson size={24} />
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">Full Name</p>
                            <p className="font-semibold text-gray-800">{profile?.username || "Not set"}</p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500">Used across analytics, notifications and support tickets.</p>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-yellow-100 text-yellow-600 p-3 rounded-full">
                            <MdEmail size={24} />
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">Email</p>
                            <p className="font-semibold text-gray-800 break-all">{profile?.email}</p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500">Primary contact for billing alerts, escalations and audit exports.</p>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-yellow-100 text-yellow-600 p-3 rounded-full">
                            <MdPhone size={24} />
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">Contact</p>
                            <p className="font-semibold text-gray-800">{profile?.contact || "Not set"}</p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500">Shared with verified trainers for urgent platform-wide incidents.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-6">
                <div>
                    <h2 className="text-lg font-semibold mb-1">Profile Information</h2>
                    <p className="text-sm text-gray-500">Keep your core contact channels current to avoid downtime in approvals or payouts.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleProfileChange}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            placeholder="Jane Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleProfileChange}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            placeholder="admin@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                        <input
                            type="text"
                            name="contact"
                            value={formData.contact}
                            onChange={handleProfileChange}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            placeholder="+977 9800000000"
                        />
                    </div>
                </div>

                <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-4">
                        <MdSecurity className="text-yellow-500" size={20} />
                        <div>
                            <h3 className="font-semibold">Security</h3>
                            <p className="text-sm text-gray-500">Rotate your password regularly to comply with security best-practices.</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={passwords.currentPassword}
                                onChange={handlePasswordChange}
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={passwords.newPassword}
                                onChange={handlePasswordChange}
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                placeholder="At least 6 characters"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={passwords.confirmPassword}
                                onChange={handlePasswordChange}
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                placeholder="Repeat new password"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={fetchProfile}
                        className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                        disabled={saving}
                    >
                        Reset
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-60"
                        disabled={saving}
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminProfile;
