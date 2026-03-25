import { useTrainerForm } from "../../hooks/UseTrainerForm"
import { useGeoLocation } from "../../hooks/UseGeoLocation"
import TrainerMap from "../../components/TrainerMap"
import { registerTrainerService } from "../../services/trainerService"
import { useState } from "react"
import { useNavigate } from "react-router";

export default function RegisterTrainer() {
  const { formData, updateField } = useTrainerForm()
  const { location, error: locationError } = useGeoLocation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [files, setFiles] = useState([])
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!formData.email || !formData.password || !formData.contact) {
      setError("Email, password and contact are required.")
      return
    }

    if (!location) {
      setError("Location is required.")
      return
    }

    try {
      setLoading(true)

      const payload = new FormData()

payload.append("email", formData.email)
payload.append("password", formData.password)
payload.append("username", formData.username)
payload.append("contact", formData.contact)
payload.append("specialization", formData.specialization)
payload.append("type", formData.type)
payload.append("latitude", location.lat)
payload.append("longitude", location.lng)
payload.append("radius", formData.radiusKm)
console.log(files)

files.forEach((file) => {
  payload.append("certificate", file)
})
      await registerTrainerService(payload)
      setSuccess("Trainer registered successfully!")
      navigate("/login")

    } catch (err) {
      setError("Failed to register trainer.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg overflow-hidden grid grid-cols-1 lg:grid-cols-2">

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <h2 className="text-2xl font-bold text-gray-800">
            Trainer Registration
          </h2>

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
          />
           <Input
            label="Username"
            type="text"
            value={formData.username}
            onChange={(e) => updateField("username", e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => updateField("password", e.target.value)}
          />

          <Input
            label="Contact Number"
            value={formData.contact}
            onChange={(e) => updateField("contact", e.target.value)}
          />

          <Input
            label="Specialization"
            value={formData.specialization}
            onChange={(e) => updateField("specialization", e.target.value)}
          />

          <Select
            label="Trainer Type"
            value={formData.type}
            onChange={(e) => updateField("type", e.target.value)}
            options={[
              { label: "Select type", value: "" },
              { label: "Personal Trainer", value: "personal" },
              { label: "Nutritionist", value: "nutrition" },
              { label: "Physiotherapist", value: "physio" },
            ]}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Service Radius: {formData.radiusKm} km
            </label>
            <input
              type="range"
              min={1}
              max={15}
              value={formData.radiusKm}
              onChange={(e) => updateField("radiusKm", e.target.value)}
              className="w-full accent-blue-600"
            />
          </div>
          <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Documents (max 4)
  </label>
  <input
    type="file"
    multiple
    accept="image/*,application/pdf"
    onChange={(e) => setFiles(Array.from(e.target.files))}
    className="w-full border border-gray-300 rounded-lg px-4 py-2"
  />
</div>


          {location && (
            <p className="text-sm text-green-600">
              Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </p>
          )}

          {locationError && (
            <p className="text-sm text-red-600">{locationError}</p>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register Trainer"}
          </button>
        </form>

        {/* MAP */}
        <div className="h-[400px] lg:h-full">
          <TrainerMap location={location} radiusKm={formData.radiusKm} />
        </div>
      </div>
    </div>
  )
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        {...props}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    </div>
  )
}

function Select({ label, options, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        {...props}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
