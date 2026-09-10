import { wx, intensity } from '../lib/wmo.ts';
import { hour12, weekday, windDir, aqi } from '../lib/format.ts';

const TZ  = 'Asia%2FKathmandu';
const API = 'https://api.open-meteo.com/v1/forecast';
const AQ  = 'https://air-quality-api.open-meteo.com/v1/air-quality';

async function fetchWeather(lat, lon) {
  const fc = `${API}?latitude=${lat}&longitude=${lon}`
    + `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,`
    + `weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m`
    + `&minutely_15=precipitation`
    + `&hourly=temperature_2m,precipitation_probability,precipitation,weather_code,`
    + `wind_speed_10m,relative_humidity_2m,uv_index`
    + `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,`
    + `uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max`
    + `&timezone=${TZ}&forecast_days=10`;

  const aq = `${AQ}?latitude=${lat}&longitude=${lon}&current=pm2_5,pm10,us_aqi&timezone=${TZ}`;

  const [f, a] = await Promise.all([
    fetch(fc).then(r => { if (!r.ok) throw new Error('forecast failed'); return r.json(); }),
    fetch(aq).then(r => (r.ok ? r.json() : null)).catch(() => null),
  ]);
  return { f, a };
}

/* Nowcast: read 15-minute precipitation slots, convert to mm/hr, describe. */
function nowcast(minutely, currentIso) {
  const t = minutely?.time, p = minutely?.precipitation;
  if (!t?.length || !p?.length) return { state: 'unknown', text: '' };

  const nowKey = currentIso.slice(0, 13);
  let i = t.findIndex(x => x.slice(0, 13) === nowKey);
  if (i < 0) i = 0;

  const mmhr = k => (p[k] ?? 0) * 4;      // 15-min mm → mm/hr
  const now  = mmhr(i);
  const next = Array.from({ length: 8 }, (_, k) => mmhr(i + k));   // next 2 hours
  const peak = Math.max(...next);
  const peakAt = i + next.indexOf(peak);

  const isRaining = now >= 0.1;

  let firstWet = -1;
  for (let k = 1; k < next.length; k++) if (next[k] >= 0.1) { firstWet = k; break; }

  let stop = -1;
  if (isRaining && firstWet === -1) {
    for (let k = 1; k < 12 && i + k < p.length; k++) {
      if ((p[i + k] ?? 0) < 0.02) { stop = k; break; }
    }
  }

  const grade = intensity(peak);
  const mins  = k => k * 15;

  if (!isRaining && firstWet !== -1) {
    return {
      state: 'starting',
      text: `Rain starting in about ${mins(firstWet)} min`,
      detail: `Peak ${grade.label.toLowerCase()}, ${peak.toFixed(1)} mm/h`,
    };
  }
  if (isRaining && stop !== -1) {
    return {
      state: 'stopping',
      text: `Rain stopping in about ${mins(stop)} min`,
      detail: `Currently ${intensity(now).label.toLowerCase()}, ${now.toFixed(1)} mm/h`,
    };
  }
  if (isRaining) {
    return {
      state: 'raining',
      text: `Raining now — ${intensity(now).label.toLowerCase()}`,
      detail: `Next 2h peak ${peak.toFixed(1)} mm/h around ${hour12(t[peakAt])}`,
    };
  }
  return {
    state: 'dry',
    text: 'No rain expected in the next 2 hours',
    detail: peak > 0.1 ? `Later peak ${peak.toFixed(1)} mm/h around ${hour12(t[peakAt])}` : '',
  };
}

/* Rule-based alerts for Nepal. Clearly NOT official warnings. */
function alertsFor(f, a) {
  const d = f.daily, c = f.current, out = [];

  const rain0 = d.precipitation_sum[0] ?? 0;
  const rain1 = d.precipitation_sum[1] ?? 0;
  const pop0  = d.precipitation_probability_max[0] ?? 0;

  if (rain0 >= 100 || rain1 >= 100 || (pop0 >= 80 && rain0 >= 50))
    out.push(['bad', '🌧️ <b>Heavy rain expected.</b> Flood and landslide risk in hill and Tarai districts. Avoid landslide-prone roads.']);
  else if (rain0 >= 50 || pop0 >= 70)
    out.push(['warn', '🌦️ <b>Significant rain likely.</b> Carry rain gear and watch for localised flooding.']);

  if (d.temperature_2m_max[0] >= 38)
    out.push(['bad', '🔥 <b>Heat wave conditions.</b> Stay hydrated, avoid outdoor work 11am–4pm.']);
  if (d.temperature_2m_min[0] <= 2)
    out.push(['warn', '❄️ <b>Near-freezing night.</b> Protect crops, livestock and exposed pipes.']);
  if (c.wind_gusts_10m >= 60)
    out.push(['warn', `💨 <b>Strong gusts</b> up to ${Math.round(c.wind_gusts_10m)} km/h.`]);
  if (a?.current?.us_aqi >= 150)
    out.push(['bad', `😷 <b>Unhealthy air</b> (US AQI ${Math.round(a.current.us_aqi)}). Limit outdoor exertion.`]);

  return out;
}

