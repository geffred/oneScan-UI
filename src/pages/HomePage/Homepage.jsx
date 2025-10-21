/* eslint-disable no-unused-vars */
import React from "react";
import Header from "../../components/Header/Header";
import HeroSection from "../../components/HeroSection/HeroSection";
import FeaturesSection from "../../components/FeaturesSection/FeaturesSection";
import PlatformsSection from "../../components/PlatformsSection/PlatformsSection";
import ProcessSection from "../../components/ProcessSection/ProcessSection";
import StatsSection from "../../components/StatsSection/StatsSection";
import CTASection from "../../components/CTASection/CTASection";
import Footer from "../../components/Footer/Footer";
import "./HomePage.css"; // Assuming you have a CSS file for styling
import AvisSection from "../../components/AvisSection/AvisSection";
import TrackingSection from "../../components/TrackingSection/TrackingSection";
import AddressMap from "../../components/AddressMap/AddressMap";

const Homepage = () => {
  return (
    <div className="homepage">
      <Header />
      <HeroSection />
      <TrackingSection />
      <FeaturesSection />
      <PlatformsSection />
      <ProcessSection />
      <AvisSection />
      <StatsSection />
      <CTASection />
      <AddressMap />
      <Footer />
    </div>
  );
};

export default Homepage;
