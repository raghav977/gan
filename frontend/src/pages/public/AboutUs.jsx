import React from 'react'
import Header from '../../components/Header'
import { MdFitnessCenter, MdPeople, MdTrendingUp, MdStar } from 'react-icons/md'

const AboutUs = () => {
  const stats = [
    { label: "Active Members", value: "5,000+" },
    { label: "Certified Trainers", value: "150+" },
    { label: "Success Stories", value: "3,500+" },
    { label: "Years of Excellence", value: "8+" }
  ];

  const team = [
    { name: "Raj Kumar", role: "Founder & Head Coach", bio: "Certified strength coach with 10+ years in the fitness industry." },
    { name: "Priya Sharma", role: "Nutrition Director", bio: "Sports nutritionist helping clients reach peak performance." },
    { name: "Arjun Patel", role: "Lead Trainer", bio: "Specializes in functional training and athletic development." },
    { name: "Maya Singh", role: "Wellness Coach", bio: "Holistic health practitioner focused on mental wellness." }
  ];

  const values = [
    { icon: <MdFitnessCenter size={32} />, title: "Fitness First", desc: "Your health is our priority. We create personalized plans for every body." },
    { icon: <MdPeople size={32} />, title: "Community Driven", desc: "Join a supportive community that celebrates your wins big and small." },
    { icon: <MdTrendingUp size={32} />, title: "Results Oriented", desc: "Data-driven approach ensures you see measurable progress." },
    { icon: <MdStar size={32} />, title: "Excellence", desc: "Industry-certified trainers delivering world-class fitness education." }
  ];

  return (
    <div>
      <Header />

      {/* Hero Section */}
      <section className="bg-linear-to-r from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-extrabold mb-4">About GYM FITNESS</h1>
          <p className="text-xl text-gray-300">Empowering fitness journeys through expert guidance, community, and technology</p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-extrabold text-gray-900 mb-6">Our Story</h2>
              <p className="text-gray-600 text-lg mb-4">
                Founded in 2016, GYM FITNESS started with a simple mission: make professional fitness coaching accessible to everyone.
              </p>
              <p className="text-gray-600 text-lg mb-4">
                Today, we serve thousands of members across Nepal and beyond, connecting them with certified trainers, personalized workout plans, and a supportive community.
              </p>
              <p className="text-gray-600 text-lg">
                We believe fitness is about mental wellness, self-discipline, and building habits that transform lives.
              </p>
            </div>
            <div className="relative">
              <div className="bg-linear-to-br from-[#F7C707] to-yellow-500 rounded-2xl p-8 shadow-xl">
                <div className="grid grid-cols-2 gap-6">
                  {stats.map((stat, idx) => (
                    <div key={idx} className="text-center">
                      <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                      <p className="text-sm text-gray-700 mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-900">Our Core Values</h2>
            <p className="text-gray-600 mt-2 text-lg">What drives us every day</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {values.map((val, idx) => (
              <div key={idx} className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow text-center">
                <div className="flex justify-center mb-4 text-[#F7C707]">
                  {val.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{val.title}</h3>
                <p className="text-gray-600">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-900">Meet Our Leadership</h2>
            <p className="text-gray-600 mt-2 text-lg">Experienced professionals dedicated to your success</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {team.map((member, idx) => (
              <div key={idx} className="bg-linear-to-b from-gray-50 to-gray-100 rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
                <div className="w-24 h-24 bg-[#F7C707] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <MdFitnessCenter size={48} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                <p className="text-[#F7C707] font-semibold text-sm mt-1">{member.role}</p>
                <p className="text-gray-600 text-sm mt-3">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-900">Why Choose Tute Kendra Hub?</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-md">
              <h4 className="text-xl font-bold text-gray-900 mb-3">Certified Trainers</h4>
              <p className="text-gray-600">All our trainers are certified and stay current with fitness science.</p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-md">
              <h4 className="text-xl font-bold text-gray-900 mb-3">Personalized Plans</h4>
              <p className="text-gray-600">Custom workout and nutrition plans tailored to your goals.</p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-md">
              <h4 className="text-xl font-bold text-gray-900 mb-3">Advanced Technology</h4>
              <p className="text-gray-600">Digital platform for progress tracking and trainer connection.</p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-md">
              <h4 className="text-xl font-bold text-gray-900 mb-3">Supportive Community</h4>
              <p className="text-gray-600">Join thousands of members supporting each other.</p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-md">
              <h4 className="text-xl font-bold text-gray-900 mb-3">Proven Results</h4>
              <p className="text-gray-600">3,500 success stories from transformed members.</p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-md">
              <h4 className="text-xl font-bold text-gray-900 mb-3">Flexible Learning</h4>
              <p className="text-gray-600">Learn at your own pace with courses and coaching.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-linear-to-r from-[#F7C707] to-yellow-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold mb-4">Ready to Transform Your Life?</h2>
          <p className="text-lg text-gray-800 mb-8">Join thousands of members achieving their fitness goals</p>
          <div className="flex gap-4 justify-center">
            <button className="bg-white text-[#F7C707] font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors">
              Get Started
            </button>
            <button className="bg-gray-900 text-white font-bold px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutUs
