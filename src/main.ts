import './styles.css';
import { teams, type TeamRow } from './teamData';


const app = document.querySelector<HTMLDivElement>('#app')!;
const factorHelp: Record<string, string> = {
  net: 'Net Rating is points scored minus points allowed per 100 possessions. Positive values indicate that a team outscored opponents after adjusting for pace.',
  offense: 'Offensive Rating is points scored per 100 possessions. Higher is better.',
  defense: 'Defensive Rating is points allowed per 100 possessions. Lower is better.',
  shooting: 'Effective field-goal percentage gives extra credit to three-pointers because they are worth more than two-pointers.',
  turnovers: 'Turnover percentage estimates how often possessions end with the offense losing the ball. Lower is usually better.',
  rebounding: 'Offensive and defensive rebound rates estimate how often a team wins available rebounds on each end.',
  pace: 'Pace estimates possessions per 48 minutes. It changes game style and can affect how comfortable each team is at the expected tempo.',
  home: 'Home court is treated as a modest contextual advantage, not a guarantee.',
  rest: 'Back-to-backs receive a small fatigue penalty; extra rest receives a smaller positive adjustment.',
  recent: 'Recent form uses the last 10 games as a modest update so a short streak cannot erase a full season of evidence.',
  players: 'Player adjustments let you model availability, recent performance, role changes, and estimated on-court influence separately for up to three important players per team.',
  rotation: 'Rotation continuity reflects whether the usual lineup and roles are intact. Major lineup disruption lowers the estimate.',
  bench: 'Bench depth reflects how well a team can sustain quality when starters rest or when the rotation is shortened.',
  matchup: 'Matchup fit captures a user judgment about whether size, perimeter defense, rim pressure, or another style feature creates a specific advantage.'
};

function nav(): string {
  return `<nav class="topbar"><a class="brand" href="#/model"><span></span>POSSESSION LAB</a><div class="navlinks"><a data-route="model" href="#/model">Model</a><a data-route="learn" href="#/learn">Learn the numbers</a><a data-route="method" href="#/method">Method</a><a data-route="evidence" href="#/evidence">Evidence</a><a data-route="about" href="#/about">Founder</a></div></nav>`;
}

function shell(content: string): void {
  app.innerHTML = `${nav()}<main>${content}</main><footer><div><a class="brand" href="#/model"><span></span>POSSESSION LAB</a><p>Basketball analytics built to be inspected, adjusted, and understood.</p></div><p>Independent research project. Not affiliated with or endorsed by the NBA or any NBA team. Forecasts are model estimates, not certainties.</p></footer>`;
  markActive();
}

function markActive(): void {
  const route = (location.hash.replace('#/', '') || 'model').split('?')[0];
  document.querySelectorAll<HTMLAnchorElement>('[data-route]').forEach((a) => a.classList.toggle('active', a.dataset.route === route));
}

function info(label: string, key: string): string {
  return `<details class="inline-info"><summary>${label}<span>i</span></summary><p>${factorHelp[key]}</p></details>`;
}

function seasonLabel(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  if (m >= 10) return `${y}–${String(y + 1).slice(-2)}`;
  return `${y - 1}–${String(y).slice(-2)}`;
}

