import type { ReactNode } from 'react';

function Panel({ x = 82, y = 65, w = 180, h = 125, children }: { x?: number; y?: number; w?: number; h?: number; children?: ReactNode }) {
  return <g transform={`translate(${x} ${y}) matrix(.87 .43 0 1 0 0)`}><rect width={w} height={h} rx="4" className="iso-top" />{children}</g>;
}
function Tile({ x, y, size = 50, accent = false }: { x: number; y: number; size?: number; accent?: boolean }) {
  return <g transform={`translate(${x} ${y})`} className={accent ? 'iso-accent' : ''}><path d={`M0 0 ${size} ${size*.5} 0 ${size} ${-size} ${size*.5}Z`} className="iso-top" /><path d={`M${-size} ${size*.5}v12L0 ${size+12} ${size} ${size*.5+12}V${size*.5}M0 ${size}v12`} /></g>;
}
function Chip({ x = 180, y = 140, size = 42 }: { x?: number; y?: number; size?: number }) {
  return <g transform={`translate(${x} ${y}) matrix(.87 .43 -.87 .43 0 0)`}><rect x={-size} y={-size} width={size*2} height={size*2} rx="3" className="iso-top" /><rect x={-size+10} y={-size+10} width={size*2-20} height={size*2-20} rx="2" className="iso-accent" />{[-24,-12,0,12,24].map(n=><path key={n} d={`M${n} ${-size}v-10M${n} ${size}v10M${-size} ${n}h-10M${size} ${n}h10`} />)}</g>;
}
function Rack({ x = 102, y = 56, rows = 4 }: { x?: number; y?: number; rows?: number }) {
  return <Panel x={x} y={y} w={135} h={rows*29+16}>{Array.from({length:rows},(_,i)=><g key={i}><rect x="9" y={8+i*29} width="117" height="22" rx="2" /><path d={`M19 ${19+i*29}h60`} /><circle cx="111" cy={19+i*29} r="2" className="iso-lit" /></g>)}</Panel>;
}

