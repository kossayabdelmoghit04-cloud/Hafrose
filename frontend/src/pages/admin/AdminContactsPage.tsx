import React, { useState } from 'react';
import { Mail, CheckCircle2, Trash2, Eye, XCircle } from 'lucide-react';
import {
  useAdminContacts,
  useMarkContactAsRead,
  useDeleteContact,
} from '../../features/admin/hooks/useAdminData';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { useSEO } from '../../hooks/useSEO';

export const AdminContactsPage: React.FC = () => {
  useSEO({ title: 'Messagerie Contact | HAFROSE Admin', noIndex: true });

  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);

  const { data: contactsData, isLoading, isError, refetch } = useAdminContacts();
  const markReadMutation = useMarkContactAsRead();
  const deleteMutation = useDeleteContact();

  const contactsList = contactsData?.data || (Array.isArray(contactsData) ? contactsData : []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await markReadMutation.mutateAsync(id);
    } catch (err: any) {
      alert(err?.message || 'Erreur lors du marquage comme lu.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Voulez-vous supprimer ce message ?')) {
      try {
        await deleteMutation.mutateAsync(id);
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage(null);
        }
      } catch (err: any) {
        alert(err?.message || 'Erreur lors de la suppression.');
      }
    }
  };

  const openMessage = (m: any) => {
    setSelectedMessage(m);
    if (!m.is_read) {
      handleMarkAsRead(m.id);
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
        message="Impossible de charger la messagerie de contact."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-neutral-950/80 p-6 rounded-2xl border border-neutral-800/80 shadow-lg">
        <h2 className="font-serif text-xl text-white font-medium">Messagerie Client & Support</h2>
        <p className="text-xs text-neutral-400">Demandes d'informations et conciergerie HAFROSE</p>
      </div>

      <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 text-[11px] font-semibold uppercase text-neutral-400 tracking-wider bg-neutral-900/40">
                <th className="py-3.5 px-4">Expéditeur</th>
                <th className="py-3.5 px-4">Sujet</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900 text-xs">
              {contactsList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-400">
                    <Mail className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                    <span>Aucun message reçu.</span>
                  </td>
                </tr>
              ) : (
                contactsList.map((m: any) => (
                  <tr key={m.id} className="hover:bg-neutral-900/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-white">{m.name}</p>
                      <p className="text-[10px] text-neutral-400">{m.email}</p>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-200 font-medium">
                      {m.subject || 'Demande d informations'}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-400">
                      {new Date(m.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3.5 px-4">
                      {m.is_read ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Lu
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Nouveau
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => openMessage(m)}
                          title="Lire le message"
                          className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}
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

      {/* MESSAGE DETAIL MODAL */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <h3 className="font-serif text-lg text-white">{selectedMessage.subject || 'Message Contact'}</h3>
                <p className="text-xs text-neutral-400">
                  De: {selectedMessage.name} ({selectedMessage.email})
                </p>
              </div>
              <button onClick={() => setSelectedMessage(null)} className="text-neutral-400 hover:text-white">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl text-neutral-200 text-xs leading-relaxed whitespace-pre-wrap">
              {selectedMessage.message || selectedMessage.body || 'Aucun contenu.'}
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] text-neutral-500">
                Reçu le {new Date(selectedMessage.created_at).toLocaleString('fr-FR')}
              </span>
              <button
                onClick={() => handleDelete(selectedMessage.id)}
                className="px-3 py-1.5 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl hover:bg-rose-900/60"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContactsPage;
