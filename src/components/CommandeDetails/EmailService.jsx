import emailjs from "@emailjs/browser";

// Configuration EmailJS
const EMAILJS_SERVICE_ID = "service_w8gb6cp";
const EMAILJS_TEMPLATE_ID = "template_0eduqda";
const EMAILJS_PUBLIC_KEY = "lAe4pEEgnlrd0Uu9C";

// Initialiser EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class EmailService {
  static async sendEmailNotification(commande, cabinet, commentaire) {
    try {
      // Formater les dates
      const formatDate = (dateString) => {
        if (!dateString) return "Non spécifiée";
        const date = new Date(dateString);
        return date.toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      };

      // Formater le statut
      const formatStatus = (status) => {
        const statusLabels = {
          EN_ATTENTE: "En attente",
          EN_COURS: "En cours",
          TERMINEE: "Terminée",
          EXPEDIEE: "Expédiée",
          ANNULEE: "Annulée",
        };
        return statusLabels[status] || status;
      };

      // Préparer les données du template
      const templateParams = {
        to_email: cabinet.email,
        cabinet_name: cabinet.nom,
        commande_id: commande.externalId,
        patient_ref: commande.refPatient || "Non spécifiée",
        plateforme: commande.plateforme,
        date_reception: formatDate(commande.dateReception),
        date_echeance: formatDate(commande.dateEcheance),
        statut: formatStatus(
          commande.status || commande.statut || "EN_ATTENTE"
        ),
        type_appareil: commande.typeAppareil || "Non spécifié",
        numero_suivi: commande.numeroSuivi || "Non attribué",
        commentaire:
          commentaire && commentaire.trim() !== ""
            ? commentaire
            : "Aucun commentaire",
      };

      // Envoyer l'email
      const result = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );

      if (result.status === 200) {
        return { success: true, message: "Email envoyé avec succès" };
      } else {
        throw new Error("Erreur lors de l'envoi de l'email");
      }
    } catch (error) {
      console.error("Erreur EmailJS:", error);
      throw new Error(`Erreur lors de l'envoi de l'email: ${error.message}`);
    }
  }

  static async markNotificationAsSent(commandeId) {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token manquant");

    const response = await fetch(
      `${API_BASE_URL}/public/commandes/${commandeId}/notification/sent`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    return response;
  }

  static async getNotificationStatus(commandeId) {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token manquant");

    const response = await fetch(
      `${API_BASE_URL}/public/commandes/${commandeId}/notification`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
}
