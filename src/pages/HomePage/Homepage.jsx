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
import { ToastContainer } from "react-toastify";

const Homepage = () => {
  return (
    <div className="homepage">
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
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
