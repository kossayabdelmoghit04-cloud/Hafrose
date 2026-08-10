import React, { useState } from 'react';
import { ShieldCheck, Eye, XCircle } from 'lucide-react';
import { useAdminLogs, useActivityLogs } from '../../features/admin/hooks/useAdminData';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { useSEO } from '../../hooks/useSEO';

export const AdminLogsPage: React.FC = () => {
  useSEO({ title: 'Journaux d Audit | HAFROSE Admin', noIndex: true });

  const [tab, setTab] = useState<'admin' | 'activity'>('admin');
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const { data: adminLogsData, isLoading: isAdminLoading, isError: isAdminError, refetch: refetchAdmin } = useAdminLogs();
  const { data: activityLogsData, isLoading: isActLoading, isError: isActError, refetch: refetchAct } = useActivityLogs();

  const logsList = tab === 'admin'
    ? (adminLogsData?.data || (Array.isArray(adminLogsData) ? adminLogsData : []))
    : (activityLogsData?.data || (Array.isArray(activityLogsData) ? activityLogsData : []));

  const isLoading = tab === 'admin' ? isAdminLoading : isActLoading;
  const isError = tab === 'admin' ? isAdminError : isActError;
  const refetch = tab === 'admin' ? refetchAdmin : refetchAct;

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
        message="Impossible de charger les journaux d'audit."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-neutral-950/80 p-6 rounded-2xl border border-neutral-800/80 shadow-lg">
        <div>
          <h2 className="font-serif text-xl text-white font-medium">Journaux d'Audit & Sécurité</h2>
          <p className="text-xs text-neutral-400">Tracabilité des actions administratives et événements système</p>
        </div>

        {/* Tab Buttons */}
        <div className="inline-flex bg-neutral-900 p-1 rounded-xl border border-neutral-800">
          <button
            onClick={() => setTab('admin')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tab === 'admin'
                ? 'bg-burgundy-900 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Logs Administration
          </button>
          <button
            onClick={() => setTab('activity')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tab === 'activity'
                ? 'bg-burgundy-900 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Activité Globale
          </button>
        </div>
      </div>

      {/* LOGS TABLE */}
      <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 text-[11px] font-semibold uppercase text-neutral-400 tracking-wider bg-neutral-900/40">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Utilisateur / Admin</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Ressource</th>
                <th className="py-3.5 px-4">Adresse IP</th>
                <th className="py-3.5 px-4 text-right">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900 text-xs">
              {logsList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    <ShieldCheck className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                    <span>Aucun événement d'audit enregistré.</span>
                  </td>
                </tr>
              ) : (
                logsList.map((log: any) => (
                  <tr key={log.id} className="hover:bg-neutral-900/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-neutral-400 text-[11px]">
                      {new Date(log.created_at).toLocaleString('fr-FR')}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {log.user_email || log.user?.email || log.user_id || 'Système'}
                    </td>
                    <td className="py-3 px-4 font-medium text-amber-400">
                      {log.action || log.event_type || 'Action'}
                    </td>
                    <td className="py-3 px-4 text-neutral-300 font-mono">
                      {log.resource || '—'} {log.resource_id ? `#${log.resource_id}` : ''}
                    </td>
                    <td className="py-3 px-4 text-neutral-400 font-mono text-[11px]">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-lg transition-colors"
                        title="Inspecter le contexte"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* LOG CONTEXT MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <h3 className="font-serif text-lg text-white">Contexte de l'Événement #{selectedLog.id}</h3>
              <button onClick={() => setSelectedLog(null)} className="text-neutral-400 hover:text-white">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <pre className="p-4 bg-neutral-900/80 border border-neutral-800 rounded-xl text-neutral-300 font-mono text-xs overflow-x-auto max-h-64">
              {JSON.stringify(selectedLog, null, 2)}
            </pre>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogsPage;