function modelView(): void {
  shell(`<section class="hero compact"><div><p class="kicker">NBA MATCHUP FORECASTING PROJECT</p><h1>Build the game before it happens.</h1><p class="lede">Select two teams, update what is different about this specific night, and see how each assumption moves the forecast. The model combines season performance, game context, and player-level inputs instead of reducing a matchup to one statistic.</p><div class="hero-actions"><a class="btn primary" href="#builder">Build a matchup</a><a class="btn ghost" href="#/method">How the model is built</a></div></div><aside class="status-card"><span>CURRENT DATA MODE</span><strong id="seasonStatus">${seasonLabel()}</strong><p id="dataStatus">Using the latest available season baseline. Static GitHub edition using the verified 2025–26 full-season baseline.</p></aside></section>

<section id="builder" class="builder"><div class="section-title"><div><p class="kicker">MATCHUP BUILDER</p><h2>Set the conditions.</h2></div><p>Nothing is hidden. Every adjustment appears in the factor board below, and every unfamiliar statistic has an explanation.</p></div>
<div class="team-select-row"><div><label for="teamA">Team A</label><select id="teamA"></select></div><button id="swapTeams" class="swap" type="button" aria-label="Swap teams">⇄</button><div><label for="teamB">Team B</label><select id="teamB"></select></div></div>
<div id="teamCards" class="team-cards"></div>

<div class="controls-grid">
  <section class="control-card"><h3>Game setting</h3><label>Location<select id="location"><option value="A">Team A home</option><option value="neutral">Neutral court</option><option value="B">Team B home</option></select></label><label>Expected pace<select id="paceMode"><option value="auto">Use team styles</option><option value="slow">Slower than usual</option><option value="fast">Faster than usual</option></select></label>${info('Why these matter', 'home')}</section>
  <section class="control-card"><h3>Rest and travel load</h3><label>Team A rest<select id="restA"><option value="0">Back-to-back</option><option value="1" selected>1 day</option><option value="2">2 days</option><option value="3">3+ days</option></select></label><label>Team B rest<select id="restB"><option value="0">Back-to-back</option><option value="1" selected>1 day</option><option value="2">2 days</option><option value="3">3+ days</option></select></label>${info('How rest is used', 'rest')}</section>
  <section class="control-card"><h3>Recent form</h3><label>Team A wins in last 10<input id="formA" type="range" min="0" max="10" value="5"><output id="formAOut">5</output></label><label>Team B wins in last 10<input id="formB" type="range" min="0" max="10" value="5"><output id="formBOut">5</output></label>${info('Why short-term form is limited', 'recent')}</section>
  <section class="control-card"><h3>Rotation and bench</h3><label>Team A lineup continuity<select id="rotationA"><option value="0.7">Stable rotation</option><option value="0" selected>Normal</option><option value="-0.8">Some disruption</option><option value="-1.8">Major disruption</option></select></label><label>Team B lineup continuity<select id="rotationB"><option value="0.7">Stable rotation</option><option value="0" selected>Normal</option><option value="-0.8">Some disruption</option><option value="-1.8">Major disruption</option></select></label><label>Team A bench depth<select id="benchA"><option value="0.8">Clear advantage</option><option value="0" selected>Neutral</option><option value="-0.8">Thin rotation</option></select></label><label>Team B bench depth<select id="benchB"><option value="0.8">Clear advantage</option><option value="0" selected>Neutral</option><option value="-0.8">Thin rotation</option></select></label>${info('What rotation continuity means', 'rotation')}</section>
  <section class="control-card"><h3>Matchup-specific fit</h3><label>Team A style fit<select id="fitA"><option value="1.2">Strong advantage</option><option value="0.6">Small advantage</option><option value="0" selected>Neutral</option><option value="-0.6">Small disadvantage</option><option value="-1.2">Strong disadvantage</option></select></label><label>Team B style fit<select id="fitB"><option value="1.2">Strong advantage</option><option value="0.6">Small advantage</option><option value="0" selected>Neutral</option><option value="-0.6">Small disadvantage</option><option value="-1.2">Strong disadvantage</option></select></label>${info('When to use this', 'matchup')}</section>
</div>

<section class="players-section"><div class="section-title"><div><p class="kicker">PLAYER-LEVEL ADJUSTMENTS</p><h2>Account for more than availability.</h2></div><p>Add up to three important players per team. You can model injury status, recent performance, a changed role, and estimated on-court influence separately.</p></div><div class="player-columns"><div><h3 id="playerATitle">Team A players</h3><div id="playersA"></div></div><div><h3 id="playerBTitle">Team B players</h3><div id="playersB"></div></div></div>${info('How player adjustments are handled', 'players')}</section>

<div class="action-row"><button id="calculate" class="btn primary" type="button">Recalculate matchup</button></div>
<div id="refreshNote" class="refresh-note"></div>

<section class="forecast" aria-live="polite"><div class="forecast-head"><div><p class="kicker">FORECAST</p><h2 id="winner">Select two teams</h2><p id="summary">The forecast will update as you change the matchup.</p></div><div class="prob"><strong id="probability">—</strong><span>estimated win chance</span></div></div><div class="split"><div id="barA"></div><div id="barB"></div></div><div class="split-labels"><span id="labelA"></span><span id="labelB"></span></div><div id="factorBoard" class="factor-board"></div><section class="reading"><h3>How to read this result</h3><p id="readingText"></p></section></section>
</section>`);
  initModel();
}

