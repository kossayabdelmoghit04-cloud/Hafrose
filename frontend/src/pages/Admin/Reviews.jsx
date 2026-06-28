import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import Loader from '../../components/ui/Loader';
import Swal from 'sweetalert2';
import { 
  FiCheck, 
  FiX, 
  FiTrash2, 
  FiStar, 
  FiMessageSquare 
} from 'react-icons/fi';

export default function Reviews() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  // Charger les avis clients
  const { data: reviewsData, isLoading, error } = useQuery({
    queryKey: ['adminReviews', page],
    queryFn: () => api.get(`/admin/reviews?page=${page}&per_page=12`).then(res => res),
    keepPreviousData: true,
  });

  // Mutation pour approuver
  const approveMutation = useMutation({
    mutationFn: (id) => api.patch(`/admin/reviews/${id}/approve`),
    onSuccess: (res) => {
      if (res.success) {
        Swal.fire('Approuvé !', 'L\'avis a été approuvé et est visible sur le site.', 'success');
        queryClient.invalidateQueries({ queryKey: ['adminReviews'] });
      }
    },
    onError: (err) => {
      Swal.fire('Erreur', err.message || 'L\'opération a échoué.', 'error');
    }
  });

  // Mutation pour rejeter/désapprouver
  const rejectMutation = useMutation({
    mutationFn: (id) => api.patch(`/admin/reviews/${id}/reject`),
    onSuccess: (res) => {
      if (res.success) {
        Swal.fire('Rejeté !', 'L\'avis a été désapprouvé et masqué sur le site.', 'success');
        queryClient.invalidateQueries({ queryKey: ['adminReviews'] });
      }
    },
    onError: (err) => {
      Swal.fire('Erreur', err.message || 'L\'opération a échoué.', 'error');
    }
  });

  // Mutation pour supprimer
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/reviews/${id}`),
    onSuccess: (res) => {
      if (res.success) {
        Swal.fire('Supprimé !', 'L\'avis a été supprimé définitivement.', 'success');
        queryClient.invalidateQueries({ queryKey: ['adminReviews'] });
      }
    },
    onError: (err) => {
      Swal.fire('Erreur', err.message || 'La suppression a échoué.', 'error');
    }
  });

  const handleApprove = (id) => {
    approveMutation.mutate(id);
  };

  const handleReject = (id) => {
    rejectMutation.mutate(id);
  };

  const handleDelete = (review) => {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: `Vous allez supprimer définitivement l'avis de "${review.customer_name}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#111111',
      cancelButtonColor: '#7F7F7F',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(review.id);
      }
    });
  };

  if (isLoading) return <Loader fullPage />;
  if (error) return <div className="text-red-500">Erreur : {error.message}</div>;

  const reviewsList = reviewsData?.data || [];
  const meta = reviewsData?.meta || { current_page: 1, last_page: 1 };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-serif text-luxury-charcoal">Modération des Avis</h2>
        <p className="text-sm text-luxury-gray">Consultez et modérez les retours et notations des clients.</p>
      </div>

      {/* Grid of Reviews */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviewsList.map((review) => (
          <div 
            key={review.id} 
            className={`p-6 bg-white border rounded-lg flex flex-col justify-between shadow-sm hover:shadow transition-all duration-300 ${
              !review.is_approved ? 'border-amber-300 bg-amber-50/20' : 'border-luxury-gold/10'
            }`}
          >
            <div className="space-y-4">
              {/* Product and Rating info */}
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-sm text-luxury-charcoal truncate max-w-[170px]" title={review.product?.name}>
                    {review.product?.name || 'Produit supprimé'}
                  </h4>
                  <span className="text-[10px] text-luxury-gray block">Par {review.customer_name}</span>
                </div>
                <div className="flex gap-1 text-luxury-gold">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FiStar 
                      key={i} 
                      className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-luxury-gold' : 'text-luxury-light-gray'}`} 
                    />
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <div className="p-3 bg-luxury-light-gray/40 rounded text-xs text-luxury-gray flex gap-2">
                <FiMessageSquare className="w-4 h-4 shrink-0 text-luxury-gold mt-0.5" />
                <p className="italic line-clamp-4">"{review.comment}"</p>
              </div>
            </div>

            {/* Moderation Controls */}
            <div className="flex items-center justify-between border-t border-luxury-light-gray mt-6 pt-4">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                review.is_approved ? 'text-emerald-600' : 'text-amber-600'
              }`}>
                {review.is_approved ? 'Approuvé' : 'En attente'}
              </span>

              <div className="flex gap-2">
                {review.is_approved ? (
                  <button
                    onClick={() => handleReject(review.id)}
                    className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 rounded transition-all duration-200"
                    title="Désapprouver / Retirer du site"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleApprove(review.id)}
                    className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 rounded transition-all duration-200"
                    title="Approuver et publier"
                  >
                    <FiCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(review)}
                  className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 rounded transition-all duration-200"
                  title="Supprimer définitivement"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {reviewsList.length === 0 && (
          <div className="col-span-full text-center py-10 text-luxury-gray bg-white border border-dashed border-luxury-gold/20 rounded-lg">
            Aucun avis client soumis pour le moment.
          </div>
        )}
      </div>

      {/* Pagination */}
      {meta.last_page > 1 && (
        <div className="flex justify-between items-center py-4">
          <span className="text-xs text-luxury-gray">Page {meta.current_page} sur {meta.last_page}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-white border border-luxury-gold/15 rounded text-xs disabled:opacity-50 disabled:pointer-events-none hover:border-luxury-gold transition-all duration-300"
            >
              Précédent
            </button>
            <button
              onClick={() => setPage(p => Math.min(p + 1, meta.last_page))}
              disabled={page === meta.last_page}
              className="px-3 py-1 bg-white border border-luxury-gold/15 rounded text-xs disabled:opacity-50 disabled:pointer-events-none hover:border-luxury-gold transition-all duration-300"
            >
              Suivant
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
