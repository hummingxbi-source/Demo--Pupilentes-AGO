import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { IrisRenderer } from '../../components/common/IrisRenderer';
import { formatMXN } from '../../data/productos';
import {
  Camera,
  Upload,
  Sparkles,
  Sliders,
  Download,
  Share2,
  Eye,
  ShoppingBag,
  RefreshCw,
  Columns,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const LiveTester = ({ modeloInicial }) => {
  const productos = useStore((state) => state.productos);
  const agregarAlCarrito = useStore((state) => state.agregarAlCarrito);
  const showToast = useStore((state) => state.showToast);

  // Modelo de pupilente seleccionado
  const [modeloSeleccionado, setModeloSeleccionado] = useState(
    modeloInicial || productos[0]
  );

  useEffect(() => {
    if (modeloInicial) setModeloSeleccionado(modeloInicial);
  }, [modeloInicial]);

  // Modos de entrada: 'camara' | 'foto' | 'ilustracion'
  const [modoEntrada, setModoEntrada] = useState('ilustracion');
  const [camaraActiva, setCamaraActiva] = useState(false);
  const [errorCamara, setErrorCamara] = useState(null);
  const [fotoSubida, setFotoSubida] = useState(null);

  // Parámetros de ajuste en tiempo real
  const [intensidad, setIntensidad] = useState(0.85); // 0.3 a 1.0
  const [tamanoPupila, setTamanoPupila] = useState(0.35); // 0.2 a 0.5
  const [modoComparar, setModoComparar] = useState(false);
  const [compararPosicion, setCompararPosicion] = useState(50); // % del slider antes/después

  // Captura de foto
  const [fotoCapturada, setFotoCapturada] = useState(null);

  // Referencias para video y canvas
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Iniciar cámara web
  const iniciarCamara = async () => {
    setErrorCamara(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCamaraActiva(true);
        setModoEntrada('camara');
        showToast('Cámara iniciada. Detección activa en dispositivo 👁️', 'success');
      }
    } catch (err) {
      console.warn('Acceso a cámara no disponible:', err);
      setErrorCamara('No se pudo acceder a la cámara. Puedes subir una foto o usar el Modo Ilustración interactivo.');
      setModoEntrada('ilustracion');
      showToast('Cambiando a Modo Ilustración interactivo', 'info');
    }
  };

  const detenerCamara = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      setCamaraActiva(false);
    }
  };

  useEffect(() => {
    return () => detenerCamara();
  }, []);

  // Manejar subida de foto de fallback
  const handleSubirFoto = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFotoSubida(event.target.result);
        detenerCamara();
        setModoEntrada('foto');
        showToast('Foto cargada. Superposición de pupilente lista.', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  // Capturar foto con marco boutique dorado y watermark oficial
  const capturarFotoBoutique = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    // Fondo oscuro
    ctx.fillStyle = '#0B0B0C';
    ctx.fillRect(0, 0, 600, 600);

    // Dibujar base (video, foto o ilustración)
    if (modoEntrada === 'camara' && videoRef.current) {
      ctx.drawImage(videoRef.current, 50, 50, 500, 450);
    } else {
      // Dibujar fondo elegante para la foto
      const grad = ctx.createRadialGradient(300, 270, 50, 300, 270, 250);
      grad.addColorStop(0, '#1A1A1D');
      grad.addColorStop(1, '#0B0B0C');
      ctx.fillStyle = grad;
      ctx.fillRect(50, 50, 500, 450);

      // Dibujar iris grande
      ctx.save();
      ctx.beginPath();
      ctx.arc(300, 260, 90, 0, Math.PI * 2);
      ctx.fillStyle = modeloSeleccionado.hexPrincipal;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(300, 260, 30, 0, Math.PI * 2);
      ctx.fillStyle = '#080809';
      ctx.fill();
      ctx.restore();
    }

    // Marco dorado boutique
    ctx.strokeStyle = '#C9A24B';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, 540, 540);

    ctx.strokeStyle = 'rgba(232, 206, 143, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(40, 40, 520, 520);

    // Texto de marca y modelo
    ctx.fillStyle = '#E8CE8F';
    ctx.font = 'bold 22px serif';
    ctx.textAlign = 'center';
    ctx.fillText(`PUPILENTES AGO · ${modeloSeleccionado.nombre.toUpperCase()}`, 300, 540);

    ctx.fillStyle = '#A8A297';
    ctx.font = '12px sans-serif';
    ctx.fillText('Tienda Online CDMX · www.pupilentesago.mx', 300, 565);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setFotoCapturada(dataUrl);
    showToast('¡Foto boutique capturada con marco dorado! 📸', 'success');
  };

  // Descargar o compartir
  const descargarFoto = () => {
    if (!fotoCapturada) return;
    const a = document.createElement('a');
    a.href = fotoCapturada;
    a.download = `pupilentes-ago-${modeloSeleccionado.id}.jpg`;
    a.click();
  };

  const compartirFoto = async () => {
    if (navigator.share && fotoCapturada) {
      try {
        const blob = await (await fetch(fotoCapturada)).blob();
        const file = new File([blob], `pupilentes-ago-${modeloSeleccionado.id}.jpg`, { type: 'image/jpeg' });
        await navigator.share({
          title: `Mis pupilentes ${modeloSeleccionado.nombre} de Pupilentes AGO`,
          text: `Probándome el modelo ${modeloSeleccionado.nombre} en el Eye Lab de Pupilentes AGO CDMX ✨`,
          files: [file]
        });
      } catch (e) {
        descargarFoto();
      }
    } else {
      descargarFoto();
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Aviso de privacidad y selector de modos */}
      <div className="bg-neutral-900/90 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-xs text-stone-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Privacidad garantizada:</strong> Tu imagen se procesa 100% en tu dispositivo; no se graba ni se envía a ningún servidor.
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={camaraActiva ? detenerCamara : iniciarCamara}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              camaraActiva
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                : 'btn-outline-gold'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{camaraActiva ? 'Desactivar Cámara' : 'Activar Cámara'}</span>
          </button>

          <label className="btn-ghost text-xs py-1.5 px-3 rounded-full cursor-pointer flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" />
            <span>Subir Foto</span>
            <input type="file" accept="image/*" onChange={handleSubirFoto} className="hidden" />
          </label>

          <button
            type="button"
            onClick={() => {
              detenerCamara();
              setModoEntrada('ilustracion');
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium ${
              modoEntrada === 'ilustracion' ? 'bg-amber-400/20 text-amber-300' : 'text-stone-400'
            }`}
          >
            Modo Ilustración
          </button>
        </div>
      </div>

      {/* ÁREA PRINCIPAL DEL VISOR INTERACTIVO */}
      <div className="relative rounded-3xl overflow-hidden bg-neutral-950 border border-amber-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(201,162,75,0.2)] aspect-[4/3] sm:aspect-[16/10] max-h-[520px] flex items-center justify-center">
        {/* MODO CÁMARA */}
        {modoEntrada === 'camara' && (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />

            {/* Simulación de superposición sobre iris centrados */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center gap-28">
              <div
                className="transition-all duration-300"
                style={{
                  opacity: intensidad,
                  transform: `scale(${1 + (tamanoPupila - 0.35)})`
                }}
              >
                <IrisRenderer
                  colorPrincipal={modeloSeleccionado.hexPrincipal}
                  colorSecundario={modeloSeleccionado.hexSecundario}
                  colorAcento={modeloSeleccionado.hexAcento}
                  size={58}
                  pupilRatio={tamanoPupila}
                />
              </div>

              <div
                className="transition-all duration-300"
                style={{
                  opacity: intensidad,
                  transform: `scale(${1 + (tamanoPupila - 0.35)})`
                }}
              >
                <IrisRenderer
                  colorPrincipal={modeloSeleccionado.hexPrincipal}
                  colorSecundario={modeloSeleccionado.hexSecundario}
                  colorAcento={modeloSeleccionado.hexAcento}
                  size={58}
                  pupilRatio={tamanoPupila}
                />
              </div>
            </div>

            {/* Barra divisoria de Modo Comparar Antes / Después */}
            {modoComparar && (
              <div
                className="absolute top-0 bottom-0 w-1 bg-amber-400 cursor-ew-resize z-20 shadow-[0_0_10px_rgba(201,162,75,0.8)]"
                style={{ left: `${compararPosicion}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -left-3 w-7 h-7 rounded-full bg-amber-400 text-black flex items-center justify-center font-bold text-xs shadow-lg">
                  ↔
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODO FOTO SUBIDA */}
        {modoEntrada === 'foto' && fotoSubida && (
          <div className="relative w-full h-full flex items-center justify-center">
            <img src={fotoSubida} alt="Rostro de prueba" className="w-full h-full object-contain" />
            <div className="absolute inset-0 flex items-center justify-center gap-24 pointer-events-none">
              <div style={{ opacity: intensidad }}>
                <IrisRenderer
                  colorPrincipal={modeloSeleccionado.hexPrincipal}
                  colorSecundario={modeloSeleccionado.hexSecundario}
                  colorAcento={modeloSeleccionado.hexAcento}
                  size={54}
                />
              </div>
              <div style={{ opacity: intensidad }}>
                <IrisRenderer
                  colorPrincipal={modeloSeleccionado.hexPrincipal}
                  colorSecundario={modeloSeleccionado.hexSecundario}
                  colorAcento={modeloSeleccionado.hexAcento}
                  size={54}
                />
              </div>
            </div>
          </div>
        )}

        {/* MODO ILUSTRACIÓN INTERACTIVA (FALLBACK 100% GARANTIZADO) */}
        {modoEntrada === 'ilustracion' && (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-neutral-900 to-neutral-950">
            <div className="relative flex items-center justify-center">
              {/* Ojo grande ilustrado en SVG */}
              <svg viewBox="0 0 400 240" className="w-80 sm:w-96 drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]">
                {/* Esclera / Contorno de párpados */}
                <path
                  d="M 20 120 Q 200 20 380 120 Q 200 220 20 120 Z"
                  fill="#F9F6F0"
                  stroke="#3A332C"
                  strokeWidth="4"
                />

                {/* Sombra de párpado superior */}
                <path
                  d="M 20 120 Q 200 20 380 120 Q 200 65 20 120 Z"
                  fill="rgba(0,0,0,0.18)"
                />

                {/* Lagrimal */}
                <circle cx="35" cy="120" r="10" fill="#E8B4B8" opacity="0.8" />
              </svg>

              {/* Pupilente interactivo renderizado dentro del ojo */}
              <div
                className="absolute transition-all duration-300"
                style={{
                  opacity: intensidad,
                  transform: `scale(${1 + (tamanoPupila - 0.35) * 0.8})`
                }}
              >
                <IrisRenderer
                  colorPrincipal={modeloSeleccionado.hexPrincipal}
                  colorSecundario={modeloSeleccionado.hexSecundario}
                  colorAcento={modeloSeleccionado.hexAcento}
                  anilloLimbal={modeloSeleccionado.anilloLimbal}
                  densidadFibras={modeloSeleccionado.densidadFibras}
                  size={128}
                  pupilRatio={tamanoPupila}
                  hoverDilate={true}
                />
              </div>
            </div>

            <span className="text-xs text-stone-400 font-mono tracking-wider mt-4">
              Previsualización de estroma sobre ojo almendrado latino
            </span>
          </div>
        )}

        {/* Overlay inferior con nombre y controles rápidos */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
          <div className="p-3 rounded-2xl bg-neutral-900/90 border border-amber-500/30 backdrop-blur-md">
            <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 block">
              Tono Seleccionado
            </span>
            <span className="text-sm font-bold text-neutral-100 block">
              {modeloSeleccionado.nombre}
            </span>
            <span className="text-xs font-bold text-amber-300 font-sans">
              {formatMXN(modeloSeleccionado.precio)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setModoComparar(!modoComparar)}
              className={`p-3 rounded-full border transition-all ${
                modoComparar
                  ? 'bg-amber-400 text-black border-amber-400 font-bold'
                  : 'bg-neutral-900/90 text-stone-300 border-neutral-700 hover:text-white'
              }`}
              title="Comparar antes y después"
            >
              <Columns className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={capturarFotoBoutique}
              className="btn-gold p-3 rounded-full text-black shadow-lg"
              title="Capturar foto con marco dorado boutique"
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* CONTROLES DESLIZANTES: INTENSIDAD Y PUPILA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 text-xs">
        <div>
          <div className="flex justify-between text-stone-300 mb-1.5 font-medium">
            <span>Intensidad de Color:</span>
            <span className="text-amber-400 font-mono">{Math.round(intensidad * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.3"
            max="1.0"
            step="0.05"
            value={intensidad}
            onChange={(e) => setIntensidad(parseFloat(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer h-2 bg-neutral-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-stone-500 mt-1">
            <span>Natural acuarelado</span>
            <span>Intenso definido</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-stone-300 mb-1.5 font-medium">
            <span>Apertura de Pupila:</span>
            <span className="text-amber-400 font-mono">{Math.round(tamanoPupila * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.25"
            max="0.45"
            step="0.02"
            value={tamanoPupila}
            onChange={(e) => setTamanoPupila(parseFloat(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer h-2 bg-neutral-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-stone-500 mt-1">
            <span>Luz de día (cerrada)</span>
            <span>Luz tenue (dilatada)</span>
          </div>
        </div>
      </div>

      {/* CARRUSEL DE MODELOS PARA PROBAR */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-stone-400 px-1">
          <span className="font-semibold uppercase tracking-wider text-amber-300">
            Toca un modelo para probarlo al instante:
          </span>
          <span>{productos.length} tonos en catálogo</span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-none">
          {productos.map((prod) => {
            const isSelected = modeloSeleccionado.id === prod.id;
            return (
              <button
                key={prod.id}
                type="button"
                onClick={() => setModeloSeleccionado(prod)}
                className={`p-3 rounded-2xl border transition-all text-center flex flex-col items-center shrink-0 w-28 group ${
                  isSelected
                    ? 'bg-amber-400/15 border-amber-400 shadow-[0_0_15px_rgba(201,162,75,0.3)] scale-105'
                    : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="w-12 h-12 mb-2 group-hover:scale-110 transition-transform">
                  <IrisRenderer
                    colorPrincipal={prod.hexPrincipal}
                    colorSecundario={prod.hexSecundario}
                    size={48}
                  />
                </div>
                <span className="text-[11px] font-bold text-neutral-100 block truncate w-full">
                  {prod.nombre}
                </span>
                <span className="text-[10px] text-amber-300 font-sans block mt-0.5">
                  {formatMXN(prod.precio)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* BOTÓN DIRECTO AGREGAR AL CARRITO */}
      <div className="p-4 rounded-2xl bg-neutral-900 border border-amber-500/30 flex items-center justify-between">
        <div>
          <span className="text-xs text-stone-400 block">¿Te gustó cómo se te ve?</span>
          <span className="font-bold text-sm text-white">
            {modeloSeleccionado.nombre} — {formatMXN(modeloSeleccionado.precio)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            agregarAlCarrito({
              productoId: modeloSeleccionado.id,
              nombre: modeloSeleccionado.nombre,
              tipoCompra: "par",
              od: "0.00",
              oi: "0.00",
              precioUnitario: modeloSeleccionado.precio,
              cantidad: 1,
              hexPrincipal: modeloSeleccionado.hexPrincipal,
              hexSecundario: modeloSeleccionado.hexSecundario
            });
          }}
          className="btn-gold text-xs px-6 py-3 flex items-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Agregar este modelo al carrito</span>
        </button>
      </div>

      {/* MODAL DE FOTO CAPTURADA */}
      {fotoCapturada && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-amber-500/40 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 animate-scale-in">
            <h3 className="font-serif text-xl font-bold text-amber-200">
              ¡Tu Foto Boutique está Lista!
            </h3>
            <div className="rounded-xl overflow-hidden border border-amber-400/50 shadow-2xl">
              <img src={fotoCapturada} alt="Foto con marco dorado" className="w-full h-auto" />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={compartirFoto}
                className="btn-gold text-xs py-2.5 px-4 w-full flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Compartir / Guardar</span>
              </button>
              <button
                type="button"
                onClick={() => setFotoCapturada(null)}
                className="btn-ghost text-xs py-2.5 px-4"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