function playerBlock(side: 'A' | 'B', n: number): string {
  return `<article class="player-card"><div class="player-card-top"><strong>Player ${n}</strong><input id="p${side}${n}Name" list="roster${side}" placeholder="Optional player name"></div><div class="player-grid"><label>Status<select id="p${side}${n}Status"><option value="0" selected>Available</option><option value="-0.7">Limited</option><option value="-1.8">Starter unavailable</option><option value="-3.5">Primary star unavailable</option></select></label><label>Recent form<select id="p${side}${n}Form"><option value="0.6">Above normal</option><option value="0" selected>Normal</option><option value="-0.6">Below normal</option></select></label><label>Role change<select id="p${side}${n}Role"><option value="0.5">Expanded role working well</option><option value="0" selected>Normal role</option><option value="-0.5">Role instability</option></select></label><label>Estimated impact<select id="p${side}${n}Impact"><option value="1.2">High positive impact</option><option value="0.5">Positive impact</option><option value="0" selected>Neutral / unknown</option><option value="-0.5">Negative matchup impact</option></select></label></div></article>`;
}

const restAdjust: Record<string, number> = { '0': -1.15, '1': 0, '2': 0.3, '3': 0.45 };

function initModel(): void {
  const a = document.querySelector<HTMLSelectElement>('#teamA')!;
  const b = document.querySelector<HTMLSelectElement>('#teamB')!;
  teams.forEach((t, i) => { a.add(new Option(t.name, String(i))); b.add(new Option(t.name, String(i))); });
  a.value = String(teams.findIndex((t) => t.name === 'Golden State Warriors'));
  b.value = String(teams.findIndex((t) => t.name === 'Oklahoma City Thunder'));
  document.querySelector('#playersA')!.innerHTML = [1,2,3].map((n) => playerBlock('A', n)).join('') + '<datalist id="rosterA"></datalist>';
  document.querySelector('#playersB')!.innerHTML = [1,2,3].map((n) => playerBlock('B', n)).join('') + '<datalist id="rosterB"></datalist>';
  const refresh = (): void => { renderTeams(); calculate(); };
  a.addEventListener('change', refresh); b.addEventListener('change', refresh);
  document.querySelector('#swapTeams')!.addEventListener('click', () => { const x = a.value; a.value = b.value; b.value = x; renderTeams(); calculate(); });
  document.querySelectorAll('select,input').forEach((el) => el.addEventListener('change', calculate));
  ['formA','formB'].forEach((id) => document.querySelector(`#${id}`)!.addEventListener('input', () => { document.querySelector(`#${id}Out`)!.textContent = (document.querySelector(`#${id}`) as HTMLInputElement).value; calculate(); }));
  document.querySelector('#calculate')!.addEventListener('click', calculate);
  renderTeams(); calculate();
}

function currentTeam(side: 'A'|'B'): TeamRow {
  const idx = Number((document.querySelector(`#team${side}`) as HTMLSelectElement).value);
  const fallback = teams[idx];
  return fallback;
}

function stat(v: number, digits = 1): string { return Number.isFinite(v) ? v.toFixed(digits) : '—'; }

function renderTeams(): void {
  const a = currentTeam('A'); const b = currentTeam('B');
  document.querySelector('#playerATitle')!.textContent = `${a.name} players`;
  document.querySelector('#playerBTitle')!.textContent = `${b.name} players`;
  document.querySelector('#teamCards')!.innerHTML = [a,b].map((t, i) => `<article class="team-overview"><div><span>TEAM ${i === 0 ? 'A' : 'B'}</span><h3>${t.name}</h3><small>${t.w}–${t.l} record</small></div><div class="metric"><small>Net Rating</small><strong>${t.net >= 0 ? '+' : ''}${stat(t.net)}</strong></div><div class="metric"><small>Offense</small><strong>${stat(t.ortg)}</strong></div><div class="metric"><small>Defense</small><strong>${stat(t.drtg)}</strong></div><div class="metric"><small>eFG%</small><strong>${stat(t.efg * 100)}%</strong></div></article>`).join('');
  updateRoster('A', a.name); updateRoster('B', b.name);
}

function updateRoster(side: 'A'|'B', teamName: string): void {
  const list = document.querySelector<HTMLDataListElement>(`#roster${side}`);
  if (!list) return;
  void teamName;
  const names: string[] = [];
  list.innerHTML = names.map((n) => `<option value="${n}"></option>`).join('');
}