// Each catalogue slug gets a distinct composition, not a different colour of the same image.
export function serviceDetailArt(slug: string): ReactNode {
  switch(slug) {
    case 'integrations-api': return <>
      <path d="m81 154 98 49 100-50M179 203v-92" className="iso-accent" />
      <Tile x={180} y={77} size={40} accent /><Tile x={82} y={138} size={34} /><Tile x={278} y={138} size={34} /><Tile x={180} y={211} size={34} />
      <path d="m165 112-9 5 9 5m29-10 9 5-9 5m-12-13-4 15M71 164h20M268 164h20M170 237h20" className="iso-accent" /><path d="M179 203v24" />
    </>;
    case 'frontend-development': return <>
      <Panel x={60} y={54} w={210} h={134}><path d="M0 20H210" /><circle cx="12" cy="10" r="2" className="iso-lit" /><rect x="12" y="32" width="42" height="89" rx="2" /><path d="M23 44h21m-21 12h14m-14 12h21" /><rect x="65" y="32" width="132" height="30" rx="2" className="iso-accent" /><rect x="65" y="74" width="59" height="47" rx="2" /><rect x="135" y="74" width="62" height="47" rx="2" /></Panel>
      <g className="iso-floating"><Tile x={270} y={176} size={34} accent /><path d="m255 209 9-7 9 7-9 7Z" /></g>
    </>;
    case 'backend-development': return <>
      <Tile x={180} y={163} size={107} /><Chip x={180} y={154} size={45} />
      <path d="m88 197 35-18m113-3 37 19M180 207v31M180 90V61" className="iso-accent" />
      <g transform="translate(161 139) matrix(.87 .43 0 1 0 0)"><path d="M0 0c-7 0-7 0-7 8v5c0 5-3 6-6 6 3 0 6 1 6 6v5c0 8 0 8 7 8M30 0c7 0 7 0 7 8v5c0 5 3 6 6 6-3 0-6 1-6 6v5c0 8 0 8-7 8" /></g>
    </>;
    case 'mobile-feature-work': return <>
      <Panel x={108} y={40} w={82} h={176}><path d="M24 10h34M29 164h24" /><rect x="9" y="26" width="64" height="126" rx="2" /><path d="M17 41h47m-47 9h31M17 122h47m-47 10h26" /></Panel>
      <g className="iso-floating"><Panel x={189} y={119} w={66} h={64}><path d="M22 22h22v22H22ZM33 15v36M15 33h36" className="iso-accent" /></Panel></g>
      <path d="m126 210 54 27 76-38" /><circle cx="238" cy="167" r="3" className="iso-lit" />
    </>;
    case 'wordpress-cms': return <>
      <Panel x={72} y={47} w={171} h={153}><path d="M0 20H171M43 20v133" /><circle cx="11" cy="10" r="2" className="iso-lit" /><path d="M12 37h19m-19 13h14m-14 13h19m-19 13h14" /><rect x="55" y="33" width="104" height="33" /><path d="M55 82h104M55 93h104M55 104h83M55 115h97" /><rect x="113" y="132" width="46" height="11" className="iso-accent" /></Panel>
      <g transform="translate(241 136) rotate(28)"><path d="M0 0h12v85L6 96 0 85Z" className="iso-top" /><path d="M0 12h12M0 85h12" className="iso-accent" /></g>
    </>;
    case 'bug-fixing': return <>
      <Panel x={69} y={58} w={178} h={130}><path d="M15 19h96M15 30h73M15 41h91M15 92h89M15 104h64" /><path d="m20 62 11 10 19-22" className="iso-accent" /></Panel>
      <g className="iso-floating"><g transform="translate(217 156)"><circle r="46" className="iso-top" /><circle r="37" /><path d="m32 33 36 36 9-9-36-36" className="iso-top" /><ellipse rx="12" ry="18" className="iso-accent" /><path d="M0-18v36m-12-25-12-7m12 14h-16m16 7-12 8m36-22 12-7M12 0h16m-16 7 12 8M-6-18l-5-8m17 8 5-8" className="iso-accent" /></g></g>
    </>;
    case 'manual-qa-testing': return <>
      <Panel x={110} y={38} w={128} h={172}><rect x="35" y="-7" width="58" height="19" rx="3" className="iso-top" />{[37,73,109].map(y=><g key={y}><rect x="15" y={y} width="18" height="18" rx="2" /><path d={`m18 ${y+8} 5 5 8-10`} className="iso-accent" /><path d={`M46 ${y+5}h65m-65 9h47`} /></g>)}<path d="M15 151h97" /></Panel>
      <path d="m75 223 70 35 91-46" />
    </>;
    case 'test-automation': return <>
      <path d="M180 74 81 124v94l99 49 99-49v-94Z" /><path d="m82 125 98 49 98-49M180 174v92" className="iso-accent" />
      {[[180,46],[82,114],[278,114],[180,198]].map(([x,y],i)=><g key={i}><Tile x={x} y={y} size={29} /><path d={`m${x-10} ${y+27} 7 7 14-12`} className="iso-accent" /></g>)}
      <circle cx="180" cy="174" r="7" className="iso-top" /><circle cx="180" cy="174" r="2" className="iso-lit" />
    </>;
    case 'ui-screen-design': return <>
      <Panel x={57} y={51} w={161} h={122}><path d="M0 17H161M42 17v105" /><rect x="53" y="29" width="96" height="33" className="iso-accent" /><rect x="53" y="72" width="43" height="37" /><rect x="106" y="72" width="43" height="37" /></Panel>
      <g className="iso-floating"><Panel x={204} y={125} w={69} h={108}><rect x="8" y="13" width="53" height="37" /><path d="M8 64h53m-53 9h37" /><rect x="8" y="87" width="35" height="10" className="iso-accent" /></Panel></g>
      <path d="m59 224 94 47M239 58l19 10" />
    </>;
    case 'landing-page-design': return <>
      <g className="iso-rear"><Panel x={117} y={26} w={126} h={180} /></g>
      <Panel x={94} y={49} w={126} h={180}><path d="M0 17H126M12 8h29m41 0h29" /><path d="M13 34h73m-73 10h56" /><rect x="13" y="57" width="44" height="10" className="iso-accent" /><rect x="13" y="81" width="100" height="40" /><path d="M13 134h29m6 0h30m6 0h29M13 144h29m6 0h30m6 0h29M13 164h100" /></Panel>
      <Tile x={91} y={221} size={23} accent />
    </>;
    case 'brand-graphics': return <>
      <Tile x={180} y={149} size={107} />
      <g transform="translate(180 154) matrix(.87 .43 -.87 .43 0 0)"><rect x="-73" y="-73" width="146" height="146" /><circle r="52" /><path d="M-73 0H73M0-73V73" className="iso-grid-lines" /><path d="M-30 34V-34H5C42-34 42 12 5 12H-14v22Z" className="iso-accent" />{[[-73,-73],[73,-73],[-73,73],[73,73]].map(([x,y])=><rect key={`${x}${y}`} x={x-3} y={y-3} width="6" height="6" className="iso-lit" />)}</g>
    </>;
    case 'devops-hourly': return <>
      <path d="m77 172 103 51 103-51M180 223v32" className="iso-accent" />
      <Tile x={80} y={116} size={34} /><Chip x={183} y={139} size={29} /><Tile x={280} y={116} size={34} />
      <g transform="translate(180 81)"><circle r="35" className="iso-top" /><circle r="28" /><path d="M0-19V0l15 8" className="iso-accent" /><path d="M0-28v4M28 0h-4M0 28v-4M-28 0h4" /></g>
    </>;
    case 'server-administration': return <>
      <g className="iso-rear"><Rack x={130} y={38} rows={4} /></g><Rack x={82} y={67} rows={4} />
      <g transform="translate(263 194)"><circle r="28" className="iso-top" /><path d="M-12-7h24v23h-24ZM-7-7v-7a7 7 0 0 1 14 0v7" className="iso-accent" /><circle cy="3" r="2" className="iso-lit" /></g>
    </>;
    case 'data-engineering': return <>
      <path d="m69 172 63 32 48-24 52 26 60-30" className="iso-accent" />
      {[69,180,290].map((x,i)=><g key={x} transform={`translate(${x} ${105+i*9})`}><path d="M-28 0v65c0 17 56 17 56 0V0" className="iso-top" /><ellipse rx="28" ry="12" className={i===1?'iso-accent':'iso-top'} /><path d="M-28 22c0 16 56 16 56 0M-28 43c0 16 56 16 56 0" /></g>)}
      <Tile x={133} y={213} size={19} /><Tile x={233} y={216} size={19} accent />
    </>;
    case 'bi-dashboards': return <>
      <Panel x={57} y={47} w={224} h={145}><path d="M0 19H224" /><rect x="12" y="31" width="89" height="99" /><rect x="113" y="31" width="99" height="42" /><rect x="113" y="85" width="99" height="45" /><path d="M124 60h15v-9h17V41h15v13h19V39h11" className="iso-accent" /><path d="M124 100h30m-30 11h65" /><path d="M24 113V83h14v30m9 0V67h14v46m9 0V49h14v64" className="iso-accent" /></Panel>
      <path d="m87 231 92 46 88-44" />
    </>;
    case 'monitoring-setup': return <>
      <Tile x={180} y={183} size={96} />
      <g transform="translate(180 151) matrix(1 0 0 .6 0 0)"><circle r="88" /><circle r="63" /><circle r="36" /><path d="M-100 0H100M0-100V100" className="iso-grid-lines" /><path d="M0 0 58-65A88 88 0 0 1 88 0Z" className="iso-accent" /><circle cx="41" cy="-33" r="4" className="iso-lit" /><circle cx="-45" cy="22" r="3" /></g>
      <path d="M180 151V69" className="iso-accent" /><circle cx="180" cy="65" r="4" className="iso-lit" />
    </>;
    case 'technical-support': return <>
      <Panel x={77} y={67} w={165} h={99}><path d="M18 23h127M18 37h92M18 51h107" /><path d="m30 99-9 20 39-20" className="iso-top" /></Panel>
      <g className="iso-floating"><Panel x={158} y={151} w={109} h={67}><circle cx="31" cy="30" r="3" className="iso-lit" /><circle cx="54" cy="30" r="3" className="iso-lit" /><circle cx="77" cy="30" r="3" className="iso-lit" /><path d="m74 67 14 17 2-17" /></Panel></g>
    </>;
    case 'website-maintenance': return <>
      <Panel x={76} y={64} w={173} h={119}><path d="M0 18H173M13 34h145M13 48h94" /><rect x="13" y="64" width="60" height="40" /><path d="M85 72h72M85 84h51M85 97h63" /></Panel>
      <g transform="translate(235 195)"><circle r="40" className="iso-top" /><path d="M-13-24a18 18 0 0 0 16 29l17 23 9-8L9-1a18 18 0 0 0-2-29L4-16l-12 3Z" className="iso-accent" /></g>
    </>;
    case 'tech-consulting': return <>
      <Tile x={180} y={173} size={105} />
      <g transform="translate(180 159) matrix(1 0 0 .58 0 0)"><circle r="82" /><circle r="69" /><path d="M0-69v12M69 0H57M0 69V57M-69 0h12" /><path d="m-36 40 19-60 53-20-19 60Z" className="iso-accent" /><path d="M-17-20 17 20" /><circle r="5" className="iso-lit" /></g>
      <path d="M180 104V53m-4 5 4-5 4 5" /><circle cx="180" cy="51" r="2" className="iso-lit" />
    </>;
    default: return null;
  }
}
