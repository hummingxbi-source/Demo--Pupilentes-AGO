import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowRight, Train, Package, Sparkles } from 'lucide-react';
import { Iris, LOGO, TLink } from '../ui';
import { A } from '../lib/catalog';

gsap.registerPlugin(ScrollTrigger);

// Historia de DEMO (texto inventado): reemplazar con la historia real de la marca.
const CAPS = [
  ['2019', 'Un espejo y una idea', 'Empezamos vendiendo a amigas por Instagram desde el oriente de la CDMX. Cada par se probaba frente al espejo antes de recomendarlo.', <Iris key="i" fam="cafe" style={{ width: '46%' }} />],
  ['2020', 'Entregas en el Metro', 'Cuando todo cerró, empezamos a entregar en persona en Pantitlán y Tepalcates. Hoy sigue siendo gratis.', <Train key="t" size={90} strokeWidth={1} />],
  ['2022', 'Color también con graduación', 'Muchas clientas con miopía no encontraban color. Sumamos graduación de −0.50 a −8.00, distinta en cada ojo.', <img key="m" src={A('img/lookbook/breeze-green-1-mirada.webp')} alt="" />],
  ['2024', 'Todo México', 'Envíos con guía a todos los estados, tienda en Mercado Libre y una comunidad que crece en TikTok.', <Package key="p" size={90} strokeWidth={1} />],
  ['2026', 'Tu tienda en línea', 'Ahora eliges tu tono, cotizas tu envío y sigues tu pedido tú misma. Y sumas puntos en cada compra.', <div key="c" className="mock-shop" aria-label="Tienda en línea de Pupilentes AGO">
    <div className="bar"><i /><i /><i /><span>pupilentesago.mx/tienda</span></div>
    <div className="body"><b>Elige tu <em>tono</em></b>
      <div className="g">{['azul', 'verde', 'cafe', 'gris'].map((f) => <div key={f} className="c"><Iris fam={f} glint={false} /><span /></div>)}</div>
      <div className="cta">Agregar a la bolsa · $549</div></div>
  </div>],
];
const VALORES = [
  ['verde', 'Honestidad', 'Si un tono no te va, te lo decimos. Preferimos una clienta feliz que una venta rápida.'],
  ['azul', 'Cuidado', 'Revisamos graduación, empaque y existencia de cada par antes de que salga.'],
  ['gris', 'Cercanía', 'Te contestan personas, no robots. Por WhatsApp, de lunes a sábado.'],
];
const FRASE = 'Queremos que cambies el color de tus ojos, nunca tu forma de mirar.';

export default function Nosotros() {
  const root = useRef();
  useGSAP(() => {
    gsap.from('.ns-hero h1 .ln > span', { yPercent: 115, duration: 1.3, ease: 'expo.out', stagger: 0.1, delay: 1 });
    gsap.from('.ns-hero .coin', { scale: 0.6, rotate: -120, opacity: 0, duration: 1.8, ease: 'expo.out', delay: 1.1 });
    gsap.from('.ns-hero .reveal', { y: 24, opacity: 0, duration: 1, delay: 1.5, ease: 'expo.out' });
    gsap.to('.ns-hero .coin-wrap', { rotate: 120, y: 160, ease: 'none', scrollTrigger: { trigger: '.ns-hero', start: 'top top', end: 'bottom top', scrub: true } });
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const track = document.querySelector('.ns-tl-track');
      const dist = () => track.scrollWidth - innerWidth + 40;
      const tw = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '.ns-tl-pin', start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 0.8, invalidateOnRefresh: true } });
      gsap.utils.toArray('.ns-ch').forEach((ch) => gsap.from(ch.querySelectorAll('.yr, h3, p, .vis'), { y: 60, opacity: 0, stagger: 0.08, ease: 'expo.out', duration: 1, scrollTrigger: { trigger: ch, containerAnimation: tw, start: 'left 85%' } }));
    });
    gsap.utils.toArray('.ns-val').forEach((v, i) => gsap.from(v, { y: 60, opacity: 0, duration: 1, delay: i * 0.1, ease: 'expo.out', scrollTrigger: { trigger: '.ns-vals-grid', start: 'top 80%' } }));
    gsap.to('.ns-quote .w', { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: '.ns-quote p', start: 'top 80%', end: 'bottom 50%', scrub: true } });
    return () => mm.revert();
  }, { scope: root });

  return (
    <main ref={root}>
      <section className="ns-hero">
        <div className="coin-wrap"><img className="coin" src={LOGO} alt="" /></div>
        <div className="wrap">
          <p className="eyebrow reveal" style={{ color: 'var(--gold-l)', marginBottom: 20 }}>Nosotros</p>
          <h1><span className="ln"><span>Una tienda</span></span><span className="ln"><span>pequeña, con</span></span><span className="ln"><span className="it" style={{ color: 'var(--gold-l)' }}>mirada grande.</span></span></h1>
          <p className="reveal" style={{ color: 'rgba(251,250,247,.7)', maxWidth: '46ch', marginTop: 24 }}>Somos Pupilentes AGO: una tienda de pupilentes de color nacida en la CDMX. Esta es nuestra historia.</p>
        </div>
      </section>
      <section className="ns-tl">
        <div className="ns-tl-pin">
          <div className="wrap" style={{ width: '100%', marginBottom: 30 }}><p className="eyebrow">Nuestra historia</p></div>
          <div className="ns-tl-track">
            {CAPS.map(([y, t, d, v]) => (
              <article className="ns-ch" key={y}><span className="yr">{y}</span><div className="vis">{v}</div><h3>{t}</h3><p>{d}</p></article>
            ))}
          </div>
        </div>
      </section>
      <section className="ns-vals"><div className="wrap">
        <p className="eyebrow" style={{ color: 'var(--gold-l)' }}>Lo que nos importa</p>
        <h2 className="h-l" style={{ marginTop: 12 }}>Tres cosas que <span className="it" style={{ color: 'var(--gold-l)' }}>no negociamos.</span></h2>
        <div className="ns-vals-grid">{VALORES.map(([f, t, d]) => <div className="ns-val" key={t}><Iris fam={f} /><h3>{t}</h3><p>{d}</p></div>)}</div>
      </div></section>
      <section className="ns-quote"><div className="wrap">
        <Sparkles className="gold" size={28} style={{ marginBottom: 24 }} />
        <p>{FRASE.split(' ').map((w, i) => <span className="w" key={i}>{w} </span>)}</p>
        <TLink to="/tienda" className="btn" style={{ marginTop: 40 }}>Ver la tienda <ArrowRight size={18} /></TLink>
      </div></section>
    </main>
  );
}