function playerAdjustment(side: 'A'|'B'): number {
  let sum = 0;
  for (let n = 1; n <= 3; n++) {
    const name = (document.querySelector(`#p${side}${n}Name`) as HTMLInputElement).value.trim();
    if (!name) continue;
    for (const key of ['Status','Form','Role','Impact']) sum += Number((document.querySelector(`#p${side}${n}${key}`) as HTMLSelectElement).value);
  }
  return sum;
}

function val(id: string): number { return Number((document.querySelector(`#${id}`) as HTMLSelectElement | HTMLInputElement).value); }
function logistic(x: number): number { return Math.min(.95, Math.max(.05, 1 / (1 + Math.exp(-x / 6.4)))); }

function calculate(): void {
  const a = currentTeam('A'); const b = currentTeam('B');
  if (a.name === b.name) { document.querySelector('#winner')!.textContent = 'Choose two different teams'; document.querySelector('#probability')!.textContent = '—'; document.querySelector('#summary')!.textContent = 'A team cannot play itself.'; document.querySelector('#factorBoard')!.innerHTML = ''; return; }
  const location = (document.querySelector('#location') as HTMLSelectElement).value;
  const paceMode = (document.querySelector('#paceMode') as HTMLSelectElement).value;
  const factors = [
    { name: 'Overall team strength', value: (a.net - b.net) * .34, help: factorHelp.net },
    { name: 'Offensive efficiency', value: (a.ortg - b.ortg) * .12, help: factorHelp.offense },
    { name: 'Defensive efficiency', value: (b.drtg - a.drtg) * .12, help: factorHelp.defense },
    { name: 'Shooting efficiency', value: ((a.efg - b.efg) * 100) * .18, help: factorHelp.shooting },
    { name: 'Turnover control', value: (b.tov - a.tov) * .12, help: factorHelp.turnovers },
    { name: 'Offensive rebounding', value: (a.orb - b.orb) * .06, help: factorHelp.rebounding },
    { name: 'Defensive rebounding', value: (a.drb - b.drb) * .05, help: factorHelp.rebounding },
    { name: 'Pace / tempo fit', value: paceMode === 'fast' ? (a.pace - b.pace) * .05 : paceMode === 'slow' ? (b.pace - a.pace) * .05 : (a.pace - b.pace) * .02, help: factorHelp.pace },
    { name: 'Home court', value: location === 'A' ? 2 : location === 'B' ? -2 : 0, help: factorHelp.home },
    { name: 'Rest', value: (restAdjust[String(val('restA'))] ?? 0) - (restAdjust[String(val('restB'))] ?? 0), help: factorHelp.rest },
    { name: 'Recent form', value: (val('formA') - val('formB')) * .32, help: factorHelp.recent },
    { name: 'Player-level inputs', value: playerAdjustment('A') - playerAdjustment('B'), help: factorHelp.players },
    { name: 'Rotation continuity', value: val('rotationA') - val('rotationB'), help: factorHelp.rotation },
    { name: 'Bench depth', value: val('benchA') - val('benchB'), help: factorHelp.bench },
    { name: 'Matchup fit', value: val('fitA') - val('fitB'), help: factorHelp.matchup }
  ];
  const edge = factors.reduce((s, f) => s + f.value, 0);
  const pA = logistic(edge); const pB = 1 - pA; const aFav = pA >= pB; const p = Math.max(pA, pB);
  document.querySelector('#winner')!.textContent = `${aFav ? a.name : b.name} favored`;
  document.querySelector('#probability')!.textContent = `${Math.round(p * 100)}%`;
  document.querySelector('#summary')!.textContent = p >= .70 ? 'A meaningful model edge, with room for normal game-to-game variance.' : p >= .58 ? 'A moderate edge rather than a decisive favorite.' : 'A close matchup where a few possessions can change the outcome.';
  (document.querySelector('#barA') as HTMLElement).style.width = `${pA * 100}%`; (document.querySelector('#barB') as HTMLElement).style.width = `${pB * 100}%`;
  document.querySelector('#labelA')!.textContent = `${a.name} ${Math.round(pA * 100)}%`; document.querySelector('#labelB')!.textContent = `${b.name} ${Math.round(pB * 100)}%`;
  const ordered = factors.slice().sort((x,y) => Math.abs(y.value) - Math.abs(x.value));
  document.querySelector('#factorBoard')!.innerHTML = ordered.map((f) => `<article class="factor ${f.value > .04 ? 'aedge' : f.value < -.04 ? 'bedge' : 'even'}"><div><span>${f.name}</span><strong>${f.value > 0 ? '+' : ''}${f.value.toFixed(2)}</strong></div><p>${f.value > .04 ? `Leans ${a.name}.` : f.value < -.04 ? `Leans ${b.name}.` : 'Essentially even.'}</p><details><summary>What this measures</summary><p>${f.help}</p></details></article>`).join('');
  const top = ordered.filter((f) => Math.abs(f.value) > .15).slice(0,3).map((f) => f.name.toLowerCase());
  document.querySelector('#readingText')!.textContent = `The largest differences in this setup are ${top.length ? top.join(', ') : 'small across most inputs'}. The percentage is the model's estimate for these inputs, not a statement that the favored team will definitely win.`;
}

