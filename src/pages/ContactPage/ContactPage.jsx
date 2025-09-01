import React from "react";
import Contact from "../../components/Contact/Contact";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./ContactPage.css";

const ContactPage = () => {
  return (
    <div className="contact-page">
      <Header />
      <main className="contact-page-main">
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
