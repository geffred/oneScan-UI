/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import React, {
  useState,
  useContext,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import useSWR from "swr";
import { toast } from "react-toastify";
import { AuthContext } from "../../components/Config/AuthContext";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import BonCommande from "../BonDeCommande/BonDeCommande";
import CertificatConformite from "./CertificatConformite";
import { useReactToPrint } from "react-to-print";
import { AlertCircle, ArrowLeft, Shield } from "lucide-react";
import JSZip from "jszip";
import { ToastContainer } from "react-toastify";

import CommandeHeader from "./CommandeHeader";
import CommandeInfoGrid from "./CommandeInfoGrid";
import CommandeActions from "./CommandeActions";
import { EmailService } from "./EmailService";

import "./CommandeDetails.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token manquant");

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

const fetchWithAuthBlob = async (url) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token manquant");

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Erreur téléchargement: ${response.status}`);
  }

  return response.blob();
};

const getCommandes = async () =>
  fetchWithAuth(`${API_BASE_URL}/public/commandes`);

const getCommandeByExternalId = async (externalId) => {
  if (!externalId) throw new Error("ExternalId manquant");
  return fetchWithAuth(`${API_BASE_URL}/public/commandes/${externalId}`);
};

const getCabinets = async () => fetchWithAuth(`${API_BASE_URL}/cabinet`);

const markAsRead = async (commandeId) => {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `${API_BASE_URL}/public/commandes/${commandeId}/vu`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );
  if (!response.ok) throw new Error("Erreur lecture");
  return response;
};

const updateCabinetId = async (commandeId, cabinetId) => {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `${API_BASE_URL}/public/commandes/cabinet/${commandeId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cabinetId: cabinetId }),
    },
  );
  if (!response.ok) throw new Error("Erreur mise à jour cabinet");
  return response.json();
};

const analyseCommentaireDeepSeek = async (commentaire, commandeId) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/deepseek`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ commentaire, commandeId }),
  });
  if (!response.ok) throw new Error("Erreur DeepSeek");
  return response.json();
};

const updateCommandeStatus = async (commandeId, status) => {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `${API_BASE_URL}/public/commandes/statut/${commandeId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ statut: status }),
    },
  );
  if (!response.ok) throw new Error("Erreur statut");
  return response.json();
};

const checkCertificatExists = async (commandeId) => {
  if (!commandeId) return false;
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(
      `${API_BASE_URL}/certificats/commande/${commandeId}/exists`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (!response.ok) return false;
    const data = await response.json();
    return data.exists || false;
  } catch (error) {
    return false;
  }
};

const LoadingState = React.memo(() => (
  <div className="commandes-loading-state">
    <div className="commandes-loading-spinner"></div>
    <p className="commandes-loading-text">Chargement des détails...</p>
  </div>
));

const ErrorState = React.memo(({ error, onBack }) => (
  <div className="commandes-error-state">
    <AlertCircle className="commandes-error-icon" size={48} />
    <h3 className="commandes-error-title">Erreur</h3>
    <p className="commandes-error-message">{error || "Commande non trouvée"}</p>
    <button className="commandes-btn commandes-btn-primary" onClick={onBack}>
      <ArrowLeft size={16} />
      Retour
    </button>
  </div>
));

