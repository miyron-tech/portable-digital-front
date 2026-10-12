import type { ServiceCategory } from '@/lib/types';
import { serviceDetailArt } from './ServiceDetailArt';

function point(x: number, y: number, z: number) { return `${180 + (x - y) * .87},${183 + (x + y) * .43 - z}`; }
function Box({ x = 0, y = 0, z = 0, w = 90, d = 90, h = 16, accent = false }: { x?: number; y?: number; z?: number; w?: number; d?: number; h?: number; accent?: boolean }) {
  const a = point(x, y, z + h), b = point(x + w, y, z + h), c = point(x + w, y + d, z + h), e = point(x, y + d, z + h);
  return <g className={accent ? 'iso-box iso-accent' : 'iso-box'}>
    <polygon points={`${a} ${e} ${point(x, y + d, z)} ${point(x, y, z)}`} className="iso-side" />
    <polygon points={`${e} ${c} ${point(x + w, y + d, z)} ${point(x, y + d, z)}`} className="iso-side" />
    <polygon points={`${a} ${b} ${c} ${e}`} className="iso-top" />
  </g>;
}
function Screen({ x = 0, y = 0, z = 0, mobile = false }: { x?: number; y?: number; z?: number; mobile?: boolean }) {
  return <g transform={`translate(${x} ${y})`}><g className="iso-floating">
    <g transform={`translate(100 ${63 - z}) matrix(.87 .43 0 1 0 0)`}>
      <rect width={mobile ? 80 : 166} height={mobile ? 142 : 112} rx="5" className="iso-top" />
      <path d={mobile ? 'M0 19H80' : 'M0 19H166'} />
      <circle cx="10" cy="10" r="1.4" className="iso-lit" /><circle cx="17" cy="10" r="1.4" /><circle cx="24" cy="10" r="1.4" />
      <rect x="12" y="32" width={mobile ? 56 : 47} height="49" rx="2" />
      {mobile ? <><path d="M12 94H64M12 103H51" /><rect x="12" y="115" width="35" height="10" rx="2" className="iso-accent" /></> : <><path d="M74 36H148M74 47H131M74 58H140M74 78H122M12 95H65" /><path d="m25 49-8 7 8 7m18-14 8 7-8 7m-8-17-5 21" className="iso-accent" /><rect x="122" y="88" width="29" height="10" rx="2" className="iso-accent" /></>}
    </g>
  </g></g>;
}

export function ServiceIllustration({ category, slug = '' }: { category: ServiceCategory; slug?: string }) {
  const detail = serviceDetailArt(slug);
  return <svg viewBox="0 0 360 300" fill="none" className={`service-illustration illustration-${category}`} aria-hidden="true">
    <g className="iso-guides"><path d="m33 228 147 73 147-73M180 19v25M23 178l20 10M317 188l20-10" /><path d="M174 281h12m-6-6v12" /></g>
    <g className="iso-drawing" strokeLinejoin="round" strokeLinecap="round">
      {detail || <>
      {category === 'development' && <>
        <Box x={-68} y={-53} w={144} d={118} z={-5} h={9} />
        <g className="iso-rear"><Screen x={-20} y={-15} z={4} mobile={slug.includes('mobile')} /></g>
        <Screen x={12} y={13} mobile={slug.includes('mobile')} />
        <path d="m132 241 29 14 27-13" className="iso-accent" />
      </>}
      {category === 'design' && <>
        {[0, 1, 2, 3].map((n) => <g key={n}><Box x={-68} y={-68} w={136} d={136} z={n * 23} h={8} accent={n === 2} /></g>)}
        <g className="iso-floating"><g transform="translate(180 95) matrix(.87 .43 -.87 .43 0 0)"><rect x="-43" y="-43" width="86" height="86" rx="2" /><path d="M-43-17H43M-12-17V43" /><rect x="-2" y="-6" width="34" height="23" className="iso-accent" /><path d="M-2 28H32" />{[[-43,-43],[43,-43],[-43,43],[43,43]].map(([x,y])=><rect key={`${x},${y}`} x={x-2} y={y-2} width="4" height="4" className="iso-lit" />)}</g></g>
      </>}
      {category === 'infrastructure' && <>
        <path d="m79 203 101 51 105-52M180 254v-29" className="iso-accent" />
        {[[0,-67,83],[-67,1,58],[4,7,36]].map(([x,y,h],i)=><g key={i} className={`iso-module iso-module-${i}`}><Box x={x} y={y} w={59} d={59} h={h} z={0} />{[10,22,34].filter(n=>n<h).map(n=><path key={n} d={`M${point(x,y+59,n)} ${point(x+59,y+59,n)}`} />)}<circle cx={180+(x-y-47)*.87} cy={183+(x+y+65)*.43-12} r="2" className="iso-lit" /></g>)}
      </>}
      {category === 'data' && <>
        <Box x={-68} y={-68} w={136} d={136} h={5} z={-15} />
        <path d="m81 182 99-50 99 50-99 50-99-50m99-50v100M130 157l100 50m0-50-100 50" />
        {[[0,0,74],[-49,-49,26],[-49,49,33],[49,-49,49],[49,49,23]].map(([x,y,h],i)=><g key={i} className={`iso-module iso-module-${i%3}`}><Box x={x-14} y={y-14} w={28} d={28} h={h} accent={i===0} /><circle cx={180+(x-y)*.87} cy={183+(x+y)*.43-h} r="2" className="iso-lit" /></g>)}
      </>}
      {category === 'monitoring' && <>
        <Box x={-72} y={-52} w={144} d={104} h={8} z={-5} />
        <g className="iso-floating"><g transform="translate(86 52) matrix(.87 .43 0 1 0 0)"><rect width="204" height="125" rx="4" className="iso-top" /><path d="M15 24H189M15 49H189M15 74H189M15 99H189M42 16V110M82 16V110M122 16V110M162 16V110" className="iso-grid-lines" /><path d="M15 78h29l13-21 16 39 25-64 17 48h22l11-19 13 17h27" className="iso-accent iso-signal" /><circle cx="187" cy="16" r="2" className="iso-lit" /></g></g>
      </>}
      {category === 'support' && <>
        {[0,1,2].map(n=><Box key={n} x={-65} y={-65} w={130} d={130} z={n*18-12} h={7} />)}
        <g className="iso-floating"><g transform="translate(138 49) matrix(.87 .43 0 1 0 0)"><path d="M0 5 49-5 98 5v59c0 30-22 53-49 66C22 117 0 94 0 64Z" className="iso-top" /><path d="M10 14 49 6l39 8v49c0 24-16 43-39 55C26 106 10 87 10 63Z" /><path d="m28 61 14 15 30-36" className="iso-accent" /><circle cx="49" cy="-5" r="2" className="iso-lit" /></g></g>
      </>}
      </>}
    </g>
  </svg>;
}
