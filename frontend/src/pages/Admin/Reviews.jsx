import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import Loader from '../../components/ui/Loader';
import Skeleton from '../../components/ui/Skeleton';
import Swal from 'sweetalert2';
import { 
  FiCheck, 
  FiX, 
  FiTrash2, 
  FiStar, 
  FiMessageSquare 
} from 'react-icons/fi';
import Button from '../../components/ui/Button';
import AdminActionButton from '../../components/ui/AdminActionButton';
import Card from '../../components/ui/Card';


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

  if (error) return (
    <Card variant="alert" animate={false}>
      <Card.Body><p className="text-red-500">Erreur : {error.message}</p></Card.Body>
    </Card>
  );

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
        {isLoading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <Card key={idx} variant="review" size="md" animate={false}>
              <Card.Body>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-grow">
                      <div className="w-28 h-4 skeleton-shimmer" />
                      <div className="w-16 h-3 skeleton-shimmer opacity-60" />
                    </div>
                    <div className="w-16 h-4 skeleton-shimmer opacity-80 shrink-0" />
                  </div>
                  <div className="p-3 bg-luxury-light-gray/40 rounded h-16 skeleton-shimmer" />
                </div>
              </Card.Body>
              <Card.Footer className="justify-between items-center pt-3 border-t border-card-border-editorial">
                <div className="w-16 h-3.5 skeleton-shimmer" />
                <div className="flex gap-2">
                  <div className="w-8 h-8 skeleton-shimmer rounded" />
                  <div className="w-8 h-8 skeleton-shimmer rounded" />
                </div>
              </Card.Footer>
            </Card>
          ))
        ) : (
          reviewsList.map((review) => (
            <Card
              key={review.id}
              variant="review"
              size="md"
              hoverable
              animate={false}
              className={!review.is_approved ? 'border-amber-300 bg-amber-50/20' : ''}
            >
              <Card.Body>
                <div className="space-y-4">
                  {/* Product and Rating info */}
                  <div className="flex justify-between items-start">
                    <div>
                      <Card.Title as="h4" className="text-sm truncate max-w-[170px]" title={review.product?.name}>
                        {review.product?.name || 'Produit supprimé'}
                      </Card.Title>
                      <Card.Meta>Par {review.customer_name}</Card.Meta>
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
              </Card.Body>

              {/* Moderation Controls */}
              <Card.Footer>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  review.is_approved ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {review.is_approved ? 'Approuvé' : 'En attente'}
                </span>

                <Card.Actions>
                  {review.is_approved ? (
                    <AdminActionButton
                      action="reject"
                      onClick={() => handleReject(review.id)}
                      title="Désapprouver / Retirer du site"
                    />
                  ) : (
                    <AdminActionButton
                      action="approve"
                      onClick={() => handleApprove(review.id)}
                      title="Approuver et publier"
                    />
                  )}
                  <AdminActionButton
                    action="delete"
                    onClick={() => handleDelete(review)}
                    title="Supprimer définitivement"
                  />
                </Card.Actions>
              </Card.Footer>
            </Card>
          ))
        )}

        {!isLoading && reviewsList.length === 0 && (
          <Card variant="empty" size="lg" animate={false} className="col-span-full">
            <Card.Body>
              <div className="text-center py-10 text-luxury-gray">
                Aucun avis client soumis pour le moment.
              </div>
            </Card.Body>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {meta.last_page > 1 && (
        <div className="flex justify-between items-center py-4">
          <span className="text-xs text-luxury-gray">Page {meta.current_page} sur {meta.last_page}</span>
          <div className="flex gap-2">
            <Button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              variant="secondary"
              size="sm"
            >
              Précédent
            </Button>
            <Button
              onClick={() => setPage(p => Math.min(p + 1, meta.last_page))}
              disabled={page === meta.last_page}
              variant="secondary"
              size="sm"
            >
              Suivant
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
