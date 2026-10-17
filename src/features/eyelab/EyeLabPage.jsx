import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { LiveTester } from './LiveTester';
import { InteractiveQuiz } from './InteractiveQuiz';
import { Sparkles, Camera, HelpCircle, ArrowLeft } from 'lucide-react';

export const EyeLabPage = () => {
  const [searchParams] = useSearchParams();
  const modeloIdQuery = searchParams.get('modelo');
  const productos = useStore((state) => state.productos);

  const [activeTab, setActiveTab] = useState('probador'); // 'probador' | 'recomendador'
  const [modeloPreseleccionado, setModeloPreseleccionado] = useState(null);

  useEffect(() => {
    if (modeloIdQuery) {
      const match = productos.find((p) => p.id === modeloIdQuery);
      if (match) {
        setModeloPreseleccionado(match);
        setActiveTab('probador');
      }
    }
  }, [modeloIdQuery, productos]);

  const handleSelectWinner = (modeloGanador) => {
    setModeloPreseleccionado(modeloGanador);
    setActiveTab('probador');
  };

  return (
    <div className="bg-neutral-950 text-neutral-100 py-10 min-h-screen">
      <div className="container-custom max-w-5xl">
        <Link to="/" className="inline-flex items-center gap-2 text-xs text-stone-400 hover:text-amber-300 mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la Tienda</span>
        </Link>

        {/* Encabezado del Eye Lab */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Laboratorio Óptico Virtual</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-amber-100 mb-3">
            Eye Lab Pupilentes AGO
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            La experiencia interactiva definitiva: pruébate tonos en vivo con tu cámara o responde 5 preguntas para que nuestro algoritmo encuentre tu mirada ideal.
          </p>
        </div>

        {/* Tabs superiores */}
        <div className="flex justify-center mb-8">
          <div className="p-1 rounded-full bg-neutral-900 border border-neutral-800 flex items-center">
            <button
              type="button"
              onClick={() => setActiveTab('probador')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
                activeTab === 'probador'
                  ? 'bg-amber-400 text-neutral-950 shadow-[0_0_15px_rgba(201,162,75,0.4)]'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>A) Probador en Vivo (Cámara)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('recomendador')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
                activeTab === 'recomendador'
                  ? 'bg-amber-400 text-neutral-950 shadow-[0_0_15px_rgba(201,162,75,0.4)]'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>B) Recomendador Interactivo</span>
            </button>
          </div>
        </div>

        {/* Contenido según pestaña */}
        {activeTab === 'probador' ? (
          <LiveTester modeloInicial={modeloPreseleccionado} />
        ) : (
          <InteractiveQuiz onSelectWinnerForTester={handleSelectWinner} />
        )}
      </div>
    </div>
  );
};
