import React, { useState } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import "./AvisSection.css";

const AvisSection = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Kevina Tsague",
      position: "Prothésiste Dentaire",
      company: "Lab Dentaire Mons",
      location: "Mons, Belgique",
      rating: 5,
      text: "SmileLab Ortho a considérablement simplifié notre gestion quotidienne. Nous traitons les commandes beaucoup plus rapidement et les erreurs sont quasi inexistantes.",
      avatar: "KT",
    },
    {
      id: 2,
      name: "Stéphane C",
      position: "Prothésiste Dentaire",
      company: "",
      location: "Bruxelles, Belgique",
      rating: 5,
      text: "Depuis que nous utilisons SmileLab Ortho, la centralisation de nos outils nous permet de gagner plusieurs heures par semaine. Tout est plus clair et facile à suivre.",
      avatar: "SC",
    },
    {
      id: 3,
      name: "Mey ",
      position: "Prothésiste Dentaire",
      company: " ",
      location: "Soignie, Belgique",
      rating: 5,
      text: "L’interface est intuitive et les fonctionnalités nous permettent d’éviter les erreurs répétitives. Notre productivité a nettement augmenté.",
      avatar: "M",
    },
    {
      id: 4,
      name: "Laura Verstraete",
      position: "Prothésiste Dentaire",
      company: "Lab SmileTech",
      location: "Bruxelles, Belgique",
      rating: 5,
      text: "Grâce à SmileLab Ortho, le suivi des commandes est devenu transparent. Nous pouvons facilement vérifier l’état de chaque projet et gagner en précision.",
      avatar: "LV",
    },
    {
      id: 5,
      name: "Joe",
      position: "Prothésiste Dentaire",
      company: "",
      location: "Mons, Belgique",
      rating: 5,
      text: "L’outil nous fait économiser énormément de temps et réduit les risques d’erreurs. C’est devenu indispensable dans notre laboratoire.",
      avatar: "JD",
    },
    {
      id: 6,
      name: "Geffred N. Tchapda",
      position: "Designer 3D",
      company: "cgcm studio",
      location: "Charleroi, Belgique",
      rating: 5,
      text: "SmileLab Ortho centralise tous nos processus et facilite la communication entre nos équipes. Nous sommes beaucoup plus efficaces au quotidien.",
      avatar: "TNG",
    },
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  const goToTestimonial = (index) => {
    setCurrentTestimonial(index);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        className={
          index < rating
            ? "testimonials-star-filled"
            : "testimonials-star-empty"
        }
        fill={index < rating ? "#FFB800" : "none"}
      />
    ));
  };

  return (
    <section className="testimonials-wrapper">
      <div className="testimonials-container-main">
        <div className="testimonials-header">
          <h2 className="testimonials-main-title">
            Ce que disent nos premiers Utilisateurs
          </h2>
          <p className="testimonials-main-subtitle">
            Découvrez comment Mysmilelab transforme le quotidien des
            laboratoires dentaires partout en France
          </p>
        </div>

        <div className="testimonials-carousel-wrapper">
          <button
            className="testimonials-nav-btn testimonials-nav-prev"
            onClick={prevTestimonial}
            aria-label="Avis précédent"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="testimonials-slider-track">
            <div
              className="testimonials-slides-container"
              style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={testimonial.id} className="testimonials-card-item">
                  <div className="testimonials-quote-icon">
                    <Quote size={32} />
                  </div>

                  <div className="testimonials-card-content">
                    <div className="testimonials-rating-display">
                      {renderStars(testimonial.rating)}
                    </div>

                    <p className="testimonials-review-text">
                      "{testimonial.text}"
                    </p>

                    <div className="testimonials-author-section">
                      <div className="testimonials-author-avatar">
                        <span>{testimonial.avatar}</span>
                      </div>
                      <div className="testimonials-author-details">
                        <h4 className="testimonials-author-name">
                          {testimonial.name}
                        </h4>
                        <p className="testimonials-author-role">
                          {testimonial.position}
                        </p>
                        <p className="testimonials-author-workplace">
                          {testimonial.company}
                        </p>
                        <p className="testimonials-author-location">
                          {testimonial.location}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            className="testimonials-nav-btn testimonials-nav-next"
            onClick={nextTestimonial}
            aria-label="Avis suivant"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="testimonials-dots-navigation">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`testimonials-dot ${
                currentTestimonial === index ? "testimonials-dot-active" : ""
              }`}
              onClick={() => goToTestimonial(index)}
              aria-label={`Aller à l'avis ${index + 1}`}
            />
          ))}
        </div>

        <div className="testimonials-metrics-section">
          <div className="testimonials-metric-item">
            <span className="testimonials-metric-number">+25</span>
            <span className="testimonials-metric-label">Commande par jour</span>
          </div>
          <div className="testimonials-metric-item">
            <span className="testimonials-metric-number">92%</span>
            <span className="testimonials-metric-label">
              Gain de temps constaté
            </span>
          </div>
          <div className="testimonials-metric-item">
            <span className="testimonials-metric-number">4.9/5</span>
            <span className="testimonials-metric-label">
              Satisfaction moyenne
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AvisSection;
