'use strict';
// All game content is editable here. No dependencies or build tools needed.
const missions = [
  {id:'OP-01',name:'ISS LIFE-SUPPORT DROP',category:'ORBITAL STATION RESUPPLY',description:'Low Earth Orbit station ‘Horizon-1’ is running critically low on CO2 scrubbers and food rations. Assemble a reliable single-stage supply rocket within budget before their reserve filters saturate.',payload:'Hermes Supply Pod Mk1',cargo:800,altitude:400,deltaV:9200,budget:9500000,prep:12,deadline:12,grant:1200000},
  {id:'OP-02',name:'LUNAR RELAY DELIVERY',category:'DEEP-SPACE LOGISTICS',description:'Deploy an upgraded communication package into a lunar-transfer trajectory. Prioritize propellant and reliable upper-stage performance.',payload:'Selene Relay Pod',cargo:500,altitude:1500,deltaV:11500,budget:13000000,prep:14,deadline:14,grant:1800000},
  {id:'OP-03',name:'ATMOSPHERIC OBSERVER',category:'SCIENTIFIC RESEARCH',description:'Launch a science instrument to a high observation orbit. A lightweight payload and efficient engine are essential.',payload:'Aurora Science Pod',cargo:300,altitude:700,deltaV:9700,budget:11500000,prep:12,deadline:12,grant:1400000},
  {id:'OP-04',name:'EMERGENCY CREW RETURN',category:'CREW RESCUE',description:'A stranded crew requires an urgent rescue flight. Balance safe ascent, capsule capacity, and a narrow preparation window.',payload:'Orion Crew Capsule',cargo:0,altitude:420,deltaV:9400,budget:15000000,prep:10,deadline:10,grant:2400000},
  {id:'OP-05',name:'FRONTIER OUTPOST SUPPLY',category:'HEAVY-CARGO DELIVERY',description:'Deliver mission-critical cargo to the Frontier outpost. The mass of the shipment demands a powerful and carefully balanced rocket.',payload:'Atlas Heavy Cargo Pod',cargo:1500,altitude:800,deltaV:10500,budget:19000000,prep:16,deadline:16,grant:3000000}
];
const parts = {
  capsule:{type:'PAYLOAD/CAPSULE',name:'Hermes Supply Pod Mk1',code:'C-003',cost:2000000,prep:2,mass:1200,cargo:800,seats:0,dv:0,thrust:0},
  tank:{type:'FUEL TANK',name:'Titan Propellant Stack',code:'T-001',cost:2500000,prep:3,mass:9000,cargo:0,seats:0,dv:6800,thrust:0},
  engine:{type:'ENGINE',name:'Vulcan Main Engine',code:'E-001',cost:2600000,prep:3,mass:3300,cargo:0,seats:0,dv:2800,thrust:540000},
  avionics:{type:'GUIDANCE',name:'Pioneer Flight Computer',code:'P-001',cost:850000,prep:1,mass:220,cargo:0,seats:0,dv:0,thrust:0},
  stabilizer:{type:'STABILIZER',name:'Fin Control Assembly',code:'S-001',cost:450000,prep:1,mass:350,cargo:0,seats:0,dv:0,thrust:0},
  fairing:{type:'FAIRING',name:'Lightweight Nose Shell',code:'F-001',cost:300000,prep:1,mass:180,cargo:0,seats:0,dv:0,thrust:0}
};
const order=['capsule','tank','engine','avionics','stabilizer','fairing'];
const state={mission:0,installed:new Set(['capsule']),surplus:new Set(),completed:new Set(),rescued:0,delivered:0,reserve:0,launched:false};
let flightFrame=null;
const FLIGHT_DURATION=16000;
const flightStages=[{name:'pad',label:'01 / LAUNCH SITE',alt:0},{name:'sky',label:'02 / ASCENT THROUGH SKY',alt:20},{name:'space',label:'03 / UPPER ATMOSPHERE & SPACE',alt:140},{name:'moon',label:'04 / LUNAR APPROACH',alt:384400}];
// The scenery is ONE tall SVG world. Move the SVG camera upward by changing viewBox Y.
// At rest, viewBox Y=1860 (launch pad). At the destination, Y=0 (Moon).
const WORLD_TRAVEL=1860;
function setFlightCamera(progress){
  const cameraY=WORLD_TRAVEL*(1-Math.max(0,Math.min(1,progress)));
  document.querySelector('#flight-scene .flight-backdrop')
    .setAttribute('viewBox',`0 ${cameraY.toFixed(2)} 600 620`);
}
function setFlightPhase(phase,progress=0,altitude=0){
  const scene=el('flight-scene');scene.dataset.phase=phase;
  const step=flightStages.find(s=>s.name===phase)||flightStages[0];
  el('flight-phase').textContent=step.label;
  el('flight-altitude').textContent=`ALT ${Math.round(altitude).toLocaleString('en-US')} KM`;
  el('flight-progress-fill').style.width=`${Math.min(100,Math.max(0,progress*100))}%`;
  setFlightCamera(progress);
}
function resetFlight(){
  if(flightFrame!==null)cancelAnimationFrame(flightFrame);
  flightFrame=null;
  document.body.classList.remove('flight-active','launched');
  el('rocket-graphic').style.transform='';
  setFlightPhase('pad',0,0);
}
function playFlight(onDone){
  resetFlight();
  document.body.classList.add('flight-active','launched');
  const start=performance.now();
  function tick(now){
    const progress=Math.min(1,(now-start)/FLIGHT_DURATION);
    const phase=progress<.22?'pad':progress<.48?'sky':progress<.75?'space':'moon';
    const alt=progress<.22?progress/.22*10:progress<.48?10+(progress-.22)/.26*130:progress<.75?140+(progress-.48)/.27*100000:100140+(progress-.75)/.25*284260;
    setFlightPhase(phase,progress,alt);
    // Keep rocket in the middle while the world scrolls past it.
    const rocket=el('rocket-graphic');
    rocket.style.transform=`translateY(${-8-Math.sin(progress*24)*5}px) scale(${1-Math.min(.25,progress*.25)})`;
    if(progress<1){flightFrame=requestAnimationFrame(tick)}
    else{
      flightFrame=null;
      document.body.classList.remove('flight-active');
      rocket.style.transform='translateY(-8px) scale(.75)';
      onDone();
    }
  }
  flightFrame=requestAnimationFrame(tick);
}

