import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { PRODUCTOS_INICIALES } from '../data/productos';
import { TODOS_LOS_PEDIDOS_DEMO } from '../data/pedidos';
import { CLIENTAS_INICIALES } from '../data/clientas';
import { ACCESORIOS } from '../data/accesorios';
import { AJUSTES_INICIALES } from '../data/ajustesIniciales';
import { limpiarTodasLasImagenes } from '../lib/imageStorage';
import { normalizarEstado, normalizarPedido, PESOS_POR_PUNTO_GANADO } from '../lib/estados';
import { normalizarTelefono } from '../lib/auth';

const PEDIDOS_SEMILLA = TODOS_LOS_PEDIDOS_DEMO.map(normalizarPedido);
const CLIENTA_INVITADA = { id: null, nombre: '', telefono: '', email: '', puntos: 0, nivel: 'Nueva' };
const mismoTel = (a, b) => !!a && !!b && normalizarTelefono(a) === normalizarTelefono(b);
const formatearTel = (tel) => {
  const d = (tel || '').replace(/\D/g, '').slice(-10);
  return d.length === 10 ? `${d.slice(0, 2)} ${d.slice(2, 6)} ${d.slice(6)}` : tel;
};
const generarCodigo = () => String(Math.floor(100000 + Math.random() * 900000));