function learnView(): void {
  shell(`<section class="page-hero"><p class="kicker">LEARN THE NUMBERS</p><h1>Know what every metric is doing.</h1><p class="lede">The model uses basketball statistics because they summarize different parts of a possession. Each definition below includes what the number measures and how to interpret direction.</p></section><section class="learn-grid">${[
    ['Win chance','A probability estimate for this exact set of inputs. 60% means the model leans toward that team, while still leaving substantial room for the other team to win.'],
    ['Net Rating','Points scored minus points allowed per 100 possessions. Positive is better; negative is worse.'],
    ['Offensive Rating','Points scored per 100 possessions. Higher values indicate a more efficient offense.'],
    ['Defensive Rating','Points allowed per 100 possessions. Lower values indicate a more efficient defense.'],
    ['eFG%','Shooting percentage adjusted because three-pointers are worth more than two-pointers. Higher is better.'],
    ['Turnover %','The share of possessions that end with the offense losing the ball. Lower is generally better.'],
    ['Offensive rebound %','The share of available rebounds a team recovers after its own misses. Higher creates more second chances.'],
    ['Defensive rebound %','The share of available rebounds a team secures after the opponent misses. Higher ends more defensive possessions.'],
    ['Pace','Estimated possessions per 48 minutes. It describes speed, not quality by itself.'],
    ['Player impact input','A user-adjustable estimate for how a specific player changes the matchup through availability, recent form, role, or on-court influence.'],
    ['Rotation continuity','Whether the team can use familiar lineups and roles. Disruption can matter even when the absent player is not a star.'],
    ['Model adjustment','A number of rating points added to Team A or Team B before the final probability conversion. Positive values lean Team A; negative values lean Team B.']
  ].map(([h,p]) => `<article><h2>${h}</h2><p>${p}</p></article>`).join('')}</section>`);
}

function methodView(): void {
  shell(`<section class="page-hero"><p class="kicker">METHOD</p><h1>A forecast that can be taken apart.</h1><p class="lede">Possession Lab uses a transparent weighted rating rather than an unexplained black box. Team quality, possession-level performance, game conditions, and player inputs are converted into one adjusted matchup edge and then into a probability.</p></section><section class="method-list"><article><span>01</span><div><h2>Choose the season baseline automatically</h2><p>The published GitHub edition uses the verified 2025–26 full-season baseline. A future scheduled data pipeline can update the static snapshot without requiring a paid application server.</p></div></article><article><span>02</span><div><h2>Build team quality from multiple possession-level measures</h2><p>Overall Net Rating, offense, defense, shooting efficiency, turnover control, rebounding and pace each contribute separately. The weights are intentionally visible in the factor board.</p></div></article><article><span>03</span><div><h2>Add the conditions of this game</h2><p>Home court, rest, recent form, rotation continuity, bench depth and matchup fit update the baseline. Short-term inputs are kept smaller than full-season evidence unless the user adds a major player-level change.</p></div></article><article><span>04</span><div><h2>Add player-level information</h2><p>Up to three players per team can be adjusted for status, recent performance, role changes and estimated on-court influence. This allows a matchup to change even when the team-level season averages stay the same.</p></div></article><article><span>05</span><div><h2>Convert the adjusted edge to a probability</h2><p>A logistic curve keeps close games near 50–50 and larger rating gaps farther apart. Forecasts are capped at 95% and 5% because NBA outcomes still contain randomness.</p></div></article></section><section class="method-note"><h2>What the model does not claim</h2><p>The current weights are a transparent forecasting framework, not proof that every coefficient is causal. The next research stage is game-by-game historical backtesting so home court, rest, player effects and other adjustments can be estimated from information that was known before each game.</p></section>`);
}

