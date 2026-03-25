import React from 'react'
import Header from '../../components/Header'
import HeroSection from '../../components/HeroSection'
import OurServices from '../../components/OurServices'
import OurCourses from '../../components/OurCourses'
import OurProducts from '../../components/OurProducts'
import OurTrainer from '../../components/OurTrainer'

const Home = () => {
  return (
    <div>
        {/* HEADER */}
        <Header/>
        <HeroSection/>
        <OurServices/>
        <OurCourses/>
        <OurProducts/>
        <OurTrainer/>
    </div>
  )
}

export default Home