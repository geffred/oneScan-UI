import React, { useState } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import "./AvisSection.css";

const AvisSection = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Varsik Hakopian",
      position: "",
      company: "iDent Clinic",
      location: "",
      rating: 5,
      text: "Merci à l'équipe SmileLAB ! Un travail professionnel avec des appareils orthodontiques de qualité. C'est MON laboratoire de référence.",
      avatar: "VH",
    },
    {
      id: 2,
      name: "Morgel Svetlana",
      position:
        "DSO, CEO Smiley's orthodontics, Coordinatrice des post-gradués en orthodontie ULB Erasme",
      company: "",
      location: "Bruxelles, Belgique",
      rating: 5,
      text: "Excellent Labo ! Très satisfaite de leur travail. Personnellement je suis fan de leurs disjoncteurs frittés. Équipe professionnelle, efficace et respecte nos prescriptions. Ils sont disponibles pour répondre aux questions. Livraison en temps et en heure.",
      avatar: "MS",
    },
    {
      id: 3,
      name: "Anne-Flore Latournerie",
      position: "DSO",
      company: "",
      location: "",
      rating: 5,
      text: "Cela fait environ 6 mois que je travaille avec Smile Lab et j'en suis très contente. Les appareils demandés sont de très bonne qualité et l'équipe est très réactive.",
      avatar: "AF",
    },
    {
      id: 4,
      name: "Bouzelmat Safia",
      position: "DSO, Lys Dental",
      company: "",
      location: "",
      rating: 5,
      text: "Très bon laboratoire d'orthodontie. Il est possible de réaliser tout type d'appareil de façon très personnalisée. Par téléphone (recommandé) La communication est privilégiée et offre une grande facilité dans les échanges avec le labo. Je recommande !",
      avatar: "BS",
    },
    {
      id: 5,
      name: "Prof. Dr. Maria Orellana",
      position:
        "Professor and clinic director of the Orthodontic Program at the Université Libre de Bruxelles (ULB) at the Erasme Hospital",
      company: "Erasme Hospital",
      location: "Bruxelles, Belgique",
      rating: 5,
      text: "Appareils de qualité, service impeccable, et le plus important : un processus entièrement digital qui nous permet de gagner du temps au fauteuil et augmente drastiquement la qualité de l'expérience du patient.",
      avatar: "MO",
    },
    {
      id: 6,
      name: "El Hajjaji Mohssin",
      position:
        "DSO, CEO Orthosmile, Président BUOS (BELGIAN UNION OF ORTHODONTIST SPECIALISTS), Speaker",
      company: "",
      location: "",
      rating: 5,
      text: "Laboratoire d'orthodontie à l'écoute des clients. Communication digitale et réponse rapide. Livraison des travaux à temps.",
      avatar: "EHM",
    },
    {
      id: 7,
      name: "Delfour Victoire",
      position: "DSO",
      company: "",
      location: "",
      rating: 5,
      text: "Super laboratoire où un travail de qualité et de précision est réalisé. En plus de ça, l'équipe est vraiment sympathique. Je suis pleinement satisfaite et je recommande SmileLab.",
      avatar: "DV",
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
          <h2 className="testimonials-main-title">Ils nous recommandent</h2>
          <p className="testimonials-main-subtitle">
            Des professionnels de l'orthodontie partagent leur satisfaction
            après collaboration avec notre laboratoire
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
