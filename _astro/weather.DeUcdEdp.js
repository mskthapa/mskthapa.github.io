var e={0:[`Clear sky`,`☀️`],1:[`Mainly clear`,`🌤️`],2:[`Partly cloudy`,`⛅`],3:[`Overcast`,`☁️`],45:[`Fog`,`🌫️`],48:[`Rime fog`,`🌫️`],51:[`Light drizzle`,`🌦️`],53:[`Drizzle`,`🌦️`],55:[`Heavy drizzle`,`🌦️`],56:[`Freezing drizzle`,`🌧️`],57:[`Freezing drizzle`,`🌧️`],61:[`Light rain`,`🌧️`],63:[`Rain`,`🌧️`],65:[`Heavy rain`,`🌧️`],66:[`Freezing rain`,`🌧️`],67:[`Freezing rain`,`🌧️`],71:[`Light snow`,`🌨️`],73:[`Snow`,`🌨️`],75:[`Heavy snow`,`🌨️`],77:[`Snow grains`,`🌨️`],80:[`Light showers`,`🌦️`],81:[`Showers`,`🌦️`],82:[`Violent showers`,`⛈️`],85:[`Snow showers`,`🌨️`],86:[`Snow showers`,`🌨️`],95:[`Thunderstorm`,`⛈️`],96:[`Thunderstorm, hail`,`⛈️`],99:[`Severe thunderstorm`,`⛈️`]},t=t=>e[t]??[`Unknown`,`❓`];function n(e){return e<=0?{label:`None`,tone:`none`}:e<2.5?{label:`Light`,tone:`light`}:e<7.5?{label:`Moderate`,tone:`moderate`}:e<50?{label:`Heavy`,tone:`heavy`}:{label:`Torrential`,tone:`extreme`}}var r=e=>{let t=+e.slice(11,13);return(t%12==0?12:t%12)+(t<12?`AM`:`PM`)},i=e=>new Date(e+`T00:00`).toLocaleDateString(`en-GB`,{weekday:`short`}),a=e=>[`N`,`NE`,`E`,`SE`,`S`,`SW`,`W`,`NW`][Math.round(e/45)%8];function o(e){return e==null?[`—`,`#6b7280`]:e<=50?[`Good`,`#15803d`]:e<=100?[`Moderate`,`#ca8a04`]:e<=150?[`Sensitive groups`,`#ea580c`]:e<=200?[`Unhealthy`,`#dc2626`]:e<=300?[`Very unhealthy`,`#7c3aed`]:[`Hazardous`,`#7f1d1d`]}var s=`Asia%2FKathmandu`,c=`https://api.open-meteo.com/v1/forecast`,l=`https://air-quality-api.open-meteo.com/v1/air-quality`,u=(e=new Date)=>e.toLocaleTimeString(`en-US`,{timeZone:`Asia/Kathmandu`,hour:`numeric`,minute:`2-digit`,hour12:!0}),d=(e=new Date)=>e.toLocaleString(`sv-SE`,{timeZone:`Asia/Kathmandu`}).slice(0,16).replace(` `,`T`);async function f(e,t){let n=`${c}?latitude=${e}&longitude=${t}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m&minutely_15=precipitation&hourly=temperature_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m,relative_humidity_2m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=${s}&forecast_days=10`,r=`${l}?latitude=${e}&longitude=${t}&current=pm2_5,pm10,us_aqi&timezone=${s}`,[i,a]=await Promise.all([fetch(n).then(e=>{if(!e.ok)throw Error(`forecast failed`);return e.json()}),fetch(r).then(e=>e.ok?e.json():null).catch(()=>null)]);return{f:i,a}}function p(e){let t=e?.time,i=e?.precipitation;if(!t?.length||!i?.length)return{state:`unknown`,text:``};let a=d(),o=-1;for(let e=0;e<t.length&&t[e].slice(0,16)<=a;e++)o=e;let s=e=>(i[e]??0)*4,c=o>=0?s(o):0,l=o+1,u=Array.from({length:8},(e,t)=>s(l+t)),f=Math.max(...u),p=l+u.indexOf(f),m=c>=.1,h=-1;for(let e=0;e<u.length;e++)if(u[e]>=.1){h=e;break}let g=-1;if(m&&h===-1){for(let e=1;e<12&&o+e<i.length;e++)if((i[o+e]??0)<.02){g=e;break}}let _=n(f),v=e=>Math.max(15,e*15);return!m&&h!==-1?{state:`starting`,text:`Rain starting in about ${v(h)} min`,detail:`Peak ${_.label.toLowerCase()}, ${f.toFixed(1)} mm/h`}:m&&g!==-1?{state:`stopping`,text:`Rain stopping in about ${v(g)} min`,detail:`Currently ${n(c).label.toLowerCase()}, ${c.toFixed(1)} mm/h`}:m?{state:`raining`,text:`Raining now — ${n(c).label.toLowerCase()}`,detail:`Next 2h peak ${f.toFixed(1)} mm/h around ${r(t[p])}`}:{state:`dry`,text:`No rain expected in the next 2 hours`,detail:f>.1?`Later peak ${f.toFixed(1)} mm/h around ${r(t[p])}`:``}}function m(e,t,n){let r=e.daily,i=e.current,a=[],o=n&&(n.state===`raining`||n.state===`starting`||n.state===`stopping`),s=r.precipitation_sum[0]??0,c=r.precipitation_sum[1]??0,l=r.precipitation_probability_max[0]??0;return o&&(s>=100||c>=100||l>=80&&s>=50?a.push([`bad`,`🌧️ <b>Heavy rain expected.</b> Flood and landslide risk in hill and Tarai districts. Avoid landslide-prone roads.`]):(s>=50||l>=70)&&a.push([`warn`,`🌦️ <b>Significant rain likely.</b> Carry rain gear and watch for localised flooding.`])),r.temperature_2m_max[0]>=38&&a.push([`bad`,`🔥 <b>Heat wave conditions.</b> Stay hydrated, avoid outdoor work 11am–4pm.`]),r.temperature_2m_min[0]<=2&&a.push([`warn`,`❄️ <b>Near-freezing night.</b> Protect crops, livestock and exposed pipes.`]),i.wind_gusts_10m>=60&&a.push([`warn`,`💨 <b>Strong gusts</b> up to ${Math.round(i.wind_gusts_10m)} km/h.`]),t?.current?.us_aqi>=150&&a.push([`bad`,`😷 <b>Unhealthy air</b> (US AQI ${Math.round(t.current.us_aqi)}). Limit outdoor exertion.`]),a}function h(e,n,s,c,l=new Date){let d=s.current,f=s.daily,h=s.hourly,[g,_]=t(d.weather_code),v=d.time.slice(0,13),y=h.time.findIndex(e=>e.slice(0,13)===v);y<0&&(y=0);let b=p(s.minutely_15),x=m(s,c,b),[S,C]=o(c?.current?.us_aqi),w=f.precipitation_sum[0]??0;e.innerHTML=`
    <div class="card hero-card">
      <div class="hero">
        <div class="icon">${_}</div>
        <div class="hero-main">
          <div class="loc-ne">${n.ne}</div>
          <div class="loc-en">${n.en}</div>
          <div class="temp">${Math.round(d.temperature_2m)}°</div>
          <div class="cond">${g}</div>
          <div class="sub">Feels ${Math.round(d.apparent_temperature)}° ·
            H ${Math.round(f.temperature_2m_max[0])}° L ${Math.round(f.temperature_2m_min[0])}°</div>
        </div>
        <div class="meta">
          Updated ${u(l)} NPT · Data ${r(d.time)}<br>
          ${n.lat.toFixed(3)}°N, ${n.lon.toFixed(3)}°E<br>
          Open-Meteo
        </div>
      </div>
    </div>

    <div class="card nowcast nc-${b.state}">
      <div class="nc-text">${b.text}</div>
      ${b.detail?`<div class="nc-detail">${b.detail}</div>`:``}
    </div>

    ${x.length?`<div class="alerts">${x.map(([e,t])=>`<div class="alert a-${e}">${t}</div>`).join(``)}</div>`:``}

    <div class="card dhm-card">
      <span>⚠️ Official warnings are issued by DHM Nepal.</span>
      <a href="https://www.dhm.gov.np/" target="_blank" rel="noopener">Check DHM →</a>
    </div>

    <div class="grid">
      ${[[`Rain today`,`${w.toFixed(1)} mm`],[`Rain chance`,`${f.precipitation_probability_max[0]??0}%`],[`Humidity`,`${Math.round(d.relative_humidity_2m)}%`],[`Wind`,`${Math.round(d.wind_speed_10m)} km/h ${a(d.wind_direction_10m)}`],[`Gusts`,`${Math.round(d.wind_gusts_10m)} km/h`],[`UV`,h.uv_index[y]==null?`—`:Math.round(h.uv_index[y])],[`Pressure`,`${Math.round(d.pressure_msl)} hPa`],[`Air quality`,c?.current?`<span class="aqi-badge" style="background:${C}">${Math.round(c.current.us_aqi)} ${S}</span>`:`—`]].map(([e,t])=>`<div class="stat"><div class="k">${e}</div><div class="v">${t}</div></div>`).join(``)}
    </div>

    <div class="card">
      <h2>Next 24 hours</h2>
      <div class="hourly">
        ${h.time.slice(y,y+24).map((e,n)=>{let i=y+n;return`<div class="hour">
            <div class="h">${n===0?`Now`:r(e)}</div>
            <div class="e">${t(h.weather_code[i])[1]}</div>
            <div class="t">${Math.round(h.temperature_2m[i])}°</div>
            <div class="p">${h.precipitation_probability[i]??``}%</div>
          </div>`}).join(``)}
      </div>
    </div>

    <div class="card">
      <h2>10-day forecast</h2>
      ${f.time.map((e,n)=>`
        <div class="day">
          <span>${n===0?`Today`:i(e)}</span>
          <span class="e">${t(f.weather_code[n])[1]}</span>
          <span><span class="hi">${Math.round(f.temperature_2m_max[n])}°</span>
                <span class="lo">${Math.round(f.temperature_2m_min[n])}°</span></span>
          <span class="sub">💧 ${f.precipitation_probability_max[n]??`—`}%</span>
          <span class="sub">${Math.round(f.wind_speed_10m_max[n])} km/h</span>
        </div>`).join(``)}
    </div>

    <div class="card">
      <h2>Sun</h2>
      <div class="grid">
        <div class="stat"><div class="k">Sunrise</div><div class="v">${(f.sunrise[0]||``).slice(11,16)}</div></div>
        <div class="stat"><div class="k">Sunset</div><div class="v">${(f.sunset[0]||``).slice(11,16)}</div></div>
        <div class="stat"><div class="k">Max UV</div><div class="v">${Math.round(f.uv_index_max[0]??0)}</div></div>
        <div class="stat"><div class="k">Rain total</div><div class="v">${w.toFixed(1)} mm</div></div>
      </div>
    </div>

    <div class="card placeholder">
      <h2>Nepal rain map</h2>
      <p class="sub">Live national rain radar arrives in Phase 4.</p>
    </div>
  `}async function g(e,t){let n=document.getElementById(e);if(n){n.innerHTML=`<div class="card"><div class="state">Loading weather…</div></div>`;try{let{f:e,a:r}=await f(t.lat,t.lon);h(n,t,e,r);try{localStorage.setItem(`wx:${t.slug}`,JSON.stringify({f:e,a:r,at:Date.now()}))}catch{}}catch(e){console.error(`mount failed:`,e);let r=null;try{r=JSON.parse(localStorage.getItem(`wx:${t.slug}`)||`null`)}catch{}if(r){h(n,t,r.f,r.a,newDate(r.at));let e=Math.round((Date.now()-r.at)/6e4);n.insertAdjacentHTML(`afterbegin`,`<div class="alert a-warn">📴 Offline — showing data from ${e} min ago.</div>`)}else n.innerHTML=`<div class="card"><div class="state">
        ⚠️ Could not load weather for <b>${t.en}</b>.<br>Check your connection.</div>
        <div style="text-align:center;margin-top:14px">
        <button onclick="location.reload()">Try again</button></div></div>`}}}export{g as t};