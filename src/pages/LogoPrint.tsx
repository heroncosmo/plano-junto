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
        
        {/* Versão SVG da Logo */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Versão SVG da Logo</h2>
          <div className="w-64 h-64 mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="256" height="256">
              <defs>
                <linearGradient id="juntaplay-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: "#06b6d4", stopOpacity: 1}} />
                  <stop offset="100%" style={{stopColor: "#0891b2", stopOpacity: 1}} />
                </linearGradient>
              </defs>
              
              {/* Background circle */}
              <circle cx="60" cy="60" r="55" fill="url(#juntaplay-gradient)" stroke="#0891b2" strokeWidth="2"/>
              
              {/* Letter J */}
              <path d="M30 30h12v36c0 6.6 5.4 12 12 12s12-5.4 12-12V30h12v36c0 13.2-10.8 24-24 24s-24-10.8-24-24V30z" fill="white"/>
              
              {/* Small dots representing community */}
              <circle cx="85" cy="35" r="4" fill="white" opacity="0.8"/>
              <circle cx="95" cy="45" r="3" fill="white" opacity="0.6"/>
              <circle cx="80" cy="50" r="3" fill="white" opacity="0.6"/>
            </svg>
          </div>
        </div>
        
        {/* Versão em Alta Resolução */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Versão em Alta Resolução (400x400)</h2>
          <div className="w-80 h-80 mx-auto">
            <img src="/juntaplay-logo-high-res.svg" alt="JuntaPlay Logo High Res" className="w-full h-full" />
          </div>
        </div>
        
        {/* Informações da Logo */}
        <div className="max-w-2xl mx-auto text-left bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Especificações da Logo</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Cores:</strong> Cyan (#06b6d4) para #0891b2 (gradiente)</p>
            <p><strong>Fonte:</strong> Inter, system-ui, sans-serif</p>
            <p><strong>Peso da fonte:</strong> Bold (700)</p>
            <p><strong>Formato:</strong> SVG (vetorial)</p>
            <p><strong>Dimensões:</strong> 120x120px (base)</p>
          </div>
        </div>
        
        {/* Instruções */}
        <div className="mt-8 text-sm text-gray-500">
          <p>📸 Tire um screenshot desta página para obter a logo em alta resolução</p>
          <p>💾 Logos disponíveis:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><code className="bg-gray-100 px-2 py-1 rounded">/public/juntaplay-logo.svg</code> - Versão padrão (120x120)</li>
            <li><code className="bg-gray-100 px-2 py-1 rounded">/public/juntaplay-logo-high-res.svg</code> - Alta resolução (400x400)</li>
            <li><code className="bg-gray-100 px-2 py-1 rounded">/public/favicon.svg</code> - Favicon (32x32)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LogoPrint;
