import React, { useState } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import "./AvisSection.css";

const AvisSection = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Dr. Marie Dubois",
      position: "Directrice Technique",
      company: "Laboratoire DentoParis",
      location: "Paris, France",
      rating: 5,
      text: "IA Lab a révolutionné notre flux de travail. Nous avons réduit de 70% le temps de traitement des commandes et nos erreurs ont pratiquement disparu. L'intégration avec Itero et 3Shape est parfaite.",
      avatar: "MD",
    },
    {
      id: 2,
      name: "Marc Fontaine",
      position: "Prothésiste Dentaire",
      company: "Lab Sourire Plus",
      location: "Lyon, France",
      rating: 5,
      text: "L'IA générative pour les bons de commande est impressionnante. Elle comprend parfaitement les spécifications techniques et génère des socles précis. Un gain de temps énorme !",
      avatar: "MF",
    },
    {
      id: 3,
      name: "Dr. Sophie Martin",
      position: "Chef de Production",
      company: "Centre Dentaire Innovant",
      location: "Marseille, France",
      rating: 5,
      text: "Depuis l'adoption d'IA Lab, notre productivité a explosé. La centralisation de toutes nos plateformes en une seule interface nous fait gagner plusieurs heures par jour.",
      avatar: "SM",
    },
    {
      id: 4,
      name: "Jean-Pierre Moreau",
      position: "Gérant",
      company: "Laboratoire Precision",
      location: "Toulouse, France",
      rating: 5,
      text: "L'automatisation des socles dentaires est un game-changer. La précision millimétrique et la rapidité d'exécution ont considérablement amélioré notre qualité de service.",
      avatar: "JPM",
    },
    {
      id: 5,
      name: "Dr. Claire Rousseau",
      position: "Responsable Qualité",
      company: "DentalTech Pro",
      location: "Bordeaux, France",
      rating: 5,
      text: "Le support client est exceptionnel et la plateforme est intuitive. Nos équipes ont été formées rapidement et adoptent facilement les nouvelles fonctionnalités.",
      avatar: "CR",
    },
    {
      id: 6,
      name: "Antoine Bergeron",
      position: "Directeur Technique",
      company: "Lab Excellence",
      location: "Lille, France",
      rating: 5,
      text: "Les analytics en temps réel nous permettent de suivre nos performances et d'optimiser continuellement nos processus. Un outil indispensable pour un laboratoire moderne.",
      avatar: "AB",
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
          <h2 className="testimonials-main-title">Ce que disent nos clients</h2>
          <p className="testimonials-main-subtitle">
            Découvrez comment IA Lab transforme le quotidien des laboratoires
            dentaires partout en France
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
            <span className="testimonials-metric-number">4.9/5</span>
            <span className="testimonials-metric-label">Note moyenne</span>
          </div>
          <div className="testimonials-metric-item">
            <span className="testimonials-metric-number">500+</span>
            <span className="testimonials-metric-label">Avis clients</span>
          </div>
          <div className="testimonials-metric-item">
            <span className="testimonials-metric-number">98%</span>
            <span className="testimonials-metric-label">
              Recommandent IA Lab
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AvisSection;