function render(root, loc, f, a) {
  const c = f.current, d = f.daily, h = f.hourly;
  const [cond, emo] = wx(c.weather_code);

  const nowIso = c.time.slice(0, 13);
  let i0 = h.time.findIndex(t => t.slice(0, 13) === nowIso);
  if (i0 < 0) i0 = 0;

  const nc     = nowcast(f.minutely_15, c.time);
  const alerts = alertsFor(f, a);
  const [aqTxt, aqCol] = aqi(a?.current?.us_aqi);
  const rain0  = d.precipitation_sum[0] ?? 0;

  root.innerHTML = `
    <div class="card hero-card">
      <div class="hero">
        <div class="icon">${emo}</div>
        <div class="hero-main">
          <div class="loc-ne">${loc.ne}</div>
          <div class="loc-en">${loc.en}</div>
          <div class="temp">${Math.round(c.temperature_2m)}°</div>
          <div class="cond">${cond}</div>
          <div class="sub">Feels ${Math.round(c.apparent_temperature)}° ·
            H ${Math.round(d.temperature_2m_max[0])}° L ${Math.round(d.temperature_2m_min[0])}°</div>
        </div>
        <div class="meta">
          Updated ${hour12(c.time)} NPT<br>
          ${loc.lat.toFixed(3)}°N, ${loc.lon.toFixed(3)}°E<br>
          Open-Meteo
        </div>
      </div>
    </div>

    <div class="card nowcast nc-${nc.state}">
      <div class="nc-text">${nc.text}</div>
      ${nc.detail ? `<div class="nc-detail">${nc.detail}</div>` : ''}
    </div>

    ${alerts.length ? `<div class="alerts">${alerts.map(([s, m]) =>
      `<div class="alert a-${s}">${m}</div>`).join('')}</div>` : ''}

    <div class="card dhm-card">
      <span>⚠️ Official warnings are issued by DHM Nepal.</span>
      <a href="https://www.dhm.gov.np/" target="_blank" rel="noopener">Check DHM →</a>
    </div>

    <div class="grid">
      ${[
        ['Rain today', `${rain0.toFixed(1)} mm`],
        ['Rain chance', `${d.precipitation_probability_max[0] ?? 0}%`],
        ['Humidity', `${Math.round(c.relative_humidity_2m)}%`],
        ['Wind', `${Math.round(c.wind_speed_10m)} km/h ${windDir(c.wind_direction_10m)}`],
        ['Gusts', `${Math.round(c.wind_gusts_10m)} km/h`],
        ['UV', h.uv_index[i0] != null ? Math.round(h.uv_index[i0]) : '—'],
        ['Pressure', `${Math.round(c.pressure_msl)} hPa`],
        ['Air quality', a?.current
          ? `<span class="aqi-badge" style="background:${aqCol}">${Math.round(a.current.us_aqi)} ${aqTxt}</span>`
          : '—'],
      ].map(([k, v]) =>
        `<div class="stat"><div class="k">${k}</div><div class="v">${v}</div></div>`
      ).join('')}
    </div>

    <div class="card">
      <h2>Next 24 hours</h2>
      <div class="hourly">
        ${h.time.slice(i0, i0 + 24).map((t, k) => {
          const j = i0 + k;
          return `<div class="hour">
            <div class="h">${k === 0 ? 'Now' : hour12(t)}</div>
            <div class="e">${wx(h.weather_code[j])[1]}</div>
            <div class="t">${Math.round(h.temperature_2m[j])}°</div>
            <div class="p">${h.precipitation_probability[j] ?? ''}%</div>
          </div>`;
        }).join('')}
      </div>
    </div>

    <div class="card">
      <h2>10-day forecast</h2>
      ${d.time.map((t, i) => `
        <div class="day">
          <span>${i === 0 ? 'Today' : weekday(t)}</span>
          <span class="e">${wx(d.weather_code[i])[1]}</span>
          <span><span class="hi">${Math.round(d.temperature_2m_max[i])}°</span>
                <span class="lo">${Math.round(d.temperature_2m_min[i])}°</span></span>
          <span class="sub">💧 ${d.precipitation_probability_max[i] ?? '—'}%</span>
          <span class="sub">${Math.round(d.wind_speed_10m_max[i])} km/h</span>
        </div>`).join('')}
    </div>

    <div class="card">
      <h2>Sun</h2>
      <div class="grid">
        <div class="stat"><div class="k">Sunrise</div><div class="v">${(d.sunrise[0] || '').slice(11, 16)}</div></div>
        <div class="stat"><div class="k">Sunset</div><div class="v">${(d.sunset[0] || '').slice(11, 16)}</div></div>
        <div class="stat"><div class="k">Max UV</div><div class="v">${Math.round(d.uv_index_max[0] ?? 0)}</div></div>
        <div class="stat"><div class="k">Rain total</div><div class="v">${rain0.toFixed(1)} mm</div></div>
      </div>
    </div>

    <div class="card placeholder">
      <h2>Nepal rain map</h2>
      <p class="sub">Live national rain radar arrives in Phase 4.</p>
    </div>
  `;
}

export async function mount(rootId, loc) {
  const root = document.getElementById(rootId);
  if (!root) return;

  root.innerHTML = '<div class="card"><div class="state">Loading weather…</div></div>';

  try {
    const { f, a } = await fetchWeather(loc.lat, loc.lon);
    render(root, loc, f, a);
    try { localStorage.setItem(`wx:${loc.slug}`, JSON.stringify({ f, a, at: Date.now() })); } catch {}
  } catch (e) {
    let cached = null;
    try { cached = JSON.parse(localStorage.getItem(`wx:${loc.slug}`) || 'null'); } catch {}

    if (cached) {
      render(root, loc, cached.f, cached.a);
      const age = Math.round((Date.now() - cached.at) / 60000);
      root.insertAdjacentHTML('afterbegin',
        `<div class="alert a-warn">📴 Offline — showing data from ${age} min ago.</div>`);
    } else {
      root.innerHTML = `<div class="card"><div class="state">
        ⚠️ Could not load weather for <b>${loc.en}</b>.<br>Check your connection.</div>
        <div style="text-align:center;margin-top:14px">
        <button onclick="location.reload()">Try again</button></div></div>`;
    }
  }
}