import React, { useState, useEffect } from "react";
import {
  FileText,
  Edit,
  Trash2,
  PlusCircle,
  CheckCircle,
  Save,
  X,
  Printer,
  Building,
  Phone,
  Mail,
  FileDigit,
  AlertTriangle,
  Plus,
  Minus,
  Clock,
  BookmarkPlus,
} from "lucide-react";
import { useAuth } from "../../components/Config/AuthContext";
import { getUserIdFromToken } from "../../utils/authUtils";
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
  commandeRefPatient,
}) => {
  const { userData } = useAuth();

  // Utiliser la fonction utilitaire pour récupérer l'userId
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const id = getUserIdFromToken();
    if (id) {
      setUserId(id);
      console.log("UserId récupéré:", id);
    } else {
      console.error("Impossible de récupérer l'userId");
    }
  }, []);

  const [certificat, setCertificat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingBasicInfo, setEditingBasicInfo] = useState(false);
  const [materiauxPreencodes, setMateriauxPreencodes] = useState([]);
  const [showMateriauPreencodeForm, setShowMateriauPreencodeForm] =
    useState(false);
  const [newMateriauPreencode, setNewMateriauPreencode] = useState({
    typeMateriau: "",
    numeroLot: "",
  });

  const [formData, setFormData] = useState({
    typeDispositif: commandeTypeAppareil || "",
    materiaux: [{ type: "", numeroLot: "" }],
  });

  const [basicInfo, setBasicInfo] = useState({
    fabricantNom: "LABORATOIRE D'ORTHODONTIE Smile lab",
    fabricantAdresse: "Boulevard Roosevelt 23, 7060 Soignies",
    fabricantTelephone: "+32(0) 493 35 73 28",
    fabricantEmail: "contact@smilelabortho.be",
    fabricantTVA: "BE0794998835",
    avertissement:
      "Attention: Il peut exister une incompatibilité possible avec des métaux ou alliages déjà présents en bouche.",
    sterilisation: "À réaliser par le praticien avant mise en bouche",
  });

  useEffect(() => {
    if (commandeId) {
      loadCertificat();
    }
  }, [commandeId]);

  useEffect(() => {
    if (userId) {
      loadMateriauxPreencodes();
    }
  }, [userId]);

  useEffect(() => {
    if (commandeTypeAppareil && !certificat?.typeDispositif) {
      setFormData((prev) => ({
        ...prev,
        typeDispositif: commandeTypeAppareil,
      }));
    }
  }, [commandeTypeAppareil, certificat]);

  const loadMateriauxPreencodes = async () => {
    if (!userId) {
      console.warn("UserId non disponible pour charger les matériaux");
      return;
    }

    try {
      const materiaux = await apiRequest(
        `/materiaux-preencodes/user/${userId}/recent`
      );
      setMateriauxPreencodes(materiaux);
    } catch (error) {
      console.error("Erreur lors du chargement des matériaux:", error);
    }
  };

  const loadCertificat = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`/certificats/commande/${commandeId}`);
      if (response) {
        setCertificat(response);
        setFormData({
          typeDispositif: response.typeDispositif || commandeTypeAppareil || "",
          materiaux:
            response.materiaux && response.materiaux.length > 0
              ? response.materiaux
              : [{ type: "", numeroLot: "" }],
        });

        if (response.fabricantNom) {
          setBasicInfo((prev) => ({
            ...prev,
            fabricantNom: response.fabricantNom || prev.fabricantNom,
            fabricantAdresse:
              response.fabricantAdresse || prev.fabricantAdresse,
            fabricantTelephone:
              response.fabricantTelephone || prev.fabricantTelephone,
            fabricantEmail: response.fabricantEmail || prev.fabricantEmail,
            fabricantTVA: response.fabricantTVA || prev.fabricantTVA,
            avertissement: response.avertissement || prev.avertissement,
            sterilisation: response.sterilisation || prev.sterilisation,
          }));
        }

        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.log("Aucun certificat trouvé pour cette commande");
      setCertificat(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!showForm) {
      try {
        const defaults = await apiRequest("/certificats/defaults");
        setFormData((prev) => ({
          ...prev,
          materiaux: defaults.materiaux || [
            {
              type: "Alliage métallique fritté de qualité médicale",
              numeroLot: "",
            },
          ],
          typeDispositif: commandeTypeAppareil || prev.typeDispositif || "",
        }));
      } catch (error) {
        console.error(
          "Erreur lors du chargement des valeurs par défaut:",
          error
        );
        setFormData((prev) => ({
          ...prev,
          materiaux: [
            {
              type: "Alliage métallique fritté de qualité médicale",
              numeroLot: "",
            },
          ],
          typeDispositif: commandeTypeAppareil || prev.typeDispositif || "",
        }));
      }
      setShowForm(true);
      setEditing(true);
    }
  };

  const handleSave = async () => {
    if (!formData.typeDispositif) {
      alert("Le champ 'Type de dispositif' est obligatoire");
      return;
    }

    const materiauxValides = formData.materiaux.filter(
      (m) => m.type && m.type.trim() !== ""
    );
    if (materiauxValides.length === 0) {
      alert("Veuillez ajouter au moins un matériau");
      return;
    }

    if (!userId) {
      alert(
        "Impossible de déterminer l'utilisateur. Veuillez vous reconnecter."
      );
      return;
    }

    try {
      setLoading(true);
      let response;

      const dataToSave = {
        ...formData,
        materiaux: materiauxValides,
        ...basicInfo,
        referencePatient: commandeRefPatient || "Non spécifié",
      };

      console.log("UserId utilisé pour la sauvegarde:", userId);

      if (certificat) {
        response = await apiRequest(
          `/certificats/${certificat.id}/user/${userId}`,
          "PUT",
          dataToSave
        );
      } else {
        response = await apiRequest(
          `/certificats/commande/${commandeId}/user/${userId}`,
          "POST",
          dataToSave
        );
      }

      setCertificat(response);
      setShowForm(false);
      setEditing(false);
      setEditingBasicInfo(false);

      if (userId) {
        await loadMateriauxPreencodes();
      }

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
          materiaux: [{ type: "", numeroLot: "" }],
        });
        if (onUpdate) onUpdate();
        alert("Certificat supprimé avec succès");
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        alert("Erreur lors de la suppression: " + error.message);
      }
    }
  };

  const handlePrint = () => {
    if (!certificat) return;

    let materiauxHtml = "";
    if (certificat.materiaux && certificat.materiaux.length > 0) {
      materiauxHtml = certificat.materiaux
        .map(
          (m) =>
            `<div class="value">• ${m.type || "Non spécifié"} (Lot: ${
              m.numeroLot || "Non spécifié"
            })</div>`
        )
        .join("");
    } else {
      materiauxHtml =
        '<div class="value">Alliage métallique fritté de qualité médicale</div>';
    }

    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    iframe.style.left = "-9999px";

    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow.document;

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
              .value { margin-left: 10px; margin-bottom: 5px; }
              .footer { margin-top: 50px; font-size: 12px; color: #666; }
              .signature { margin-top: 50px; border-top: 1px solid #000; width: 300px; padding-top: 10px; }
              @media print {
                  body { margin: 20px; }
                  .no-print { display: none; }
                  button { display: none; }
              }
          </style>
      </head>
      <body>
          <div class="header">
              <div class="title">Certificat de Conformité</div>
          </div>
          
          <div class="section">
              <div class="label">Fabricant:</div>
              <div class="value">${basicInfo.fabricantNom}</div>
              <div class="value">${basicInfo.fabricantAdresse}</div>
              <div class="value">${basicInfo.fabricantTelephone}</div>
              <div class="value">${basicInfo.fabricantEmail}</div>
              <div class="value">TVA : ${basicInfo.fabricantTVA}</div>
          </div>
          
          <div class="section">
              <div class="label">Identifiant du Dispositif:</div>
              <div class="value">${certificat.identifiantDispositif}</div>
          </div>
          
          <div class="section">
              <div>Ce dispositif est conforme aux exigences essentielles énoncées à l'annexe I de l'A.R.
              du 18/03/1999 relatif aux dispositifs médicaux. Les produits utilisés répondent aux
              obligations et le dispositif a été conçu de manière à ne présenter aucun danger pour
              le patient lorsqu'il est utilisé selon les prescriptions du praticien de l'art dentaire.</div>
          </div>
          
          <div class="section">
              <div class="label">${basicInfo.avertissement}</div>
          </div>
          
          <div class="section">
              <div class="label">Référence du Patient:</div>
              <div class="value">${
                certificat.referencePatient ||
                commandeRefPatient ||
                "Non spécifié"
              }</div>
          </div>
          
          <div class="section">
              <div class="label">Description du Dispositif:</div>
              <div class="value">Type : ${
                certificat.typeDispositif || "Non spécifié"
              }</div>
              <div class="label" style="margin-top: 10px;">Matériaux utilisés:</div>
              ${materiauxHtml}
              <div class="value" style="margin-top: 10px;">Stérilisation : ${
                basicInfo.sterilisation
              }</div>
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
          
          <div class="no-print" style="text-align: center; margin-top: 30px;">
              <button onclick="window.print()" style="padding: 10px 20px; background: #007AFF; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">
                  🖨️ Imprimer le certificat
              </button>
          </div>
          
          <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  setTimeout(function() {
                    window.close();
                  }, 1000);
                }, 500);
              };
              
              window.onafterprint = function() {
                setTimeout(function() {
                  window.close();
                }, 500);
              };
          </script>
      </body>
      </html>
    `;

    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();

      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 500);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBasicInfoChange = (e) => {
    const { name, value } = e.target;
    setBasicInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMateriauChange = (index, field, value) => {
    const newMateriaux = [...formData.materiaux];
    newMateriaux[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      materiaux: newMateriaux,
    }));
  };

  const addMateriau = () => {
    setFormData((prev) => ({
      ...prev,
      materiaux: [...prev.materiaux, { type: "", numeroLot: "" }],
    }));
  };

  const removeMateriau = (index) => {
    if (formData.materiaux.length > 1) {
      const newMateriaux = formData.materiaux.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        materiaux: newMateriaux,
      }));
    }
  };

  const useMateriauPreencode = (materiau) => {
    setFormData((prev) => ({
      ...prev,
      materiaux: [
        ...prev.materiaux,
        { type: materiau.typeMateriau, numeroLot: materiau.numeroLot },
      ],
    }));
  };

  const handleSaveMateriauPreencode = async () => {
    if (!newMateriauPreencode.typeMateriau.trim()) {
      alert("Le type de matériau est obligatoire");
      return;
    }

    if (!userId) {
      alert(
        "Impossible de déterminer l'utilisateur. Veuillez vous reconnecter."
      );
      return;
    }

    try {
      await apiRequest(`/materiaux-preencodes/user/${userId}`, "POST", {
        typeMateriau: newMateriauPreencode.typeMateriau,
        numeroLot: newMateriauPreencode.numeroLot,
      });

      await loadMateriauxPreencodes();

      setNewMateriauPreencode({ typeMateriau: "", numeroLot: "" });
      setShowMateriauPreencodeForm(false);

      alert("Matériau pré-encodé sauvegardé avec succès");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert("Erreur lors de la sauvegarde: " + error.message);
    }
  };

  const handleDeleteMateriauPreencode = async (materiauId) => {
    if (window.confirm("Voulez-vous supprimer ce matériau pré-encodé ?")) {
      try {
        await apiRequest(`/materiaux-preencodes/${materiauId}`, "DELETE");
        await loadMateriauxPreencodes();
        alert("Matériau supprimé avec succès");
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        alert("Erreur lors de la suppression: " + error.message);
      }
    }
  };

  const handleCancel = () => {
    if (certificat) {
      loadCertificat();
      setEditing(false);
      setShowForm(false);
      setEditingBasicInfo(false);
    } else {
      setShowForm(false);
      setEditing(false);
      setEditingBasicInfo(false);
    }
  };

  const handleEditBasicInfo = () => {
    setEditingBasicInfo(true);
    if (!certificat) {
      setShowForm(true);
      setEditing(true);
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

      {certificat && !editing && !editingBasicInfo ? (
        <>
          <div className="certificat-content-section">
            <div className="certificat-status-info">
              <CheckCircle size={16} className="text-success" />
              <span>Certificat généré</span>
              <strong className="certificat-identifier">
                {certificat.identifiantDispositif}
              </strong>
              <button
                className="details-btn details-btn-sm details-btn-outline"
                onClick={handleEditBasicInfo}
                title="Modifier les informations de base"
                style={{ marginLeft: "10px", fontSize: "0.8rem" }}
              >
                <Edit size={12} /> Infos base
              </button>
            </div>

            <div className="certificat-details-grid">
              <div className="certificat-detail-item">
                <label>Type de dispositif:</label>
                <span>{certificat.typeDispositif || "Non spécifié"}</span>
              </div>

              <div className="certificat-detail-item full-width">
                <label>Matériaux utilisés:</label>
                <div className="materiaux-list">
                  {certificat.materiaux && certificat.materiaux.length > 0 ? (
                    certificat.materiaux.map((materiau, index) => (
                      <div key={index} className="materiau-item">
                        <span>• {materiau.type || "Non spécifié"}</span>
                        <span className="numero-lot">
                          (Lot: {materiau.numeroLot || "Non spécifié"})
                        </span>
                      </div>
                    ))
                  ) : (
                    <span>Alliage métallique fritté de qualité médicale</span>
                  )}
                </div>
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
                  <div>
                    <Building size={14} /> {basicInfo.fabricantNom}
                  </div>
                  <div>{basicInfo.fabricantAdresse}</div>
                  <div>
                    <Phone size={14} /> {basicInfo.fabricantTelephone} -{" "}
                    <Mail size={14} /> {basicInfo.fabricantEmail}
                  </div>
                  <div>
                    <FileDigit size={14} /> TVA: {basicInfo.fabricantTVA}
                  </div>
                </div>
              </div>

              <div className="certificat-detail-item full-width">
                <label>Stérilisation:</label>
                <span>{basicInfo.sterilisation}</span>
              </div>

              <div className="certificat-detail-item full-width warning-item">
                <label>
                  <AlertTriangle size={14} /> Avertissement:
                </label>
                <span className="warning-text">{basicInfo.avertissement}</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        (showForm || editing || editingBasicInfo) && (
          <div className="certificat-form-container">
            <h3>
              {certificat
                ? editingBasicInfo
                  ? "Modifier les informations de base"
                  : "Modifier le certificat"
                : "Nouveau certificat de conformité"}
            </h3>

            <div className="basic-info-section">
              <h4>
                <Building size={18} />
                Informations du fabricant
              </h4>

              <div className="form-inputs-grid">
                <div className="form-input-group">
                  <label>Nom du fabricant *</label>
                  <input
                    type="text"
                    name="fabricantNom"
                    value={basicInfo.fabricantNom}
                    onChange={handleBasicInfoChange}
                    placeholder="Nom du fabricant"
                    required
                    className="form-control-input"
                  />
                </div>

                <div className="form-input-group">
                  <label>Adresse *</label>
                  <input
                    type="text"
                    name="fabricantAdresse"
                    value={basicInfo.fabricantAdresse}
                    onChange={handleBasicInfoChange}
                    placeholder="Adresse complète"
                    required
                    className="form-control-input"
                  />
                </div>

                <div className="form-input-group">
                  <label>Téléphone *</label>
                  <input
                    type="text"
                    name="fabricantTelephone"
                    value={basicInfo.fabricantTelephone}
                    onChange={handleBasicInfoChange}
                    placeholder="Numéro de téléphone"
                    required
                    className="form-control-input"
                  />
                </div>

                <div className="form-input-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="fabricantEmail"
                    value={basicInfo.fabricantEmail}
                    onChange={handleBasicInfoChange}
                    placeholder="Adresse email"
                    required
                    className="form-control-input"
                  />
                </div>

                <div className="form-input-group">
                  <label>Numéro TVA *</label>
                  <input
                    type="text"
                    name="fabricantTVA"
                    value={basicInfo.fabricantTVA}
                    onChange={handleBasicInfoChange}
                    placeholder="Numéro de TVA"
                    required
                    className="form-control-input"
                  />
                </div>

                <div className="form-input-group">
                  <label>Procédure de stérilisation</label>
                  <textarea
                    name="sterilisation"
                    value={basicInfo.sterilisation}
                    onChange={handleBasicInfoChange}
                    placeholder="Procédure de stérilisation"
                    className="form-control-input"
                    rows={3}
                  />
                </div>

                <div className="form-input-group full-width">
                  <label>Avertissement</label>
                  <textarea
                    name="avertissement"
                    value={basicInfo.avertissement}
                    onChange={handleBasicInfoChange}
                    placeholder="Texte d'avertissement"
                    className="form-control-input"
                    rows="3"
                  />
                </div>
              </div>
            </div>

            {!editingBasicInfo && (
              <div className="device-info-section">
                <h4>
                  <FileText size={18} />
                  Informations du dispositif
                </h4>

                <div className="form-inputs-grid">
                  <div className="form-input-group full-width">
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

                  {materiauxPreencodes.length > 0 && (
                    <div className="form-input-group full-width">
                      <label>
                        <Clock size={16} /> Matériaux récemment utilisés
                      </label>
                      <div className="materiaux-preencodes-list">
                        {materiauxPreencodes.map((materiau) => (
                          <div
                            key={materiau.id}
                            className="materiau-preencode-item"
                          >
                            <div className="materiau-preencode-info">
                              <span className="materiau-type">
                                {materiau.typeMateriau}
                              </span>
                              <span className="materiau-lot">
                                Lot: {materiau.numeroLot || "Non spécifié"}
                              </span>
                            </div>
                            <div className="materiau-preencode-actions">
                              <button
                                type="button"
                                onClick={() => useMateriauPreencode(materiau)}
                                className="details-btn details-btn-sm details-btn-primary"
                                title="Utiliser ce matériau"
                              >
                                <Plus size={14} /> Utiliser
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteMateriauPreencode(materiau.id)
                                }
                                className="details-btn details-btn-sm details-btn-danger"
                                title="Supprimer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!showMateriauPreencodeForm ? (
                    <div className="form-input-group full-width">
                      <button
                        type="button"
                        onClick={() => setShowMateriauPreencodeForm(true)}
                        className="details-btn details-btn-sm details-btn-secondary"
                      >
                        <BookmarkPlus size={16} /> Ajouter un matériau
                        pré-encodé
                      </button>
                    </div>
                  ) : (
                    <div className="form-input-group full-width materiau-preencode-form">
                      <label>Nouveau matériau pré-encodé</label>
                      <div className="materiau-preencode-inputs">
                        <input
                          type="text"
                          value={newMateriauPreencode.typeMateriau}
                          onChange={(e) =>
                            setNewMateriauPreencode((prev) => ({
                              ...prev,
                              typeMateriau: e.target.value,
                            }))
                          }
                          placeholder="Type de matériau *"
                          className="form-control-input"
                        />
                        <input
                          type="text"
                          value={newMateriauPreencode.numeroLot}
                          onChange={(e) =>
                            setNewMateriauPreencode((prev) => ({
                              ...prev,
                              numeroLot: e.target.value,
                            }))
                          }
                          placeholder="Numéro de lot"
                          className="form-control-input"
                        />
                        <div className="materiau-preencode-form-actions">
                          <button
                            type="button"
                            onClick={handleSaveMateriauPreencode}
                            className="details-btn details-btn-sm details-btn-primary"
                          >
                            <Save size={14} /> Sauvegarder
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowMateriauPreencodeForm(false);
                              setNewMateriauPreencode({
                                typeMateriau: "",
                                numeroLot: "",
                              });
                            }}
                            className="details-btn details-btn-sm details-btn-secondary"
                          >
                            <X size={14} /> Annuler
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="form-input-group full-width">
                    <label>Matériaux pour ce certificat *</label>
                    {formData.materiaux.map((materiau, index) => (
                      <div key={index} className="materiau-input-row">
                        <input
                          type="text"
                          value={materiau.type}
                          onChange={(e) =>
                            handleMateriauChange(index, "type", e.target.value)
                          }
                          placeholder="Type de matériau"
                          className="form-control-input materiau-type-input"
                        />
                        <input
                          type="text"
                          value={materiau.numeroLot}
                          onChange={(e) =>
                            handleMateriauChange(
                              index,
                              "numeroLot",
                              e.target.value
                            )
                          }
                          placeholder="Numéro de lot"
                          className="form-control-input materiau-lot-input"
                        />
                        <button
                          type="button"
                          onClick={() => removeMateriau(index)}
                          className="details-btn details-btn-sm details-btn-danger"
                          disabled={formData.materiaux.length === 1}
                          title="Retirer ce matériau"
                        >
                          <Minus size={16} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addMateriau}
                      className="details-btn details-btn-sm details-btn-secondary"
                      style={{ marginTop: "10px" }}
                    >
                      <Plus size={16} /> Ajouter un matériau
                    </button>
                  </div>
                </div>
              </div>
            )}

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
                  <strong>Note :</strong> Tous les champs marqués d'un * sont
                  obligatoires. Les matériaux utilisés seront automatiquement
                  sauvegardés pour une utilisation future.
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
