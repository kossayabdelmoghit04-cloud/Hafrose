import axios from 'axios';

// Instance Axios configurée pour l'API Laravel
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Intercepteur de requête : utile pour ajouter des en-têtes personnalisés ou des tokens d'authentification à l'avenir
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse : centralise la gestion des erreurs API
api.interceptors.response.use(
  (response) => {
    return response.data; // Retourne directement le corps de la réponse Laravel { success, message, data }
  },
  (error) => {
    let errorMessage = "Une erreur inattendue est survenue.";
    let validationErrors = null;

    if (error.response) {
      const { status, data } = error.response;
      
      // Extraction du message d'erreur renvoyé par Laravel ou le serveur
      errorMessage = data?.message || errorMessage;
      validationErrors = data?.errors || null;

      switch (status) {
        case 400:
          console.error("Requête incorrecte :", errorMessage);
          break;
        case 401:
          console.warn("Non authentifié : redirection vers la connexion ou nettoyage de session.");
          break;
        case 403:
          console.error("Accès interdit :", errorMessage);
          break;
        case 404:
          console.warn("Ressource non trouvée :", errorMessage);
          break;
        case 422:
          console.warn("Erreur de validation :", validationErrors);
          break;
        case 429:
          console.warn("Trop de requêtes. Veuillez patienter.");
          errorMessage = "Trop de requêtes. Veuillez patienter avant de réessayer.";
          break;
        case 500:
          console.error("Erreur serveur interne :", errorMessage);
          errorMessage = "Une erreur serveur est survenue. Nos artisans techniques sont prévenus.";
          break;
        default:
          console.error(`Erreur HTTP ${status} :`, errorMessage);
      }
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      console.error("Aucune réponse reçue du serveur API :", error.request);
      errorMessage = "Impossible de contacter le serveur. Veuillez vérifier votre connexion.";
    } else {
      // Une erreur s'est produite lors de la configuration de la requête
      console.error("Erreur de configuration de la requête :", error.message);
    }

    // Retourne un objet d'erreur standardisé pour nos catch() dans les composants
    const apiError = new Error(errorMessage);
    apiError.status = error.response?.status || 500;
    apiError.errors = validationErrors;
    apiError.originalError = error;

    return Promise.reject(apiError);
  }
);

export default api;
