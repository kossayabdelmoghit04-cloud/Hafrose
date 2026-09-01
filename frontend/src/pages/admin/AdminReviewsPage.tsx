import React from 'react';
import { Star, CheckCircle, XCircle, Trash2, MessageSquare } from 'lucide-react';
import {
  useAdminReviews,
  useApproveReview,
  useRejectReview,
  useDeleteReview,
} from '../../features/admin/hooks/useAdminData';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { useSEO } from '../../hooks/useSEO';
import { Review } from '../../types/models';

export const AdminReviewsPage: React.FC = () => {
  useSEO({ title: 'Modération des Avis | HAFROSE Admin', noIndex: true });

  const { data: reviewsData, isLoading, isError, refetch } = useAdminReviews();
  const approveMutation = useApproveReview();
  const rejectMutation = useRejectReview();
  const deleteMutation = useDeleteReview();

  const reviewsList: Review[] = reviewsData?.data || (Array.isArray(reviewsData) ? (reviewsData as Review[]) : []);

  const handleApprove = async (id: number) => {
    try {
      await approveMutation.mutateAsync(id);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur lors de l approbation.';
      alert(errorMsg);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectMutation.mutateAsync(id);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur lors du rejet.';
      alert(errorMsg);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Voulez-vous vraiment supprimer cet avis client ?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Erreur lors de la suppression.';
        alert(errorMsg);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Spinner size="xl" variant="burgundy" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Erreur de chargement"
        message="Impossible de charger les avis clients."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-neutral-950/80 p-6 rounded-2xl border border-neutral-800/80 shadow-lg">
        <h2 className="font-serif text-xl text-white font-medium">Modération des Avis Client</h2>
        <p className="text-xs text-neutral-400">Validez les témoignages affichés sur la boutique</p>
      </div>

      <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 text-[11px] font-semibold uppercase text-neutral-400 tracking-wider bg-neutral-900/40">
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Note</th>
                <th className="py-3.5 px-4">Avis</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900 text-xs">
              {reviewsList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-400">
                    <MessageSquare className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                    <span>Aucun avis à modérer.</span>
                  </td>
                </tr>
              ) : (
                reviewsList.map((r: Review) => (
                  <tr key={r.id} className="hover:bg-neutral-900/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-white">{r.user_name || r.name || r.user?.first_name || 'Client HAFROSE'}</p>
                      <p className="text-[10px] text-neutral-500">{r.email || r.user?.email || '—'}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < (r.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-neutral-700'
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-300 max-w-md">
                      <p className="font-medium text-white text-xs">{r.title || 'Avis sur le produit'}</p>
                      <p className="text-neutral-400 mt-0.5 line-clamp-2">{r.comment || r.body}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      {r.is_approved ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                          Approuvé
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950/80 text-amber-400 border border-amber-800/50">
                          En attente
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        {!r.is_approved ? (
                          <button
                            onClick={() => handleApprove(r.id)}
                            disabled={approveMutation.isPending}
                            title="Approuver"
                            className="p-2 text-emerald-400 hover:bg-emerald-950/40 rounded-lg transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReject(r.id)}
                            disabled={rejectMutation.isPending}
                            title="Rejeter"
                            className="p-2 text-amber-400 hover:bg-amber-950/40 rounded-lg transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(r.id)}
                          disabled={deleteMutation.isPending}
                          title="Supprimer"
                          className="p-2 text-neutral-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReviewsPage;
