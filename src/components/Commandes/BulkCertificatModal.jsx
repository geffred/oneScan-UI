import React, { useState, useEffect } from "react";
import {
  Shield,
  Save,
  X,
  Zap,
  Plus,
  Minus,
  Trash2,
  BookmarkPlus,
  ListRestart,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-toastify";
import "./BulkCertificatModal.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const BulkCertificatModal = ({
  selectedCommandes,
  onClose,
  onSaveSuccess,
  userId,
}) => {
  const [loading, setLoading] = useState(false);
  const [materiauxPreencodes, setMateriauxPreencodes] = useState([]);
  const [formData, setFormData] = useState([]);
  const [showAddMatForm, setShowAddMatForm] = useState(false);
  const [newMat, setNewMat] = useState({ typeMateriau: "", numeroLot: "" });

  useEffect(() => {
    const initialData = selectedCommandes.map((cmd) => ({
      commandeId: cmd.id,
      refPatient: cmd.refPatient || "Inconnu",
      typeDispositif: cmd.typeAppareil || "",
      materiaux: [{ type: "", numeroLot: "" }],
    }));
    setFormData(initialData);
    if (userId) loadMateriauxPreencodes();
  }, [selectedCommandes, userId]);

  const loadMateriauxPreencodes = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/materiaux-preencodes/user/${userId}/recent`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) setMateriauxPreencodes(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const addMaterialToAll = (mat) => {
    setFormData((prevData) =>
      prevData.map((item) => {
        const isDuplicate = item.materiaux.some(
          (m) =>
            m.type.trim().toLowerCase() ===
              mat.typeMateriau.trim().toLowerCase() &&
            (m.numeroLot || "").trim() === (mat.numeroLot || "").trim(),
        );

        if (isDuplicate) return item;

        const existingContent = item.materiaux.filter(
          (m) => m.type.trim() !== "",
        );

        return {
          ...item,
          materiaux: [
            ...existingContent,
            { type: mat.typeMateriau, numeroLot: mat.numeroLot || "" },
          ],
        };
      }),
    );
    toast.info(`Matériau ajouté (les doublons ont été ignorés)`);
  };

  const handleBulkDeleteCerts = async () => {
    if (
      !window.confirm("Supprimer les certificats existants pour la sélection ?")
    )
      return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      for (const cmd of selectedCommandes) {
        await fetch(`${API_BASE_URL}/certificats/commande/${cmd.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      toast.success("Certificats supprimés");
      onSaveSuccess(false); // false = ne garde pas la sélection après suppression
    } catch (e) {
      toast.error("Erreur suppression");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    const incomplete = formData.some(
      (d) =>
        !d.typeDispositif.trim() || d.materiaux.every((m) => !m.type.trim()),
    );
    if (incomplete)
      return toast.error("Remplissez tous les champs obligatoires.");

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      for (const data of formData) {
        await fetch(
          `${API_BASE_URL}/certificats/commande/${data.commandeId}/user/${userId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              typeDispositif: data.typeDispositif,
              materiaux: data.materiaux.filter((m) => m.type.trim() !== ""),
              fabricantNom: "LABORATOIRE D'ORTHODONTIE Smile lab",
              fabricantAdresse: "Boulevard Roosevelt 23, 7060 Soignies",
              fabricantTelephone: "+32(0) 493 35 73 28",
              fabricantEmail: "contact@smilelabortho.be",
              fabricantTVA: "BE0794998835",
              referencePatient: data.refPatient,
              sterilisation: "À réaliser par le praticien avant mise en bouche",
              avertissement:
                "Attention: Incompatibilité possible avec des métaux déjà présents en bouche.",
            }),
          },
        );
      }
      toast.success("Certificats générés !");
      // GARDE LA SÉLECTION pour permettre l'impression immédiate
      onSaveSuccess(true);
    } catch (e) {
      toast.error("Erreur sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMat = (rowIndex, matIndex, field, value) => {
    const newData = [...formData];
    newData[rowIndex].materiaux[matIndex][field] = value;
    setFormData(newData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container bulk-cert-container">
        <div className="modal-header">
          <h3>
            <Shield size={22} /> Création groupée ({selectedCommandes.length})
          </h3>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              className="bulk-delete-certs-btn"
              onClick={handleBulkDeleteCerts}
              title="Supprimer certificats existants"
            >
              <Trash2 size={18} color="#ef4444" />
            </button>
            <button onClick={onClose} className="modal-close-btn">
              ✕
            </button>
          </div>
        </div>
        <div className="modal-content">
          <div className="bulk-quick-actions">
            <div className="recent-mats-scroll">
              {materiauxPreencodes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => addMaterialToAll(m)}
                  className="mini-mat-badge"
                >
                  <Plus size={10} /> {m.typeMateriau}
                </button>
              ))}
            </div>
          </div>
          <table className="bulk-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Dispositif *</th>
                <th>Matériaux *</th>
              </tr>
            </thead>
            <tbody>
              {formData.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.refPatient}</td>
                  <td>
                    <input
                      className="bulk-input"
                      value={row.typeDispositif}
                      onChange={(e) => {
                        const newD = [...formData];
                        newD[idx].typeDispositif = e.target.value;
                        setFormData(newD);
                      }}
                    />
                  </td>
                  <td>
                    {row.materiaux.map((m, midx) => (
                      <div key={midx} className="bulk-mat-row">
                        <input
                          value={m.type}
                          onChange={(e) =>
                            handleUpdateMat(idx, midx, "type", e.target.value)
                          }
                          placeholder="Matériau"
                        />
                        <input
                          value={m.numeroLot}
                          onChange={(e) =>
                            handleUpdateMat(
                              idx,
                              midx,
                              "numeroLot",
                              e.target.value,
                            )
                          }
                          placeholder="Lot"
                        />
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="modal-footer">
          <button
            className="details-btn details-btn-secondary"
            onClick={onClose}
          >
            Fermer
          </button>
          <button
            className="details-btn details-btn-primary"
            onClick={handleSaveAll}
            disabled={loading}
          >
            {loading ? "Calcul..." : "Générer les certificats"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkCertificatModal;
