import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="mb-8 text-center">
      <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight sm:text-5xl">
        Formateur de Texte
      </h1>
      <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
        Appliquez facilement des styles uniques à votre texte pour le faire ressortir.
      </p>
    </header>
  );
};

export default Header;
