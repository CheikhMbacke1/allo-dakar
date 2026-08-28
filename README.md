# Allo Dakar — Plateforme de transport interurbain

Mono-repo pour la plateforme connectant chauffeurs indépendants et clients pour des trajets interurbains au Sénégal.

**État actuel : Phase 1 (Fondations)** — backend NestJS + Prisma opérationnel avec authentification OTP, disponibilités, réservations et notifications basiques. Web et mobile arrivent en phases 3 et 4 (voir la roadmap du document d'architecture).

## Structure

```
apps/
  api/        # Backend NestJS + Prisma (cette phase)
  web/        # (à venir - Phase 3) Next.js
  mobile/     # (à venir - Phase 4) Expo / React Native
packages/
  shared/     # Types et enums partagés (statuts, rôles...)
```

## Prérequis

- Node.js 20+
- npm 10+
- Docker (pour Postgres local) — ou un compte [Neon](https://neon.tech) si vous préférez développer directement contre le cloud

## Installation

```bash
# 1. Installer toutes les dépendances (workspaces)
npm install

# 2. Démarrer Postgres en local
docker compose up -d

# 3. Configurer les variables d'environnement
cp apps/api/.env.example apps/api/.env
# Éditer apps/api/.env si besoin (DATABASE_URL, JWT_SECRET...)

# 4. Générer le client Prisma et appliquer les migrations
npm run prisma:generate
npm run prisma:migrate

# 5. Lancer l'API en mode développement
npm run api:dev
```

L'API est alors disponible sur `http://localhost:3001/api/v1`.

## Basculer sur Neon (production ou dev cloud)

1. Créer un projet sur [neon.tech](https://neon.tech)
2. Copier la "connection string" (pooled) depuis le dashboard Neon
3. La coller dans `apps/api/.env` à la place de `DATABASE_URL`
4. Relancer `npm run prisma:migrate` (ou `prisma:deploy` en production, sans prompt interactif)

## Tester rapidement le flux d'authentification OTP

```bash
# 1. Demander un code (en dev, le code est affiché dans les logs du serveur,
#    aucun SMS n'est réellement envoyé — voir sms.provider.ts)
curl -X POST http://localhost:3001/api/v1/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{"phone": "+221771234567"}'

# 2. Vérifier le code reçu dans les logs, puis :
curl -X POST http://localhost:3001/api/v1/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"phone": "+221771234567", "code": "1234", "fullName": "Amadou Diallo"}'
# -> retourne un accessToken JWT à utiliser en "Authorization: Bearer <token>"
```

## Scripts utiles (racine)

| Commande | Description |
|---|---|
| `npm run api:dev` | Démarre l'API en mode watch |
| `npm run api:build` | Build de production |
| `npm run api:test` | Tests unitaires |
| `npm run prisma:generate` | Régénère le client Prisma après modif du schéma |
| `npm run prisma:migrate` | Crée/applique une migration (dev) |
| `npm run lint` | Lint du backend |

## Déploiement

- **Backend** → [Render](https://render.com) : créer un "Web Service" pointant sur `apps/api`, build command `npm ci && npm run prisma:generate && npm run api:build`, start command `npm run start:prod --workspace=apps/api`. Ajouter les variables d'environnement (`DATABASE_URL` = connection string Neon, `JWT_SECRET`).
- **Base de données** → [Neon](https://neon.tech) (déjà configuré ci-dessus).
- **Frontend Web** (Phase 3) → [Vercel](https://vercel.com), pointant sur `apps/web`.
- **Code source** → GitHub, avec la CI (`.github/workflows/ci.yml`) qui vérifie lint/build/test sur chaque push vers `main`.

## Documentation d'architecture complète

Voir le document `analyse-architecture-allo-dakar.md` livré précédemment pour : le MVP détaillé, les parcours utilisateurs, le modèle de données complet, et la roadmap par phases.

## Prochaine étape (Phase 2)

Enrichir le cœur métier : messagerie liée aux réservations (déjà modélisée en base, endpoints à écrire), évaluations post-trajet, et affinage des règles de disponibilité (ex. empêcher un chauffeur de publier deux trajets qui se chevauchent).
