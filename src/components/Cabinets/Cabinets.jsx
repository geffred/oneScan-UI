/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useContext, useMemo, useCallback } from "react";
import useSWR from "swr";
import emailjs from "@emailjs/browser";
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Mail,
  MapPin,
  Search,
  Phone,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { AuthContext } from "../../components/Config/AuthContext";
import { useNavigate } from "react-router-dom";
import CabinetFormModal from "./CabinetFormModal"; // Import du nouveau composant
import "./Cabinets.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const EMAILJS_PUBLIC_KEY = "rfexuIcDBNIIdOsf2";
const EMAILJS_SERVICE_ID = "service_ag5llz9";
const EMAILJS_TEMPLATE_ID = "template_7846xp8";

emailjs.init(EMAILJS_PUBLIC_KEY);

// --- Fetcher SWR ---
const fetchWithAuth = async (url) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token manquant");
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok)
    throw new Error((await res.json()).message || `Erreur ${res.status}`);
  return res.json();
};

// --- Composant Ligne Tableau (Memoized) ---
const CabinetRow = React.memo(
  ({ cabinet, onEdit, onDelete, onSendPassword, sendingPasswords }) => (
    <div className="cabinet-table-row">
      <div className="cabinet-table-cell" data-label="Nom">
        <div className="cabinet-name-info">
          <Building2 size={18} className="cabinet-icon" />
          <span className="cabinet-name">{cabinet.nom}</span>
        </div>
      </div>
      <div className="cabinet-table-cell" data-label="Email">
        <div className="cabinet-email-info">
          <Mail size={16} className="cabinet-info-icon" />
          <span>{cabinet.email}</span>
        </div>
      </div>
      <div className="cabinet-table-cell" data-label="Téléphone">
        <div className="cabinet-email-info">
          <Phone size={16} className="cabinet-info-icon" />
          <span>{cabinet.numeroDeTelephone || "-"}</span>
        </div>
      </div>
      <div className="cabinet-table-cell" data-label="Livraison">
        <div className="cabinet-address-info">
          <MapPin size={16} className="cabinet-info-icon" />
          <span className="truncate-text" title={cabinet.adresseDeLivraison}>
            {cabinet.adresseDeLivraison || "-"}
          </span>
        </div>
      </div>
      <div className="cabinet-table-cell" data-label="Statut">
        <div className="cabinet-status-badges">
          <span
            className={`status-badge ${
              cabinet.emailVerified ? "verified" : "not-verified"
            }`}
          >
            {cabinet.emailVerified ? (
              <CheckCircle2 size={14} />
            ) : (
              <AlertCircle size={14} />
            )}
            {cabinet.emailVerified ? "Vérifié" : "Non vérifié"}
          </span>
        </div>
      </div>
      <div className="cabinet-table-cell actions">
        <div className="cabinet-actions">
          <button
            onClick={() => onSendPassword(cabinet)}
            className={`cabinet-send-btn ${cabinet.passwordSend ? "sent" : ""}`}
            disabled={
              cabinet.passwordSend || sendingPasswords.includes(cabinet.id)
            }
            title="Envoyer mot de passe"
          >
            {sendingPasswords.includes(cabinet.id) ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <KeyRound size={16} />
            )}
          </button>
          <button
            onClick={() => onEdit(cabinet)}
            className="cabinet-edit-btn"
            title="Modifier"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(cabinet.id)}
            className="cabinet-delete-btn"
            title="Supprimer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  )
);

CabinetRow.displayName = "CabinetRow";