const el=(id)=>document.getElementById(id);
const money=(n)=>'$'+Math.round(n).toLocaleString('en-US');
const fmt=(n)=>Math.round(n).toLocaleString('en-US');
const costOf=(key)=>parts[key].cost*(state.surplus.has(key)?0.55:1);
const prepOf=(key)=>parts[key].prep*(state.surplus.has(key)?0.5:1);
function stats(){const installed=[...state.installed],mass=installed.reduce((a,k)=>a+parts[k].mass,0)+13050;const cost=installed.reduce((a,k)=>a+costOf(k),0);const prep=installed.reduce((a,k)=>a+prepOf(k),0);const engine=state.installed.has('engine'),tank=state.installed.has('tank');const deltaV=engine&&tank?9600:engine?2800:0;const twr=engine?Math.max(.1,540000/(mass*9.81)):0;const reliability=Math.max(70,96-state.surplus.size*3);return{mass,cost,prep,deltaV,twr,reliability};}
function rocketSvg(){return `<defs><linearGradient id="rocket-metal" x1="0" x2="1"><stop stop-color="#474050"/><stop offset=".35" stop-color="#d2c9d2"/><stop offset=".65" stop-color="#716674"/><stop offset="1" stop-color="#28212f"/></linearGradient></defs>
<g stroke="#948a9c" stroke-width="2.7" stroke-linejoin="round">
<!-- support tower / assembly rack -->
<path d="M28 35H84M27 114H80M27 285H83M25 334H82M25 384H85M155 35H210M158 114H210M154 285H214M157 334H215M155 384H215" stroke="#a19aa5" stroke-width="4" opacity=".3"/>
<path d="M66 42V380M174 42V380" opacity=".15" stroke-width="2"/>
<!-- capsule -->
<g opacity="${state.installed.has('capsule')?1:.16}"><path d="M120 24 L158 100 L158 135 L82 135 L82 100 Z" fill="#9c91a7"/><path d="M120 24 L144 102 L96 102Z" fill="#d4c6d8"/><path d="M97 108H143V126H97Z" fill="#1b2534" stroke="none"/><text x="120" y="121" fill="#24e5d1" text-anchor="middle" font-family="monospace" font-size="12" stroke="none">C-003</text></g>
<!-- tank -->
<g opacity="${state.installed.has('tank')?1:.12}"><rect x="82" y="138" width="76" height="149" fill="url(#rocket-metal)"/><path d="M82 163H158M82 257H158" stroke="#2e2633" stroke-width="6"/><rect x="94" y="180" width="52" height="26" fill="#b679ed" stroke="none"/><text x="120" y="197" font-family="monospace" text-anchor="middle" font-size="12" fill="#100916" stroke="none">T-001</text></g>
<!-- engine -->
<g opacity="${state.installed.has('engine')?1:.14}"><rect x="88" y="289" width="64" height="41" fill="#85b5b0"/><path d="M101 330L89 382H151L139 330Z" fill="#c48663"/><text x="120" y="315" font-size="12" font-family="monospace" text-anchor="middle" stroke="none" fill="#0e1d20">E-001</text></g>
<!-- fins -->
<g opacity="${state.installed.has('stabilizer')?1:.1}" fill="#9a6ad5"><path d="M82 287L55 342H82Z"/><path d="M158 287L185 342H158Z"/></g>
</g>`;}
function miniSvg(key){let text=parts[key].code;let colors={capsule:'#b86af1',tank:'#d1d0de',engine:'#6acbbd',avionics:'#e7bc7c',stabilizer:'#b482d8',fairing:'#7788b6'};return `<svg viewBox="0 0 80 100" aria-hidden="true"><g stroke="#9d90a5" stroke-width="2" fill="${colors[key]}">${key==='capsule'?'<path d="M40 10L60 43V80H20V43Z"/>':key==='engine'?'<path d="M22 18H58V55L70 88H10L22 55Z"/>':key==='stabilizer'?'<path d="M29 18H51V80H12L29 40ZM51 40L68 80H51Z"/>':key==='fairing'?'<path d="M40 5L66 78H14Z"/>':'<rect x="20" y="15" width="40" height="70"/>'}</g><text x="40" y="60" font-family="monospace" font-weight="bold" font-size="11" fill="#110b18" text-anchor="middle">${text}</text></svg>`;}
function update(){const mission=missions[state.mission],s=stats();el('mission-title').textContent=`[${state.mission+1}/5] ${mission.id}: ${mission.name}`;el('mission-category').textContent=`CATEGORY: ${mission.category}`;el('mission-description').textContent=mission.description;
el('constraint-list').innerHTML=`<li>Required Payload: ${mission.payload}</li><li>Min Cargo Capacity: ${fmt(mission.cargo)}kg</li><li>Target Orbit Altitude: ${fmt(mission.altitude)}km</li><li>Required Orbit Delta-V: ${fmt(mission.deltaV)}m/s</li><li class="spacer"></li><li>Strict Budget Cap: ${money(mission.budget)}</li><li>Launch Window Deadline: ${mission.deadline}d</li><li>Completion Funding Grant: ${money(mission.grant)}</li>`;
el('campaign-line').textContent=`Campaign: ${state.completed.size}/5 Completed | Astronauts Rescued: ${state.rescued} | Cargo Delivered: ${fmt(state.delivered)}kg | Agency Reserve: ${money(state.reserve)}`;
el('pad-status').textContent=state.launched?'LAUNCHED':'STANDBY';el('pad-mass').textContent=fmt(s.mass)+'kg';el('pad-stages').textContent='1';el('pad-surplus').textContent=state.surplus.size;
el('budget-label').textContent=`${money(s.cost)} / ${money(mission.budget)}`;el('prep-label').textContent=`${s.prep.toFixed(1)} / ${mission.deadline}d`;el('twr-label').textContent=s.twr.toFixed(2);el('dv-label').textContent=fmt(s.deltaV)+'m/s';
for(const [key,value,max] of [['budget',s.cost,mission.budget],['prep',s.prep,mission.deadline],['twr',s.twr,1.5],['dv',s.deltaV,mission.deltaV]]){let meter=el(key+'-meter'),percent=Math.min(100,100*value/max);meter.style.width=percent+'%';meter.classList.toggle('over',key==='budget'&&value>max||key==='prep'&&value>max);}
el('reliability').textContent=s.reliability+'%';el('surplus-total').textContent=state.surplus.size;el('total-mass').textContent=fmt(s.mass)+'kg';
el('rocket-graphic').innerHTML=rocketSvg();
el('part-slots').innerHTML=order.map(k=>{
 const p=parts[k],installed=state.installed.has(k),surplus=state.surplus.has(k);
 return `<div class="part-card ${installed?'installed':''}" data-part="${k}">
   <button class="slot" type="button" data-action="install" aria-pressed="${installed}" aria-label="${installed?'Remove':'Install'} ${p.name}">
     ${miniSvg(k)}<span class="part-code">${p.code}</span><span class="part-state">${installed?'INSTALLED':'AVAILABLE'}</span>
   </button>
   <button class="part-mode" type="button" data-action="surplus" aria-pressed="${surplus}" aria-label="Toggle surplus for ${p.name}">${surplus?'SURPLUS':'NEW'}</button>
 </div>`;
}).join('');
// The catalog always shows every part, installed or not. Tooltip content is
// populated only on hover/focus, never as a permanently displayed inspector.
if (hoveredPart) {
 const card=el('part-slots').querySelector(`[data-part="${hoveredPart}"]`);
 if (card && card.matches(':hover, :focus-within')) showPartDetails(hoveredPart);
 else hidePartDetails();
}
}
let hoveredPart=null;
const inspector=el('part-inspector');
function showPartDetails(key,x,y){
 const p=parts[key],installed=state.installed.has(key),surplus=state.surplus.has(key);
 hoveredPart=key;
 inspector.innerHTML=`<div class="inspector-heading">${p.type}</div><div class="inspector-inner"><h3>${p.name}</h3><p>Part ID: ${p.code}<br>Cost: ${money(costOf(key))}<br>Prep: ${prepOf(key)}d<br>Mass: ${fmt(p.mass)}kg<br>Seats: ${p.seats}<br>Cargo: ${fmt(p.cargo)}kg<br>Status: ${installed?'INSTALLED':'AVAILABLE'}<br>Mode: ${surplus?'SURPLUS':'FACTORY NEW'}</p><p class="inspector-help">Click the part to ${installed?'remove':'install'} it. Use NEW/SURPLUS to change procurement mode.</p></div>`;
 inspector.classList.add('visible');inspector.setAttribute('aria-hidden','false');
 positionTooltip(x,y,key);
}
function positionTooltip(x,y,key){
 if (!inspector.classList.contains('visible')) return;
 const card=el('part-slots').querySelector(`[data-part="${key}"]`);
 const r=card?.getBoundingClientRect();
 const px=x??(r?r.right:0),py=y??(r?r.top:0);
 const w=inspector.offsetWidth,h=inspector.offsetHeight,pad=12;
 const left=Math.min(Math.max(pad,px+18),Math.max(pad,window.innerWidth-w-pad));
 const top=Math.min(Math.max(pad,py+12),Math.max(pad,window.innerHeight-h-pad));
 inspector.style.left=left+'px';inspector.style.top=top+'px';
}
function hidePartDetails(){hoveredPart=null;inspector.classList.remove('visible');inspector.setAttribute('aria-hidden','true');}
const grid=el('part-slots');
grid.addEventListener('pointerover',e=>{
 const card=e.target.closest('[data-part]');
 if(card && card.dataset.part!==hoveredPart)showPartDetails(card.dataset.part,e.clientX,e.clientY);
});
grid.addEventListener('pointermove',e=>{if(hoveredPart)positionTooltip(e.clientX,e.clientY,hoveredPart)});
grid.addEventListener('pointerout',e=>{if(!e.relatedTarget||!grid.contains(e.relatedTarget))hidePartDetails();});
grid.addEventListener('focusin',e=>{const card=e.target.closest('[data-part]');if(card)showPartDetails(card.dataset.part);});
grid.addEventListener('focusout',e=>{if(!e.relatedTarget||!grid.contains(e.relatedTarget))hidePartDetails();});
grid.addEventListener('click',e=>{
 const button=e.target.closest('button[data-action]');if(!button)return;
 const key=button.closest('[data-part]').dataset.part,p=parts[key];
 if(button.dataset.action==='install'){
  const installed=state.installed.has(key);
  if(installed){state.installed.delete(key);state.surplus.delete(key)}else state.installed.add(key);
  setTelemetry(`[ASSEMBLY] ${installed?'Removed':'Installed'} ${p.code} ${installed?'from':'in'} build.`);
 } else {
  if(state.surplus.has(key))state.surplus.delete(key);
  else state.surplus.add(key);
  setTelemetry(`[PROCUREMENT] ${p.code} set to ${state.surplus.has(key)?'SURPLUS':'FACTORY NEW'}.`);
 }
 state.launched=false;resetFlight();update();
 // The catalog re-renders, so preserve keyboard focus on the same control.
 const replacement=grid.querySelector(`[data-part="${key}"] [data-action="${button.dataset.action}"]`);
 if(e.detail===0)replacement?.focus();
});

