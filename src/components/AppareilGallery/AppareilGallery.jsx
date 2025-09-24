import React, { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import {
  Settings,
  Search,
  Filter,
  Eye,
  X,
  FileText,
  Tag,
  Wrench,
  Image as ImageIcon,
  User,
} from "lucide-react";
import "./AppareilGallery.css";

// Enums pour les filtres
const CATEGORIES = [
  { value: "", label: "Toutes les catégories" },
  { value: "APPAREILS_FIXES_FRITTES", label: "Appareils Fixes Frittés" },
  {
    value: "APPAREILS_SUR_ANCRAGES_OSSEUX_BENEFIT",
    label: "Appareils sur Ancrages Osseux Benefit",
  },
  { value: "APPAREILS_3D_IMPRIMES", label: "Appareils 3D Imprimés" },
  { value: "APPAREILS_AMOVIBLES", label: "Appareils Amovibles" },
  { value: "CONTENTIONS", label: "Contentions" },
];

const OPTIONS = [
  { value: "", label: "Toutes les options" },
  { value: "DISJONCTEUR_FRITTE", label: "Disjoncteur Fritté" },
  { value: "TUBES_SUR_16_ET_26", label: "Tubes sur 16 et 26" },
  { value: "BRAS_DE_DELAIRE", label: "Bras de Delaire" },
  { value: "SMART_BANDS", label: "Smart Bands" },
  { value: "VERIN_SUPERIEUR", label: "Vérin Supérieur" },
  { value: "BAGUES_STANDARD", label: "Bagues Standard" },
  {
    value: "BENEFIT_STANDARD_VERIN_STANDARD",
    label: "Benefit Standard (Vérin Standard)",
  },
  {
    value: "POWER_SCREW_BENEFIT_STANDARD",
    label: "Power Screw Benefit Standard",
  },
  { value: "AUCUN", label: "Aucune option" },
];

// ✅ URL backend depuis .env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AppareilGallery = () => {
  const [appareils, setAppareils] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedOption, setSelectedOption] = useState("");

  // 🔹 Fetch direct des appareils
  useEffect(() => {
    console.log("API_BASE_URL =", API_BASE_URL);

    fetch(`${API_BASE_URL}/appareils`)
      .then((response) => {
        if (!response.ok) throw new Error(`Erreur ${response.status}`);
        return response.json();
      })
      .then((data) => {
        console.log("✅ Appareils reçus:", data);
        setAppareils(data);
      })
      .catch((err) => {
        console.error("❌ Erreur lors du fetch:", err);
        setError(err.message);
        toast.error("Erreur lors de la récupération des appareils");
      })
      .finally(() => setLoading(false));
  }, []);

  // 🔹 Filtrage
  const filteredAppareils = useMemo(() => {
    return appareils.filter((appareil) => {
      const matchesSearch =
        !searchTerm ||
        appareil.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appareil.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        !selectedCategory || appareil.categorie === selectedCategory;
      const matchesOption =
        !selectedOption || appareil.options === selectedOption;

      return matchesSearch && matchesCategory && matchesOption;
    });
  }, [appareils, searchTerm, selectedCategory, selectedOption]);

  if (loading) return <p>⏳ Chargement des appareils...</p>;
  if (error) return <p style={{ color: "red" }}>❌ Erreur: {error}</p>;

  return (
    <div className="appareil-gallery">
      <h1>Galerie des Appareils</h1>
      <p>{filteredAppareils.length} appareil(s) trouvé(s)</p>

      {filteredAppareils.length === 0 ? (
        <p>Aucun appareil trouvé.</p>
      ) : (
        <ul>
          {filteredAppareils.map((appareil) => (
            <li key={appareil.id}>{appareil.nom}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AppareilGallery;
