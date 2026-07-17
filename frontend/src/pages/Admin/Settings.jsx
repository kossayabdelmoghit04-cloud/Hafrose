import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import Loader from '../../components/ui/Loader';
import Skeleton from '../../components/ui/Skeleton';
import Swal from 'sweetalert2';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import {
  FiSettings,
  FiInfo,
  FiShare2,
  FiSearch,
  FiUpload,
  FiImage,
  FiSave
} from 'react-icons/fi';
import { Form, Input, EmailField, Textarea } from '../../components/ui/form';

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
      reader.onloadend = () => { setLogoPreview(reader.result); };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFaviconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => { setFaviconPreview(reader.result); };
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
    if (logoFile) formData.append('site_logo', logoFile);
    if (faviconFile) formData.append('site_favicon', faviconFile);
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    const skeletonTabs = [
      { id: 'general', name: 'Général & Design', icon: FiSettings },
      { id: 'contact', name: 'Contact & Horaires', icon: FiInfo },
      { id: 'socials', name: 'Réseaux Sociaux', icon: FiShare2 },
      { id: 'seo', name: 'SEO & Référencement', icon: FiSearch },
    ];
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div>
          <h2 className="text-3xl font-serif text-luxury-charcoal">Paramètres du Site</h2>
          <p className="text-sm text-luxury-gray">Configurez l'identité globale, le SEO et les coordonnées de la boutique.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <Card variant="admin" size="sm" animate={false} className="w-full md:w-64 !p-0 overflow-hidden shrink-0">
            <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible">
              {skeletonTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    disabled
                    className="flex items-center gap-3 px-4 py-3 text-sm font-semibold w-full text-left whitespace-nowrap border-b md:border-b-0 md:border-r-2 border-transparent text-luxury-gray opacity-50"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </Card>
          <Skeleton.Form rows={5} className="flex-grow w-full" />
        </div>
      </div>
    );
  }
  if (error) return (
    <Card variant="alert" animate={false}>
      <Card.Body><p className="text-red-500">Erreur : {error.message}</p></Card.Body>
    </Card>
  );

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
        <Card variant="admin" size="sm" animate={false} className="w-full md:w-64 !p-0 overflow-hidden shrink-0">
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
        </Card>

        {/* Form Panel */}
        <Card variant="admin" size="lg" animate={false} className="flex-grow w-full">
          <Form onSubmit={handleSubmit}>
            <Card.Body className="space-y-8">

              {/* TAB 1: General & Design */}
              {activeTab === 'general' && (
                <Form.Section>
                  <Card.Title as="h3" className="font-serif text-lg pb-3 border-b border-luxury-light-gray">
                    Général & Identité
                  </Card.Title>

                  <Form.Field name="settings-site-name">
                    <Form.Label required>Nom de l'enseigne</Form.Label>
                    <Input
                      variant="admin"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      placeholder="Hafrose"
                      required
                      autoComplete="organization"
                    />
                    <Form.Error />
                  </Form.Field>

                  {/* Logo & Favicon upload */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card variant="flat" size="sm" animate={false} className="space-y-4">
                      <Card.Content className="flex-col gap-4">
                        <Card.Subtitle className="uppercase tracking-wider">Logo Officiel</Card.Subtitle>
                        <div className="flex gap-4 items-center">
                          <div className="w-20 h-20 bg-white border border-luxury-gold/15 flex items-center justify-center rounded overflow-hidden p-2 flex-shrink-0">
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
                            <Card.Meta className="block mt-2">Recommandé : PNG, SVG (max 5 Mo)</Card.Meta>
                          </div>
                        </div>
                      </Card.Content>
                    </Card>

                    <Card variant="flat" size="sm" animate={false} className="space-y-4">
                      <Card.Content className="flex-col gap-4">
                        <Card.Subtitle className="uppercase tracking-wider">Favicon Navigateur</Card.Subtitle>
                        <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 bg-white border border-luxury-gold/15 flex items-center justify-center rounded overflow-hidden p-2 flex-shrink-0">
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
                            <Card.Meta className="block mt-2">Recommandé : ICO, PNG (max 2 Mo)</Card.Meta>
                          </div>
                        </div>
                      </Card.Content>
                    </Card>
                  </div>
                </Form.Section>
              )}

              {/* TAB 2: Contact & Hours */}
              {activeTab === 'contact' && (
                <Form.Section>
                  <Card.Title as="h3" className="font-serif text-lg pb-3 border-b border-luxury-light-gray">
                    Coordonnées & Ouverture
                  </Card.Title>

                  <Form.Row cols={{ default: 1, md: 2 }}>
                    <Form.Field name="settings-phone">
                      <Form.Label>Téléphone de contact</Form.Label>
                      <Input
                        variant="admin"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+33 1 23 45 67 89"
                        autoComplete="tel"
                      />
                    </Form.Field>

                    <Form.Field name="settings-email">
                      <Form.Label>Email de contact</Form.Label>
                      <EmailField
                        variant="admin"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="contact@hafrose.com"
                        autoComplete="email"
                      />
                    </Form.Field>
                  </Form.Row>

                  <Form.Field name="settings-address">
                    <Form.Label>Adresse postale</Form.Label>
                    <Textarea
                      variant="admin"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="123 Rue de l'Artisanat, 75001 Paris"
                      rows={2}
                    />
                  </Form.Field>

                  <Form.Field name="settings-hours">
                    <Form.Label>Horaires d'ouverture</Form.Label>
                    <Textarea
                      variant="admin"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      placeholder={"Lundi - Vendredi : 10h00 - 19h00\nSamedi : 11h00 - 18h00"}
                      rows={3}
                    />
                    <Form.Helper>Un horaire par ligne</Form.Helper>
                  </Form.Field>
                </Form.Section>
              )}

              {/* TAB 3: Social Networks */}
              {activeTab === 'socials' && (
                <Form.Section>
                  <Card.Title as="h3" className="font-serif text-lg pb-3 border-b border-luxury-light-gray">
                    Réseaux Sociaux & Messageries
                  </Card.Title>

                  <Form.Row cols={{ default: 1, md: 3 }}>
                    <Form.Field name="settings-facebook">
                      <Form.Label>Lien Facebook</Form.Label>
                      <Input
                        variant="admin"
                        value={facebook}
                        onChange={(e) => setFacebook(e.target.value)}
                        placeholder="https://facebook.com/hafrose"
                        autoComplete="url"
                      />
                    </Form.Field>

                    <Form.Field name="settings-instagram">
                      <Form.Label>Lien Instagram</Form.Label>
                      <Input
                        variant="admin"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        placeholder="https://instagram.com/hafrose"
                        autoComplete="url"
                      />
                    </Form.Field>

                    <Form.Field name="settings-whatsapp">
                      <Form.Label>Numéro WhatsApp Business</Form.Label>
                      <Input
                        variant="admin"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="+33612345678"
                        autoComplete="tel"
                      />
                      <Form.Helper>Format international sans espaces</Form.Helper>
                    </Form.Field>
                  </Form.Row>
                </Form.Section>
              )}

              {/* TAB 4: SEO Metadata */}
              {activeTab === 'seo' && (
                <Form.Section>
                  <Card.Title as="h3" className="font-serif text-lg pb-3 border-b border-luxury-light-gray">
                    SEO & Optimisation pour les Moteurs de Recherche
                  </Card.Title>

                  <Form.Field name="settings-meta-title">
                    <Form.Label>Meta Title par défaut</Form.Label>
                    <Input
                      variant="admin"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      placeholder="Hafrose - Boutique Artisanale d'Exception"
                    />
                    <Form.Counter current={metaTitle.length} max={60} />
                    <Form.Helper>Recommandé : 50–60 caractères</Form.Helper>
                  </Form.Field>

                  <Form.Field name="settings-meta-desc">
                    <Form.Label>Meta Description par défaut</Form.Label>
                    <Textarea
                      variant="admin"
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      placeholder="Boutique d'articles artisanaux de luxe façonnés à la main..."
                      rows={4}
                    />
                    <Form.Counter current={metaDescription.length} max={160} />
                    <Form.Helper>Recommandé : 120–160 caractères</Form.Helper>
                  </Form.Field>
                </Form.Section>
              )}

            </Card.Body>

            {/* Action buttons */}
            <Card.Footer>
              <div className="ml-auto">
                <Button
                  type="submit"
                  variant="primary"
                  loading={updateMutation.isPending}
                  icon={<FiSave />}
                >
                  Sauvegarder les modifications
                </Button>
              </div>
            </Card.Footer>
          </Form>
        </Card>

      </div>

    </div>
  );
}
