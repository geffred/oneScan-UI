import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Edit,
  Trash2,
  PlusCircle,
  CheckCircle,
  Save,
  X,
  Printer,
} from "lucide-react";
import "./CertificatConformite.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Fonction API helper
const apiRequest = async (endpoint, method = "GET", data = null) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token manquant");

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const config = {
    method,
    headers,
  };

  if (data && method !== "GET") {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: response.statusText }));
    throw new Error(
      error.message || error.error || `Erreur ${response.status}`
    );
  }

  return response.json();
};

const CertificatConformite = ({
  commandeId,
  onUpdate,
  commandeTypeAppareil,
}) => {
  const [certificat, setCertificat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    typeDispositif: commandeTypeAppareil || "",
    ancrage: "",
    materiau: "",
    activation: "",
    technicienResponsable: "",
  });

  // Charger le certificat existant
  useEffect(() => {
    if (commandeId) {
      loadCertificat();
    }
  }, [commandeId]);

  // Mettre à jour le type de dispositif quand la commande change
  useEffect(() => {
    if (commandeTypeAppareil && !certificat?.typeDispositif) {
      setFormData((prev) => ({
        ...prev,
        typeDispositif: commandeTypeAppareil,
      }));
    }
  }, [commandeTypeAppareil, certificat]);

  const loadCertificat = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`/certificats/commande/${commandeId}`);
      if (response) {
        setCertificat(response);
        setFormData({
          typeDispositif: response.typeDispositif || commandeTypeAppareil || "",
          ancrage: response.ancrage || "",
          materiau: response.materiau || "",
          activation: response.activation || "",
          technicienResponsable: response.technicienResponsable || "",
        });
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      // Certificat non trouvé, c'est normal
      console.log("Aucun certificat trouvé pour cette commande");
      setCertificat(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!showForm) {
      // Charger les valeurs par défaut
      try {
        const defaults = await apiRequest("/certificats/defaults");
        setFormData((prev) => ({
          ...prev,
          materiau:
            defaults.materiau ||
            "Alliage métallique fritté de qualité médicale",
          activation:
            defaults.activation ||
            "Vis centrale à pas progressif (1/4 tour = 0,25 mm)",
          technicienResponsable: defaults.technicienResponsable || "Stéphane",
          typeDispositif: commandeTypeAppareil || prev.typeDispositif || "",
          ancrage: prev.ancrage || "",
        }));
      } catch (error) {
        console.error(
          "Erreur lors du chargement des valeurs par défaut:",
          error
        );
        // Valeurs par défaut en dur
        setFormData((prev) => ({
          ...prev,
          materiau: "Alliage métallique fritté de qualité médicale",
          activation: "Vis centrale à pas progressif (1/4 tour = 0,25 mm)",
          technicienResponsable: "Stéphane",
          typeDispositif: commandeTypeAppareil || prev.typeDispositif || "",
        }));
      }
      setShowForm(true);
      setEditing(true);
    }
  };

  const handleSave = async () => {
    if (!formData.typeDispositif || !formData.ancrage) {
      alert("Les champs 'Type de dispositif' et 'Ancrage' sont obligatoires");
      return;
    }

    try {
      setLoading(true);
      let response;

      if (certificat) {
        // Mise à jour
        response = await apiRequest(
          `/certificats/${certificat.id}`,
          "PUT",
          formData
        );
      } else {
        // Création
        response = await apiRequest(
          `/certificats/commande/${commandeId}`,
          "POST",
          formData
        );
      }

      setCertificat(response);
      setShowForm(false);
      setEditing(false);
      if (onUpdate) onUpdate();
      alert(
        certificat
          ? "Certificat mis à jour avec succès"
          : "Certificat créé avec succès"
      );
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert("Erreur lors de la sauvegarde: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!certificat) return;

    if (
      window.confirm(
        "Êtes-vous sûr de vouloir supprimer ce certificat ? Cette action est irréversible."
      )
    ) {
      try {
        await apiRequest(`/certificats/${certificat.id}`, "DELETE");
        setCertificat(null);
        setShowForm(false);
        setFormData({
          typeDispositif: commandeTypeAppareil || "",
          ancrage: "",
          materiau: "",
          activation: "",
          technicienResponsable: "",
        });
        if (onUpdate) onUpdate();
        alert("Certificat supprimé avec succès");
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        alert("Erreur lors de la suppression: " + error.message);
      }
    }
  };

  const handleGeneratePDF = () => {
    if (!certificat) return;

    try {
      // Ouvrir dans une nouvelle fenêtre pour impression
      const newWindow = window.open();
      if (!newWindow) {
        alert("Veuillez autoriser les popups pour générer le PDF");
        return;
      }

      // Construire le HTML du certificat avec le CSS d'origine
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Certificat de Conformité</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .header { text-align: center; margin-bottom: 40px; }
                .title { font-size: 24px; font-weight: bold; margin-bottom: 30px; }
                .section { margin-bottom: 25px; }
                .label { font-weight: bold; margin-bottom: 5px; }
                .value { margin-left: 10px; }
                .footer { margin-top: 50px; font-size: 12px; color: #666; }
                .signature { margin-top: 50px; border-top: 1px solid #000; width: 300px; padding-top: 10px; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="title">Certificat de Conformité</div>
            </div>
            
            <div class="section">
                <div class="label">Fabricant:</div>
                <div class="value">LABORATOIRE D'ORTHODONTIE Smile lab</div>
                <div class="value">Boulevard Roosevelt 23, 7060 Soignies</div>
                <div class="value">+32(0) 493 35 73 28</div>
                <div class="value">contact@smilelabortho.be</div>
                <div class="value">TVA : BE0794998835</div>
            </div>
            
            <div class="section">
                <div class="label">Technicien responsable:</div>
                <div class="value">${
                  certificat.technicienResponsable || "Stéphane"
                }</div>
            </div>
            
            <div class="section">
                <div class="label">Identifiant du Dispositif:</div>
                <div class="value">${certificat.identifiantDispositif}</div>
            </div>
            
            <div class="section">
                <div>Ce dispositif est conforme aux exigences essentielles énoncées à l'annexe I de l'A.R.
                du 18/03/1999 relatif aux dispositifs médicaux. Les produits utilisés répondent aux
                obligations et le dispositif a été conçu de manière à ne présagner aucun danger pour
                le patient lorsqu'il est utilisé selon les prescriptions du praticien de l'art dentaire.</div>
            </div>
            
            <div class="section">
                <div class="label">Attention: Il peut exister une incompatibilité possible avec des métaux ou alliages déjà présents en bouche.</div>
            </div>
            
            <div class="section">
                <div class="label">Référence du Patient:</div>
                <div class="value">${
                  certificat.referencePatient || "Non spécifié"
                }</div>
            </div>
            
            <div class="section">
                <div class="label">Description du Dispositif:</div>
                <div class="value">Type : ${
                  certificat.typeDispositif || "Non spécifié"
                }</div>
                <div class="value">Ancrage : ${
                  certificat.ancrage || "Non spécifié"
                }</div>
                <div class="value">Matériau : ${
                  certificat.materiau ||
                  "Alliage métallique fritté de qualité médicale"
                }</div>
                <div class="value">Activation : ${
                  certificat.activation ||
                  "Vis centrale à pas progressif (1/4 tour = 0,25 mm)"
                }</div>
                <div class="value">Méthode de fabrication : Conception numérique et impression 3D / frittage laser</div>
                <div class="value">Stérilisation : À réaliser par le praticien avant mise en bouche</div>
            </div>
            
            <div class="section">
                <div class="label">Date de Déclaration:</div>
                <div class="value">${
                  certificat.dateDeclaration
                    ? new Date(certificat.dateDeclaration).toLocaleDateString(
                        "fr-FR"
                      )
                    : new Date().toLocaleDateString("fr-FR")
                }</div>
            </div>
            
            <div class="signature">
                <div>Signature du responsable technique</div>
            </div>
            
            <div class="footer">
                Document généré le ${new Date().toLocaleDateString("fr-FR")}
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
                <button onclick="window.print()" style="padding: 10px 20px; background: #007AFF; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">
                     Imprimer le certificat
                </button>
                <button onclick="window.close()" style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px; font-size: 14px;">
                    ✕ Fermer
                </button>
            </div>
        </body>
        </html>
      `;

      newWindow.document.write(html);
      newWindow.document.close();
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      alert("Erreur lors de la génération du certificat: " + error.message);
    }
  };

  const handlePrint = () => {
    if (!certificat) return;
    handleGeneratePDF();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    if (certificat) {
      // Si on avait un certificat, on revient à l'affichage
      setEditing(false);
      setShowForm(false);
    } else {
      // Si on était en création, on annule
      setShowForm(false);
      setEditing(false);
    }
  };

  if (loading && !certificat) {
    return (
      <div className="details-loading-state">
        <div className="details-loading-spinner"></div>
        <p className="details-loading-text">Chargement du certificat...</p>
      </div>
    );
  }

  return (
    <div className="certificat-conformite-container">
      <div className="certificat-header-section">
        <div className="certificat-title-wrapper">
          <h2>
            <FileText size={20} />
            Certificat de Conformité
          </h2>
        </div>

        {certificat ? (
          <div className="certificat-actions-container">
            <button
              className="details-btn details-btn-primary details-btn-sm"
              onClick={handlePrint}
              title="Imprimer le certificat"
              disabled={loading}
            >
              <Printer size={16} /> Imprimer
            </button>
            <button
              className="details-btn details-btn-secondary details-btn-sm"
              onClick={() => setEditing(true)}
              title="Modifier"
              disabled={loading}
            >
              <Edit size={16} /> Modifier
            </button>
            <button
              className="details-btn details-btn-danger details-btn-sm"
              onClick={handleDelete}
              title="Supprimer"
              disabled={loading}
            >
              <Trash2 size={16} /> Supprimer
            </button>
          </div>
        ) : (
          <button
            className="details-btn details-btn-primary"
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? (
              "Chargement..."
            ) : (
              <>
                <PlusCircle size={16} /> Créer Certificat
              </>
            )}
          </button>
        )}
      </div>

      {certificat && !editing ? (
        <div className="certificat-content-section">
          <div className="certificat-status-info">
            <CheckCircle size={16} className="text-success" />
            <span>Certificat généré</span>
            <strong className="certificat-identifier">
              {certificat.identifiantDispositif}
            </strong>
          </div>

          <div className="certificat-details-grid">
            <div className="certificat-detail-item">
              <label>Type de dispositif:</label>
              <span>{certificat.typeDispositif || "Non spécifié"}</span>
            </div>
            <div className="certificat-detail-item">
              <label>Ancrage:</label>
              <span>{certificat.ancrage || "Non spécifié"}</span>
            </div>
            <div className="certificat-detail-item">
              <label>Matériau:</label>
              <span>
                {certificat.materiau ||
                  "Alliage métallique fritté de qualité médicale"}
              </span>
            </div>
            <div className="certificat-detail-item">
              <label>Activation:</label>
              <span>
                {certificat.activation ||
                  "Vis centrale à pas progressif (1/4 tour = 0,25 mm)"}
              </span>
            </div>
            <div className="certificat-detail-item">
              <label>Technicien responsable:</label>
              <span>{certificat.technicienResponsable || "Stéphane"}</span>
            </div>
            <div className="certificat-detail-item">
              <label>Date de déclaration:</label>
              <span>
                {certificat.dateDeclaration
                  ? new Date(certificat.dateDeclaration).toLocaleDateString(
                      "fr-FR"
                    )
                  : new Date().toLocaleDateString("fr-FR")}
              </span>
            </div>
            <div className="certificat-detail-item full-width">
              <label>Informations fabricant:</label>
              <div className="fabricant-details">
                <div>LABORATOIRE D'ORTHODONTIE Smile lab</div>
                <div>Boulevard Roosevelt 23, 7060 Soignies</div>
                <div>
                  Tél: +32(0) 493 35 73 28 - Email: contact@smilelabortho.be
                </div>
                <div>TVA: BE0794998835</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        (showForm || editing) && (
          <div className="certificat-form-container">
            <h3>
              {certificat
                ? "Modifier le certificat"
                : "Nouveau certificat de conformité"}
            </h3>

            <div className="form-inputs-grid">
              <div className="form-input-group">
                <label>Type de dispositif *</label>
                <input
                  type="text"
                  name="typeDispositif"
                  value={formData.typeDispositif}
                  onChange={handleInputChange}
                  placeholder="Ex: Disjoncteur à deux bras latéraux"
                  required
                  className="form-control-input"
                />
              </div>

              <div className="form-input-group">
                <label>Ancrage *</label>
                <input
                  type="text"
                  name="ancrage"
                  value={formData.ancrage}
                  onChange={handleInputChange}
                  placeholder="Ex: Sur molaires (selon prescription)"
                  required
                  className="form-control-input"
                />
              </div>

              <div className="form-input-group">
                <label>Matériau</label>
                <input
                  type="text"
                  name="materiau"
                  value={formData.materiau}
                  onChange={handleInputChange}
                  placeholder="Alliage métallique fritté de qualité médicale"
                  className="form-control-input"
                />
              </div>

              <div className="form-input-group">
                <label>Activation</label>
                <input
                  type="text"
                  name="activation"
                  value={formData.activation}
                  onChange={handleInputChange}
                  placeholder="Vis centrale à pas progressif (1/4 tour = 0,25 mm)"
                  className="form-control-input"
                />
              </div>

              <div className="form-input-group">
                <label>Technicien responsable</label>
                <input
                  type="text"
                  name="technicienResponsable"
                  value={formData.technicienResponsable}
                  onChange={handleInputChange}
                  placeholder="Stéphane"
                  className="form-control-input"
                />
              </div>
            </div>

            <div className="form-actions-container">
              <div className="form-buttons-group">
                <button
                  className="details-btn details-btn-primary"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="details-download-spinner"></div>
                  ) : (
                    <>
                      <Save size={16} /> Enregistrer
                    </>
                  )}
                </button>
                <button
                  className="details-btn details-btn-secondary"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  <X size={16} /> Annuler
                </button>
              </div>

              <div className="form-info-note">
                <small>
                  <strong>Note :</strong> Les informations du fabricant sont
                  préremplies.
                </small>
              </div>
            </div>
          </div>
        )
      )}

      {!certificat && !showForm && (
        <div className="certificat-empty-state">
          <p>
            Aucun certificat de conformité n'a été créé pour cette commande.
          </p>
          <p className="certificat-hint-text">
            Cliquez sur "Créer Certificat" pour générer un nouveau certificat.
          </p>
        </div>
      )}
    </div>
  );
};

export default CertificatConformite;
