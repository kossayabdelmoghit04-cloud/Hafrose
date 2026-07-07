import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import Loader from '../../components/ui/Loader';
import Swal from 'sweetalert2';
import Button from '../../components/ui/Button';
import { 
  FiSettings, 
  FiInfo, 
  FiShare2, 
  FiSearch, 
  FiUpload, 
  FiImage, 
  FiSave 
} from 'react-icons/fi';

export default function Settings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');

  // Charger les paramètres du site
  const { data: settings = {}, isLoading, error } = useQuery({
    queryKey: ['adminSettings'],
    queryFn: () => api.get('/admin/settings').then(res => res.data),
  });

  // États locaux du formulaire
  const [siteName, setSiteName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [hours, setHours] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  
  // Logos
  const [logoPreview, setLogoPreview] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState('');
  const [faviconFile, setFaviconFile] = useState(null);

  // Synchroniser les données chargées avec le formulaire
  useEffect(() => {
    if (Object.keys(settings).length > 0) {
      setSiteName(settings.site_name || '');
      setAddress(settings.address || '');
      setPhone(settings.phone || '');
      setEmail(settings.email || '');
      setHours(settings.hours || '');
      setFacebook(settings.facebook || '');
      setInstagram(settings.instagram || '');
      setWhatsapp(settings.whatsapp || '');
      setMetaTitle(settings.meta_title || '');
      setMetaDescription(settings.meta_description || '');
      setLogoPreview(settings.site_logo || '');
      setFaviconPreview(settings.site_favicon || '');
    }
  }, [settings]);

  // Mutation de mise à jour
  const updateMutation = useMutation({
    mutationFn: (formData) => api.post('/admin/settings', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: (res) => {
      if (res.success) {
        Swal.fire('Succès !', 'Les paramètres du site ont été mis à jour.', 'success');
        queryClient.invalidateQueries({ queryKey: ['adminSettings'] });
      }
    },
    onError: (err) => {
      Swal.fire('Erreur', err.message || 'La mise à jour a échoué.', 'error');
    }
  });

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFaviconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFaviconPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('settings[site_name]', siteName);
    formData.append('settings[address]', address);
    formData.append('settings[phone]', phone);
    formData.append('settings[email]', email);
    formData.append('settings[hours]', hours);
    formData.append('settings[facebook]', facebook);
    formData.append('settings[instagram]', instagram);
    formData.append('settings[whatsapp]', whatsapp);
    formData.append('settings[meta_title]', metaTitle);
    formData.append('settings[meta_description]', metaDescription);

    if (logoFile) {
      formData.append('site_logo', logoFile);
    }
    if (faviconFile) {
      formData.append('site_favicon', faviconFile);
    }

    updateMutation.mutate(formData);
  };

  if (isLoading) return <Loader fullPage />;
  if (error) return <div className="text-red-500">Erreur : {error.message}</div>;

  const tabs = [
    { id: 'general', name: 'Général & Design', icon: FiSettings },
    { id: 'contact', name: 'Contact & Horaires', icon: FiInfo },
    { id: 'socials', name: 'Réseaux Sociaux', icon: FiShare2 },
    { id: 'seo', name: 'SEO & Référencement', icon: FiSearch },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-serif text-luxury-charcoal">Paramètres du Site</h2>
        <p className="text-sm text-luxury-gray">Configurez l'identité globale, le SEO et les coordonnées de la boutique.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        
        {/* Navigation Tabs */}
        <aside className="w-full md:w-64 bg-white border border-luxury-gold/10 rounded-lg shadow-sm overflow-hidden shrink-0">
          <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all duration-300 w-full text-left whitespace-nowrap border-b md:border-b-0 md:border-r-2 ${
                    activeTab === tab.id
                      ? 'bg-luxury-gold/10 border-luxury-gold text-luxury-gold'
                      : 'border-transparent text-luxury-gray hover:text-luxury-charcoal hover:bg-luxury-light-gray/20'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Form Panel */}
        <form onSubmit={handleSubmit} className="flex-grow w-full bg-white border border-luxury-gold/10 rounded-lg shadow-sm p-6 space-y-8">
          
          {/* TAB 1: General & Design */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="font-serif text-lg text-luxury-charcoal pb-3 border-b border-luxury-light-gray">Général & Identité</h3>
              
              <div>
                <label className="block text-xs font-semibold text-luxury-gray uppercase tracking-wider mb-2">
                  Nom de l'enseigne
                </label>
                <input
                  type="text"
                  required
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="Hafrose"
                  className="w-full px-4 py-2.5 bg-luxury-cream/30 border border-luxury-gold/15 rounded outline-none focus:border-luxury-gold text-sm"
                />
              </div>

              {/* Logo Upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-luxury-cream/10 border border-luxury-gold/10 rounded space-y-4">
                  <span className="block text-xs font-bold text-luxury-gray uppercase tracking-wider">Logo Officiel</span>
                  <div className="flex gap-4 items-center">
                    <div className="w-20 h-20 bg-white border border-luxury-gold/15 flex items-center justify-center rounded overflow-hidden p-2">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Aperçu Logo" className="w-full h-full object-contain" />
                      ) : (
                        <FiImage className="w-8 h-8 text-luxury-light-gray" />
                      )}
                    </div>
                    <div>
                      <label className="flex items-center gap-2 px-3 py-2 bg-white border border-luxury-gold/25 hover:border-luxury-gold rounded text-xs cursor-pointer text-luxury-charcoal font-semibold w-fit">
                        <FiUpload />
                        <span>Changer le logo</span>
                        <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                      </label>
                      <span className="text-[10px] text-luxury-gray block mt-2">Recommandé : PNG, SVG (max 5 Mo)</span>
                    </div>
                  </div>
                </div>

                {/* Favicon Upload */}
                <div className="p-4 bg-luxury-cream/10 border border-luxury-gold/10 rounded space-y-4">
                  <span className="block text-xs font-bold text-luxury-gray uppercase tracking-wider">Favicon Navigateur</span>
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-white border border-luxury-gold/15 flex items-center justify-center rounded overflow-hidden p-2">
                      {faviconPreview ? (
                        <img src={faviconPreview} alt="Aperçu Favicon" className="w-full h-full object-contain" />
                      ) : (
                        <FiImage className="w-6 h-6 text-luxury-light-gray" />
                      )}
                    </div>
                    <div>
                      <label className="flex items-center gap-2 px-3 py-2 bg-white border border-luxury-gold/25 hover:border-luxury-gold rounded text-xs cursor-pointer text-luxury-charcoal font-semibold w-fit">
                        <FiUpload />
                        <span>Changer le favicon</span>
                        <input type="file" accept="image/*" onChange={handleFaviconChange} className="hidden" />
                      </label>
                      <span className="text-[10px] text-luxury-gray block mt-2">Recommandé : ICO, PNG (max 2 Mo)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Contact & Hours */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <h3 className="font-serif text-lg text-luxury-charcoal pb-3 border-b border-luxury-light-gray">Coordonnées & Ouverture</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-luxury-gray uppercase tracking-wider mb-2">
                    Téléphone de contact
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+33 1 23 45 67 89"
                    className="w-full px-4 py-2.5 bg-luxury-cream/30 border border-luxury-gold/15 rounded outline-none focus:border-luxury-gold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-luxury-gray uppercase tracking-wider mb-2">
                    Email de contact
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@hafrose.com"
                    className="w-full px-4 py-2.5 bg-luxury-cream/30 border border-luxury-gold/15 rounded outline-none focus:border-luxury-gold text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-luxury-gray uppercase tracking-wider mb-2">
                  Adresse postale
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Rue de l'Artisanat, 75001 Paris"
                  rows="2"
                  className="w-full px-4 py-2.5 bg-luxury-cream/30 border border-luxury-gold/15 rounded outline-none focus:border-luxury-gold text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-luxury-gray uppercase tracking-wider mb-2">
                  Horaires d'ouverture
                </label>
                <textarea
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="Lundi - Vendredi : 10h00 - 19h00&#10;Samedi : 11h00 - 18h00"
                  rows="3"
                  className="w-full px-4 py-2.5 bg-luxury-cream/30 border border-luxury-gold/15 rounded outline-none focus:border-luxury-gold text-sm"
                />
              </div>
            </div>
          )}

          {/* TAB 3: Social Networks */}
          {activeTab === 'socials' && (
            <div className="space-y-6">
              <h3 className="font-serif text-lg text-luxury-charcoal pb-3 border-b border-luxury-light-gray">Réseaux Sociaux & Messageries</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-luxury-gray uppercase tracking-wider mb-2">
                    Lien Facebook
                  </label>
                  <input
                    type="text"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    placeholder="https://facebook.com/hafrose"
                    className="w-full px-4 py-2.5 bg-luxury-cream/30 border border-luxury-gold/15 rounded outline-none focus:border-luxury-gold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-luxury-gray uppercase tracking-wider mb-2">
                    Lien Instagram
                  </label>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="https://instagram.com/hafrose"
                    className="w-full px-4 py-2.5 bg-luxury-cream/30 border border-luxury-gold/15 rounded outline-none focus:border-luxury-gold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-luxury-gray uppercase tracking-wider mb-2">
                    Numéro WhatsApp Business
                  </label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+33612345678"
                    className="w-full px-4 py-2.5 bg-luxury-cream/30 border border-luxury-gold/15 rounded outline-none focus:border-luxury-gold text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SEO Metadata */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <h3 className="font-serif text-lg text-luxury-charcoal pb-3 border-b border-luxury-light-gray">SEO & Optimisation pour les Moteurs de Recherche</h3>
              
              <div>
                <label className="block text-xs font-semibold text-luxury-gray uppercase tracking-wider mb-2">
                  Meta Title par défaut
                </label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Hafrose - Boutique Artisanale d'Exception"
                  className="w-full px-4 py-2.5 bg-luxury-cream/30 border border-luxury-gold/15 rounded outline-none focus:border-luxury-gold text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-luxury-gray uppercase tracking-wider mb-2">
                  Meta Description par défaut
                </label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Boutique d'articles artisanaux de luxe façonnés à la main..."
                  rows="4"
                  className="w-full px-4 py-2.5 bg-luxury-cream/30 border border-luxury-gold/15 rounded outline-none focus:border-luxury-gold text-sm resize-none"
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end pt-6 border-t border-luxury-gold/10">
            <Button
              type="submit"
              variant="primary"
              loading={updateMutation.isPending}
              icon={<FiSave />}
            >
              Sauvegarder les modifications
            </Button>
          </div>

        </form>
      </div>

    </div>
  );
}
