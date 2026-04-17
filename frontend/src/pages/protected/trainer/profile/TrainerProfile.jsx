import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MdBadge, MdPerson, MdWork, MdTimeline, MdLink, MdDone } from "react-icons/md";
import { selectUser, updateUser } from "../../../../store/slices/authSlice";

const STORAGE_KEY = "trainer_profile";

const defaultProfile = {
  fullName: "",
  headline: "Strength & Conditioning Coach",
  specialization: "Functional Training",
  yearsOfExperience: "3",
  bio: "",
  pricing: "40",
  instagram: "",
  youtube: "",
  certifications: "",
};

const TrainerProfile = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [profile, setProfile] = useState(defaultProfile);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      setProfile(JSON.parse(cached));
    } else {
      setProfile((prev) => ({
        ...prev,
        fullName: user?.displayName || user?.username || "",
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      dispatch(updateUser({
        displayName: profile.fullName,
        specialization: profile.specialization,
      }));
      setSaving(false);
      setMessage({ type: "success", text: "Profile saved locally. Connect API to persist server-side." });
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Trainer Profile</h1>
          <p className="text-gray-500">Curate the story clients see on your portfolio, proposals and booking flows.</p>
        </div>
        <div className="bg-white rounded-xl shadow px-5 py-4 flex items-center gap-4">
          <MdBadge className="text-yellow-500" size={32} />
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">Account Type</p>
            <p className="font-semibold text-gray-800">{user?.role || "trainer"}</p>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-yellow-100 text-yellow-600 p-2 rounded-full">
              <MdPerson size={22} />
            </div>
            <div>
              <p className="text-xs uppercase text-gray-400">Clients see</p>
              <p className="font-semibold">{profile.fullName || "Your name"}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">Displayed on onboarding flows, proposals and chat threads.</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-yellow-100 text-yellow-600 p-2 rounded-full">
              <MdWork size={22} />
            </div>
            <div>
              <p className="text-xs uppercase text-gray-400">Specialization</p>
              <p className="font-semibold">{profile.specialization || "Not specified"}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">Helps users match with your niche instantly.</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-yellow-100 text-yellow-600 p-2 rounded-full">
              <MdTimeline size={22} />
            </div>
            <div>
              <p className="text-xs uppercase text-gray-400">Experience</p>
              <p className="font-semibold">{profile.yearsOfExperience || 0}+ years</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">Shown on user dashboards and search results.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Core Information</h2>
          <p className="text-sm text-gray-500">This powers proposals, schedule cards and AI profile summaries.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Full name</label>
            <input
              type="text"
              name="fullName"
              value={profile.fullName}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-yellow-500"
              placeholder="E.g. Sanish Lama"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Headline</label>
            <input
              type="text"
              name="headline"
              value={profile.headline}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-yellow-500"
              placeholder="Strength & Mobility Specialist"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Specialization</label>
            <input
              type="text"
              name="specialization"
              value={profile.specialization}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-yellow-500"
              placeholder="e.g. Powerlifting, Posture Rehab"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Years of experience</label>
            <input
              type="number"
              min="0"
              name="yearsOfExperience"
              value={profile.yearsOfExperience}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-yellow-500"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Bio</label>
          <textarea
            name="bio"
            value={profile.bio}
            onChange={handleChange}
            rows={4}
            className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-yellow-500"
            placeholder="Tell clients how you coach, your wins and your coaching philosophy."
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Session pricing (USD)</label>
            <input
              type="number"
              min="0"
              name="pricing"
              value={profile.pricing}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Certifications</label>
            <input
              type="text"
              name="certifications"
              value={profile.certifications}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-yellow-500"
              placeholder="NASM CPT, CrossFit Level 2"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Instagram</label>
            <input
              type="text"
              name="instagram"
              value={profile.instagram}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-yellow-500"
              placeholder="@coach.handle"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">YouTube</label>
            <input
              type="text"
              name="youtube"
              value={profile.youtube}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-yellow-500"
              placeholder="Channel URL"
            />
          </div>
        </div>

        <div className="rounded-xl border p-4 bg-gray-50">
          <div className="flex items-center gap-2 mb-3">
            <MdLink className="text-yellow-500" />
            <div>
              <h3 className="font-semibold">Public profile preview</h3>
              <p className="text-sm text-gray-500">Share this card with leads; they'll see the same data once APIs are connected.</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-lg font-semibold">{profile.fullName || "Your name"}</p>
              <p className="text-gray-600">{profile.headline}</p>
              <p className="text-gray-500 text-sm">{profile.specialization} • {profile.yearsOfExperience || 0}+ yrs</p>
            </div>
            <button
              type="button"
              className="px-4 py-2 border rounded-lg border-yellow-400 text-yellow-600"
              onClick={() => {
                if (typeof window !== "undefined") {
                  navigator.clipboard.writeText(`${window.location.origin}/trainer/profile`);
                }
              }}
            >
              Copy profile URL
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2 border rounded-lg"
            onClick={() => {
              localStorage.removeItem(STORAGE_KEY);
              setProfile(defaultProfile);
            }}
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-60 flex items-center gap-2"
          >
            {saving ? "Saving..." : <><MdDone /> Save profile</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TrainerProfile;