function evidenceView(): void {
  shell(`<section class="page-hero"><p class="kicker">EVIDENCE</p><h1>Sources behind the inputs.</h1><p class="lede">Official definitions and current NBA data are separated from modeling assumptions. A source can establish what a statistic means without proving the exact size of a forecasting adjustment.</p></section><section class="source-grid"><article><span>NBA STATS</span><h2>Advanced team and player statistics</h2><p>NBA Stats provides team and player measures including Net Rating, eFG%, rebounding, turnover measures, pace, usage and other advanced statistics.</p><a href="https://www.nba.com/stats/teams/advanced" target="_blank" rel="noreferrer">Team advanced statistics ↗</a><a href="https://www.nba.com/stats/players/advanced" target="_blank" rel="noreferrer">Player advanced statistics ↗</a></article><article><span>NBA STATS</span><h2>Definitions and Four Factors</h2><p>The league glossary defines metrics used throughout the project. The NBA Stats FAQ specifically identifies effective field-goal percentage, turnover ratio, offensive rebounding percentage and free-throw attempt rate as important winning factors.</p><a href="https://www.nba.com/stats/help/glossary" target="_blank" rel="noreferrer">NBA Stats glossary ↗</a><a href="https://www.nba.com/stats/help/faq" target="_blank" rel="noreferrer">NBA Stats FAQ ↗</a></article><article><span>OFFICIAL NBA</span><h2>Availability and roster context</h2><p>Official injury reporting and NBA roster/news pages are used to check whether the season baseline still reflects the players expected to be available.</p><a href="https://official.nba.com/nba-injury-report-2025-26-season/" target="_blank" rel="noreferrer">Official injury reporting ↗</a><a href="https://www.nba.com/news" target="_blank" rel="noreferrer">NBA news ↗</a></article><article><span>RESEARCH LITERATURE</span><h2>Rest and schedule congestion</h2><p>Published NBA research has found measurable relationships between rest, schedule congestion and performance. Possession Lab therefore includes rest, but keeps the adjustment modest and visible.</p><a href="https://pubmed.ncbi.nlm.nih.gov/9381060/" target="_blank" rel="noreferrer">Travel and rest study ↗</a><a href="https://pubmed.ncbi.nlm.nih.gov/32172667/" target="_blank" rel="noreferrer">Back-to-back study ↗</a></article></section><section class="research-result"><div><strong>0.802</strong><span>earlier team-season holdout R²</span></div><p>The project’s earlier five-variable ridge model trained on 2024–25 explained about 80% of the variation in 2025–26 team winning percentage. That result motivated the current work, but it is not presented as individual-game accuracy.</p></section>`);
}

function aboutView(): void {
  shell(`<section class="about-hero"><div class="founder-photo"><img id="founderPhoto" src="./resources/founder-photo.jpg" alt="Divit Walia, founder of Possession Lab" loading="eager"></div><div><p class="kicker">FOUNDER</p><h1>Divit Walia</h1><p class="role">Founder & Lead Researcher</p><p class="lede">I built Possession Lab to make sports analytics useful to people who care about the game but do not necessarily speak the language of statistics. The project began with a two-season study of NBA team success and has developed into a matchup model that lets users inspect the evidence, change assumptions, and see exactly why a forecast moves.</p><p class="about-copy">I lead the research design, data preparation, modeling, validation, interpretation, source review, and digital presentation. My standard for the project is simple: a sophisticated model should become more understandable when someone looks closer—not less.</p><div class="founder-expertise" aria-label="Areas of focus"><span>Sports analytics</span><span>Data science</span><span>Statistical modeling</span><span>Research communication</span><span>Basketball</span></div></div></section><section class="principles"><article><h2>Transparent</h2><p>Every major adjustment is visible instead of being buried inside a final percentage.</p></article><article><h2>Current</h2><p>The model clearly labels the season baseline used for its calculations.</p></article><article><h2>Useful</h2><p>The output is designed to explain a matchup, not only announce a favorite.</p></article><article><h2>Testable</h2><p>Assumptions are separated from established definitions so they can be improved with future backtesting.</p></article></section>`);
}

function route(): void {
  const r = (location.hash.replace('#/', '') || 'model').split('?')[0];
  if (r === 'learn') learnView(); else if (r === 'method') methodView(); else if (r === 'evidence') evidenceView(); else if (r === 'about') aboutView(); else modelView();
  window.scrollTo({ top: 0, behavior: 'instant' });
}

window.addEventListener('hashchange', route);
route();