export const useStore = create(
  persist(
    (set, get) => ({
      // Estado de datos compartidos
      productos: PRODUCTOS_INICIALES,
      pedidos: PEDIDOS_SEMILLA,
      clientas: CLIENTAS_INICIALES,
      accesorios: ACCESORIOS,
      ajustes: AJUSTES_INICIALES,

      // Estado de la clienta en la tienda
      carrito: [],
      cuponAplicado: null,
      puntosCanjeados: 0,
      telefono: null, // Sesión de clienta (teléfono verificado por WhatsApp)
      clientaActual: CLIENTA_INVITADA,

      // --- Acceso sin contraseña por WhatsApp (OTP) ---
      // Producción: el backend genera el código, lo guarda con hash y lo envía con la
      // WhatsApp Cloud API (plantilla de autenticación) desde el número de Pupilentes AGO.
      // Demo: el código se genera aquí y se muestra como notificación simulada de WhatsApp.
      otpPendiente: null, // { telefono, codigo, expira, intentos }
      mensajeWhatsappDemo: null, // { de, texto, codigo, id }
      solicitarOtp: (tel) => {
        const digits = (tel || '').replace(/\D/g, '');
        if (digits.length !== 10) return { ok: false, error: 'Escribe tu WhatsApp a 10 dígitos' };
        const codigo = generarCodigo();
        set({
          otpPendiente: { telefono: formatearTel(digits), codigo, expira: Date.now() + 5 * 60 * 1000, intentos: 0 },
          mensajeWhatsappDemo: {
            id: Date.now(),
            de: 'Pupilentes AGO',
            codigo,
            texto: `${codigo} es tu código de verificación de Pupilentes AGO. Vence en 5 minutos. No lo compartas con nadie.`
          }
        });
        return { ok: true };
      },
      cerrarMensajeWhatsappDemo: () => set({ mensajeWhatsappDemo: null }),
      verificarOtp: (codigo) => {
        const otp = get().otpPendiente;
        if (!otp) return { ok: false, error: 'Solicita un código primero' };
        if (Date.now() > otp.expira) return { ok: false, error: 'El código venció. Pide uno nuevo.' };
        if (otp.intentos >= 4) return { ok: false, error: 'Demasiados intentos. Pide un código nuevo.' };
        if (String(codigo).trim() !== otp.codigo) {
          set({ otpPendiente: { ...otp, intentos: otp.intentos + 1 } });
          return { ok: false, error: 'Código incorrecto' };
        }
        get().iniciarSesionClienta(otp.telefono);
        set({ otpPendiente: null, mensajeWhatsappDemo: null });
        return { ok: true };
      },
      iniciarSesionClienta: (tel) => {
        const state = get();
        let clienta = state.clientas.find((c) => mismoTel(c.telefono, tel));
        let clientas = state.clientas;
        if (!clienta) {
          clienta = {
            id: `cli-${Date.now()}`,
            nombre: '',
            telefono: formatearTel(tel),
            email: '',
            ciudad: 'CDMX',
            puntos: 0,
            nivel: 'Nueva',
            totalGastado: 0,
            pedidosCount: 0,
            fechaRegistro: new Date().toISOString().substring(0, 10),
            notas: 'Registrada desde la tienda online (acceso por WhatsApp).'
          };
          clientas = [clienta, ...clientas];
        }
        set({ telefono: clienta.telefono, clientaActual: clienta, clientas });
      },
      actualizarPerfilClienta: (patch) => {
        const actual = get().clientaActual;
        if (!actual?.id) return;
        const nueva = { ...actual, ...patch };
        set((state) => ({
          clientaActual: nueva,
          clientas: state.clientas.map((c) => (c.id === nueva.id ? nueva : c))
        }));
      },
      canjearRecompensa: (puntos, nombre) => {
        const actual = get().clientaActual;
        if (!actual?.id || actual.puntos < puntos) {
          get().showToast('Aún no tienes puntos suficientes', 'warn');
          return false;
        }
        get().actualizarPerfilClienta({ puntos: actual.puntos - puntos });
        get().showToast(`Canjeaste ${nombre}. Se agregará a tu próximo pedido.`, 'success');
        return true;
      },
      cerrarSesionCliente: () => set({ telefono: null, clientaActual: CLIENTA_INVITADA, otpPendiente: null }),

      // Rol de demostración ("clienta" o "duena")
      rolActual: "clienta",

      // Simulador de avance de tiempo (+20 días para ver renovaciones)
      diasOffsetSimulados: 0,

      // Notificaciones Toast flotantes
      toast: null,
      showToast: (mensaje, tipo = "info") => {
        set({ toast: { mensaje, tipo, id: Date.now() } });
        setTimeout(() => {
          set((state) => (state.toast?.mensaje === mensaje ? { toast: null } : state));
        }, 4000);
      },
      hideToast: () => set({ toast: null }),

      // Selector de rol
      setRol: (rol) => set({ rolActual: rol }),

      // Carrito de compras
      agregarAlCarrito: (item) => {
        set((state) => {
          // Si el mismo producto con misma graduación OD y OI ya está, incrementa cantidad
          const existenteIndex = state.carrito.findIndex(
            (c) => c.productoId === item.productoId && c.od === item.od && c.oi === item.oi && c.tipoCompra === item.tipoCompra
          );

          if (existenteIndex >= 0) {
            const nuevoCarrito = [...state.carrito];
            nuevoCarrito[existenteIndex].cantidad += (item.cantidad || 1);
            return { carrito: nuevoCarrito };
          } else {
            return {
              carrito: [
                ...state.carrito,
                {
                  ...item,
                  cartItemId: `${item.productoId}_${item.od}_${item.oi}_${Date.now()}`,
                  cantidad: item.cantidad || 1
                }
              ]
            };
          }
        });
        get().showToast(`Se agregó "${item.nombre}" al carrito`, "success");
      },

      actualizarCantidadCarrito: (cartItemId, nuevaCantidad) => {
        set((state) => {
          if (nuevaCantidad <= 0) {
            return { carrito: state.carrito.filter((item) => item.cartItemId !== cartItemId) };
          }
          return {
            carrito: state.carrito.map((item) =>
              item.cartItemId === cartItemId ? { ...item, cantidad: nuevaCantidad } : item
            )
          };
        });
      },

      actualizarItemCarrito: (cartItemId, campos) => {
        set((state) => ({
          carrito: state.carrito.map((item) =>
            item.cartItemId === cartItemId ? { ...item, ...campos } : item
          )
        }));
      },

      eliminarDelCarrito: (cartItemId) => {
        set((state) => ({
          carrito: state.carrito.filter((item) => item.cartItemId !== cartItemId)
        }));
      },

      vaciarCarrito: () => set({ carrito: [], cuponAplicado: null, puntosCanjeados: 0 }),

      aplicarCupon: (codigo) => {
        const codigoNormalizado = codigo.trim().toUpperCase();
        if (codigoNormalizado === "AGOPRIMERA") {
          set({ cuponAplicado: { codigo: "AGOPRIMERA", porcentaje: 10, valorFijo: 0, descripcion: "10% de bienvenida" } });
          get().showToast("¡Cupón AGOPRIMERA aplicado: 10% de descuento!", "success");
          return true;
        } else if (codigoNormalizado === "AGO100") {
          set({ cuponAplicado: { codigo: "AGO100", porcentaje: 0, valorFijo: 100, descripcion: "$100 de regalo" } });
          get().showToast("¡Cupón aplicado: $100 MXN de descuento!", "success");
          return true;
        } else {
          get().showToast("El cupón ingresado no es válido o ha expirado", "warn");
          return false;
        }
      },

      removerCupon: () => set({ cuponAplicado: null }),

      canjearPuntos: (puntos) => {
        set({ puntosCanjeados: puntos });
        get().showToast(`Canjeados ${puntos} puntos ($${Math.floor(puntos / 3)} MXN)`, "success");
      },

      // Flujo de compra: Crear Pedido y descontar stock en vivo
      crearPedido: (datosPedido) => {
        const state = get();
        const siguienteNumero = state.pedidos.length + 1063;
        const nuevoId = `AGO-${siguienteNumero}`;

        const nuevoPedido = {
          id: nuevoId,
          fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
          estado: "verificar_comprobante",
          ...datosPedido
        };

        // Descontar inventario por cada graduación y ojo
        const nuevosProductos = state.productos.map((prod) => {
          let stockActualizado = { ...prod.stockPorGraduacion };
          let fueModificado = false;

          datosPedido.items.forEach((item) => {
            if (item.productoId === prod.id) {
              const cant = item.cantidad || 1;
              if (item.od && stockActualizado[item.od] !== undefined) {
                stockActualizado[item.od] = Math.max(0, stockActualizado[item.od] - cant);
                fueModificado = true;
              }
              if (item.oi && stockActualizado[item.oi] !== undefined) {
                stockActualizado[item.oi] = Math.max(0, stockActualizado[item.oi] - cant);
                fueModificado = true;
              }
            }
          });

          return fueModificado ? { ...prod, stockPorGraduacion: stockActualizado } : prod;
        });

        // Sumar puntos a la clienta (1 punto por cada $10)
        const puntosGanados = Math.floor(datosPedido.total / PESOS_POR_PUNTO_GANADO);
        const clientaActualizada = state.clientaActual?.id
          ? {
              ...state.clientaActual,
              puntos: Math.max(0, (state.clientaActual.puntos || 0) - state.puntosCanjeados + puntosGanados),
              pedidosCount: (state.clientaActual.pedidosCount || 0) + 1,
              totalGastado: (state.clientaActual.totalGastado || 0) + (datosPedido.total || 0)
            }
          : state.clientaActual;

        set({
          clientas: clientaActualizada?.id
            ? state.clientas.map((c) => (c.id === clientaActualizada.id ? clientaActualizada : c))
            : state.clientas,
          pedidos: [nuevoPedido, ...state.pedidos],
          productos: nuevosProductos,
          clientaActual: clientaActualizada,
          carrito: [],
          cuponAplicado: null,
          puntosCanjeados: 0
        });

        get().showToast(`¡Pedido ${nuevoId} creado con éxito! Se reflejó en el panel.`, "success");
        return nuevoPedido;
      },

      // Acciones del Panel de Araceli
      actualizarEstadoPedido: (pedidoId, estadoPedido) => {
        const nuevoEstado = normalizarEstado(estadoPedido);
        set((state) => ({
          pedidos: state.pedidos.map((p) =>
            p.id === pedidoId ? { ...p, estado: nuevoEstado } : p
          )
        }));
        get().showToast(`Pedido ${pedidoId} movido a "${nuevoEstado.replace('_', ' ').toUpperCase()}"`, "info");
      },

      actualizarPedido: (pedidoId, patch) => {
        set((state) => ({
          pedidos: state.pedidos.map((p) =>
            p.id === pedidoId ? { ...p, ...patch } : p
          )
        }));
      },

      agregarPedidoManual: (pedidoManual) => {
        const state = get();
        const nuevoId = `AGO-${state.pedidos.length + 1063}`;
        const nuevoPedido = {
          id: nuevoId,
          fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
          ...pedidoManual
        };

        // Descontar inventario
        const nuevosProductos = state.productos.map((prod) => {
          let stockActualizado = { ...prod.stockPorGraduacion };
          let fueModificado = false;

          (pedidoManual.items || []).forEach((item) => {
            if (item.productoId === prod.id) {
              const cant = item.cantidad || 1;
              if (item.od && stockActualizado[item.od] !== undefined) {
                stockActualizado[item.od] = Math.max(0, stockActualizado[item.od] - cant);
                fueModificado = true;
              }
              if (item.oi && stockActualizado[item.oi] !== undefined) {
                stockActualizado[item.oi] = Math.max(0, stockActualizado[item.oi] - cant);
                fueModificado = true;
              }
            }
          });

          return fueModificado ? { ...prod, stockPorGraduacion: stockActualizado } : prod;
        });

        set({
          pedidos: [nuevoPedido, ...state.pedidos],
          productos: nuevosProductos
        });
        get().showToast(`Venta manual registrada: ${nuevoId}`, "success");
        return nuevoPedido;
      },

      actualizarStock: (productoId, graduacion, nuevoValor) => {
        set((state) => ({
          productos: state.productos.map((prod) => {
            if (prod.id !== productoId) return prod;
            return {
              ...prod,
              stockPorGraduacion: {
                ...prod.stockPorGraduacion,
                [graduacion]: Math.max(0, Number(nuevoValor) || 0)
              }
            };
          })
        }));
      },

      actualizarProducto: (productoActualizado) => {
        set((state) => ({
          productos: state.productos.map((p) =>
            p.id === productoActualizado.id ? productoActualizado : p
          )
        }));
        get().showToast(`Modelo "${productoActualizado.nombre}" actualizado en tienda`, "success");
      },

      agregarProducto: (nuevoProducto) => {
        set((state) => ({
          productos: [nuevoProducto, ...state.productos]
        }));
        get().showToast(`Nuevo modelo "${nuevoProducto.nombre}" publicado en la tienda`, "success");
      },

      eliminarProducto: (productoId) => {
        set((state) => ({
          productos: state.productos.filter((p) => p.id !== productoId)
        }));
        get().showToast("Modelo retirado del catálogo", "warn");
      },

      importarProductos: (nuevosProductos) => {
        set({ productos: nuevosProductos });
        get().showToast("Inventario importado exitosamente desde Excel", "success");
      },

      // Avanzar tiempo para demo de recordatorios de renovación
      avanzarDiasSimulados: (dias) => {
        set((state) => ({
          diasOffsetSimulados: state.diasOffsetSimulados + dias
        }));
        get().showToast(`Se avanzó el calendario demo +${dias} días`, "info");
      },

      ajustarPuntosClienta: (clientaId, puntosDelta) => {
        set((state) => ({
          clientas: state.clientas.map((c) =>
            c.id === clientaId ? { ...c, puntos: Math.max(0, c.puntos + puntosDelta) } : c
          )
        }));
        get().showToast("Puntos de clienta actualizados", "success");
      },

      actualizarAjustes: (patch) => {
        set((state) => ({
          ajustes: { ...state.ajustes, ...patch }
        }));
        get().showToast("Ajustes guardados correctamente", "success");
      },

      // Botón: Resetear demo
      resetearDemo: () => {
        limpiarTodasLasImagenes();
        try {
          localStorage.removeItem('pupilentes_ago_storage_v1');
          localStorage.removeItem('pupilentes_ago_storage_v5');
          localStorage.removeItem('pupilentes_ago_storage_v6');
          localStorage.removeItem('ago_sesion_clienta');
          localStorage.removeItem('ago_otp_pending');
        } catch (e) {}
        set({
          productos: PRODUCTOS_INICIALES,
          pedidos: PEDIDOS_SEMILLA,
          clientas: CLIENTAS_INICIALES,
          accesorios: ACCESORIOS,
          ajustes: AJUSTES_INICIALES,
          carrito: [],
          cuponAplicado: null,
          puntosCanjeados: 0,
          telefono: null,
          clientaActual: CLIENTA_INVITADA,
          otpPendiente: null,
          mensajeWhatsappDemo: null,
          diasOffsetSimulados: 0
        });
        get().showToast("Demo reseteada a valores iniciales de fábrica", "info");
      }
    }),
    {
      name: 'pupilentes_ago_storage_v6',
      version: 6,
      migrate: (persistedState, version) => {
        // Si la versión es anterior a 5 o estado corrupto, descartar y rehidratar de semilla
        if (!version || version < 6 || !persistedState?.productos?.some((p) => p.tipo)) {
          return {
            productos: PRODUCTOS_INICIALES,
            pedidos: PEDIDOS_SEMILLA,
            clientas: CLIENTAS_INICIALES,
            accesorios: ACCESORIOS,
            ajustes: AJUSTES_INICIALES,
            carrito: [],
            cuponAplicado: null,
            puntosCanjeados: 0,
            telefono: null,
            clientaActual: CLIENTA_INVITADA,
            rolActual: 'clienta',
            diasOffsetSimulados: 0
          };
        }
        return persistedState;
      },
      // No persistir el código OTP ni la notificación simulada
      partialize: (state) => {
        const { otpPendiente, mensajeWhatsappDemo, toast, ...resto } = state;
        return resto;
      },
      storage: createJSONStorage(() => localStorage)
    }
  )
);

