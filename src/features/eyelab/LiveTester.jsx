import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';
import { useStore } from '../../store/useStore';
import { LISTA_IRIS, MAPA_IRIS, obtenerIrisProducto } from '../../data/imagenes';
import { formatMXN } from '../../data/productos';
import {
  Camera,
  Upload,
  Sparkles,
  Download,
  Share2,
  ShoppingBag,
  RefreshCw,
  Columns,
  Eye,
  Sliders,
  AlertCircle,
  CheckCircle2,
  User,
  SlidersHorizontal
} from 'lucide-react';

// Landmark indices for MediaPipe FaceLandmarker
const IRIS_A = { center: 468, ring: [469, 470, 471, 472] };
const IRIS_B = { center: 473, ring: [474, 475, 476, 477] };

const EYELID_1 = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
const EYELID_2 = [263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466];

export const LiveTester = ({ modeloInicial }) => {
  const productos = useStore((state) => state.productos);
  const agregarAlCarrito = useStore((state) => state.agregarAlCarrito);
  const showToast = useStore((state) => state.showToast);

  // Modelo de lente seleccionado
  const [colorActivo, setColorActivo] = useState(() => {
    if (modeloInicial) {
      return obtenerIrisProducto(modeloInicial);
    }
    return MAPA_IRIS.azul;
  });

  // El modelo puede llegar después del primer render (?modelo= en la URL)
  useEffect(() => {
    if (modeloInicial) setColorActivo(obtenerIrisProducto(modeloInicial));
  }, [modeloInicial]);

  // Modo de entrada: 'camara' | 'foto'
  const [modoEntrada, setModoEntrada] = useState('camara');
  const [camaraActiva, setCamaraActiva] = useState(false);
  const [cargandoModelo, setCargandoModelo] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState(null);
  const [rostroDetectado, setRostroDetectado] = useState(true);
  const [fotoSubidaSrc, setFotoSubidaSrc] = useState(null);

  // Sliders finos de realismo óptico (0.62 para translucidez realista)
  const [intensidad, setIntensidad] = useState(0.62); // 0.4 a 1.0
  const [tamanoPupila, setTamanoPupila] = useState(0.33); // 0.25 a 0.52
  const [modoComparar, setModoComparar] = useState(false);
  const [compararX, setCompararX] = useState(50); // percentage

  // Refs de render
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const offscreenCanvasRef = useRef(null);
  const landmarkerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);
  const textureCacheRef = useRef({});
  const smoothedA = useRef({ cx: 0, cy: 0, r: 0, active: false });
  const smoothedB = useRef({ cx: 0, cy: 0, r: 0, active: false });
  const modelImgRef = useRef(null);

  // Refs reactivos para bucle de cámara en tiempo real (evita stale closure)
  const colorActivoRef = useRef(colorActivo);
  const intensidadRef = useRef(intensidad);
  const tamanoPupilaRef = useRef(tamanoPupila);
  const modoCompararRef = useRef(modoComparar);
  const compararXRef = useRef(compararX);

  useEffect(() => {
    colorActivoRef.current = colorActivo;
    intensidadRef.current = intensidad;
    tamanoPupilaRef.current = tamanoPupila;
    modoCompararRef.current = modoComparar;
    compararXRef.current = compararX;
  }, [colorActivo, intensidad, tamanoPupila, modoComparar, compararX]);

  // Pre-cargar texturas RGBA de 640x640
  useEffect(() => {
    LISTA_IRIS.forEach((iris) => {
      const img = new Image();
      img.src = iris.tex;
      img.crossOrigin = 'anonymous';
      textureCacheRef.current[iris.id] = img;
    });

    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
    }
  }, []);

  // Inicializar MediaPipe FaceLandmarker singleton
  useEffect(() => {
    let isCancelled = false;

    async function initMediaPipe() {
      try {
        setCargandoModelo(true);
        const fileset = await FilesetResolver.forVisionTasks('/mediapipe/wasm');

        if (isCancelled) return;

        let landmarker = null;
        try {
          landmarker = await FaceLandmarker.createFromOptions(fileset, {
            baseOptions: {
              modelAssetPath: '/models/face_landmarker.task',
              delegate: 'GPU',
            },
            runningMode: modoEntrada === 'camara' ? 'VIDEO' : 'IMAGE',
            numFaces: 1,
            outputFaceBlendshapes: false,
            outputFacialTransformationMatrixes: false,
          });
        } catch (gpuError) {
          console.warn('Fallback a CPU en FaceLandmarker:', gpuError);
          landmarker = await FaceLandmarker.createFromOptions(fileset, {
            baseOptions: {
              modelAssetPath: '/models/face_landmarker.task',
              delegate: 'CPU',
            },
            runningMode: modoEntrada === 'camara' ? 'VIDEO' : 'IMAGE',
            numFaces: 1,
            outputFaceBlendshapes: false,
            outputFacialTransformationMatrixes: false,
          });
        }

        if (isCancelled) return;
        landmarkerRef.current = landmarker;
        setCargandoModelo(false);
      } catch (err) {
        console.error('Error al inicializar FaceLandmarker:', err);
        if (!isCancelled) {
          setCargandoModelo(false);
          setErrorMensaje('No se pudo cargar el motor biométrico.');
        }
      }
    }

    initMediaPipe();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Pipeline de renderizado fotorrealista para un ojo
  const renderOjoRealista = useCallback(
    (ctx, canvasW, canvasH, irisData, eyelidPoints, textureImg, alphaIntensidad, pupilRatio) => {
      const { cx, cy, r } = irisData;
      if (r <= 2) return;

      // 1. Radio del lente ampliado a 1.2x para cubrir el iris con realismo anatómico
      const lensRadius = r * 1.2;
      const lensDiameter = lensRadius * 2;

      ctx.save();

      // 2. Máscara de recorte anatómica según los puntos del párpado
      if (eyelidPoints && eyelidPoints.length > 3) {
        ctx.beginPath();
        eyelidPoints.forEach((pt, i) => {
          const px = pt.x * canvasW;
          const py = pt.y * canvasH;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.closePath();
        ctx.clip();
      }

      // 3. Capturar muestra del ojo original para extraer pestañas oscuras y brillos reales
      const sampleSize = Math.ceil(lensDiameter * 1.4);
      const sx = Math.max(0, Math.floor(cx - sampleSize / 2));
      const sy = Math.max(0, Math.floor(cy - sampleSize / 2));
      const sw = Math.min(canvasW - sx, sampleSize);
      const sh = Math.min(canvasH - sy, sampleSize);

      let originalData = null;
      try {
        if (sw > 0 && sh > 0) {
          originalData = ctx.getImageData(sx, sy, sw, sh);
        }
      } catch (e) {
        // En caso de canvas teñido por CORS externo
      }

      // 4. Dibujar textura del lente con borde difuminado (feather 12%)
      ctx.globalAlpha = alphaIntensidad;
      ctx.globalCompositeOperation = 'source-over';

      if (textureImg && textureImg.complete && textureImg.naturalWidth > 0) {
        ctx.drawImage(
          textureImg,
          cx - lensRadius,
          cy - lensRadius,
          lensDiameter,
          lensDiameter
        );

        // Suavizado perimetral feather 12% hacia el borde exterior
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        const featherGrad = ctx.createRadialGradient(
          cx, cy, lensRadius * 0.88,
          cx, cy, lensRadius * 1.01
        );
        featherGrad.addColorStop(0, 'rgba(0,0,0,0)');
        featherGrad.addColorStop(1, 'rgba(0,0,0,0.85)');
        ctx.fillStyle = featherGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, lensRadius * 1.01, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        // Fallback radial
        const grad = ctx.createRadialGradient(cx, cy, lensRadius * 0.3, cx, cy, lensRadius);
        grad.addColorStop(0, colorActivo.hex);
        grad.addColorStop(0.88, colorActivo.hex);
        grad.addColorStop(1, '#0E0D0C');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, lensRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. Anillo limbal perimetral fino a 0.97 R para realismo
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = '#12100E';
      ctx.lineWidth = Math.max(1, r * 0.08);
      ctx.beginPath();
      ctx.arc(cx, cy, lensRadius * 0.97, 0, Math.PI * 2);
      ctx.stroke();

      // 6. Recorte de pupila con destination-out para ver la pupila real de la clienta
      const pupilHoleRadius = lensRadius * pupilRatio;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = 1.0;
      const pupilGrad = ctx.createRadialGradient(
        cx,
        cy,
        pupilHoleRadius * 0.65,
        cx,
        cy,
        pupilHoleRadius
      );
      pupilGrad.addColorStop(0, 'rgba(0,0,0,1)');
      pupilGrad.addColorStop(0.8, 'rgba(0,0,0,0.9)');
      pupilGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = pupilGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, pupilHoleRadius, 0, Math.PI * 2);
      ctx.fill();

      // 7. Conservar pestañas y sombras oscuras por encima del lente (luminancia < 0.28)
      if (originalData) {
        const offCanvas = offscreenCanvasRef.current;
        if (offCanvas) {
          offCanvas.width = sw;
          offCanvas.height = sh;
          const offCtx = offCanvas.getContext('2d');
          const darkData = offCtx.createImageData(sw, sh);
          const d = originalData.data;
          const out = darkData.data;

          for (let i = 0; i < d.length; i += 4) {
            const rVal = d[i];
            const gVal = d[i + 1];
            const bVal = d[i + 2];
            const lum = (0.299 * rVal + 0.587 * gVal + 0.114 * bVal) / 255;

            // Si es un pixel oscuro (pestaña o sombra del párpado), preservarlo
            if (lum < 0.28) {
              out[i] = rVal;
              out[i + 1] = gVal;
              out[i + 2] = bVal;
              out[i + 3] = Math.round((1 - lum / 0.28) * 190);
            }
          }

          offCtx.putImageData(darkData, 0, 0);
          ctx.globalCompositeOperation = 'source-over';
          ctx.globalAlpha = 0.85;
          ctx.drawImage(offCanvas, sx, sy);
        }
      }

      // 8. Conservar reflejos naturales auténticos (luminancia > 0.85)
      if (originalData) {
        const offCanvas = offscreenCanvasRef.current;
        if (offCanvas) {
          const offCtx = offCanvas.getContext('2d');
          const specData = offCtx.createImageData(sw, sh);
          const d = originalData.data;
          const out = specData.data;

          for (let i = 0; i < d.length; i += 4) {
            const rVal = d[i];
            const gVal = d[i + 1];
            const bVal = d[i + 2];
            const lum = (0.299 * rVal + 0.587 * gVal + 0.114 * bVal) / 255;

            if (lum > 0.85) {
              out[i] = 255;
              out[i + 1] = 255;
              out[i + 2] = 255;
              out[i + 3] = Math.round(((lum - 0.85) / 0.15) * 220);
            }
          }

          offCtx.putImageData(specData, 0, 0);
          ctx.globalCompositeOperation = 'lighten';
          ctx.globalAlpha = 0.9;
          ctx.drawImage(offCanvas, sx, sy);
        }
      }

      ctx.restore();
    },
    [colorActivo]
  );

  // Renderizar un frame de imagen estática (modelo o foto subida)
  const procesarImagenEstatica = useCallback(
    (imgElement) => {
      if (!imgElement || !canvasRef.current || !landmarkerRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const w = imgElement.naturalWidth || imgElement.width || 640;
      const h = imgElement.naturalHeight || imgElement.height || 640;

      canvas.width = w;
      canvas.height = h;

      // Dibujar imagen base
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(imgElement, 0, 0, w, h);

      // Si el modo comparar está activo y estamos antes del divisor, guardar original
      let copyCanvas = null;
      if (modoComparar) {
        copyCanvas = document.createElement('canvas');
        copyCanvas.width = w;
        copyCanvas.height = h;
        copyCanvas.getContext('2d').drawImage(imgElement, 0, 0, w, h);
      }

      // Detección con MediaPipe
      try {
        const results = landmarkerRef.current.detect(imgElement);

        if (results && results.faceLandmarks && results.faceLandmarks.length > 0) {
          setRostroDetectado(true);
          setErrorMensaje(null);
          const landmarks = results.faceLandmarks[0];

          // Ojo A
          const centerA = landmarks[IRIS_A.center];
          const ringA = IRIS_A.ring.map((idx) => landmarks[idx]);
          const radA = ringA.reduce((sum, pt) => sum + Math.hypot(pt.x - centerA.x, pt.y - centerA.y), 0) / ringA.length;

          // Ojo B
          const centerB = landmarks[IRIS_B.center];
          const ringB = IRIS_B.ring.map((idx) => landmarks[idx]);
          const radB = ringB.reduce((sum, pt) => sum + Math.hypot(pt.x - centerB.x, pt.y - centerB.y), 0) / ringB.length;

          const eye1Pts = EYELID_1.map((idx) => landmarks[idx]);
          const eye2Pts = EYELID_2.map((idx) => landmarks[idx]);

          const texImg = textureCacheRef.current[colorActivo.id];

          // Renderizar pupilentes
          renderOjoRealista(
            ctx,
            w,
            h,
            { cx: centerA.x * w, cy: centerA.y * h, r: radA * w },
            eye1Pts,
            texImg,
            intensidad,
            tamanoPupila
          );

          renderOjoRealista(
            ctx,
            w,
            h,
            { cx: centerB.x * w, cy: centerB.y * h, r: radB * w },
            eye2Pts,
            texImg,
            intensidad,
            tamanoPupila
          );
        } else {
          setRostroDetectado(false);
          setErrorMensaje('Sube una foto donde se vea tu cara completa mirando de frente.');
        }
      } catch (err) {
        console.warn('Detección estática con fallback:', err);
      }

      // Aplicar línea de comparación antes / después si está activa
      if (modoComparar && copyCanvas) {
        const splitPx = (w * compararX) / 100;
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, splitPx, h);
        ctx.clip();
        ctx.drawImage(copyCanvas, 0, 0);
        ctx.restore();

        // Línea divisoria
        ctx.save();
        ctx.strokeStyle = '#B08D57';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(splitPx, 0);
        ctx.lineTo(splitPx, h);
        ctx.stroke();
        ctx.restore();
      }
    },
    [colorActivo, intensidad, tamanoPupila, modoComparar, compararX, renderOjoRealista]
  );

  // Procesar imagen de foto subida por la clienta
  useEffect(() => {
    if (modoEntrada === 'foto' && modelImgRef.current) {
      procesarImagenEstatica(modelImgRef.current);
    }
  }, [colorActivo, intensidad, tamanoPupila, modoComparar, compararX, modoEntrada, procesarImagenEstatica]);

  // Bucle de video en tiempo real para la cámara (reactivo instantáneamente)
  const bucleVideo = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    // Si falta landmarker, dibujar video básico y pedir el siguiente frame sin detener el bucle
    if (!landmarkerRef.current) {
      if (video.readyState >= 2) {
        const vw = video.videoWidth || 1280;
        const vh = video.videoHeight || 720;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        if (canvas.width !== vw * dpr || canvas.height !== vh * dpr) {
          canvas.width = vw * dpr;
          canvas.height = vh * dpr;
        }
        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.drawImage(video, 0, 0, vw, vh);
        ctx.restore();
      }
      animationFrameRef.current = requestAnimationFrame(bucleVideo);
      return;
    }

    const activeColor = colorActivoRef.current;
    const activeIntensidad = intensidadRef.current;
    const activeTamano = tamanoPupilaRef.current;
    const activeModoComparar = modoCompararRef.current;
    const activeCompararX = compararXRef.current;

    if (video.readyState >= 2 && video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime;
      const vw = video.videoWidth || 1280;
      const vh = video.videoHeight || 720;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      if (canvas.width !== vw * dpr || canvas.height !== vh * dpr) {
        canvas.width = vw * dpr;
        canvas.height = vh * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, vw, vh);
      ctx.drawImage(video, 0, 0, vw, vh);

      let copyCanvas = null;
      if (activeModoComparar) {
        copyCanvas = document.createElement('canvas');
        copyCanvas.width = vw;
        copyCanvas.height = vh;
        copyCanvas.getContext('2d').drawImage(video, 0, 0, vw, vh);
      }

      const results = landmarkerRef.current.detectForVideo(video, performance.now());

      if (results && results.faceLandmarks && results.faceLandmarks.length > 0) {
        setRostroDetectado(true);
        const landmarks = results.faceLandmarks[0];

        // Centro y radio A
        const cA = landmarks[IRIS_A.center];
        const rA = IRIS_A.ring.map((idx) => landmarks[idx]);
        const radA = rA.reduce((sum, pt) => sum + Math.hypot(pt.x - cA.x, pt.y - cA.y), 0) / rA.length;

        // Suavizado EMA con alpha = 0.5 para evitar temblor
        const alpha = 0.5;
        smoothedA.current.cx = smoothedA.current.active ? smoothedA.current.cx * (1 - alpha) + cA.x * vw * alpha : cA.x * vw;
        smoothedA.current.cy = smoothedA.current.active ? smoothedA.current.cy * (1 - alpha) + cA.y * vh * alpha : cA.y * vh;
        smoothedA.current.r = smoothedA.current.active ? smoothedA.current.r * (1 - alpha) + radA * vw * alpha : radA * vw;
        smoothedA.current.active = true;

        // Centro y radio B
        const cB = landmarks[IRIS_B.center];
        const rB = IRIS_B.ring.map((idx) => landmarks[idx]);
        const radB = rB.reduce((sum, pt) => sum + Math.hypot(pt.x - cB.x, pt.y - cB.y), 0) / rB.length;

        smoothedB.current.cx = smoothedB.current.active ? smoothedB.current.cx * (1 - alpha) + cB.x * vw * alpha : cB.x * vw;
        smoothedB.current.cy = smoothedB.current.active ? smoothedB.current.cy * (1 - alpha) + cB.y * vh * alpha : cB.y * vh;
        smoothedB.current.r = smoothedB.current.active ? smoothedB.current.r * (1 - alpha) + radB * vw * alpha : radB * vw;
        smoothedB.current.active = true;

        const eye1Pts = EYELID_1.map((idx) => landmarks[idx]);
        const eye2Pts = EYELID_2.map((idx) => landmarks[idx]);
        const texImg = textureCacheRef.current[activeColor?.id || 'miel'];

        renderOjoRealista(ctx, vw, vh, smoothedA.current, eye1Pts, texImg, activeIntensidad, activeTamano);
        renderOjoRealista(ctx, vw, vh, smoothedB.current, eye2Pts, texImg, activeIntensidad, activeTamano);
      } else {
        setRostroDetectado(false);
      }

      if (activeModoComparar && copyCanvas) {
        const splitPx = (vw * activeCompararX) / 100;
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, splitPx, vh);
        ctx.clip();
        ctx.drawImage(copyCanvas, 0, 0);
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = '#B08D57';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(splitPx, 0);
        ctx.lineTo(splitPx, vh);
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();
    }

    animationFrameRef.current = requestAnimationFrame(bucleVideo);
  }, [renderOjoRealista]);

  // Iniciar / Detener cámara con espera a loadeddata
  const activarCamara = async () => {
    try {
      setModoEntrada('camara');
      setErrorMensaje(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        try {
          await video.play();
        } catch (playErr) {
          console.warn('Esperando interacción para video.play():', playErr);
        }

        // Esperar loadeddata si aún no está listo
        if (video.readyState < 2) {
          await new Promise((resolve) => {
            const onLoaded = () => {
              video.removeEventListener('loadeddata', onLoaded);
              resolve();
            };
            video.addEventListener('loadeddata', onLoaded);
          });
        }

        if (landmarkerRef.current) {
          landmarkerRef.current.setOptions({ runningMode: 'VIDEO' });
        }
        setCamaraActiva(true);
      }
    } catch (err) {
      console.warn('Permiso de cámara denegado o no disponible:', err);
      setErrorMensaje('Activa la cámara en la configuración de tu navegador para usar esta función');
      setModoEntrada('modelo');
      setCamaraActiva(false);
    }
  };

  // Efecto que lanza bucleVideo al activarse la cámara (el canvas ya existe)
  useEffect(() => {
    if (camaraActiva) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(bucleVideo);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [camaraActiva, bucleVideo]);

  const detenerCamara = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setCamaraActiva(false);
  };

  // Limpieza al desmontar componente
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((t) => t.stop());
      }
    };
  }, []);

  // Subir foto propia
  const handleSubirFoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    detenerCamara();
    setModoEntrada('foto');
    const url = URL.createObjectURL(file);
    setFotoSubidaSrc(url);

    const img = new Image();
    img.src = url;
    img.onload = () => {
      modelImgRef.current = img;
      if (landmarkerRef.current) {
        landmarkerRef.current.setOptions({ runningMode: 'IMAGE' });
      }
      procesarImagenEstatica(img);
    };
  };

  // Capturar foto boutique con marco
  const tomarFotoBoutique = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    // Crear canvas con marco y firma
    const photoCanvas = document.createElement('canvas');
    const border = 32;
    photoCanvas.width = canvas.width + border * 2;
    photoCanvas.height = canvas.height + border * 2 + 60;
    const pctx = photoCanvas.getContext('2d');

    // Fondo ébano
    pctx.fillStyle = '#0E0D0C';
    pctx.fillRect(0, 0, photoCanvas.width, photoCanvas.height);

    // Borde interior dorado fino
    pctx.strokeStyle = '#B08D57';
    pctx.lineWidth = 1.5;
    pctx.strokeRect(border - 6, border - 6, canvas.width + 12, canvas.height + 12);

    // Dibujar escena
    pctx.drawImage(canvas, border, border);

    // Pie con marca
    pctx.fillStyle = '#E8DCC4';
    pctx.font = '300 20px Cormorant Garamond, serif';
    pctx.textAlign = 'center';
    pctx.fillText(`PUPILENTES AGO · ${colorActivo.nombre.toUpperCase()}`, photoCanvas.width / 2, photoCanvas.height - 38);

    pctx.fillStyle = '#9A8F82';
    pctx.font = '400 11px Plus Jakarta Sans, sans-serif';
    pctx.fillText('Simulación Virtual · CDMX', photoCanvas.width / 2, photoCanvas.height - 18);

    // Descargar
    const link = document.createElement('a');
    link.download = `pupilentes-ago-${colorActivo.id}.png`;
    link.href = photoCanvas.toDataURL('image/png');
    link.click();
    showToast('Foto boutique descargada en alta resolución', 'success');
  };

  // Agregar modelo actual al carrito
  const handleComprarModelo = () => {
    const prod = productos.find((p) => p.familia === colorActivo.familia) || productos[0];
    agregarAlCarrito(prod, '0.00', '0.00', 1);
    showToast(`Lente ${colorActivo.nombre} agregado al carrito`, 'success');
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* ========================================================
          COLUMNA IZQUIERDA (8/12): ESCENARIO PRINCIPAL HORIZONTAL
          ======================================================== */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        {/* Barra superior de entrada: Cámara y Subir Foto */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-espresso border border-cocoa">
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-sand font-medium">
              Modo de prueba:
            </span>
            <button
              onClick={() => {
                if (camaraActiva) {
                  detenerCamara();
                } else {
                  activarCamara();
                }
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs transition-all font-medium ${
                camaraActiva
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'bg-brass text-ink font-semibold shadow-md hover:bg-gilt'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>{camaraActiva ? 'Apagar cámara web' : 'Activar mi cámara web'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs bg-ink text-sand hover:text-gilt border border-cocoa cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Subir mi foto</span>
              <input type="file" accept="image/*" onChange={handleSubirFoto} className="hidden" />
            </label>
          </div>
        </div>

        {/* Lienzo de visualización HORIZONTAL (Aspect-Video para Webcam) */}
        <div className="relative w-full aspect-[4/5] sm:aspect-video rounded-[24px] overflow-hidden bg-espresso border border-cocoa flex items-center justify-center shadow-2xl">
          {/* Video oculto para streaming */}
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="absolute w-px h-px opacity-0 pointer-events-none"
          />

          {/* Canvas reactivo siempre renderizado */}
          <canvas
            ref={canvasRef}
            className={`w-full h-full object-contain transition-opacity duration-300 ${
              camaraActiva || fotoSubidaSrc ? 'opacity-100' : 'opacity-0'
            } ${modoEntrada === 'camara' ? 'scale-x-[-1]' : ''}`}
          />

          {/* Estado de espera antes de activar cámara */}
          {!camaraActiva && !fotoSubidaSrc && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-br from-espresso via-ink to-espresso gap-4 z-10">
              <div className="w-16 h-16 rounded-full bg-brass/10 border border-brass/30 flex items-center justify-center text-brass shadow-lg">
                <Camera className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-md">
                <h3 className="font-serif text-2xl text-champagne font-light">
                  Probador en Vivo de Pupilentes
                </h3>
                <p className="text-xs text-stone font-light leading-relaxed">
                  Activa tu cámara web para probarte cualquiera de los tonos en tiempo real con detección biométrica de tu mirada.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={activarCamara}
                  className="btn-brass text-xs"
                >
                  <Camera className="w-4 h-4 mr-1.5" />
                  <span>Iniciar Cámara</span>
                </button>
              </div>
            </div>
          )}

          {/* Loader elegante inicial */}
          {cargandoModelo && modoEntrada !== 'catalogo' && (
            <div className="absolute inset-0 bg-ink/90 flex flex-col items-center justify-center gap-3 z-20">
              <RefreshCw className="w-6 h-6 text-brass animate-spin" />
              <span className="text-xs uppercase tracking-widest text-sand">
                Calibrando probador biométrico...
              </span>
            </div>
          )}

          {/* Alerta si el rostro no se detecta (solo en cámara o foto) */}
          {!rostroDetectado && !cargandoModelo && modoEntrada !== 'catalogo' && (
            <div className="absolute bottom-5 inset-x-5 flex justify-center z-10 pointer-events-none">
              <div className="px-4 py-2 rounded-full bg-ink/90 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2 backdrop-blur-md">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>{errorMensaje || 'Centra tu rostro con buena iluminación frontal'}</span>
              </div>
            </div>
          )}

          {/* Divisor interactivo antes / después */}
          {modoComparar && (
            <div className="absolute inset-x-0 bottom-4 flex justify-center z-20">
              <div className="px-4 py-2 rounded-full bg-ink/90 border border-brass/40 text-xs text-sand flex items-center gap-3 backdrop-blur-md">
                <span>Antes</span>
                <input
                  type="range"
                  min="5"
                  max="95"
                  value={compararX}
                  onChange={(e) => setCompararX(parseFloat(e.target.value))}
                  className="w-40 accent-brass cursor-pointer"
                />
                <span>Con {colorActivo.nombre}</span>
              </div>
            </div>
          )}
        </div>

        {/* Selector de Pupilente (Tono) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="uppercase tracking-[0.16em] text-sand font-medium">
              Elegir Tono de Pupilente:
            </span>
            <span className="text-stone">8 tonos disponibles</span>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {LISTA_IRIS.map((iris) => {
              const isSelected = colorActivo.id === iris.id;
              return (
                <button
                  key={iris.id}
                  onClick={() => {
                    setColorActivo(iris);
                  }}
                  className={`shrink-0 flex items-center gap-2.5 px-3.5 py-2 rounded-full border transition-all ${
                    isSelected
                      ? 'bg-brass text-ink border-brass font-semibold shadow-md scale-105'
                      : 'bg-espresso/80 text-champagne border-cocoa hover:border-brass/40'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/30 shadow-inner"
                    style={{ backgroundColor: iris.hex }}
                  />
                  <span className="text-xs font-serif">{iris.nombre}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================
          COLUMNA DERECHA (4/12): PANEL DE CONTROL & CONFIGURACIÓN
          ======================================================== */}
      <div className="lg:col-span-4 bg-espresso/70 border border-cocoa rounded-[24px] p-6 space-y-6 shadow-xl">
        {/* Producto Seleccionado */}
        <div className="border-b border-cocoa pb-5 space-y-2">
          <span className="text-[10px] uppercase tracking-[0.2em] text-sand font-medium">
            Pupilente Seleccionado
          </span>
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl text-champagne font-light">
              {colorActivo.nombre}
            </h2>
            <span className="font-sans text-base text-sand font-semibold">
              $649.00 MXN
            </span>
          </div>
          <p className="text-xs text-stone font-light">
            {colorActivo.desc}
          </p>
        </div>

        {/* Sliders de Ajuste Fino */}
        <div className="space-y-4">
          <span className="text-xs uppercase tracking-wider text-sand block font-medium">
            Calibración Óptica
          </span>

          {/* Intensidad de Mezcla */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-stone">
              <span>Opacidad del Tono:</span>
              <span className="font-mono text-champagne">{Math.round(intensidad * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.4"
              max="1.0"
              step="0.02"
              value={intensidad}
              onChange={(e) => setIntensidad(parseFloat(e.target.value))}
              className="w-full accent-brass cursor-pointer"
            />
          </div>

          {/* Apertura de Pupila */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-stone">
              <span>Apertura de Pupila:</span>
              <span className="font-mono text-champagne">{Math.round(tamanoPupila * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.25"
              max="0.52"
              step="0.01"
              value={tamanoPupila}
              onChange={(e) => setTamanoPupila(parseFloat(e.target.value))}
              className="w-full accent-brass cursor-pointer"
            />
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="pt-2 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setModoComparar(!modoComparar)}
              className={`py-2.5 rounded-full text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                modoComparar
                  ? 'bg-brass text-ink border-brass'
                  : 'bg-ink text-sand border-cocoa hover:border-brass/50'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>{modoComparar ? 'Ocultar división' : 'Comparar'}</span>
            </button>

            <button
              onClick={tomarFotoBoutique}
              className="py-2.5 rounded-full text-xs font-medium bg-ink text-sand border border-cocoa hover:border-brass/50 flex items-center justify-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tomar Foto</span>
            </button>
          </div>

          <button
            onClick={handleComprarModelo}
            className="w-full btn-brass py-3 flex items-center justify-center gap-2 shadow-lg"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Agregar {colorActivo.nombre} al Carrito</span>
          </button>
        </div>

        {/* Nota legal y de privacidad */}
        <div className="pt-3 border-t border-cocoa/60 text-[11px] text-stone/70 text-center space-y-1">
          <p>Tu imagen se procesa 100% en tu dispositivo y nunca se envía a servidores.</p>
          <p className="italic text-sand/60">Simulación visual aproximada con fines ilustrativos.</p>
        </div>
      </div>
    </div>
  );
};

export default LiveTester;