function setTelemetry(message){el('telemetry-log').textContent=message;}
function changeMission(delta){state.mission=(state.mission+delta+missions.length)%missions.length;state.launched=false;state.installed=new Set(['capsule']);state.surplus.clear();document.body.classList.remove('launched');update();setTelemetry(`[MISSION CONTROL] ${missions[state.mission].id} loaded. Awaiting vehicle configuration.`);}
el('prev-mission').addEventListener('click',()=>changeMission(-1));el('next-mission').addEventListener('click',()=>changeMission(1));
el('autofit').addEventListener('click',()=>{state.installed=new Set(order);state.surplus=new Set(['capsule','tank','engine']);state.launched=false;resetFlight();update();setTelemetry('[AUTO-FIT] Vehicle assembled. Check budget, prep time, thrust, and delta-V before launch.');});
el('reset').addEventListener('click',()=>{state.installed=new Set(['capsule']);state.surplus.clear();state.launched=false;resetFlight();update();setTelemetry('[RESET] Assembly returned to initial configuration.');});
el('launch').addEventListener('click',()=>{if(state.launched)return;const m=missions[state.mission],s=stats(),issues=[];if(!state.installed.has('capsule'))issues.push('payload missing');if(!state.installed.has('engine')||!state.installed.has('tank'))issues.push('propulsion incomplete');if(s.cost>m.budget)issues.push('budget exceeded');if(s.prep>m.deadline)issues.push('prep deadline exceeded');if(s.twr<1.2)issues.push('insufficient thrust');if(s.deltaV<m.deltaV)issues.push('insufficient delta-V');if(issues.length){setTelemetry('[NO GO] '+issues.join('; ')+'.');return;}state.launched=true;update();setTelemetry(`[LIFTOFF] ${m.id}: Ascent underway. Tracking atmospheric and lunar scenery...`);playFlight(()=>{if(!state.completed.has(state.mission)){state.completed.add(state.mission);state.delivered+=m.cargo;state.rescued+=state.mission===3?3:0;state.reserve+=m.grant;}update();setTelemetry(`[MISSION COMPLETE] ${m.id}: Flight sequence complete. Funding grant ${money(m.grant)} recorded.`);});});
update();resetFlight();setTelemetry('[GO FOR LAUNCH] Configure rocket components or select Auto-Fit Valid Build.');
