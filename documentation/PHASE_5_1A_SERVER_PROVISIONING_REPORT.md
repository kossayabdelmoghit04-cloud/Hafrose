# HAFROSE — Phase 5.1A Server Provisioning Report

> **Date :** 2026-09-09  
> **Branche de référence :** `main`  
> **Commit de référence audité :** `77ee7bf7fae66a85e92fa2655bbbedc32efc6d31`  
> **Statut global :** 🔴 `STATUS = BLOCKED`

---

## Server

```text
OS: Ubuntu 24.04 LTS (Target Architecture x86_64)
IP: NOT_PROVISIONED (En attente de commande VPS / Serveur dédié)
Provider: NOT_CONFIGURED (Aucun fournisseur cloud ni compte externe relié)
Hostname: NOT_CONFIGURED
```

---

## SSH

```text
Ed25519: NOT_CONFIGURED (Clé hafrose-production-deploy non générée sur serveur cible)
Deploy user: NOT_CONFIGURED (Utilisateur non-root 'deploy' en attente d'instanciation)
Root SSH: NOT_CONFIGURED (Hardening en attente)
Password SSH: NOT_CONFIGURED (Désactivation en attente)
```

---

## Docker

```text
Docker Engine: NOT_CONFIGURED (En attente d'installation sur serveur cible)
Docker Compose: NOT_CONFIGURED (En attente d'installation du plugin officiel Compose v2)
```

---

## Firewall

```text
22: NOT_CONFIGURED (UFW en attente d'activation sur l'hôte cible)
80: NOT_CONFIGURED (UFW en attente d'activation sur l'hôte cible)
443: NOT_CONFIGURED (UFW en attente d'activation sur l'hôte cible)
3306 public: BLOCKED (Architecture locale & Dockerfile validée : aucun port 3306 exposé à l'extérieur)
```

---

## Repository

```text
HAFROSE repository: READY (Architecture Docker multi-services, backend Laravel 11, frontend React 19)
main branch: READY (Commit 77ee7bf, tests unitaires et linters 100% verts)
```

---

## Environment

```text
Production env configured: BLOCKED (Sécurité : le fichier .env de production ne doit exister que sur le serveur réel)
Secrets protected: PASS (Aucun secret commité dans Git, .gitignore strict)
```

---

## DNS

```text
hafrose.com: NOT CONFIGURED (NXDOMAIN - vérifié le 2026-09-09)
www.hafrose.com: NOT CONFIGURED (NXDOMAIN - vérifié le 2026-09-09)
api.hafrose.com: NOT CONFIGURED (NXDOMAIN - vérifié le 2026-09-09)
```

---

## SSL

```text
Public SSL: NOT CONFIGURED (Certificats Let's Encrypt en attente de la résolution DNS publique - Phase 5.1B)
```

---

## DÉCISION

```text
============================================================
HAFROSE PHASE 5.1A
SERVER PROVISIONING = BLOCKED
============================================================

BLOCKER:
Aucune instance serveur physique ou VPS Linux de production n'est actuellement provisionnée ni accessible.

CAUSE:
Conformément à la RÈGLE ABSOLUE (Section 1), aucun paramètre externe (adresse IP publique, identifiants de fournisseur cloud, accès SSH distant, clés privées) ne doit être simulé, inventé ou demandé en clair. L'infrastructure d'hébergement matériel nécessite une action d'instanciation externe de la part de l'opérateur.

ACTION REQUIRED:
L'administrateur système / opérateur doit réaliser les actions de provisioning initial suivantes :
1. Provisionner une instance (VPS ou serveur dédié) répondant aux prérequis HAFROSE :
   - OS : Ubuntu 24.04 LTS (x86_64)
   - Dimensionnement minimal : 2 vCPU, 4 GB RAM, 40 GB SSD, 1 IPv4 publique.
2. Exécuter le script de bootstrap & hardening officiel (Section ci-dessous).
3. Générer la paire de clés SSH Ed25519 dédiée et injecter la clé publique dans ~deploy/.ssh/authorized_keys.
4. Renseigner les 3 secrets dans GitHub Actions Settings (PROD_SERVER_IP, PROD_SERVER_USER, PROD_SSH_PRIVATE_KEY).
```

---

## Guide d'Exécution Externe pour l'Opérateur

### 1. Spécifications du Serveur Cible
* **Système :** Ubuntu 24.04 LTS
* **Ressources :** 2 vCPU, 4 GB RAM, 40 GB SSD (NVMe recommandé), 1 IPv4 statique publique.

### 2. Procédure de Hardening & Installation (Sur le serveur cible après création)

```bash
# 1. Mise à jour du système
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw fail2ban ca-certificates gnupg lsb-release unzip

# 2. Création de l'utilisateur de déploiement non-root
sudo adduser --disabled-password --gecos "" deploy
sudo usermod -aG sudo deploy

# 3. Installation officielle de Docker Engine & Docker Compose Plugin
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 4. Permissions Docker pour l'utilisateur deploy
sudo usermod -aG docker deploy

# 5. Configuration du Pare-feu (UFW)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP / ACME'
sudo ufw allow 443/tcp comment 'HTTPS'
sudo ufw --force enable
sudo ufw status verbose

# 6. Hardening SSH
# Générer la clé Ed25519 sur la machine d'administration :
# ssh-keygen -t ed25519 -C "hafrose-production-deploy" -f ~/.ssh/hafrose_deploy_key
# Copier la clé publique dans ~deploy/.ssh/authorized_keys
sudo mkdir -p /home/deploy/.ssh
# (Placer la clé publique dans /home/deploy/.ssh/authorized_keys)
sudo chmod 700 /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys
sudo chown -R deploy:deploy /home/deploy/.ssh

# Configurer /etc/ssh/sshd_config.d/hardening.conf
cat << 'EOF' | sudo tee /etc/ssh/sshd_config.d/hardening.conf
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
X11Forwarding no
MaxAuthTries 5
EOF

# Validation de la syntaxe avant redémarrage
sudo sshd -t && sudo systemctl restart ssh

# 7. Fail2ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable --now fail2ban

# 8. Préparation du répertoire de déploiement HAFROSE
sudo mkdir -p /var/www/hafrose
sudo chown -R deploy:deploy /var/www/hafrose

# 9. Clone initial par l'utilisateur deploy
su - deploy
git clone -b main https://github.com/votre-orga/hafrose.git /var/www/hafrose
cd /var/www/hafrose
cp .env.example .env
# Renseigner les vraies clés et secrets de production dans /var/www/hafrose/.env
```

---

## Prochaines Étapes Validées dans la Feuille de Route
1. **PHASE 5.1A :** Provisioning & Hardening du serveur Production réel (`SERVER PROVISIONING = BLOCKED` en attente de l'instance externe).
2. **PHASE 5.1B :** Configuration DNS Production (`A records`) + Certificats Publics Let's Encrypt SSL.
3. **PHASE 5.1C :** Premier déploiement Production + Validation CI/CD automatisée + Tests d'accès externes.
4. **PHASE 5.1D :** Test de restauration de sauvegarde (Disaster Recovery) + Monitoring + Certification finale Go-Live.
