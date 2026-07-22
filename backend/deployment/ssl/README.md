# Guide de Configuration SSL / TLS Let's Encrypt — HAFROSE Backend

Ce document détaille la procédure pas-à-pas pour l'installation, la configuration, le renouvellement automatique et la sécurisation SSL/TLS Let's Encrypt sous Ubuntu 24.04 LTS pour le backend HAFROSE.

---

## 1. Prérequis

- Un nom de domaine pointant vers l'adresse IP publique du serveur (A Record).
- Nginx installé et configuré (`deployment/nginx/hafrose.conf`).
- Les ports **80 (HTTP)** et **443 (HTTPS)** ouverts sur le pare-feu systemd (`ufw`).

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

---

## 2. Installation de Certbot & Plugin Nginx

Sur Ubuntu 24.04 LTS, installez `certbot` et le module `python3-certbot-nginx` via `snapd` ou `apt` :

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

---

## 3. Génération du Certificat SSL

Exécutez la commande Certbot interactive pour obtenir et installer automatiquement le certificat SSL Let's Encrypt dans Nginx :

```bash
sudo certbot --nginx \
  -d hafrose.com \
  -d www.hafrose.com \
  -d api.hafrose.com \
  --agree-tos \
  --email admin@hafrose.com \
  --redirect
```

### Explications des flags :
- `--nginx` : Utilise le plugin Nginx pour valider le challenge ACME et recharger la configuration.
- `-d <domain>` : Domaines et sous-domaines inclus dans le certificat SAN.
- `--agree-tos` : Acceptation automatique des conditions d'utilisation Let's Encrypt.
- `--email` : Adresse email de notification pour expiration ou alertes de sécurité.
- `--redirect` : Configure la redirection automatique de HTTP vers HTTPS.

---

## 4. Emplacement des Certificats Générés

Certbot enregistre les clés et certificats dans :
- **Certificat complet (Chaine)** : `/etc/letsencrypt/live/hafrose.com/fullchain.pem`
- **Clé privée** : `/etc/letsencrypt/live/hafrose.com/privkey.pem`
- **Certificat intermédiaire (Chain)** : `/etc/letsencrypt/live/hafrose.com/chain.pem`

---

## 5. Renouvellement Automatique

Les certificats Let's Encrypt sont valides 90 jours. Certbot configure automatiquement un service et un timer Systemd (`certbot.timer`) qui vérifie l'expiration 2 fois par jour.

### Vérifier le statut du timer Systemd :
```bash
sudo systemctl status certbot.timer
```

### Tester le processus de renouvellement sans altérer les certificats (Dry-run) :
```bash
sudo certbot renew --dry-run
```

### Intégration Cron complémentaire (Secours)
Ajouter dans `/etc/cron.d/hafrose-ssl` ou la crontab root :
```cron
0 4 * * * root /usr/bin/certbot renew --quiet --post-hook "systemctl reload nginx"
```

---

## 6. Sécurisation Avancée & En-tête HSTS

Pour garantir que les navigateurs et clients API interagissent uniquement via HTTPS sécurisé, l'en-tête HSTS (HTTP Strict Transport Security) est activé dans `deployment/nginx/hafrose.conf` :

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

### Avantages :
- **Forçage HTTPS côté client** pendant 1 an (31536000 secondes).
- **Protection contre le SSL Stripping** et les attaques Man-in-the-Middle (MitM).

---

## 7. Commande de Vérification SSL / TLS

### Test en ligne de commande avec OpenSSL :
```bash
openssl s_client -connect hafrose.com:443 -servername hafrose.com
```

### Vérifier la date d'expiration exacte :
```bash
echo | openssl s_client -servername hafrose.com -connect hafrose.com:443 2>/dev/null | openssl x509 -noout -dates
```
