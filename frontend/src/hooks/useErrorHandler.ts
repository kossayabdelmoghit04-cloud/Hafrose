import { ApiErrorResponse } from '../types/api';

const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: 'La requête est invalide. Veuillez vérifier vos informations.',
  401: 'Votre session a expiré. Veuillez vous reconnecter.',
  403: "Vous n'avez pas les autorisations nécessaires pour accéder à cette ressource.",
  404: "Le contenu demandé est introuvable.",
  409: "Une ressource avec ces informations existe déjà.",
  422: "Certaines informations sont incorrectes. Veuillez vérifier vos saisies.",
  429: "Trop de tentatives. Veuillez patienter quelques instants avant de réessayer.",
  500: "Une erreur inattendue est survenue sur nos serveurs. Veuillez réessayer ultérieurement.",
  502: "Nos serveurs sont temporairement indisponibles. Veuillez réessayer dans quelques instants.",
  503: "Le service est temporairement en maintenance. Nous revenons très prochainement.",
};

/**
 * getApiErrorMessage
 * Converts a raw ApiErrorResponse or unknown error into a user-friendly French message.
 */
export function getApiErrorMessage(error: unknown): string {
  if (!error) return 'Une erreur inattendue est survenue.';

  const apiError = error as ApiErrorResponse & { status_code?: number };

  // If we have a specific status code message
  if (apiError.status_code && HTTP_ERROR_MESSAGES[apiError.status_code]) {
    return HTTP_ERROR_MESSAGES[apiError.status_code];
  }

  // If the API returned a readable message
  if (apiError.message && apiError.message.length > 0 && apiError.message.length < 200) {
    return apiError.message;
  }

  return 'Une erreur inattendue est survenue. Veuillez réessayer.';
}

/**
 * getValidationErrors
 * Extracts Laravel 422 validation errors as a flat key->message map.
 */
export function getValidationErrors(error: unknown): Record<string, string> {
  const apiError = error as ApiErrorResponse;
  if (!apiError?.errors) return {};

  return Object.fromEntries(
    Object.entries(apiError.errors).map(([key, messages]) => [key, messages[0]])
  );
}
