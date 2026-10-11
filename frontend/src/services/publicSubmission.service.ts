import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants/api.constants';
import { ApiResponse } from '../types/api';
import { Review } from '../types/models';

export interface ContactSubmission {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  website?: string;
  turnstileToken: string;
}

export interface ReviewSubmission {
  product_id: number;
  customer_name: string;
  rating: number;
  comment: string;
  turnstileToken: string;
}

export const publicSubmissionService = {
  submitContact(payload: ContactSubmission): Promise<ApiResponse<unknown>> {
    const { turnstileToken, ...fields } = payload;
    return apiClient.post(API_ENDPOINTS.CONTACT.SUBMIT, {
      ...fields,
      'cf-turnstile-response': turnstileToken,
    });
  },

  submitReview(payload: ReviewSubmission): Promise<ApiResponse<Review>> {
    const { turnstileToken, ...fields } = payload;
    return apiClient.post(API_ENDPOINTS.REVIEWS.SUBMIT, {
      ...fields,
      'cf-turnstile-response': turnstileToken,
    });
  },
};
