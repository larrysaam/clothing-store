import React from 'react';
import { assets } from '@/assets/assets';

const About = () => (
  <div className="bg-gray-50 py-12">
    <div className="container mx-auto px-4 space-y-12">
      {/* Header with Logo and Title */}
      <div className="text-center space-y-4">
        <img src={assets.KMlogo} alt="KM Sportwear Logo" className="mx-auto w-32 h-auto" />
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800">
          Le rêve commence ici.
        </h1>
      </div>

      {/* Intro paragraph */}
      <section className="max-w-3xl mx-auto text-gray-700 leading-relaxed space-y-4">
        <p>
          KM Sportwear incarne l’élégance, le mouvement et la performance. Bien plus qu’une marque de vêtements, c’est une vision du style qui unit la rigueur du sport et l’exigence du luxe. Chaque collection raconte une ambition : celle de faire du vêtement un prolongement du corps, du charisme et de la volonté.
        </p>
      </section>

      <hr className="border-gray-300" />

      {/* À propos section */}
      <section className="max-w-3xl mx-auto space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">À propos de KM Sportwear</h2>
        <div className="text-gray-700 leading-relaxed space-y-4">
          <p>
            Bienvenue chez <strong>KM Sportwear</strong>, une maison de sport et de lifestyle où l’élégance rencontre l’énergie, et où chaque pièce est conçue pour habiller les corps actifs avec sobriété, style et exigence. Pensée pour celles et ceux qui se distinguent autant dans la rue que dans l’effort, KM propose une gamme de vêtements premium aux coupes épurées, aux tissus performants, et au design minimaliste.
          </p>
          <p>
            Notre volonté est de créer un pont entre les mondes : entre le sport et le quotidien, entre les origines et l’avenir, entre le confort et l’allure. Chez KM, nous croyons que la mode peut être fonctionnelle sans jamais perdre en esthétique, et que l’élégance se joue dans le détail, la coupe, et l’intention.
          </p>
          <p>
            Inspirée par le dynamisme africain et une vision mondiale du style, KM Sportwear conçoit des vêtements pensés pour l’effort comme pour la représentation, pour les performances physiques comme pour les engagements de style.
          </p>
        </div>
      </section>

      <hr className="border-gray-300" />

      {/* Mission section */}
      <section className="max-w-3xl mx-auto space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">Notre mission</h2>
        <div className="text-gray-700 leading-relaxed space-y-4">
          <p>
            Notre mission est simple et forte : concevoir des vêtements de sport et de lifestyle haut de gamme, accessibles, durables, et porteurs de sens. Nous voulons permettre à chacun de se sentir fort, stylé, confiant, que ce soit dans l’arène du sport, dans l’intimité d’une salle de sport ou dans les rues d’une grande ville.
          </p>
          <p>
            KM Sportwear défend une production raisonnée, des matières responsables, et une distribution maîtrisée. Derrière chaque vêtement, il y a une histoire : celle d’un rêve partagé, celle d’un design pensé pour durer, celle d’un engagement éthique et esthétique.
          </p>
        </div>
      </section>

      <hr className="border-gray-300" />

      {/* Why choose section */}
      <section className="max-w-3xl mx-auto space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">Pourquoi choisir KM Sportwear</h2>
        <div className="text-gray-700 leading-relaxed space-y-4">
          <p>
            Chaque pièce KM est conçue avec une exigence absolue. Les tissus que nous utilisons sont sélectionnés pour leur qualité, leur respirabilité, leur résistance et leur texture. Les finitions sont soignées, les coupes étudiées, les couleurs réfléchies. Rien n’est laissé au hasard.
          </p>
          <p>
            Nous offrons une expérience d’achat fluide et intuitive. Notre site vous permet de naviguer facilement, de commander en toute sécurité, et de recevoir vos pièces rapidement partout en France et en Europe.
          </p>
          <p>
            Mais au-delà du produit et du service, KM se distingue par une vision : celle d’un sport élégant, engagé, universel. Celle d’un style qui reflète l’énergie intérieure de celles et ceux qui le portent.
          </p>
        </div>
      </section>

      <hr className="border-gray-300" />

      {/* Founders section */}
      <section className="max-w-3xl mx-auto space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">Les créateurs de KM Sportwear</h2>
        <div className="text-gray-700 leading-relaxed space-y-4">
          <p>
            <strong>Une vision née de la passion.</strong><br />
            Derrière KM se trouvent deux esprits unis par la même volonté de créer : <strong>Kens</strong> et <strong>Malika</strong>, fondateurs et co-créateurs de la marque. Leur complémentarité est à l’image de KM : entre force et finesse, entre rigueur et intuition, entre ambition et harmonie.
          </p>
          <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600">
            "Nous voulions créer plus qu’une marque : une déclaration de style, de mouvement et de puissance.
            <br /><strong>KM, c’est Ken et Malika — mais aussi :</strong>
            <br /><em>Kharisme & LUXE, Mouvement, Endurance, Performance.</em>
            <br />C’est une manière d’entrer dans le monde avec confiance, ancrage, et élégance."
          </blockquote>
          <p>
            <strong>Une inspiration mondiale, un attrait universel.</strong><br />
            La marque KM puise son essence dans une culture panafricaine forte, mais son regard se tourne vers le monde. Chez KM, le sport est une langue universelle, et la mode un drapeau qui se porte au quotidien.
          </p>
          <p>
            KM célèbre <strong>le sport, l’unité, la culture et la mode</strong>, à travers des vêtements qui parlent toutes les langues.
          </p>
          <p className="text-right text-gray-500 italic">— Kens & Malika</p>
        </div>
      </section>

      <hr className="border-gray-300" />

      {/* Delivery section */}
      <section className="max-w-3xl mx-auto space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">Livraison</h2>
        <div className="text-gray-700 leading-relaxed space-y-4">
          <p>
            Nous préparons chaque commande avec soin, dans un délai de 1 à 2 jours ouvrés.
            <br />Nos délais de livraison sont les suivants :
          </p>
          <ul className="list-disc list-inside ml-6 space-y-1">
            <li>France : entre 3 et 5 jours ouvrés</li>
            <li>Europe : entre 5 et 10 jours ouvrés</li>
            <li>Livraison express : sous 1 à 4 jours ouvrés (des frais supplémentaires peuvent s’appliquer)</li>
          </ul>
          <p>
            Une fois votre commande expédiée, vous recevrez par email un lien de suivi pour connaître à tout moment l’état de votre livraison.
          </p>
          <p>
            La livraison est disponible à l’international. Pour les envois hors Union Européenne, des frais de douane peuvent s’appliquer. Ceux-ci restent à la charge du client.
          </p>
        </div>
      </section>
    </div>
  </div>
);

export default About;
