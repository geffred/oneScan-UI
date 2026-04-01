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
    headers: { Authorization: `Bearer ${token}`, ...options.headers },
    ...options,
  });
  if (!response.ok)
    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
  return response.json();
};

const fetchWithAuthBlob = async (url) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token manquant");
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok)
    throw new Error(`Erreur téléchargement: ${response.status}`);
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
      body: JSON.stringify({ cabinetId }),
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
  } catch {
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
      <ArrowLeft size={16} /> Retour
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
  const hasMarkedAsRead = useRef(false);
  const hasFetchedCertificat = useRef(false);

  const initialCommande = location.state?.commande;

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
      revalidateOnReconnect: false,
      errorRetryCount: 3,
      fallbackData: initialCommande,
      dedupingInterval: 10000,
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
    { revalidateOnFocus: false, dedupingInterval: 60000 },
  );

  useEffect(() => {
    if (commande?.id && !hasFetchedCertificat.current) {
      hasFetchedCertificat.current = true;
      const timer = setTimeout(() => {
        checkCertificatExists(commande.id)
          .then(setHasCertificat)
          .catch(() => setHasCertificat(false));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [commande?.id]);

  useEffect(() => {
    if (commande?.id && !commande.vu && !hasMarkedAsRead.current) {
      hasMarkedAsRead.current = true;
      mutateCommande({ ...commande, vu: true }, false);
      markAsRead(commande.id)
        .then(() => mutateCommandes())
        .catch(() => mutateCommande({ ...commande, vu: false }, false));
    }
  }, [commande?.id]);

  const toggleSidebar = useCallback(() => setSidebarOpen((p) => !p), []);
  const handleComponentChange = useCallback(
    (c) => {
      setActiveComponent(c);
      navigate(`/dashboard/${c}`);
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
    setActionStates((p) => ({ ...p, download: true }));

    try {
      const token = localStorage.getItem("token");

      if (commande.plateforme === "MEDITLINK") {
        toast.info("Récupération des fichiers MeditLink...");
        const orderResponse = await fetch(
          `${API_BASE_URL}/meditlink/orders/${commande.externalId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (!orderResponse.ok)
          throw new Error(
            `Erreur ${orderResponse.status}: ${orderResponse.statusText}`,
          );
        const orderData = await orderResponse.json();
        if (!orderData.order?.case?.files?.length) {
          toast.warning("Aucun fichier trouvé pour ce cas MeditLink");
          return;
        }

        const relevantFiles = orderData.order.case.files.filter(
          (f) =>
            f.fileType === "SCAN_DATA" &&
            f.name &&
            !f.name.toLowerCase().endsWith(".meditgroupinfo"),
        );
        if (!relevantFiles.length) {
          toast.warning("Aucun fichier de scan disponible");
          return;
        }

        const finalZip = new JSZip();
        let filesAdded = 0,
          processingCount = 0,
          errorCount = 0;

        for (const file of relevantFiles) {
          try {
            const fileInfoResponse = await fetch(
              `${API_BASE_URL}/meditlink/files/${file.uuid}?type=stl`,
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            );
            if (fileInfoResponse.status === 202) {
              processingCount++;
              continue;
            }
            if (!fileInfoResponse.ok) {
              errorCount++;
              continue;
            }
            const fileInfo = await fileInfoResponse.json();
            const downloadUrl = fileInfo.url || fileInfo.downloadUrl;
            if (!downloadUrl) {
              errorCount++;
              continue;
            }
            const archiveResponse = await fetch(downloadUrl);
            if (!archiveResponse.ok) {
              errorCount++;
              continue;
            }
            const archiveBlob = await archiveResponse.blob();
            if (archiveBlob.size === 0) {
              errorCount++;
              continue;
            }
            finalZip.file(
              fileInfo.downloadFileName || `${file.name}.7z`,
              archiveBlob,
            );
            filesAdded++;
          } catch {
            errorCount++;
          }
        }

        if (filesAdded === 0) {
          processingCount > 0
            ? toast.warning(
                `${processingCount} fichier(s) en cours de conversion. Réessayez plus tard.`,
              )
            : toast.error("Aucun fichier n'a pu être téléchargé");
          return;
        }

        const finalZipBlob = await finalZip.generateAsync({
          type: "blob",
          compression: "DEFLATE",
          compressionOptions: { level: 6 },
        });
        downloadBlobInBrowser(
          finalZipBlob,
          `MeditLink_${commande.externalId}.zip`,
        );
        let msg = `${filesAdded} fichier(s) téléchargé(s)`;
        if (processingCount > 0) msg += ` (${processingCount} en conversion)`;
        if (errorCount > 0) msg += ` (${errorCount} en erreur)`;
        toast.success(msg);
      } else if (commande.plateforme === "DEXIS") {
        const response = await fetch(
          `${API_BASE_URL}/dexis/cases/${commande.externalId}/download`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (!response.ok) throw new Error(`Erreur backend: ${response.status}`);
        const azureUrl = (await response.text()).replace(/"/g, "").trim();
        if (!azureUrl.startsWith("http"))
          throw new Error("URL de téléchargement invalide");
        const link = document.createElement("a");
        link.href = azureUrl;
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
            console.error("Erreur Upper 3Shape:", e.message);
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
            console.error("Erreur Lower 3Shape:", e.message);
          }
        }
        try {
          const details = await fetchWithAuth(
            `${API_BASE_URL}/threeshape/orders/${commande.externalId}`,
          );
          if (details.files?.length) {
            for (const file of details.files) {
              if (
                file.hash === commande.hash_upper ||
                file.hash === commande.hash_lower
              )
                continue;
              const jawType = file.jawType || file.name || "";
              if (
                !file.hash ||
                jawType.toLowerCase().includes("none") ||
                jawType.toLowerCase() === "unknown"
              )
                continue;
              try {
                const blob = await fetchWithAuthBlob(
                  `${API_BASE_URL}/threeshape/files/${commande.externalId}/${file.hash}`,
                );
                let fileName = file.name || `${file.jawType}_scan.stl`;
                if (!fileName.toLowerCase().endsWith(".stl"))
                  fileName += ".stl";
                zip.file(fileName, blob);
                filesAdded++;
              } catch (e) {
                console.error(`Erreur fichier 3Shape:`, e.message);
              }
            }
          }
        } catch (e) {
          console.log("Pas de détails 3Shape:", e.message);
        }

        if (filesAdded > 0) {
          downloadBlobInBrowser(
            await zip.generateAsync({ type: "blob" }),
            `3Shape_Scan_${commande.externalId}.zip`,
          );
          toast.success(`${filesAdded} fichier(s) STL 3Shape téléchargé(s)`);
        } else {
          toast.warning("Aucun fichier STL 3Shape valide trouvé");
        }
      } else if (commande.plateforme === "MYSMILELAB") {
        // ── FIX : utiliser fichierPublicIds (clés B2) ou fichierUrls
        // L'externalId est l'UUID de la commande, PAS une clé Backblaze B2
        const fichierPublicIds = commande.fichierPublicIds || [];
        const fichierUrls = commande.fichierUrls || [];

        // Priorité 1 : fichierPublicIds = clés B2 directes (ex: commandes/cabinet/cmd_xxx.zip)
        // Priorité 2 : extraire la clé depuis l'URL publique Backblaze
        const keysToDownload =
          fichierPublicIds.length > 0
            ? fichierPublicIds
            : fichierUrls
                .map((url) => {
                  try {
                    // URL format: https://f005.backblazeb2.com/file/<bucket>/<key>
                    const urlObj = new URL(url);
                    const parts = urlObj.pathname.split("/file/");
                    if (parts.length > 1) {
                      // Enlève le nom du bucket, garde seulement la clé
                      return parts[1].split("/").slice(1).join("/") || null;
                    }
                    return null;
                  } catch {
                    return null;
                  }
                })
                .filter(Boolean);

        if (keysToDownload.length === 0) {
          toast.warning("Aucun fichier associé à cette commande MySmileLab");
          return;
        }

        if (keysToDownload.length === 1) {
          // Un seul fichier — téléchargement direct
          const endpoint = `${API_BASE_URL}/files/download?fileKey=${encodeURIComponent(keysToDownload[0])}`;
          const blob = await fetchWithAuthBlob(endpoint);
          const fileName =
            keysToDownload[0].split("/").pop() ||
            `MySmileLab_${commande.id}.zip`;
          downloadBlobInBrowser(blob, fileName);
          toast.success("Fichier téléchargé");
        } else {
          // Plusieurs fichiers — regroupement dans un ZIP
          toast.info(
            `Téléchargement de ${keysToDownload.length} fichier(s)...`,
          );
          const zip = new JSZip();
          let added = 0;
          for (const key of keysToDownload) {
            try {
              const endpoint = `${API_BASE_URL}/files/download?fileKey=${encodeURIComponent(key)}`;
              const blob = await fetchWithAuthBlob(endpoint);
              const fileName = key.split("/").pop() || `file_${added + 1}.zip`;
              zip.file(fileName, blob);
              added++;
            } catch (e) {
              console.error(`Erreur fichier B2 ${key}:`, e.message);
            }
          }
          if (added === 0) {
            toast.error("Aucun fichier n'a pu être téléchargé");
            return;
          }
          const zipBlob = await zip.generateAsync({
            type: "blob",
            compression: "DEFLATE",
            compressionOptions: { level: 6 },
          });
          downloadBlobInBrowser(zipBlob, `MySmileLab_${commande.id}.zip`);
          toast.success(`${added} fichier(s) téléchargé(s)`);
        }
      } else {
        // Autres plateformes génériques
        const endpoint = `${API_BASE_URL}/${commande.plateforme.toLowerCase()}/download/${commande.externalId}`;
        const blob = await fetchWithAuthBlob(endpoint);
        downloadBlobInBrowser(blob, `scan-${commande.externalId}.zip`);
        toast.success("Fichier téléchargé");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors du téléchargement : " + error.message);
    } finally {
      setActionStates((p) => ({ ...p, download: false }));
    }
  }, [commande]);

  const handleGenerateOrder = useCallback(async () => {
    if (!commande) return;
    setActionStates((p) => ({ ...p, generate: true }));
    toast.info("Analyse IA en cours...");
    try {
      if (!commande.commentaire?.trim()) throw new Error("Commentaire vide");
      await analyseCommentaireDeepSeek(commande.commentaire, commande.id);
      await mutateCommande();
      await mutateCommandes();
      setActionStates((p) => ({ ...p, reloadFiles: Date.now() }));
      toast.success("Bon de commande généré");
    } catch (error) {
      toast.error(error.message || "Erreur génération");
    } finally {
      setActionStates((p) => ({ ...p, generate: false }));
    }
  }, [commande, mutateCommande, mutateCommandes]);

  const handleSendEmailNotification = useCallback(async () => {
    if (!commande?.cabinetId) return toast.warning("Aucun cabinet associé");
    const cabinet = cabinets.find((c) => c.id === commande.cabinetId);
    if (!cabinet?.email) return toast.warning("Email cabinet introuvable");
    setActionStates((p) => ({ ...p, sendEmail: true }));
    try {
      await EmailService.sendEmailNotification(
        commande,
        cabinet,
        commande.commentaire,
      );
      await EmailService.markNotificationAsSent(commande.id);
      mutateCommande({ ...commande, notification: true }, false);
      toast.success("Email envoyé");
    } catch {
      toast.error("Erreur envoi email");
    } finally {
      setActionStates((p) => ({ ...p, sendEmail: false }));
    }
  }, [commande, cabinets, mutateCommande]);

  const handleStatusChange = useCallback(
    async (newStatus) => {
      setActionStates((p) => ({ ...p, updateStatus: true }));
      try {
        await updateCommandeStatus(commande.id, newStatus);
        await mutateCommande();
        mutateCommandes();
        toast.success("Statut mis à jour");
      } catch {
        toast.error("Erreur mise à jour statut");
      } finally {
        setActionStates((p) => ({ ...p, updateStatus: false }));
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

  if (!commande && commandeLoading)
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