const Cabinet = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCabinet, setEditingCabinet] = useState(null);

  // États d'erreur/succès globaux
  const [globalError, setGlobalError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sendingPasswords, setSendingPasswords] = useState([]);
  const navigate = useNavigate();

  const { data: currentUser } = useSWR(
    isAuthenticated ? `${API_BASE_URL}/auth/me` : null,
    fetchWithAuth
  );
  const {
    data: cabinets = [],
    mutate: mutateCabinets,
    isLoading,
  } = useSWR(isAuthenticated ? `${API_BASE_URL}/cabinet` : null, fetchWithAuth);

  const filteredCabinets = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return cabinets.filter(
      (c) =>
        c.nom.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term)
    );
  }, [cabinets, searchTerm]);

  // --- Handlers ---

  const handleModalSuccess = (data, type) => {
    if (type === "modification") {
      mutateCabinets(
        cabinets.map((c) => (c.id === data.id ? data : c)),
        false
      );
      setSuccess("Cabinet modifié avec succès");
    } else {
      mutateCabinets([...cabinets, data.cabinet], false);
      setSuccess("Cabinet créé avec succès");
    }
    setTimeout(() => setSuccess(null), 3000);
    mutateCabinets(); // Revalidation SWR
  };

  const handleSendPassword = async (cabinet) => {
    setSendingPasswords((prev) => [...prev, cabinet.id]);
    try {
      const token = localStorage.getItem("token");

      const resGen = await fetch(
        `${API_BASE_URL}/cabinet/${cabinet.id}/regenerate-password`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!resGen.ok) throw new Error("Erreur génération mot de passe");
      const { newPassword } = await resGen.json();

      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        to_email: cabinet.email,
        cabinet_name: cabinet.nom,
        password: newPassword,
      });

      await fetch(`${API_BASE_URL}/cabinet/${cabinet.id}/mark-password-sent`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      mutateCabinets();
      setSuccess(`Mot de passe envoyé à ${cabinet.nom}`);
    } catch (err) {
      setGlobalError(err.message);
    } finally {
      setSendingPasswords((prev) => prev.filter((id) => id !== cabinet.id));
      setTimeout(() => {
        setSuccess(null);
        setGlobalError(null);
      }, 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce cabinet ?")) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE_URL}/cabinet/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      mutateCabinets(
        cabinets.filter((c) => c.id !== id),
        false
      );
      setSuccess("Cabinet supprimé");
    } catch (err) {
      setGlobalError("Erreur suppression");
    }
    setTimeout(() => setSuccess(null), 3000);
  };

  const openCreateModal = () => {
    setEditingCabinet(null);
    setIsModalOpen(true);
  };
  const openEditModal = (cab) => {
    setEditingCabinet(cab);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCabinet(null);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="cabinet-main-wrapper">
      <div className="cabinet-content-container">
        <div className="cabinet-management-card">
          <div className="cabinet-management-header">
            <h1 className="cabinet-management-title">
              <div className="cabinet-management-icon">
                <Building2 size={24} />
              </div>
              Gestion des Cabinets
            </h1>
            <button onClick={openCreateModal} className="cabinet-create-btn">
              <Plus size={18} /> Nouveau Cabinet
            </button>
          </div>

          {globalError && (
            <div className="cabinet-error-notification">{globalError}</div>
          )}
          {success && (
            <div className="cabinet-success-notification">{success}</div>
          )}

          <div className="cabinet-search-section">
            <div className="cabinet-search-wrapper">
              <Search className="cabinet-search-icon" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="cabinet-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="cabinet-list-container">
            {isLoading ? (
              <div className="cabinet-list-loading">
                <Loader2 className="animate-spin" size={32} />
              </div>
            ) : filteredCabinets.length === 0 ? (
              <div className="cabinet-empty-state">
                <Building2 size={48} />
                <h3>Aucun cabinet trouvé</h3>
              </div>
            ) : (
              <div className="cabinet-table-container">
                <div className="cabinet-table-header">
                  <div className="cabinet-table-cell header">Nom</div>
                  <div className="cabinet-table-cell header">Email</div>
                  <div className="cabinet-table-cell header">Tél</div>
                  <div className="cabinet-table-cell header">Livraison</div>
                  <div className="cabinet-table-cell header">Statut</div>
                  <div className="cabinet-table-cell header actions">
                    Actions
                  </div>
                </div>
                <div className="cabinet-table-body">
                  {filteredCabinets.map((cabinet) => (
                    <CabinetRow
                      key={cabinet.id}
                      cabinet={cabinet}
                      onEdit={openEditModal}
                      onDelete={handleDelete}
                      onSendPassword={handleSendPassword}
                      sendingPasswords={sendingPasswords}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Appel du composant Modale séparé */}
        <CabinetFormModal
          isOpen={isModalOpen}
          onClose={closeModal}
          cabinetToEdit={editingCabinet}
          onSuccess={handleModalSuccess}
        />
      </div>
    </div>
  );
};

export default Cabinet;
