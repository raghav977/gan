import React from "react";
import hero from "../assets/svghero.jpg";

const HeroSection = () => {
  return (
    <section className="w-full py-16 bg-[##EAEAEA]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 items-center px-6">

        {/* LEFT SECTION */}
        <div className="space-y-6 h-[400px]">
          <h3 className="text-4xl font-bold text-gray-900 tracking-tight">
            No Pain
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic quia
            beatae praesentium maiores! Dolores ipsum eveniet quam, aliquid quas
            maiores?
          </p>

          <button className="bg-[#F7C707] text-black px-6 py-3 rounded-xl text-sm font-semibold shadow-md hover:bg-yellow-500 transition">
            Explore More
          </button>

          <div className="flex items-center gap-3 pt-4">
            <span className="text-3xl font-bold text-gray-900">15</span>
            <p className="text-gray-500 text-sm">Active Coaches</p>
          </div>
        </div>

        {/* CENTER IMAGE */}
        <div className="flex justify-center">
          <img
            src={hero}
            alt="Hero"
            className="w-full object-cover"
          />
        </div>

        {/* RIGHT SECTION */}
        <div className="space-y- h-[400px] flex flex-col gap-4">
          <h3 className="text-4xl font-bold text-gray-900 tracking-tight">
            No Gain
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sunt
            repudiandae molestias eos corporis nulla placeat, saepe tenetur
            dolorum dignissimos molestiae nisi reiciendis.
          </p>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
