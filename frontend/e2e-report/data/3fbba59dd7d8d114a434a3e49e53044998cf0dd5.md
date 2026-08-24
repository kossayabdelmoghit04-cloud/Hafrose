# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth_customer_journey.spec.ts >> Customer Authentication and Account Journey >> TEST 4 & 6: Logged-in user can access /account, /account/orders, and click Mon compte
- Location: e2e\auth_customer_journey.spec.ts:75:3

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: page.goto: Test timeout of 45000ms exceeded.
Call log:
  - navigating to "http://localhost:3000/", waiting until "networkidle"

```

# Page snapshot

```yaml
- generic [ref=f2e3]:
  - link "Passer au contenu principal" [ref=f2e4] [cursor=pointer]:
    - /url: "#main-content"
  - generic [ref=f2e6]:
    - button "Message précédent" [ref=f2e7] [cursor=pointer]
    - paragraph [ref=f2e10]: 🚚 Livraison Gratuite dès 150 MAD d'achat — Partout au Maroc
    - button "Message suivant" [ref=f2e11] [cursor=pointer]
  - banner [ref=f2e14]:
    - generic [ref=f2e16]:
      - link "HAFROSE — Retour à l'accueil" [ref=f2e17] [cursor=pointer]:
        - /url: /
        - text: HAFROSE
      - navigation "Navigation principale" [ref=f2e18]:
        - link "Nouveautés" [ref=f2e20] [cursor=pointer]:
          - /url: /#nouveautes
        - link "Sacs" [ref=f2e22] [cursor=pointer]:
          - /url: /shop?category=sacs
        - link "Bijoux" [ref=f2e24] [cursor=pointer]:
          - /url: /shop?category=bijoux
        - link "Montres" [ref=f2e26] [cursor=pointer]:
          - /url: /shop?category=montres
        - link "Lunettes" [ref=f2e28] [cursor=pointer]:
          - /url: /shop?category=lunettes
        - link "Ceintures" [ref=f2e30] [cursor=pointer]:
          - /url: /shop?category=ceintures
        - link "Portefeuilles" [ref=f2e32] [cursor=pointer]:
          - /url: /shop?category=portefeuilles
        - link "Soldes" [ref=f2e34] [cursor=pointer]:
          - /url: /shop?on_sale=true
      - generic [ref=f2e35]:
        - button "Rechercher" [ref=f2e36] [cursor=pointer]
        - link "Mon compte" [ref=f2e40] [cursor=pointer]:
          - /url: /account
        - link "Liste de souhaits" [ref=f2e45] [cursor=pointer]:
          - /url: /wishlist
        - button "Panier" [ref=f2e49] [cursor=pointer]
  - main "Contenu principal" [ref=f2e53]:
    - region "Collection HAFROSE" [ref=f2e54]:
      - img "Silhouette élégante HAFROSE — Collection Printemps" [ref=f2e58]
      - generic [ref=f2e61]:
        - paragraph [ref=f2e62]: Collection Printemps — Été 2025
        - heading "L'Art de la Féminité" [level=1] [ref=f2e63]:
          - text: L'Art de la
          - generic [ref=f2e64]: Féminité
        - paragraph [ref=f2e65]: Découvrez une collection pensée pour la femme moderne — alliant élégance intemporelle et féminité affirmée.
        - generic [ref=f2e66]:
          - link [ref=f2e67] [cursor=pointer]:
            - /url: /shop
            - button "Découvrir la Collection" [ref=f2e68]
          - link "Voir tout" [ref=f2e70] [cursor=pointer]:
            - /url: /shop
      - generic [ref=f2e72]: DÉFILER
    - generic [ref=f2e77]:
      - generic [ref=f2e86]:
        - heading "Livraison Rapide" [level=4] [ref=f2e87]
        - paragraph [ref=f2e88]: Livraison express en 24-48h partout au Maroc. Gratuite dès 150 MAD.
      - generic [ref=f2e94]:
        - heading "Paiement Sécurisé" [level=4] [ref=f2e95]
        - paragraph [ref=f2e96]: Transactions 100% sécurisées. Nous acceptons carte, virement et PayPal.
      - generic [ref=f2e102]:
        - heading "Qualité Premium" [level=4] [ref=f2e103]
        - paragraph [ref=f2e104]: Chaque pièce est soigneusement sélectionnée pour sa qualité et son raffinement.
      - generic [ref=f2e110]:
        - heading "Support Dédié" [level=4] [ref=f2e111]
        - paragraph [ref=f2e112]: Notre équipe est disponible 7j/7 pour vous accompagner dans vos achats.
    - generic [ref=f2e114]:
      - generic [ref=f2e115]:
        - paragraph [ref=f2e116]: Nos Univers
        - heading "Explorez nos Catégories" [level=2] [ref=f2e117]
        - paragraph [ref=f2e118]: Découvrez chaque univers soigneusement pensé pour exprimer votre personnalité.
      - generic [ref=f2e119]:
        - button "Découvrir la catégorie Sacs" [ref=f2e120] [cursor=pointer]:
          - img "Sacs" [ref=f2e123]
          - generic [ref=f2e125]:
            - generic [ref=f2e126]: 2 créations
            - heading "Sacs" [level=3] [ref=f2e128]
        - button "Découvrir la catégorie Bijoux" [ref=f2e131] [cursor=pointer]:
          - img "Bijoux" [ref=f2e134]
          - generic [ref=f2e136]:
            - generic [ref=f2e137]: 2 créations
            - heading "Bijoux" [level=3] [ref=f2e139]
        - button "Découvrir la catégorie Montres" [ref=f2e142] [cursor=pointer]:
          - img "Montres" [ref=f2e145]
          - generic [ref=f2e147]:
            - generic [ref=f2e148]: 2 créations
            - heading "Montres" [level=3] [ref=f2e150]
        - button "Découvrir la catégorie Lunettes" [ref=f2e153] [cursor=pointer]:
          - img "Lunettes" [ref=f2e156]
          - generic [ref=f2e158]:
            - generic [ref=f2e159]: Découvrir la collection
            - heading "Lunettes" [level=3] [ref=f2e161]
        - button "Découvrir la catégorie Ceintures" [ref=f2e164] [cursor=pointer]:
          - img "Ceintures" [ref=f2e167]
          - generic [ref=f2e169]:
            - generic [ref=f2e170]: Découvrir la collection
            - heading "Ceintures" [level=3] [ref=f2e172]
        - button "Découvrir la catégorie Portefeuilles" [ref=f2e175] [cursor=pointer]:
          - img "Portefeuilles" [ref=f2e178]
          - generic [ref=f2e180]:
            - generic [ref=f2e181]: 1 création
            - heading "Portefeuilles" [level=3] [ref=f2e183]
    - generic [ref=f2e187]:
      - generic [ref=f2e188]:
        - paragraph [ref=f2e189]: Nouveautés
        - heading "Dernières Créations" [level=2] [ref=f2e190]
        - paragraph [ref=f2e191]: Les dernières pièces arrivées chez HAFROSE — alliant modernité, matières nobles et finitions d'exception.
      - generic [ref=f2e192]:
        - generic [ref=f2e193] [cursor=pointer]:
          - generic [ref=f2e194]:
            - img "Porte-monnaie Compact en Cuir Taupe" [ref=f2e197]
            - generic [ref=f2e198]: Nouveau
            - button "Ajouter aux favoris" [ref=f2e201]
            - button "Ajout Rapide" [ref=f2e205]
          - generic [ref=f2e211]:
            - generic [ref=f2e212]:
              - generic [ref=f2e213]: Portefeuilles
              - heading "Porte-monnaie Compact en Cuir Taupe" [level=3] [ref=f2e214]
            - 'generic "Prix: 199,00 MAD" [ref=f2e215]':
              - generic [ref=f2e216]: 199,00 MAD
              - 'generic "Ancien prix: 299,00 MAD" [ref=f2e217]': 299,00 MAD
        - generic [ref=f2e218] [cursor=pointer]:
          - generic [ref=f2e219]:
            - img "Montre Élégante Cadran Nacre & Strass Dorée" [ref=f2e222]
            - generic [ref=f2e223]: Nouveau
            - button "Ajouter aux favoris" [ref=f2e226]
            - button "Ajout Rapide" [ref=f2e230]
          - generic [ref=f2e236]:
            - generic [ref=f2e237]:
              - generic [ref=f2e238]: Montres
              - heading "Montre Élégante Cadran Nacre & Strass Dorée" [level=3] [ref=f2e239]
            - 'generic "Prix: 489,00 MAD" [ref=f2e240]':
              - generic [ref=f2e241]: 489,00 MAD
              - 'generic "Ancien prix: 650,00 MAD" [ref=f2e242]': 650,00 MAD
        - generic [ref=f2e243] [cursor=pointer]:
          - generic [ref=f2e244]:
            - img "Ballerines Mary Jane en Daim Marron" [ref=f2e247]
            - generic [ref=f2e248]: Nouveau
            - button "Ajouter aux favoris" [ref=f2e251]
            - button "Ajout Rapide" [ref=f2e255]
          - generic [ref=f2e261]:
            - generic [ref=f2e262]:
              - generic [ref=f2e263]: Montres
              - heading "Ballerines Mary Jane en Daim Marron" [level=3] [ref=f2e264]
            - 'generic "Prix: 299,00 MAD" [ref=f2e265]':
              - generic [ref=f2e266]: 299,00 MAD
              - 'generic "Ancien prix: 399,00 MAD" [ref=f2e267]': 399,00 MAD
        - generic [ref=f2e268] [cursor=pointer]:
          - generic [ref=f2e269]:
            - img "Sac Cabas Grand Format Marron Chocolat" [ref=f2e272]
            - generic [ref=f2e273]: Nouveau
            - button "Ajouter aux favoris" [ref=f2e276]
            - button "Ajout Rapide" [ref=f2e280]
          - generic [ref=f2e286]:
            - generic [ref=f2e287]:
              - generic [ref=f2e288]: Sacs
              - heading "Sac Cabas Grand Format Marron Chocolat" [level=3] [ref=f2e289]
            - 'generic "Prix: 379,00 MAD" [ref=f2e290]':
              - generic [ref=f2e291]: 379,00 MAD
              - 'generic "Ancien prix: 499,00 MAD" [ref=f2e292]': 499,00 MAD
        - generic [ref=f2e293] [cursor=pointer]:
          - generic [ref=f2e294]:
            - img "Sac à Main Structuré Anse Anneau Doré" [ref=f2e297]
            - generic [ref=f2e298]: Nouveau
            - button "Ajouter aux favoris" [ref=f2e301]
            - button "Ajout Rapide" [ref=f2e305]
          - generic [ref=f2e311]:
            - generic [ref=f2e312]:
              - generic [ref=f2e313]: Sacs
              - heading "Sac à Main Structuré Anse Anneau Doré" [level=3] [ref=f2e314]
            - 'generic "Prix: 349,00 MAD" [ref=f2e315]':
              - generic [ref=f2e316]: 349,00 MAD
              - 'generic "Ancien prix: 450,00 MAD" [ref=f2e317]': 450,00 MAD
        - generic [ref=f2e318] [cursor=pointer]:
          - generic [ref=f2e319]:
            - img "Jonc Nœud d'Amour Doré" [ref=f2e322]
            - generic [ref=f2e323]: Nouveau
            - button "Ajouter aux favoris" [ref=f2e326]
            - button "Ajout Rapide" [ref=f2e330]
          - generic [ref=f2e336]:
            - generic [ref=f2e337]:
              - generic [ref=f2e338]: Bijoux
              - heading "Jonc Nœud d'Amour Doré" [level=3] [ref=f2e339]
            - 'generic "Prix: 179,00 MAD" [ref=f2e340]':
              - generic [ref=f2e341]: 179,00 MAD
              - 'generic "Ancien prix: 249,00 MAD" [ref=f2e342]': 249,00 MAD
        - generic [ref=f2e343] [cursor=pointer]:
          - generic [ref=f2e344]:
            - img "Bracelet Torsade Doré Légance" [ref=f2e347]
            - generic [ref=f2e348]: Nouveau
            - button "Ajouter aux favoris" [ref=f2e351]
            - button "Ajout Rapide" [ref=f2e355]
          - generic [ref=f2e361]:
            - generic [ref=f2e362]:
              - generic [ref=f2e363]: Bijoux
              - heading "Bracelet Torsade Doré Légance" [level=3] [ref=f2e364]
            - 'generic "Prix: 149,00 MAD" [ref=f2e365]':
              - generic [ref=f2e366]: 149,00 MAD
              - 'generic "Ancien prix: 199,00 MAD" [ref=f2e367]': 199,00 MAD
      - button "Découvrir toutes les Nouveautés" [ref=f2e369] [cursor=pointer]
    - generic [ref=f2e373]:
      - paragraph [ref=f2e374]: Univers Sacs
      - heading "Sacs" [level=2] [ref=f2e375]
      - paragraph [ref=f2e376]: Explorez notre sélection exclusive de sacs façonnées avec passion et matières nobles.
    - generic [ref=f2e404]:
      - paragraph [ref=f2e405]: Univers Bijoux
      - heading "Bijoux" [level=2] [ref=f2e406]
      - paragraph [ref=f2e407]: Explorez notre sélection exclusive de bijoux façonnées avec passion et matières nobles.
    - generic [ref=f2e435]:
      - paragraph [ref=f2e436]: Univers Montres
      - heading "Montres" [level=2] [ref=f2e437]
      - paragraph [ref=f2e438]: Explorez notre sélection exclusive de montres façonnées avec passion et matières nobles.
    - generic [ref=f2e466]:
      - paragraph [ref=f2e467]: Univers Lunettes
      - heading "Lunettes" [level=2] [ref=f2e468]
      - paragraph [ref=f2e469]: Explorez notre sélection exclusive de lunettes façonnées avec passion et matières nobles.
    - generic [ref=f2e497]:
      - paragraph [ref=f2e498]: Univers Ceintures
      - heading "Ceintures" [level=2] [ref=f2e499]
      - paragraph [ref=f2e500]: Explorez notre sélection exclusive de ceintures façonnées avec passion et matières nobles.
    - generic [ref=f2e528]:
      - paragraph [ref=f2e529]: Univers Portefeuilles
      - heading "Portefeuilles" [level=2] [ref=f2e530]
      - paragraph [ref=f2e531]: Explorez notre sélection exclusive de portefeuilles façonnées avec passion et matières nobles.
    - generic [ref=f2e558]:
      - generic [ref=f2e559]:
        - generic [ref=f2e560]:
          - paragraph [ref=f2e561]: Sélection du Moment
          - heading "Meilleures Ventes" [level=2] [ref=f2e562]
        - generic [ref=f2e563]:
          - button "Articles précédents" [disabled] [ref=f2e564]
          - button "Articles suivants" [ref=f2e567] [cursor=pointer]
      - generic [ref=f2e570]:
        - generic [ref=f2e571] [cursor=pointer]:
          - generic [ref=f2e572]:
            - img "Ballerines Mary Jane en Daim Marron" [ref=f2e575]
            - generic [ref=f2e576]: Best-seller
            - button "Ajouter aux favoris" [ref=f2e579]
            - button "Ajout Rapide" [ref=f2e583]
          - generic [ref=f2e589]:
            - generic [ref=f2e590]:
              - generic [ref=f2e591]: Montres
              - heading "Ballerines Mary Jane en Daim Marron" [level=3] [ref=f2e592]
            - 'generic "Prix: 299,00 MAD" [ref=f2e593]':
              - generic [ref=f2e594]: 299,00 MAD
              - 'generic "Ancien prix: 399,00 MAD" [ref=f2e595]': 399,00 MAD
        - generic [ref=f2e596] [cursor=pointer]:
          - generic [ref=f2e597]:
            - img "Porte-monnaie Compact en Cuir Taupe" [ref=f2e600]
            - button "Ajouter aux favoris" [ref=f2e602]
            - button "Ajout Rapide" [ref=f2e606]
          - generic [ref=f2e612]:
            - generic [ref=f2e613]:
              - generic [ref=f2e614]: Portefeuilles
              - heading "Porte-monnaie Compact en Cuir Taupe" [level=3] [ref=f2e615]
            - 'generic "Prix: 199,00 MAD" [ref=f2e616]':
              - generic [ref=f2e617]: 199,00 MAD
              - 'generic "Ancien prix: 299,00 MAD" [ref=f2e618]': 299,00 MAD
        - generic [ref=f2e619] [cursor=pointer]:
          - generic [ref=f2e620]:
            - img "Montre Élégante Cadran Nacre & Strass Dorée" [ref=f2e623]
            - button "Ajouter aux favoris" [ref=f2e625]
            - button "Ajout Rapide" [ref=f2e629]
          - generic [ref=f2e635]:
            - generic [ref=f2e636]:
              - generic [ref=f2e637]: Montres
              - heading "Montre Élégante Cadran Nacre & Strass Dorée" [level=3] [ref=f2e638]
            - 'generic "Prix: 489,00 MAD" [ref=f2e639]':
              - generic [ref=f2e640]: 489,00 MAD
              - 'generic "Ancien prix: 650,00 MAD" [ref=f2e641]': 650,00 MAD
        - generic [ref=f2e642] [cursor=pointer]:
          - generic [ref=f2e643]:
            - img "Sac Cabas Grand Format Marron Chocolat" [ref=f2e646]
            - button "Ajouter aux favoris" [ref=f2e648]
            - button "Ajout Rapide" [ref=f2e652]
          - generic [ref=f2e658]:
            - generic [ref=f2e659]:
              - generic [ref=f2e660]: Sacs
              - heading "Sac Cabas Grand Format Marron Chocolat" [level=3] [ref=f2e661]
            - 'generic "Prix: 379,00 MAD" [ref=f2e662]':
              - generic [ref=f2e663]: 379,00 MAD
              - 'generic "Ancien prix: 499,00 MAD" [ref=f2e664]': 499,00 MAD
      - button "Voir toutes les Meilleures Ventes" [ref=f2e666] [cursor=pointer]
    - generic [ref=f2e670]:
      - generic [ref=f2e671]:
        - generic [ref=f2e672]: Édition Limitée
        - heading "La Collection Symphonie Rose" [level=2] [ref=f2e673]
        - paragraph [ref=f2e674]: Inspirée par la douceur de l'aube et l'élégance des lignes parisiennes, la collection Symphonie Rose célèbre une féminité affirmée, moderne et intemporelle.
        - paragraph [ref=f2e675]: « Chaque couture est pensée comme une œuvre d'art, où le confort rencontre l'extrême raffinement. »
        - button "Explorer la Collection" [ref=f2e677] [cursor=pointer]
      - generic [ref=f2e679]:
        - img "Maison HAFROSE — Collection Éditoriale" [ref=f2e683]
        - generic [ref=f2e684]:
          - generic [ref=f2e685]: Savoir-Faire Artisanal
          - paragraph [ref=f2e686]: Soie naturelle & finitions cousues main dans nos ateliers.
    - generic [ref=f2e693]:
      - generic [ref=f2e694]: Jusqu'au 20 Août
      - generic [ref=f2e695]: Offre Exclusive Membres
      - heading "Ventes Privées d'Été" [level=2] [ref=f2e696]
      - paragraph [ref=f2e697]: Bénéficiez de jusqu'à -30% sur une sélection exclusive de pièces de haute maroquinerie, bijoux et accessoires d'exception.
      - button "Profiter de l'Offre Privée" [ref=f2e699] [cursor=pointer]
    - generic [ref=f2e703]:
      - generic [ref=f2e708]:
        - paragraph [ref=f2e709]: Le Cercle HAFROSE
        - heading "Inscrivez-vous à la Newsletter" [level=2] [ref=f2e710]
        - paragraph [ref=f2e711]: Recevez en avant-première nos nouvelles collections, nos invitations aux ventes privées et nos conseils de style exclusifs.
      - generic [ref=f2e712]:
        - textbox "Adresse email pour la newsletter" [ref=f2e716]:
          - /placeholder: Votre adresse email...
        - button "S'inscrire" [ref=f2e717] [cursor=pointer]
      - paragraph [ref=f2e719]: En vous inscrivant, vous acceptez notre politique de confidentialité. Désinscription à tout moment.
  - contentinfo "Pied de page" [ref=f2e720]:
    - generic [ref=f2e721]:
      - generic [ref=f2e722]:
        - generic [ref=f2e723]:
          - link "HAFROSE" [ref=f2e724] [cursor=pointer]:
            - /url: /
          - paragraph [ref=f2e725]: Maison de haute couture féminine incarnant l'élégance parisienne, le raffinement des matières et la modernité des silhouettes.
          - generic [ref=f2e726]:
            - link "Suivez HAFROSE sur Instagram" [ref=f2e727] [cursor=pointer]:
              - /url: https://instagram.com
            - link "Suivez HAFROSE sur Facebook" [ref=f2e731] [cursor=pointer]:
              - /url: https://facebook.com
            - link "Suivez HAFROSE sur Twitter" [ref=f2e734] [cursor=pointer]:
              - /url: https://twitter.com
        - generic [ref=f2e737]:
          - heading "Boutique" [level=4] [ref=f2e738]
          - list [ref=f2e739]:
            - listitem [ref=f2e740]:
              - link "Nouveautés" [ref=f2e741] [cursor=pointer]:
                - /url: /#nouveautes
            - listitem [ref=f2e742]:
              - link "Sacs" [ref=f2e743] [cursor=pointer]:
                - /url: /shop?category=sacs
            - listitem [ref=f2e744]:
              - link "Bijoux" [ref=f2e745] [cursor=pointer]:
                - /url: /shop?category=bijoux
            - listitem [ref=f2e746]:
              - link "Montres" [ref=f2e747] [cursor=pointer]:
                - /url: /shop?category=montres
            - listitem [ref=f2e748]:
              - link "Lunettes" [ref=f2e749] [cursor=pointer]:
                - /url: /shop?category=lunettes
            - listitem [ref=f2e750]:
              - link "Ceintures" [ref=f2e751] [cursor=pointer]:
                - /url: /shop?category=ceintures
            - listitem [ref=f2e752]:
              - link "Portefeuilles" [ref=f2e753] [cursor=pointer]:
                - /url: /shop?category=portefeuilles
            - listitem [ref=f2e754]:
              - link "Soldes & Promotions" [ref=f2e755] [cursor=pointer]:
                - /url: /shop?on_sale=true
        - generic [ref=f2e756]:
          - heading "La Maison" [level=4] [ref=f2e757]
          - list [ref=f2e758]:
            - listitem [ref=f2e759]:
              - link "L'Histoire HAFROSE" [ref=f2e760] [cursor=pointer]:
                - /url: "#"
            - listitem [ref=f2e761]:
              - link "Savoir-Faire Artisanal" [ref=f2e762] [cursor=pointer]:
                - /url: "#"
            - listitem [ref=f2e763]:
              - link "Engagements Éco-responsables" [ref=f2e764] [cursor=pointer]:
                - /url: "#"
            - listitem [ref=f2e765]:
              - link "Nos Boutiques" [ref=f2e766] [cursor=pointer]:
                - /url: "#"
            - listitem [ref=f2e767]:
              - link "Presse & Médias" [ref=f2e768] [cursor=pointer]:
                - /url: "#"
        - generic [ref=f2e769]:
          - heading "Service Client" [level=4] [ref=f2e770]
          - list [ref=f2e771]:
            - listitem [ref=f2e772]:
              - link "Contactez-nous" [ref=f2e773] [cursor=pointer]:
                - /url: /contact
            - listitem [ref=f2e774]:
              - link "Livraisons & Retours" [ref=f2e775] [cursor=pointer]:
                - /url: "#"
            - listitem [ref=f2e776]:
              - link "Guide des Tailles" [ref=f2e777] [cursor=pointer]:
                - /url: "#"
            - listitem [ref=f2e778]:
              - link "Suivre ma Commande" [ref=f2e779] [cursor=pointer]:
                - /url: /orders
            - listitem [ref=f2e780]:
              - link "FAQ" [ref=f2e781] [cursor=pointer]:
                - /url: "#"
      - separator [ref=f2e782]
      - generic [ref=f2e783]:
        - paragraph [ref=f2e784]: © 2026 HAFROSE Paris. Tous droits réservés.
        - generic [ref=f2e785]:
          - link "Mentions Légales" [ref=f2e786] [cursor=pointer]:
            - /url: /legal
          - link "Confidentialité" [ref=f2e787] [cursor=pointer]:
            - /url: /privacy
          - link "CGV" [ref=f2e788] [cursor=pointer]:
            - /url: /cgv
        - generic [ref=f2e789]:
          - generic [ref=f2e790]: Fait avec
          - generic [ref=f2e793]: à Paris
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Customer Authentication and Account Journey', () => {
  4   | 
  5   |   test('TEST 1: Direct access to /login when online displays LoginPage without offline error', async ({ page }) => {
  6   |     await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  7   |     
  8   |     // Check heading
  9   |     const heading = page.locator('h1');
  10  |     await expect(heading).toHaveText('Connexion Client');
  11  |     
  12  |     // Check form elements
  13  |     await expect(page.locator('input[type="email"]')).toBeVisible();
  14  |     await expect(page.locator('input[type="password"]')).toBeVisible();
  15  |     await expect(page.locator('button[type="submit"]')).toContainText('Se Connecter');
  16  | 
  17  |     // Confirm no offline screen
  18  |     const offlineIcon = page.locator('svg.lucide-wifi-off');
  19  |     await expect(offlineIcon).toHaveCount(0);
  20  |     const bodyText = await page.innerText('body');
  21  |     expect(bodyText).not.toContain('Hors Connexion');
  22  |     expect(bodyText).not.toContain("Vous n'êtes actuellement pas connecté à Internet");
  23  |   });
  24  | 
  25  |   test('TEST 2: Visitor clicks Mon Compte icon in Header -> redirects to /login', async ({ page }) => {
  26  |     await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  27  |     
  28  |     // Click on User icon
  29  |     const userLink = page.locator('a[aria-label="Mon compte"], a[href="/account"]').first();
  30  |     await userLink.click();
  31  |     
  32  |     // Expect URL to become /login
  33  |     await expect(page).toHaveURL(/.*\/login/);
  34  |     await expect(page.locator('h1')).toHaveText('Connexion Client');
  35  |   });
  36  | 
  37  |   test('TEST 5: Invalid login credentials show auth error alert (NOT offline screen)', async ({ page }) => {
  38  |     await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  39  |     
  40  |     await page.fill('input[type="email"]', 'wronguser@example.com');
  41  |     await page.fill('input[type="password"]', 'WrongPassword999!');
  42  |     await page.click('button[type="submit"]');
  43  |     
  44  |     // An error alert should appear
  45  |     const alert = page.locator('[role="alert"]');
  46  |     await expect(alert).toBeVisible();
  47  |     const alertText = await alert.innerText();
  48  |     expect(alertText).toMatch(/Identifiants incorrects|Erreur de connexion|Veuillez/i);
  49  | 
  50  |     // Confirm no offline state
  51  |     expect(alertText).not.toContain('Hors Connexion');
  52  |     expect(alertText).not.toContain("Vous n'êtes actuellement pas connecté à Internet");
  53  |   });
  54  | 
  55  |   test('TEST 3: Valid customer login redirects to /account', async ({ page }) => {
  56  |     await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  57  |     
  58  |     await page.fill('input[type="email"]', 'client@hafrose.com');
  59  |     await page.fill('input[type="password"]', 'Secret123!');
  60  |     await page.click('button[type="submit"]');
  61  |     
  62  |     // Expect redirection to /account
  63  |     await expect(page).toHaveURL(/.*\/account/);
  64  |     
  65  |     // Verify dashboard welcome message
  66  |     const welcome = page.locator('h1');
  67  |     await expect(welcome).toContainText('Ravi de vous revoir');
  68  |     await expect(welcome).toContainText('Sophie');
  69  | 
  70  |     // Confirm no offline screen
  71  |     const offlineIcon = page.locator('svg.lucide-wifi-off');
  72  |     await expect(offlineIcon).toHaveCount(0);
  73  |   });
  74  | 
  75  |   test('TEST 4 & 6: Logged-in user can access /account, /account/orders, and click Mon compte', async ({ page }) => {
  76  |     // 1. Log in
  77  |     await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  78  |     await page.fill('input[type="email"]', 'client@hafrose.com');
  79  |     await page.fill('input[type="password"]', 'Secret123!');
  80  |     await page.click('button[type="submit"]');
  81  |     await expect(page).toHaveURL(/.*\/account/);
  82  | 
  83  |     // 2. Navigate to orders page
  84  |     await page.goto('http://localhost:3000/account/orders', { waitUntil: 'networkidle' });
  85  |     const ordersHeading = page.locator('h1');
  86  |     await expect(ordersHeading).toHaveText('Mes Commandes');
  87  | 
  88  |     // 3. Confirm no offline screen on orders page
  89  |     const offlineIcon = page.locator('svg.lucide-wifi-off');
  90  |     await expect(offlineIcon).toHaveCount(0);
  91  | 
  92  |     // 4. Return to home and click Mon Compte
> 93  |     await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
      |                ^ Error: page.goto: Test timeout of 45000ms exceeded.
  94  |     const userLink = page.locator('a[aria-label="Mon compte"], a[href="/account"]').first();
  95  |     await userLink.click();
  96  |     
  97  |     // Since user is logged in, it should go directly to /account, NOT /login
  98  |     await expect(page).toHaveURL(/.*\/account/);
  99  |     await expect(page.locator('h1')).toContainText('Ravi de vous revoir');
  100 |   });
  101 | 
  102 |   test('TEST 7: Register a new customer account', async ({ page }) => {
  103 |     const uniqueEmail = `test_${Date.now()}@hafrose.com`;
  104 |     await page.goto('http://localhost:3000/register', { waitUntil: 'networkidle' });
  105 |     
  106 |     // Fill register form
  107 |     await page.fill('input[name="first_name"], input[placeholder="Prénom"], input[type="text"] >> nth=0', 'Claire');
  108 |     await page.fill('input[name="last_name"], input[placeholder="Nom"], input[type="text"] >> nth=1', 'Dubois');
  109 |     await page.fill('input[type="email"]', uniqueEmail);
  110 |     await page.fill('input[type="password"] >> nth=0', 'SecretPass123!');
  111 |     await page.fill('input[type="password"] >> nth=1', 'SecretPass123!');
  112 |     
  113 |     // Check CGV if present
  114 |     const terms = page.locator('input[type="checkbox"]');
  115 |     if (await terms.count() > 0) {
  116 |       await terms.first().check();
  117 |     }
  118 |     
  119 |     await page.click('button[type="submit"]');
  120 |     
  121 |     // Expect redirect to /account or success
  122 |     await expect(page).toHaveURL(/.*\/account/);
  123 |   });
  124 | 
  125 | });
  126 | 
```