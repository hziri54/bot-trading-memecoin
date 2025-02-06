# Trading Bot Memecoin Solana - Telegram

Ce projet est un **bot de trading** permettant d'acheter et vendre des memecoins Solana directement via Telegram. Il offre plusieurs fonctionnalités, telles que la gestion des positions, le DCA (Dollar Cost Averaging), et l'intégration avec des API externes pour obtenir des prix en temps réel et effectuer des transactions.

## Fonctionnalités

- **Gestion des positions** :
  - Acheter et vendre des memecoins Solana au prix du marché.
  - Configurer un stop-loss et un take-profit pour sécuriser les investissements.
  - Voir la position exacte des investissements (quantité, prix d'achat, profit/perte).
  
- **Dollar Cost Averaging (DCA)** :
  - Acheter automatiquement des memecoins à des intervalles réguliers pour lisser les investissements.
  - Configurer un montant total à investir via DCA.

- **Portefeuille et gestion** :
  - Créer un portefeuille directement depuis le bot avec une clé privée exportable.
  - Voir un récapitulatif du portefeuille (balance, actifs détenus, valeur totale).

- **Graphiques et données** :
  - Afficher des graphiques en temps réel pour les memecoins.
  - Consulter les données de base des memecoins (prix, market cap).

- **Notifications et sécurité** :
  - Recevoir une notification après chaque transaction (achat, vente, DCA).
  - Afficher temporairement les clés privées, puis les supprimer après 5 minutes pour des raisons de sécurité.

## Prérequis

Avant de démarrer ce projet, vous devez avoir les outils suivants installés sur votre machine :

- [Node.js](https://nodejs.org/) (version 14.x ou supérieure)
- [Git](https://git-scm.com/) (facultatif mais recommandé)

## Installation

1. Clonez ce dépôt sur votre machine locale :
   ```bash
   git clone https://github.com/votre-utilisateur/trading-bot-solana.git
   cd trading-bot-solana
