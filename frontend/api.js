const API_BASE_URL = 'https://trippilot-backend-0xk1.onrender.com';

/* ─────────────────────────────────────────
   LOADER CONFIG
───────────────────────────────────────── */
const LOADER_STEPS = [
  { id: 'parse',   label: 'Reading your trip details' },
  { id: 'flights', label: 'Searching live flights' },
  { id: 'hotels',  label: 'Scanning hotels' },
  { id: 'rank',    label: 'Ranking & comparing options' },
];

// Step advances at these ms marks (actor takes ~2 min)
const STEP_TIMINGS = [0, 5000, 45000, 95000];

const LOADER_MESSAGES = [
  'Searching live flights across all airlines...',
  'Checking availability for your travel dates...',
  'Scanning Booking.com for the best hotel rates...',
  'Matching hotels to your area preferences...',
  'Scoring options by price, stops and rating...',
  'Comparing everything against your budget...',
  'Almost there, building your recommendations...',
];

let _msgInterval = null;
let _stepTimers  = [];

function stopLoaderAnimations() {
  clearInterval(_msgInterval);
  _stepTimers.forEach(clearTimeout);
  _msgInterval = null;
  _stepTimers  = [];
}

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
function formatDuration(mins) {
  const h = Math.floor(mins / 60), m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatDate(str) {
  if (!str) return '';
  const d = new Date(str);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ─────────────────────────────────────────
   SUBMIT BUTTON STATE
───────────────────────────────────────── */
function setSubmitLoading() {
  const btn = document.getElementById('submit-btn');
  if (!btn) return;
  btn.disabled = true;
  const t = btn.querySelector('.btn-text');
  const i = btn.querySelector('.btn-icon');
  if (t) t.textContent = 'Searching...';
  if (i) i.textContent = '⏳';
}

function setSubmitIdle() {
  const btn = document.getElementById('submit-btn');
  if (!btn) return;
  btn.disabled = false;
  const t = btn.querySelector('.btn-text');
  const i = btn.querySelector('.btn-icon');
  if (t) t.textContent = 'Plan My Trip';
  if (i) i.textContent = '→';
}

/* ─────────────────────────────────────────
   LOADER
───────────────────────────────────────── */
function showLoader() {
  const area = document.getElementById('results-area');
  if (!area) return;

  area.innerHTML = `
    <div class="tp-loader-wrap">
      <div class="tp-loader">
        <div class="tp-loader-plane">✈</div>
        <h3 class="tp-loader-heading">Searching for your trip</h3>
        <p class="tp-loader-msg" id="loader-msg">${LOADER_MESSAGES[0]}</p>
        <div class="tp-loader-steps">
          ${LOADER_STEPS.map((s, i) => `
            <div class="tp-lstep ${i === 0 ? 'tp-lstep--active' : ''}" id="lstep-${s.id}">
              <span class="tp-lstep-dot"></span>
              <span class="tp-lstep-label">${s.label}</span>
            </div>
          `).join('')}
        </div>
        <p class="tp-loader-note">Live data from Google Flights &amp; Booking.com &nbsp;·&nbsp; Usually takes 1–2 min</p>
      </div>
    </div>
  `;

  area.scrollIntoView({ behavior: 'smooth', block: 'center' });

  // Cycle messages
  let msgIdx = 0;
  _msgInterval = setInterval(() => {
    msgIdx = (msgIdx + 1) % LOADER_MESSAGES.length;
    const el = document.getElementById('loader-msg');
    if (!el) return;
    el.classList.add('tp-fade-out');
    setTimeout(() => {
      el.textContent = LOADER_MESSAGES[msgIdx];
      el.classList.remove('tp-fade-out');
    }, 300);
  }, 5000);

  // Advance steps
  STEP_TIMINGS.forEach((delay, i) => {
    if (i === 0) return;
    const t = setTimeout(() => {
      document.querySelectorAll('.tp-lstep').forEach((el, si) => {
        if (si < i) {
          el.classList.remove('tp-lstep--active');
          el.classList.add('tp-lstep--done');
        } else if (si === i) {
          el.classList.add('tp-lstep--active');
        }
      });
    }, delay);
    _stepTimers.push(t);
  });
}

/* ─────────────────────────────────────────
   CARD BUILDERS
───────────────────────────────────────── */
function flightCard(flight, isTopPick, rank) {
  const airline  = flight.airline || 'Charter';
  const code     = flight.airlineCode || airline.slice(0, 2).toUpperCase();
  const duration = formatDuration(flight.durationMinutes);
  const stops    = flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`;
  const direct   = flight.stops === 0 ? 'tp-direct' : '';
  const price    = flight.price ? `$${flight.price.toLocaleString()}` : '—';

  return `
    <div class="tp-flight-card${isTopPick ? ' tp-top-pick' : ''}">
      ${isTopPick
        ? '<div class="tp-badge">⭐ Top Flight</div>'
        : `<div class="tp-rank">#${rank}</div>`}
      <div class="tp-flight-airline">
        <div class="tp-airline-pill">${code}</div>
        <div>
          <div class="tp-airline-name">${airline}</div>
          <div class="tp-cabin">${flight.cabin || 'Economy'}</div>
        </div>
      </div>
      <div class="tp-flight-route">
        <div class="tp-endpoint">
          <div class="tp-time">${flight.departureTime || '—'}</div>
          <div class="tp-iata">${flight.origin || ''}</div>
        </div>
        <div class="tp-route-mid">
          <div class="tp-duration">${duration}</div>
          <div class="tp-route-line-wrap">
            <div class="tp-route-dot"></div>
            <div class="tp-route-dash"></div>
            <div class="tp-plane-icon">✈</div>
            <div class="tp-route-dash"></div>
            <div class="tp-route-dot"></div>
          </div>
          <div class="tp-stops-label ${direct}">${stops}</div>
        </div>
        <div class="tp-endpoint tp-endpoint-right">
          <div class="tp-time">${flight.arrivalTime || '—'}</div>
          <div class="tp-iata">${flight.destination || ''}</div>
        </div>
      </div>
      <div class="tp-card-footer">
        <div class="tp-price">${price} <span class="tp-per">/ person</span></div>
        <button class="tp-cta-btn">Select</button>
      </div>
    </div>`;
}

function hotelCard(hotel, isTopPick, rank) {
  const score      = hotel.reviewScore || 0;
  const scoreClass = score >= 8.5 ? 'tp-score-excellent' : score >= 7 ? 'tp-score-good' : 'tp-score-ok';
  const scoreLabel = score >= 8.5 ? 'Excellent' : score >= 7 ? 'Very Good' : 'Good';
  const checkIn    = formatDate(hotel.checkIn);
  const checkOut   = formatDate(hotel.checkOut);
  const nights     = hotel.checkIn && hotel.checkOut
    ? Math.round((new Date(hotel.checkOut) - new Date(hotel.checkIn)) / 86400000) : null;

  return `
    <div class="tp-hotel-card${isTopPick ? ' tp-top-pick' : ''}">
      ${isTopPick
        ? '<div class="tp-badge">⭐ Top Hotel</div>'
        : `<div class="tp-rank">#${rank}</div>`}
      <div class="tp-hotel-main">
        <div class="tp-hotel-name">${hotel.name}</div>
        <div class="tp-hotel-loc">📍 ${hotel.city || hotel.address || ''}</div>
        <div class="tp-hotel-rating">
          <span class="tp-score ${scoreClass}">${score}</span>
          <span class="tp-score-label">${scoreLabel}</span>
          ${hotel.reviewCount ? `<span class="tp-review-count">${Number(hotel.reviewCount).toLocaleString()} reviews</span>` : ''}
        </div>
        ${nights ? `<div class="tp-hotel-dates">${checkIn} – ${checkOut} · ${nights} nights · ${hotel.adults} adults</div>` : ''}
      </div>
      <div class="tp-card-footer">
        <div class="tp-price">${hotel.price || '—'} <span class="tp-per">total</span></div>
        <a class="tp-cta-btn tp-cta-hotel" href="${hotel.url || '#'}" target="_blank" rel="noopener noreferrer">Book →</a>
      </div>
    </div>`;
}

/* ─────────────────────────────────────────
   RENDER RESULTS
───────────────────────────────────────── */
function renderResults(data) {
  stopLoaderAnimations();
  const area = document.getElementById('results-area');
  if (!area) return;

  const flights = data.research?.flights || [];
  const hotels  = data.research?.hotels  || [];
  const req     = data.interpretation?.requirements || {};

  const origin    = req.origin?.value || '';
  const dest      = req.destination?.value || '';
  const depDate   = req.departure_date?.value || '';
  const retDate   = req.return_date?.value || '';
  const adults    = req.adults?.value || 1;
  const budget    = req.budget?.value;
  const currency  = req.currency?.value || 'USD';

  area.innerHTML = `
    <div class="tp-results">
      <div class="wrap">

        <div class="tp-summary">
          <div class="tp-summary-route">
            <span class="tp-iata-lg">${origin}</span>
            <span class="tp-route-arrow">→</span>
            <span class="tp-iata-lg">${dest}</span>
          </div>
          <div class="tp-summary-meta">
            ${depDate ? `<span>${formatDate(depDate)}${retDate ? ' – ' + formatDate(retDate) : ''}</span>` : ''}
            <span>${adults} adult${adults > 1 ? 's' : ''}</span>
            ${budget ? `<span>${currency} ${Number(budget).toLocaleString()} budget</span>` : ''}
          </div>
          <div class="tp-summary-count">${flights.length} flights · ${hotels.length} hotels found</div>
        </div>

        ${flights[0] && hotels[0] ? `
        <div class="tp-combo">
          <div class="tp-combo-header">
            <span class="tp-combo-badge">⭐ Best Combination</span>
            <p>Our top-ranked flight + hotel based on your budget and preferences</p>
          </div>
          <div class="tp-combo-grid">
            ${flightCard(flights[0], true, 1)}
            ${hotelCard(hotels[0], true, 1)}
          </div>
        </div>` : ''}

        <div class="tp-section">
          <div class="tp-section-head">
            <h2>Flights</h2>
            <span class="tp-count">${flights.length}</span>
          </div>
          <div class="tp-cards-grid">
            ${flights.map((f, i) => flightCard(f, false, i + 1)).join('')}
          </div>
        </div>

        <div class="tp-section">
          <div class="tp-section-head">
            <h2>Hotels</h2>
            <span class="tp-count">${hotels.length}</span>
          </div>
          <div class="tp-cards-grid">
            ${hotels.map((h, i) => hotelCard(h, false, i + 1)).join('')}
          </div>
        </div>

        <div class="tp-restart">
          <button class="tp-action-btn" id="restart-btn">Plan Another Trip</button>
        </div>

      </div>
    </div>`;

  // Staggered card reveal
  setTimeout(() => {
    document.querySelectorAll('.tp-flight-card, .tp-hotel-card').forEach((card, i) => {
      card.style.animationDelay = `${i * 55}ms`;
      card.classList.add('tp-card-reveal');
    });
  }, 50);

  area.scrollIntoView({ behavior: 'smooth', block: 'start' });

  document.getElementById('restart-btn')?.addEventListener('click', () => {
    area.innerHTML = '';
    document.getElementById('trip-form').reset();
    document.getElementById('plan').scrollIntoView({ behavior: 'smooth' });
    setSubmitIdle();
  });
}

/* ─────────────────────────────────────────
   RENDER CLARIFICATION
───────────────────────────────────────── */
function renderClarification(question) {
  stopLoaderAnimations();
  const area = document.getElementById('results-area');
  if (!area) return;

  area.innerHTML = `
    <div class="tp-clarify-wrap">
      <div class="tp-clarify">
        <div class="tp-clarify-icon">🧭</div>
        <h3>One quick question</h3>
        <p>${question}</p>
        <button class="tp-action-btn" id="refine-btn">Refine my trip →</button>
      </div>
    </div>`;

  area.scrollIntoView({ behavior: 'smooth', block: 'center' });

  document.getElementById('refine-btn')?.addEventListener('click', () => {
    area.innerHTML = '';
    document.getElementById('trip-request').focus();
    setSubmitIdle();
  });
}

/* ─────────────────────────────────────────
   RENDER ERROR
───────────────────────────────────────── */
function renderError(message) {
  stopLoaderAnimations();
  const area = document.getElementById('results-area');
  if (!area) return;

  area.innerHTML = `
    <div class="tp-error-wrap">
      <div class="tp-error">
        <div class="tp-error-icon">⚠️</div>
        <h3>Something went wrong</h3>
        <p>${message}</p>
        <button class="tp-action-btn" id="retry-btn">Try again</button>
      </div>
    </div>`;

  document.getElementById('retry-btn')?.addEventListener('click', () => {
    area.innerHTML = '';
    setSubmitIdle();
  });
}

/* ─────────────────────────────────────────
   FORM SUBMIT
───────────────────────────────────────── */
const tripForm = document.getElementById('trip-form');

tripForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const tripRequest = document.getElementById('trip-request').value.trim();
  const budget      = document.getElementById('budget').value.trim();

  if (!tripRequest) return;

  let message = tripRequest;
  if (budget) message += `. My maximum budget is ${budget}.`;

  setSubmitLoading();
  showLoader();

  try {
    const response = await fetch(`${API_BASE_URL}/api/trip-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    const result = await response.json();

    if (!response.ok) throw new Error(result.message || 'Trip search failed.');

    if (result.status === 'needs_clarification') {
      const question =
        result.clarification_question ||
        result.question ||
        result.message ||
        'Can you share a bit more about your trip?';
      renderClarification(question);

    } else if (result.status === 'research_completed') {
      renderResults(result);

    } else {
      renderError(result.message || 'An unexpected response was received.');
    }

  } catch (err) {
    console.error('TripPilot error:', err);
    renderError('Something went wrong while planning your trip. Please try again.');
  } finally {
    setSubmitIdle();
  }
});
