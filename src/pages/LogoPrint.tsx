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
            <li><code className="bg-gray-100 px-2 py-1 rounded">/public/j.png</code> - Logo principal</li>
            <li><code className="bg-gray-100 px-2 py-1 rounded">/public/favicon.ico</code> - Favicon ICO</li>
            <li><code className="bg-gray-100 px-2 py-1 rounded">/public/favicon-32x32.png</code> - Favicon 32x32</li>
            <li><code className="bg-gray-100 px-2 py-1 rounded">/public/favicon-16x16.png</code> - Favicon 16x16</li>
            <li><code className="bg-gray-100 px-2 py-1 rounded">/public/apple-touch-icon.png</code> - Ícone Apple</li>
            <li><code className="bg-gray-100 px-2 py-1 rounded">/public/android-chrome-192x192.png</code> - Ícone Android 192x192</li>
            <li><code className="bg-gray-100 px-2 py-1 rounded">/public/android-chrome-512x512.png</code> - Ícone Android 512x512</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LogoPrint;
