// Icone lineari solo bianche (colore da CSS via stroke), usate nel potenziometro.
const svg = (d: string) => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`

export const ICONS = {
  // settori
  build: svg('<path d="M3 21h18"/><path d="M5 21V10l7-5 7 5v11"/><path d="M9 21v-6h6v6"/><path d="M12 5V2.5"/>'),
  health: svg('<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/><path d="M9 11h2v-2h2v2h2v2h-2v2h-2v-2H9z"/>'),
  briefcase: svg('<rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M8.5 7V5.5A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.5 1.5V7"/><path d="M3 12.5h18"/>'),
  scales: svg('<path d="M12 4v16"/><path d="M7 20h10"/><path d="M5 7h14"/><path d="M5 7l-3 6a3 3 0 0 0 6 0Z"/><path d="M19 7l-3 6a3 3 0 0 0 6 0Z"/>'),
  store: svg('<path d="M4 9.5V20h16V9.5"/><path d="M3 9.5 4.5 4h15L21 9.5a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0Z"/><path d="M10 20v-5h4v5"/>'),
  laptop: svg('<rect x="4.5" y="5" width="15" height="10" rx="1.5"/><path d="M2.5 19h19"/><path d="m10 9.5-1.5 1.5L10 12.5M14 9.5l1.5 1.5-1.5 1.5"/>'),
  dish: svg('<path d="M4 16h16"/><path d="M5.5 16a6.5 6.5 0 0 1 13 0"/><path d="M12 7.5V6"/><path d="M3 19.5h18"/>'),
  sprout: svg('<path d="M12 21v-9"/><path d="M12 12c0-4-3-6-7-6 0 4 3 6 7 6Z"/><path d="M12 14c0-3.5 2.5-6 6.5-6 0 3.5-2.5 6-6.5 6Z"/>'),
  users: svg('<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="9.5" r="2.3"/><path d="M15.5 14.2A4.5 4.5 0 0 1 21 18.5"/>'),
  plus: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 8v8M8 12h8"/>'),
  // step
  compass: svg('<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>'),
  magnet: svg('<path d="M6 4v8a6 6 0 0 0 12 0V4"/><path d="M6 8h4M14 8h4"/><path d="M10 4v8a2 2 0 0 0 4 0V4"/>'),
  tools: svg('<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="3.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="3.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>'),
  loop: svg('<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8"/><path d="M4 4v4h4"/><path d="M4 13a8 8 0 0 0 14.3 4.9L20 16"/><path d="M20 20v-4h-4"/>'),
  target: svg('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>'),
  chart: svg('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
  user: svg('<circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/>'),
  // domande: una per domanda, accanto al testo
  layers: svg('<path d="m12 3.5 8.5 4.5-8.5 4.5L3.5 8z"/><path d="m3.5 12 8.5 4.5 8.5-4.5"/><path d="m3.5 16 8.5 4.5 8.5-4.5"/>'),
  team: svg('<circle cx="12" cy="7.5" r="2.5"/><circle cx="5.5" cy="10" r="2"/><circle cx="18.5" cy="10" r="2"/><path d="M7.5 19a4.5 4.5 0 0 1 9 0"/><path d="M2.5 18a3.5 3.5 0 0 1 4.2-3.4M21.5 18a3.5 3.5 0 0 0-4.2-3.4"/>'),
  funnel: svg('<path d="M3.5 4.5h17l-6.5 8v6l-4 2v-8z"/>'),
  heartLoop: svg('<path d="M20.5 12a8.5 8.5 0 1 1-2.5-6"/><path d="M18.5 2.5V6H15"/><path d="M12 16s-3.5-2.1-3.5-4.6a1.9 1.9 0 0 1 3.5-1 1.9 1.9 0 0 1 3.5 1C15.5 13.9 12 16 12 16Z"/>'),
  toolbox: svg('<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M9 8V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v2"/><path d="M3 13h18"/><path d="M10 13v2h4v-2"/>'),
  pulse: svg('<path d="M3 12h4l2.5-6 5 12 2.5-6h4"/>'),
  trend: svg('<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>'),
  star: svg('<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.9z"/>'),
  flag: svg('<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>'),
  stairs: svg('<path d="M3 20h5v-5h5v-5h5V5h3"/>'),
  chat: svg('<path d="M4 5.5h16v10H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>'),
  check: svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
}
