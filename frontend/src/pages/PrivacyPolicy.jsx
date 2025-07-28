import React from 'react'
import Title from '@/components/Title'

const PrivacyPolicy = () => (
  <div className="bg-gray-50 py-12">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-8">
        <Title text1="Politique de" text2="Confidentialité" />
        <p className="mt-2 text-gray-600 italic">résumée et web-friendly</p>
      </div>

      {/* Content */}
      <ul className="max-w-3xl mx-auto space-y-6 text-gray-700">
        <li>
          <strong>Données collectées</strong> : Compte, commande, newsletter, navigation.
        </li>
        <li>
          <strong>Utilisation</strong> : Traitement des commandes, amélioration du service, marketing si accord.
        </li>
        <li>
          <strong>Partage</strong> : Uniquement avec prestataires de confiance (paiement, livraison).
        </li>
        <li>
          <strong>Sécurité</strong> : Serveurs sécurisés, SSL.
        </li>
        <li>
          <strong>Vos droits</strong> : Accès, rectification, suppression, opposition. Contact : [email].
        </li>
      </ul>

      <hr className="my-8 border-gray-300" />

      <div className="max-w-3xl mx-auto text-gray-700 space-y-4">
        <p>
          <strong>Cookies</strong> : Pour améliorer votre expérience (modifiable via le navigateur).
        </p>
      </div>
    </div>
  </div>
)

export default PrivacyPolicy
