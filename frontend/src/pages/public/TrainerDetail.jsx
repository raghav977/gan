import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../../components/Header'
import { getTrainerDetail } from '../../api/public.trainer'
import { MdArrowBack, MdStar, MdVerified, MdLocationOn, MdPhone, MdEmail } from 'react-icons/md'

const TrainerDetail = () => {
  const { trainerId } = useParams()
  const navigate = useNavigate()
  const [trainer, setTrainer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTrainerDetail = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await getTrainerDetail(trainerId)
        setTrainer(result.trainer)
        console.log("Trainer detail:", result.trainer)
      } catch (err) {
        console.error("Failed to fetch trainer:", err)
        setError(err.message || "Failed to load trainer details")
      } finally {
        setLoading(false)
      }
    }

    if (trainerId) {
      fetchTrainerDetail()
    }
  }, [trainerId])

  if (loading) {
    return (
      <div>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F7C707]"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Header />
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={() => navigate('/trainers')}
            className="bg-[#F7C707] text-gray-900 px-6 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
          >
            Back to Trainers
          </button>
        </div>
      </div>
    )
  }

  if (!trainer) {
    return (
      <div>
        <Header />
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <p className="text-gray-600 text-lg">Trainer not found</p>
          <button
            onClick={() => navigate('/trainers')}
            className="bg-[#F7C707] text-gray-900 px-6 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
          >
            Back to Trainers
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header />

      {/* Back Button */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate('/trainers')}
            className="flex items-center gap-2 text-[#F7C707] font-semibold hover:text-yellow-600 transition-colors"
          >
            <MdArrowBack size={20} />
            Back to Trainers
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left: Profile Card */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-8 sticky top-24">
          {/* Profile Image */}
          <div className="w-full aspect-square bg-linear-to-br from-[#F7C707] to-yellow-500 rounded-xl flex items-center justify-center mb-6">
            <div className="text-5xl text-white font-bold">
              {trainer.username?.charAt(0).toUpperCase()}
            </div>
          </div>              {/* Name & Verification */}
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {trainer.username}
                  </h1>
                  {trainer.is_verified && (
                    <MdVerified size={24} className="text-blue-500" />
                  )}
                </div>
                <p className="text-gray-600 font-semibold">{trainer.specialization}</p>
              </div>

              {/* Contact Info */}
              <div className="space-y-3 mb-6 border-y py-4">
                {trainer.email && (
                  <div className="flex items-center gap-3">
                    <MdEmail className="text-[#F7C707]" size={20} />
                    <span className="text-sm text-gray-600">{trainer.email}</span>
                  </div>
                )}
                {trainer.contact && (
                  <div className="flex items-center gap-3">
                    <MdPhone className="text-[#F7C707]" size={20} />
                    <span className="text-sm text-gray-600">{trainer.contact}</span>
                  </div>
                )}
                {(trainer.latitude && trainer.longitude) && (
                  <div className="flex items-center gap-3">
                    <MdLocationOn className="text-[#F7C707]" size={20} />
                    <span className="text-sm text-gray-600">
                      {trainer.latitude}, {trainer.longitude}
                    </span>
                  </div>
                )}
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <button className="w-full bg-[#F7C707] text-gray-900 font-semibold py-3 rounded-lg hover:bg-yellow-600 transition-colors">
                  Enroll Now
                </button>
                <button className="w-full border-2 border-[#F7C707] text-[#F7C707] font-semibold py-3 rounded-lg hover:bg-yellow-50 transition-colors">
                  Send Message
                </button>
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div className="md:col-span-2 space-y-8">
            {/* Specialization */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Specialization</h2>
              <div className="flex flex-wrap gap-2">
                <span className="bg-[#F7C707] text-gray-900 px-4 py-2 rounded-full font-semibold">
                  {trainer.specialization}
                </span>
                {trainer.type && (
                  <span className="bg-gray-200 text-gray-900 px-4 py-2 rounded-full font-semibold">
                    {trainer.type}
                  </span>
                )}
              </div>
            </div>

            {/* Service Area */}
            {trainer.radius && (
              <div className="bg-white rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Area</h2>
                <p className="text-gray-600 text-lg">
                  Operating within a <span className="font-bold text-[#F7C707]">{trainer.radius}km</span> radius
                </p>
                {trainer.latitude && trainer.longitude && (
                  <p className="text-gray-500 text-sm mt-2">
                    Location: {trainer.latitude}, {trainer.longitude}
                  </p>
                )}
              </div>
            )}

            {/* About Section */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                This is a verified trainer with expertise in <span className="font-semibold">{trainer.specialization}</span>.
              </p>
              <p className="text-gray-600 leading-relaxed">
                They are committed to helping clients achieve their fitness goals through personalized training programs and expert guidance.
              </p>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-linear-to-br from-[#F7C707] to-yellow-500 rounded-xl p-6 text-center">
                <p className="text-gray-900 text-sm font-semibold mb-2">Status</p>
                <p className="text-2xl font-bold text-gray-900">Verified</p>
              </div>
              <div className="bg-gray-100 rounded-xl p-6 text-center">
                <p className="text-gray-600 text-sm font-semibold mb-2">Type</p>
                <p className="text-2xl font-bold text-gray-900">{trainer.type || 'N/A'}</p>
              </div>
              <div className="bg-gray-100 rounded-xl p-6 text-center">
                <p className="text-gray-600 text-sm font-semibold mb-2">Radius</p>
                <p className="text-2xl font-bold text-gray-900">{trainer.radius || 'N/A'}km</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrainerDetail
