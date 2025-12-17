import React from "react";
import { MapPin, Navigation, ExternalLink } from "lucide-react";
import "./AddressMap.css";

const AddressMap = () => {
  const address = "Boulevard Roosevelt 23, 7060 Soignies, Belgique";
  // Encodage pour l'URL
  const encodedAddress = encodeURIComponent(address);
  // URL standard pour l'iframe Google Maps (souvent fonctionne sans API key pour affichage simple)
  const mapSrc = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  // Lien pour ouvrir l'application GPS externe
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

  return (
    <section className="am-section">
      <div className="am-container">
        {/* Wrapper de la carte */}
        <div className="am-map-wrapper">
          <iframe
            className="am-iframe"
            src={mapSrc}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Localisation MySmileLab Soignies"
          ></iframe>
        </div>

        {/* Carte d'information flottante */}
        <div className="am-info-card">
          <div className="am-header">
            <div className="am-icon-circle">
              <MapPin size={24} />
            </div>
            <h2>Notre localisation</h2>
          </div>

          <div className="am-address">
            <p className="am-street">Boulevard Roosevelt 23</p>
            <p className="am-city">7060 Soignies, Belgique</p>
          </div>

          <a
            href={mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="am-btn"
          >
            <Navigation size={18} />
            Obtenir l'itinéraire
          </a>
        </div>
      </div>
    </section>
  );
};

export default AddressMap;
