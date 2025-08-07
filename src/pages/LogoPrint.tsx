import React from 'react';

const LogoPrint = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="text-center">
        {/* Logo Grande - Igual ao Header */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className="w-32 h-32 bg-cyan-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-6xl">J</span>
          </div>
          <span className="text-6xl font-bold text-gray-900">JuntaPlay</span>
        </div>
        
        {/* Versão da Logo */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Versão da Logo</h2>
          <div className="w-64 h-64 mx-auto">
            <img src="/j.png" alt="JuntaPlay Logo" className="w-full h-full" />
          </div>
        </div>
        
        {/* Versão em Alta Resolução */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Versão em Alta Resolução (400x400)</h2>
          <div className="w-80 h-80 mx-auto">
            <img src="/j.png" alt="JuntaPlay Logo High Res" className="w-full h-full" />
          </div>
        </div>
        

      </div>
    </div>
  );
};

export default LogoPrint;
