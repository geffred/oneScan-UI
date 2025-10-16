import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID = "service_ag5llz9";
const EMAILJS_TEMPLATE_ID = "template_3qv5owv";
const EMAILJS_PUBLIC_KEY = "rfexuIcDBNIIdOsf2";

// Initialiser EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class CommandeNotificationService {
  static async sendNewCommandeNotification(commande) {
    try {
      console.log(
        `📧 Envoi de notification pour la commande: ${commande.externalId}`
      );

      // Préparer les données du template
      const templateParams = {
        to_email: "cgcm.candji@gmail.com",
        commande_id: commande.externalId,
        patient_ref: commande.refPatient || "Non spécifiée",
        plateforme: commande.plateforme,
        date_reception: this.formatDate(commande.dateReception),
        cabinet: commande.cabinet || "Non spécifié",
        type_appareil: commande.typeAppareil || "Non spécifié",
        details: commande.details || "Aucun détail",
        commentaire: commande.commentaire || "Aucun commentaire",
        date_creation: this.formatDateTime(commande.dateCreation),
      };

      // Envoyer l'email
      const result = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );

      if (result.status === 200) {
        console.log(
          `✅ Notification envoyée pour la commande ${commande.externalId}`
        );
        return { success: true, message: "Email envoyé avec succès" };
      } else {
        throw new Error("Erreur lors de l'envoi de l'email");
      }
    } catch (error) {
      console.error("❌ Erreur EmailJS:", error);
      throw new Error(`Erreur lors de l'envoi de l'email: ${error.message}`);
    }
  }

  static formatDate(dateString) {
    if (!dateString) return "Non spécifiée";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  static formatDateTime(dateTimeString) {
    if (!dateTimeString) return "Non spécifiée";
    const date = new Date(dateTimeString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  static async markCommandeNotificationAsSent(commandeId) {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token manquant");

    try {
      const response = await fetch(
        `${API_BASE_URL}/public/commandes/${commandeId}/commande-notification/sent`,
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

      console.log(`✅ Commande ${commandeId} marquée comme notifiée`);
      return response;
    } catch (error) {
      console.error(
        `❌ Erreur marquage notification commande ${commandeId}:`,
        error
      );
      throw error;
    }
  }

  static async getCommandesWithPendingNotifications() {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token manquant");

    try {
      const response = await fetch(
        `${API_BASE_URL}/public/commandes/notifications/pending`,
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
    } catch (error) {
      console.error("❌ Erreur récupération commandes en attente:", error);
      throw error;
    }
  }
}
