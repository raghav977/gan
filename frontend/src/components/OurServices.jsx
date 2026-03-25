import React from "react";

const services = [
  {
    title: "Personal Training",
    desc: "One-on-one training sessions with certified trainers to achieve your fitness goals faster.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422A12.083 12.083 0 0112 21.5 12.08 12.08 0 015.84 10.578L12 14z" />
      </svg>
    ),
  },
  {
    title: "Group Classes",
    desc: "Join energetic group classes including yoga, HIIT, and Zumba to stay motivated and have fun.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5V10a2 2 0 00-2-2h-3" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 20h5V4H2zM9 20h6V8H9z" />
      </svg>
    ),
  },
  {
    title: "Nutrition Counseling",
    desc: "Personalized nutrition plans and advice from expert dietitians to complement workouts.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 1.343-3 3v5h6v-5c0-1.657-1.343-3-3-3z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 8V6a6 6 0 0112 0v2" />
      </svg>
    ),
  },
  {
    title: "Wellness Programs",
    desc: "Programs that focus on mental health, stress management, and overall well‑being.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-2.21 0-4 1.79-4 4v4h8v-4c0-2.21-1.79-4-4-4z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 6h12" />
      </svg>
    ),
  },
  {
    title: "Online Coaching",
    desc: "Remote guidance, workout plans, and progress tracking from anywhere.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 17v-5a4 4 0 118 0v5" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v4" />
      </svg>
    ),
  },
  {
    title: "Massage Therapy",
    desc: "Relax and recover with professional massage therapy designed to relieve muscle tension.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M7 7v10a3 3 0 003 3h4a3 3 0 003-3V7" />
      </svg>
    ),
  },
];

const OurServices = () => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-10">
          <h3 className="text-3xl font-extrabold text-slate-900">Our Services</h3>
          <p className="text-slate-500 mt-2">What we offer to help you achieve your fitness goals</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {services.map((s, idx) => {
            const highlighted = idx === 0;
            return (
              <div
                key={s.title}
                className={
                  (highlighted
                    ? "bg-[#F7C707] text-black shadow-2xl transform md:-rotate-1 md:scale-105"
                    : "bg-white text-black shadow-md hover:shadow-lg hover:-translate-y-1") +
                  " rounded-2xl p-8 transition-all duration-300"
                }
              >
                <div className="flex items-start gap-4">
                  <div
                    className={
                      (highlighted ? "bg-white/20" : "bg-[#F7C707]") +
                      " w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    }
                  >
                    <div className={(highlighted ? "text-white" : "text-white") + " flex items-center justify-center"}>
                      {s.icon}
                    </div>
                  </div>

                  <div>
                    <h4 className={(highlighted ? "text-white" : "text-slate-900") + " text-xl font-semibold"}>
                      {s.title}
                    </h4>
                    <p className={(highlighted ? "text-orange-100/90" : "text-slate-500") + " mt-3"}>
                      {s.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default OurServices;