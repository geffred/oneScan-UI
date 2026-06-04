/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useContext, useMemo, useRef } from "react";
import useSWR from "swr";
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
  TriangleAlert,
  Download,
  Upload,
} from "lucide-react";
import { AuthContext } from "../../components/Config/AuthContext";
import CabinetFormModal from "./CabinetFormModal";
import "./Cabinets.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ── EmailJS supprimé — le backend envoie les mots de passe via Brevo ─────────

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

// ── Modal de confirmation ─────────────────────────────────────────────────────
const ConfirmModal = ({ config, onConfirm, onCancel }) => {
  if (!config) return null;
  return (
    <div className="cabinet-modal-overlay">
      <div className="cabinet-confirm-modal">
        <div className="cabinet-confirm-icon">
          <TriangleAlert size={28} />
        </div>
        <h3>{config.title}</h3>
        <p>{config.message}</p>
        <div className="cabinet-confirm-actions">
          <button onClick={onCancel} className="cabinet-cancel-btn">
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className={`cabinet-confirm-btn${config.danger ? " danger" : ""}`}
          >
            {config.confirmLabel || "Confirmer"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Ligne tableau ─────────────────────────────────────────────────────────────
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
        <span
          className={`status-badge ${cabinet.emailVerified ? "verified" : "not-verified"}`}
        >
          {cabinet.emailVerified ? (
            <CheckCircle2 size={14} />
          ) : (
            <AlertCircle size={14} />
          )}
          {cabinet.emailVerified ? "Vérifié" : "Non vérifié"}
        </span>
      </div>
      <div className="cabinet-table-cell actions">
        <div className="cabinet-actions">
          {/* Bouton envoi mot de passe — désactivé si déjà envoyé ou en cours */}
          <button
            onClick={() => onSendPassword(cabinet)}
            className={`cabinet-send-btn${cabinet.passwordSend ? " sent" : ""}`}
            disabled={
              cabinet.passwordSend || sendingPasswords.includes(cabinet.id)
            }
            title={
              cabinet.passwordSend
                ? "Mot de passe déjà envoyé"
                : "Envoyer mot de passe par email"
            }
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
            onClick={() => onDelete(cabinet)}
            className="cabinet-delete-btn"
            title="Supprimer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  ),
);
CabinetRow.displayName = "CabinetRow";

// ── Composant principal ───────────────────────────────────────────────────────
const Cabinet = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCabinet, setEditingCabinet] = useState(null);
  const [globalError, setGlobalError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sendingPasswords, setSendingPasswords] = useState([]);
  const [confirmConfig, setConfirmConfig] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

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
        c.email.toLowerCase().includes(term),
    );
  }, [cabinets, searchTerm]);

  const showNotif = (type, msg) => {
    if (type === "success") setSuccess(msg);
    else setGlobalError(msg);
    setTimeout(() => {
      setSuccess(null);
      setGlobalError(null);
    }, 4000);
  };

  const handleModalSuccess = (data, type) => {
    if (type === "modification") {
      mutateCabinets(
        cabinets.map((c) => (c.id === data.id ? data : c)),
        false,
      );
      showNotif("success", "Cabinet modifié avec succès");
    } else {
      mutateCabinets([...cabinets, data.cabinet], false);
      // Le mot de passe a déjà été envoyé par le backend si skipEmailVerification = false
      const note =
        data.emailSent === false
          ? "Cabinet créé — l'envoi du mot de passe a échoué, utilisez le bouton clé."
          : "Cabinet créé — mot de passe envoyé par email au cabinet.";
      showNotif("success", note);
    }
    mutateCabinets();
  };

  // ── Envoi / régénération mot de passe ──────────────────────────────────────
  // Le backend génère un mot de passe lisible (ex: SmileLab-2026-KR47)
  // et l'envoie directement par email via Brevo.
  // Le frontend ne voit jamais le mot de passe en clair.
  const handleSendPassword = (cabinet) => {
    setConfirmConfig({
      title: "Envoyer le mot de passe",
      message: `Un nouveau mot de passe sera généré et envoyé par email à ${cabinet.nom} (${cabinet.email}).`,
      confirmLabel: "Envoyer",
      danger: false,
      onConfirm: () => executeSendPassword(cabinet),
    });
  };

  const executeSendPassword = async (cabinet) => {
    setConfirmConfig(null);
    setSendingPasswords((p) => [...p, cabinet.id]);
    try {
      const token = localStorage.getItem("token");

      // ── FIX : un seul appel backend — génère + envoie via Brevo ──────────
      const res = await fetch(
        `${API_BASE_URL}/cabinet/${cabinet.id}/regenerate-password`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Erreur serveur");

      if (data.success) {
        mutateCabinets();
        showNotif("success", `Mot de passe envoyé à ${cabinet.nom}`);
      } else {
        // Mot de passe changé en BDD mais email échoué
        showNotif(
          "error",
          data.message || "Mot de passe mis à jour mais email non envoyé",
        );
      }
    } catch (err) {
      showNotif("error", err.message);
    } finally {
      setSendingPasswords((p) => p.filter((id) => id !== cabinet.id));
    }
  };

  // ── Suppression ────────────────────────────────────────────────────────────
  const handleDelete = (cabinet) => {
    setConfirmConfig({
      title: "Supprimer le cabinet",
      message: `Voulez-vous vraiment supprimer "${cabinet.nom}" ? Cette action est définitive.`,
      confirmLabel: "Supprimer",
      danger: true,
      onConfirm: () => executeDelete(cabinet.id),
    });
  };

  const executeDelete = async (id) => {
    setConfirmConfig(null);
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE_URL}/cabinet/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      mutateCabinets(
        cabinets.filter((c) => c.id !== id),
        false,
      );
      showNotif("success", "Cabinet supprimé");
    } catch {
      showNotif("error", "Erreur suppression");
    }
  };

  // ── Export CSV ───────────────────────────────────────────────────────────
  const handleExport = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/cabinet/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur lors de l'export");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cabinets.csv";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      showNotif("success", `${cabinets.length} cabinet(s) exporté(s) en CSV`);
    } catch (err) {
      showNotif("error", err.message || "Erreur lors de l'export");
    }
  };

  // ── Import CSV ───────────────────────────────────────────────────────────
  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // permet de re-sélectionner le même fichier
    if (!file) return;

    setImporting(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE_URL}/cabinet/import`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de l'import");

      mutateCabinets();
      if (data.failed > 0 || data.skipped > 0) {
        showNotif("error", data.message);
        if (Array.isArray(data.errors) && data.errors.length) {
          console.warn("Détails import CSV:", data.errors);
        }
      } else {
        showNotif("success", data.message);
      }
    } catch (err) {
      showNotif("error", err.message);
    } finally {
      setImporting(false);
    }
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
            <div className="cabinet-header-actions">
              <button
                onClick={handleExport}
                className="cabinet-secondary-btn"
                title="Exporter tous les cabinets au format CSV"
              >
                <Download size={18} /> Exporter
              </button>
              <button
                onClick={handleImportClick}
                className="cabinet-secondary-btn"
                disabled={importing}
                title="Importer des cabinets depuis un fichier CSV"
              >
                {importing ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Upload size={18} />
                )}
                Importer
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                style={{ display: "none" }}
                onChange={handleImportFile}
              />
              <button onClick={openCreateModal} className="cabinet-create-btn">
                <Plus size={18} /> Nouveau Cabinet
              </button>
            </div>
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

        <CabinetFormModal
          isOpen={isModalOpen}
          onClose={closeModal}
          cabinetToEdit={editingCabinet}
          onSuccess={handleModalSuccess}
        />

        <ConfirmModal
          config={confirmConfig}
          onConfirm={confirmConfig?.onConfirm}
          onCancel={() => setConfirmConfig(null)}
        />
      </div>
    </div>
  );
};

export default Cabinet;
