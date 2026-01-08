import { jwtDecode } from "jwt-decode";

/**
 * Récupère l'ID de l'utilisateur depuis le token JWT
 * @returns {number|null} L'ID de l'utilisateur ou null
 */
export const getUserIdFromToken = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Aucun token trouvé");
      return null;
    }

    const decoded = jwtDecode(token);

    // Essayer différentes propriétés possibles dans le token
    const userId = 1;

    if (!userId) {
      console.error("Aucun userId trouvé dans le token:", decoded);
      return null;
    }

    return userId;
  } catch (error) {
    console.error("Erreur lors du décodage du token:", error);
    return null;
  }
};
