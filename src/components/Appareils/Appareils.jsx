import React, { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Appareils = () => {
  const [appareils, setAppareils] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("API_BASE_URL =", API_BASE_URL);
    console.log("URL appelée =", `${API_BASE_URL}/appareils`);

    fetch(`${API_BASE_URL}/appareils`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Erreur HTTP ! statut: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("✅ Données reçues:", data);
        setAppareils(data);
      })
      .catch((err) => {
        console.error("❌ Erreur lors du fetch:", err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <p>⏳ Chargement...</p>;
  if (error) return <p style={{ color: "red" }}>❌ Erreur: {error}</p>;

  return (
    <div>
      <h1>Liste des appareils</h1>
      {appareils.length === 0 ? (
        <p>Aucun appareil trouvé.</p>
      ) : (
        <ul>
          {appareils.map((appareil) => (
            <li key={appareil.id}>{appareil.nom}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Appareils;
