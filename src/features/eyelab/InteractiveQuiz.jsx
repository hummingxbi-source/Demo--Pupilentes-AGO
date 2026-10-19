import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { PREGUNTAS_QUIZ, calcularRecomendacion } from '../../data/afinidad';
import { IrisRenderer } from '../../components/common/IrisRenderer';
import { formatMXN } from '../../data/productos';
import { Sparkles, ArrowRight, ArrowLeft, Check, Camera, ShoppingBag, RotateCcw } from 'lucide-react';

export const InteractiveQuiz = ({ onSelectWinnerForTester }) => {
  const productos = useStore((state) => state.productos);
  const agregarAlCarrito = useStore((state) => state.agregarAlCarrito);
  const showToast = useStore((state) => state.showToast);

  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState({
    tonoPiel: "medio_calido",
    colorOjos: "negro",
    efecto: "glam",
    ocasion: "diario",
    intensidad: 2
  });

  const [resultados, setResultados] = useState(null);

  const preguntaActual = PREGUNTAS_QUIZ[paso];

  const seleccionarOpcion = (campo, valor) => {
    const nuevasRespuestas = { ...respuestas, [campo]: valor };
    setRespuestas(nuevasRespuestas);

    if (paso < PREGUNTAS_QUIZ.length - 1) {
      setPaso(paso + 1);
    } else {
      // Calcular resultados finales
      const top3 = calcularRecomendacion(nuevasRespuestas, productos);
      setResultados(top3);
    }
  };

  const reiniciarQuiz = () => {
    setPaso(0);
    setResultados(null);
  };

  const handleAgregarAlCarrito = (producto) => {
    agregarAlCarrito({
      productoId: producto.id,
      nombre: producto.nombre,
      tipoCompra: "par",
      od: "0.00",
      oi: "0.00",
      precioUnitario: producto.precio,
      cantidad: 1,
      hexPrincipal: producto.hexPrincipal,
      hexSecundario: producto.hexSecundario
    });
  };

  // VISTA DE RESULTADOS
  if (resultados) {
    const ganador = resultados[0];

    return (
      <div className="max-w-4xl mx-auto space-y-10 animate-fade-in py-6">
        <div className="text-center space-y-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/40 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tu Diagnóstico de Mirada Personalizado</span>
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-amber-100">
            Tu Tono Ganador es{' '}
            <span className="text-gold-gradient italic font-normal">{ganador.producto.nombre}</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 max-w-xl mx-auto leading-relaxed">
            {ganador.razon}
          </p>
        </div>

        {/* Tarjeta del Ganador Principal */}
        <div className="p-8 rounded-[24px] bg-espresso border border-cocoa shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="relative">
              <IrisRenderer
                producto={ganador.producto}
                size={160}
                hoverDilate={true}
              />
              <span className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-brass text-ink shadow-md">
                {ganador.matchPercent}% Match
              </span>
            </div>

            <div>
              <span className="text-xs uppercase font-mono tracking-widest text-sand block mb-1">
                #1 Elección Recomendada
              </span>
              <h3 className="font-serif text-3xl font-light text-champagne mb-1">
                {ganador.producto.nombre}
              </h3>
              <p className="text-xs text-stone mb-3">
                Familia {ganador.producto.familia} · {ganador.producto.duracion}
              </p>
              <span className="text-2xl font-serif text-champagne">
                {formatMXN(ganador.producto.precio)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={() => onSelectWinnerForTester(ganador.producto)}
              className="btn-brass text-xs px-6 py-3 flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" />
              <span>Probármelo en vivo</span>
            </button>

            <button
              type="button"
              onClick={() => handleAgregarAlCarrito(ganador.producto)}
              className="btn-link-thread text-xs px-6 py-2.5 flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Agregar a mi bolsa</span>
            </button>
          </div>
        </div>

        {/* Segundo y Tercer Lugar */}
        <div className="space-y-4 pt-4">
          <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest">
            Otras Opciones de Alta Afinidad:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {resultados.slice(1).map((res, i) => (
              <div
                key={res.producto.id}
                className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <IrisRenderer
                    colorPrincipal={res.producto.hexPrincipal}
                    colorSecundario={res.producto.hexSecundario}
                    size={70}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-neutral-100">{res.producto.nombre}</span>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {res.matchPercent}%
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 mt-0.5 line-clamp-1">{res.razon}</p>
                    <span className="text-xs font-bold text-amber-300 font-sans block mt-1">
                      {formatMXN(res.producto.precio)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectWinnerForTester(res.producto)}
                  className="p-2.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-amber-300 transition-colors"
                  title="Probar este tono"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center pt-6">
          <button
            type="button"
            onClick={reiniciarQuiz}
            className="btn-ghost text-xs px-5 py-2 inline-flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Repetir Cuestionario</span>
          </button>
        </div>
      </div>
    );
  }

  // VISTA DE PREGUNTAS DEL CUESTIONARIO
  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Barra de progreso de preguntas */}
      <div className="flex items-center justify-between text-xs text-stone-400 mb-6">
        <span>Pregunta {paso + 1} de {PREGUNTAS_QUIZ.length}</span>
        <span className="text-amber-400 font-mono font-bold">
          {Math.round(((paso + 1) / PREGUNTAS_QUIZ.length) * 100)}%
        </span>
      </div>

      <div className="w-full h-1 bg-neutral-900 rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-600 to-amber-300 transition-all duration-300"
          style={{ width: `${((paso + 1) / PREGUNTAS_QUIZ.length) * 100}%` }}
        />
      </div>

      <div className="text-center mb-10">
        <h2 className="font-serif text-2xl sm:text-4xl font-bold text-amber-100 mb-2">
          {preguntaActual.titulo}
        </h2>
        <p className="text-xs sm:text-sm text-stone-400">
          {preguntaActual.subtitulo}
        </p>
      </div>

      {/* Renderizado de opciones según tipo */}
      {preguntaActual.tipo === "colores" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {preguntaActual.opciones.map((op) => (
            <button
              key={op.id}
              type="button"
              onClick={() => seleccionarOpcion(preguntaActual.id, op.id)}
              className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-amber-400/60 transition-all text-center flex flex-col items-center group"
            >
              <div
                className="w-14 h-14 rounded-full border-2 border-white/20 mb-3 shadow-md group-hover:scale-110 transition-transform"
                style={{ backgroundColor: op.hex }}
              />
              <span className="text-xs font-bold text-neutral-100 block">{op.label}</span>
              <span className="text-[10px] text-stone-400 block mt-0.5">{op.sub}</span>
            </button>
          ))}
        </div>
      )}

      {preguntaActual.tipo === "selector" && (
        <div className="space-y-3">
          {preguntaActual.opciones.map((op) => (
            <button
              key={op.id}
              type="button"
              onClick={() => seleccionarOpcion(preguntaActual.id, op.id)}
              className="w-full p-4 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-amber-400/60 transition-all flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-8 h-8 rounded-full border border-white/30 shrink-0"
                  style={{ backgroundColor: op.hex }}
                />
                <div>
                  <span className="text-sm font-bold text-neutral-100 block">{op.label}</span>
                  <span className="text-xs text-stone-400">{op.desc}</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-stone-500 group-hover:text-amber-400 transition-colors" />
            </button>
          ))}
        </div>
      )}

      {preguntaActual.tipo === "cards" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {preguntaActual.opciones.map((op) => (
            <button
              key={op.id}
              type="button"
              onClick={() => seleccionarOpcion(preguntaActual.id, op.id)}
              className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-amber-400/60 transition-all text-left group"
            >
              <span className="text-sm font-bold text-neutral-100 block mb-1">{op.label}</span>
              <span className="text-xs text-stone-400 leading-relaxed block">{op.desc}</span>
            </button>
          ))}
        </div>
      )}

      {preguntaActual.tipo === "slider" && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 text-center space-y-6">
          <div className="space-y-2">
            <span className="text-base font-bold text-amber-300 block">
              {preguntaActual.labels[respuestas.intensidad - 1]}
            </span>
          </div>
          <input
            type="range"
            min={preguntaActual.min}
            max={preguntaActual.max}
            step="1"
            value={respuestas.intensidad}
            onChange={(e) => setRespuestas({ ...respuestas, intensidad: Number(e.target.value) })}
            className="w-full accent-amber-400 cursor-pointer h-2 bg-neutral-800 rounded-lg"
          />
          <div className="flex justify-between text-xs text-stone-400 px-1">
            <span>Sutil</span>
            <span>Equilibrado</span>
            <span>Intenso</span>
          </div>

          <button
            type="button"
            onClick={() => {
              const top3 = calcularRecomendacion(respuestas, productos);
              setResultados(top3);
            }}
            className="btn-brass text-xs px-8 py-3.5 inline-flex items-center gap-2 mt-4"
          >
            <span>Ver Mi Recomendación</span>
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      )}

      {paso > 0 && (
        <div className="mt-8">
          <button
            type="button"
            onClick={() => setPaso(paso - 1)}
            className="btn-ghost text-xs px-4 py-2 flex items-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Pregunta anterior</span>
          </button>
        </div>
      )}
    </div>
  );
};
