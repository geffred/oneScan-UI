import React from "react";
import "./AddressMap.css";

const AddressMap = () => {
  const address = "Boulevard Roosevelt 23, 7060 Soignies, Belgique";
  const encodedAddress = encodeURIComponent(address);

  return (
    <div className="simple-map-container">
      <div className="map-wrapper">
        <iframe
          className="google-map-iframe"
          src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2537.123456789012!2d4.0713!3d50.5790!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTDCsDM0JzQ0LjQiTiA0wrAwNCcyNS43IkU!5e0!3m2!1sfr!2sbe!4v1234567890!5m2!1sfr!2sbe`}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Localisation MySmileLab Soignies"
        ></iframe>
      </div>

      <div className="map-actions"></div>
      <div className="map-header">
        <h2>Notre localisation</h2>
        <p>Boulevard Roosevelt 23, 7060 Soignies</p>

        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="action-btn"
        >
          Obtenir l'itinéraire
        </a>
      </div>
    </div>
  );
};

export default AddressMap;