const CommandeDetails = () => {
  const { externalId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  const [actionStates, setActionStates] = useState({
    download: false,
    generate: false,
    sendEmail: false,
    updateStatus: false,
    reloadFiles: 0,
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeComponent, setActiveComponent] = useState("commandes");
  const [showBonDeCommande, setShowBonDeCommande] = useState(false);
  const [showCabinetSearch, setShowCabinetSearch] = useState(false);
  const [showCertificat, setShowCertificat] = useState(false);
  const [hasCertificat, setHasCertificat] = useState(false);

  const bonDeCommandeRef = useRef();

  const {
    data: commande,
    error: commandeError,
    isLoading: commandeLoading,
    mutate: mutateCommande,
  } = useSWR(
    isAuthenticated && externalId ? `commande-${externalId}` : null,
    () => getCommandeByExternalId(externalId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
      fallbackData: location.state?.commande,
    },
  );

  const { mutate: mutateCommandes } = useSWR(
    isAuthenticated ? "commandes" : null,
    getCommandes,
    { revalidateOnMount: false, revalidateOnFocus: false },
  );

  const { data: cabinets = [], isLoading: cabinetsLoading } = useSWR(
    isAuthenticated ? "cabinets" : null,
    getCabinets,
    { revalidateOnFocus: false },
  );

  useEffect(() => {
    if (commande?.id) {
      checkCertificatExists(commande.id)
        .then(setHasCertificat)
        .catch(() => setHasCertificat(false));
    }
  }, [commande]);

  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);

  const handleComponentChange = useCallback(
    (newComponent) => {
      setActiveComponent(newComponent);
      navigate(`/dashboard/${newComponent}`);
    },
    [navigate],
  );

  const handleBack = useCallback(
    () => navigate("/dashboard/commandes"),
    [navigate],
  );

  const handleDownloadPDF = useReactToPrint({
    content: () => bonDeCommandeRef.current,
    documentTitle: `Bon_de_commande_${commande?.externalId || "unknown"}`,
    onAfterPrint: () => toast.success("PDF téléchargé"),
  });

  const downloadBlobInBrowser = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 100);
  };

  const handleDownload = useCallback(async () => {
    if (!commande) return;

    setActionStates((prev) => ({ ...prev, download: true }));

    try {
      const token = localStorage.getItem("token");

      if (commande.plateforme === "MEDITLINK") {
        toast.info("Récupération des fichiers STL MeditLink...");

        const response = await fetch(
          `${API_BASE_URL}/meditlink/orders/${commande.externalId}/stl-files`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const filesData = await response.json();

        console.log("Fichiers STL MeditLink reçus:", filesData);

        if (
          !filesData.success ||
          !filesData.files ||
          filesData.files.length === 0
        ) {
          toast.warning("Aucun fichier STL trouvé pour ce cas MeditLink");
          return;
        }

        const readyFiles = filesData.files.filter((f) => f.status === "ready");
        const processingFiles = filesData.files.filter(
          (f) => f.status === "processing",
        );
        const errorFiles = filesData.files.filter((f) => f.status === "error");

        if (readyFiles.length === 0) {
          if (processingFiles.length > 0) {
            toast.warning(
              `${processingFiles.length} fichier(s) en cours de conversion côté MeditLink. Réessayez dans quelques instants.`,
            );
          } else {
            toast.error("Aucun fichier STL disponible pour le téléchargement");
          }
          return;
        }

        const zip = new JSZip();
        let filesAdded = 0;

        console.log(`Téléchargement de ${readyFiles.length} fichier(s) STL...`);

        await Promise.all(
          readyFiles.map(async (file) => {
            try {
              if (!file.downloadUrl) {
                console.warn(`Pas d'URL de téléchargement pour ${file.name}`);
                return;
              }

              console.log(`Téléchargement: ${file.stlFileName || file.name}`);

              const fileResponse = await fetch(file.downloadUrl);

              if (!fileResponse.ok) {
                console.error(
                  `Erreur téléchargement ${file.name}: ${fileResponse.status}`,
                );
                return;
              }

              const blob = await fileResponse.blob();

              if (blob.size === 0) {
                console.warn(`Fichier vide: ${file.name}`);
                return;
              }

              const fileName = file.stlFileName || file.name;

              zip.file(fileName, blob);
              filesAdded++;

              console.log(`Ajouté: ${fileName} (${blob.size} bytes)`);
            } catch (fileError) {
              console.error(`Erreur fichier ${file.name}:`, fileError);
            }
          }),
        );

        console.log(`${filesAdded} fichier(s) STL téléchargé(s) avec succès`);

        if (filesAdded === 0) {
          toast.error("Aucun fichier STL n'a pu être téléchargé");
          return;
        }

        const zipBlob = await zip.generateAsync({
          type: "blob",
          compression: "DEFLATE",
          compressionOptions: { level: 6 },
        });

        downloadBlobInBrowser(
          zipBlob,
          `MeditLink_STL_${commande.externalId}.zip`,
        );

        let message = `${filesAdded} fichier(s) STL téléchargé(s) avec succès`;
        if (processingFiles.length > 0) {
          message += ` (${processingFiles.length} en cours de conversion)`;
        }
        if (errorFiles.length > 0) {
          message += ` (${errorFiles.length} en erreur)`;
        }

        toast.success(message);
      } else if (commande.plateforme === "DEXIS") {
        const response = await fetch(
          `${API_BASE_URL}/dexis/cases/${commande.externalId}/download`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!response.ok) {
          throw new Error(`Erreur backend: ${response.status}`);
        }

        const azureUrl = await response.text();
        const cleanUrl = azureUrl.replace(/"/g, "").trim();

        if (!cleanUrl.startsWith("http")) {
          throw new Error("URL de téléchargement invalide reçue du serveur");
        }

        const link = document.createElement("a");
        link.href = cleanUrl;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Téléchargement Dexis lancé");
      } else if (commande.plateforme === "THREESHAPE") {
        const zip = new JSZip();
        let filesAdded = 0;

        if (commande.hash_upper) {
          try {
            const blob = await fetchWithAuthBlob(
              `${API_BASE_URL}/threeshape/files/${commande.externalId}/${commande.hash_upper}`,
            );
            zip.file("Upper_Jaw.stl", blob);
            filesAdded++;
          } catch (e) {
            console.error("Erreur Upper 3Shape", e);
          }
        }

        if (commande.hash_lower) {
          try {
            const blob = await fetchWithAuthBlob(
              `${API_BASE_URL}/threeshape/files/${commande.externalId}/${commande.hash_lower}`,
            );
            zip.file("Lower_Jaw.stl", blob);
            filesAdded++;
          } catch (e) {
            console.error("Erreur Lower 3Shape", e);
          }
        }

        try {
          const details = await fetchWithAuth(
            `${API_BASE_URL}/threeshape/orders/${commande.externalId}`,
          );
          if (details.files && Array.isArray(details.files)) {
            for (const file of details.files) {
              if (
                file.hash !== commande.hash_upper &&
                file.hash !== commande.hash_lower
              ) {
                try {
                  const blob = await fetchWithAuthBlob(
                    `${API_BASE_URL}/threeshape/files/${commande.externalId}/${file.hash}`,
                  );

                  let fileName =
                    file.name || `file_${file.hash.substring(0, 8)}.stl`;
                  if (!fileName.toLowerCase().endsWith(".stl")) {
                    fileName += ".stl";
                  }

                  zip.file(fileName, blob);
                  filesAdded++;
                } catch (e) {
                  console.error(`Erreur fichier 3Shape ${file.name}:`, e);
                }
              }
            }
          }
        } catch (e) {
          console.log("Pas de détails supplémentaires 3Shape");
        }

        if (filesAdded > 0) {
          const content = await zip.generateAsync({ type: "blob" });
          downloadBlobInBrowser(
            content,
            `3Shape_Scan_${commande.externalId}.zip`,
          );
          toast.success(`${filesAdded} fichier(s) STL 3Shape téléchargé(s)`);
        } else {
          toast.warning("Aucun fichier STL 3Shape valide trouvé");
        }
      } else {
        let endpoint = `${API_BASE_URL}/${commande.plateforme.toLowerCase()}/download/${commande.externalId}`;
        if (commande.plateforme === "MYSMILELAB") {
          endpoint = `${API_BASE_URL}/files/download?fileKey=${encodeURIComponent(commande.externalId)}`;
        }

        const blob = await fetchWithAuthBlob(endpoint);
        downloadBlobInBrowser(blob, `scan-${commande.externalId}.zip`);
        toast.success("Fichier téléchargé");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors du téléchargement : " + error.message);
    } finally {
      setActionStates((prev) => ({ ...prev, download: false }));
    }
  }, [commande]);

  const handleGenerateOrder = useCallback(async () => {
    if (!commande) return;
    setActionStates((prev) => ({ ...prev, generate: true }));
    toast.info("Analyse IA en cours...");
    try {
      if (!commande.commentaire?.trim()) throw new Error("Commentaire vide");
      await analyseCommentaireDeepSeek(commande.commentaire, commande.id);
      await mutateCommande();
      await mutateCommandes();
      setActionStates((prev) => ({ ...prev, reloadFiles: Date.now() }));
      toast.success("Bon de commande généré");
    } catch (error) {
      toast.error(error.message || "Erreur génération");
    } finally {
      setActionStates((prev) => ({ ...prev, generate: false }));
    }
  }, [commande, mutateCommande, mutateCommandes]);

  const handleSendEmailNotification = useCallback(async () => {
    if (!commande?.cabinetId) return toast.warning("Aucun cabinet associé");
    const cabinet = cabinets.find((c) => c.id === commande.cabinetId);
    if (!cabinet?.email) return toast.warning("Email cabinet introuvable");

    setActionStates((prev) => ({ ...prev, sendEmail: true }));
    try {
      await EmailService.sendEmailNotification(
        commande,
        cabinet,
        commande.commentaire,
      );
      await EmailService.markNotificationAsSent(commande.id);
      mutateCommande({ ...commande, notification: true }, false);
      toast.success("Email envoyé");
    } catch (error) {
      toast.error("Erreur envoi email");
    } finally {
      setActionStates((prev) => ({ ...prev, sendEmail: false }));
    }
  }, [commande, cabinets, mutateCommande]);

  const handleStatusChange = useCallback(
    async (newStatus) => {
      setActionStates((prev) => ({ ...prev, updateStatus: true }));
      try {
        await updateCommandeStatus(commande.id, newStatus);
        await mutateCommande();
        mutateCommandes();
        toast.success("Statut mis à jour");
      } catch {
        toast.error("Erreur mise à jour statut");
      } finally {
        setActionStates((prev) => ({ ...prev, updateStatus: false }));
      }
    },
    [commande, mutateCommande, mutateCommandes],
  );

  const handleAssociateCabinet = useCallback(
    async (cabinetId) => {
      try {
        const updated = await updateCabinetId(commande.id, cabinetId);
        mutateCommande(updated, false);
        mutateCommandes();
        setShowCabinetSearch(false);
        toast.success("Cabinet associé");
      } catch {
        toast.error("Erreur association");
      }
    },
    [commande, mutateCommande, mutateCommandes],
  );

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("fr-FR") : "Non spécifiée";

  const getEcheanceStatus = (d) => {
    if (!d) return { status: "unknown", label: "Non spécifiée", class: "gray" };
    const diff = Math.ceil((new Date(d) - new Date()) / 86400000);
    if (diff < 0) return { status: "expired", label: "Échue", class: "red" };
    if (diff <= 3)
      return { status: "urgent", label: `${diff}j restant`, class: "yellow" };
    return { status: "normal", label: `${diff}j restant`, class: "green" };
  };

  const getPlateformeColor = (p) =>
    ({
      MEDITLINK: "blue",
      ITERO: "green",
      THREESHAPE: "purple",
      DEXIS: "orange",
    })[p] || "gray";

  const echeanceStatus = useMemo(
    () => getEcheanceStatus(commande?.dateEcheance),
    [commande],
  );

  const plateformeColor = useMemo(
    () => getPlateformeColor(commande?.plateforme),
    [commande],
  );

  useEffect(() => {
    if (commande && !commande.vu) {
      markAsRead(commande.id)
        .then(() => {
          mutateCommande({ ...commande, vu: true }, false);
          mutateCommandes();
        })
        .catch(() => {});
    }
  }, [commande, mutateCommande, mutateCommandes]);

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  const LayoutWrapper = ({ children }) => (
    <div className="dashboardpage-app-container">
      <Navbar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="dashboardpage-main-layout">
        <Sidebar
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          activeComponent={activeComponent}
          setActiveComponent={handleComponentChange}
        />
        <div className="dashboardpage-main-content">
          <main className="dashboardpage-content-area">{children}</main>
          <footer className="dashboardpage-footer">
            <div className="dashboardpage-footer-content">
              <p className="dashboardpage-footer-text">
                &copy; Mysmilelab <label>Tous droits réservés.</label>
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );

  if (commandeLoading)
    return (
      <LayoutWrapper>
        <LoadingState />
      </LayoutWrapper>
    );

  if (commandeError || !commande)
    return (
      <LayoutWrapper>
        <ErrorState error={commandeError?.message} onBack={handleBack} />
      </LayoutWrapper>
    );

  return (
    <LayoutWrapper>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="details-main-container">
        <CommandeHeader
          commande={commande}
          cabinets={cabinets}
          cabinetsLoading={cabinetsLoading}
          showCabinetSearch={showCabinetSearch}
          setShowCabinetSearch={setShowCabinetSearch}
          handleBack={handleBack}
          handleAssociateCabinet={handleAssociateCabinet}
        />

        <CommandeInfoGrid
          reloadTrigger={actionStates.reloadFiles}
          commande={commande}
          echeanceStatus={echeanceStatus}
          plateformeColor={plateformeColor}
          formatDate={formatDate}
          handleStatusChange={handleStatusChange}
          actionStates={actionStates}
          isCommentLoading={false}
          finalCommentaire={commande.commentaire}
          mutateCommande={mutateCommande}
          mutateCommandes={mutateCommandes}
          showNotification={(msg, type) =>
            type === "error" ? toast.error(msg) : toast.success(msg)
          }
        />

        <CommandeActions
          commande={commande}
          actionStates={actionStates}
          isCommentLoading={false}
          canDownloadBonCommande={!!commande.typeAppareil}
          canSendEmail={!!commande.cabinetId && !commande.notification}
          handleGenerateOrder={handleGenerateOrder}
          handleOpenBonCommande={() => setShowBonDeCommande(true)}
          handleSendEmailNotification={handleSendEmailNotification}
          handleDownload={handleDownload}
          handleOpenCertificat={() => setShowCertificat(true)}
          hasCertificat={hasCertificat}
        />
      </div>

      {showBonDeCommande && (
        <BonCommande
          commande={commande}
          onClose={() => setShowBonDeCommande(false)}
          cabinet={cabinets.find((c) => c.id === commande.cabinetId)}
          ref={bonDeCommandeRef}
          onPrint={handleDownloadPDF}
        />
      )}

      {showCertificat && (
        <div className="modal-overlay" onClick={() => setShowCertificat(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <Shield size={20} style={{ marginRight: "10px" }} />
                Certificat de Conformité
              </h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowCertificat(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-content">
              <CertificatConformite
                commandeId={commande.id}
                onUpdate={() =>
                  checkCertificatExists(commande.id).then(setHasCertificat)
                }
                commandeTypeAppareil={commande.typeAppareil}
                commandeRefPatient={commande.refPatient}
              />
            </div>
          </div>
        </div>
      )}
    </LayoutWrapper>
  );
};

export default CommandeDetails;
