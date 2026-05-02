// ==========================================
// 1. ÉTAT & CATALOGUE
// ==========================================
let state = {
  diamonds: 0,
  dayCount: 0,
  lastValidatedDate: null,
  heureNotif: '08:00',
  tasks: [],
  creatures: [{ id: 'fleur', xp: 0 }],
  creatureActive: 'fleur'
};

const catalogue = [
  { id: 'fleur',    nom: 'Fleur parfumée',       prix: 0,   stades: ['🌱','🪴','🌿','🌸','🌹'] },
  { id: 'poule',    nom: 'Poule cui-cui',         prix: 50,  stades: ['🥚','🐣','🐤','🐔','🪽'] },
  { id: 'papillon', nom: 'Papillon libre',        prix: 80,  stades: ['🥚','🐛','🫘','🌀','🦋'] },
  { id: 'chaton',   nom: 'Chaton poilu',          prix: 100, stades: ['🐾','😸','🐈‍⬛','🐈','🐱'] },
  { id: 'lune',     nom: 'Lune solaire',          prix: 200, stades: ['🌚','🌑','🌛','🌝','🌞'] },
  { id: 'etoiles',  nom: 'Étoiles brillantes',    prix: 150, stades: ['⚡','✨','🌟','⭐','💫'] },
  { id: 'coeurs',   nom: "Cœurs d'amour",         prix: 180, stades: ['🧡','💛','💚','🩷','❤️'] },
  { id: 'sirene',   nom: "Sirène d'argent",       prix: 250, stades: ['🐟','🐳','🧝‍♀️','👸','🧜‍♀️'] },
  { id: 'reine',    nom: 'Reine Queen B',         prix: 220, stades: ['👗','🥻','👠','👑','💍'] },
  { id: 'licorne',  nom: 'Licorne Rose',          prix: 280, stades: ['🥚','🎠','🪅','🌈','🦄'] },
  { id: 'vampire',  nom: 'Vampire de sang',       prix: 300, stades: ['🩸','🦇','🌙','👁️','🧛‍♀️'] },
  { id: 'dragon',   nom: 'Dragonnet',             prix: 350, stades: ['🦕','🦎','🐍','🐲','🐉'] },
  { id: 'phenix',   nom: 'Phénix de ses cendres', prix: 500, stades: ['🪺','🐦','🔥','⭐','🐦‍🔥'] },
];

const phrasesPositives = [
  "Chaque petit geste compte pour ton sanctuaire. ✨",
  "Une tâche à la fois, et la magie opère. 🪄",
  "Ta créature est fière de tes efforts ! 🐾",
  "Tu prépares ton bonheur de demain. 🌿",
  "Bravo ! Tu es la reine de ton royaume. 👑",
  "Ta maison te dit merci. 🏠✨",
  "C'est l'heure de briller, petite fée ! 🧚",
  "Regarde tout ce que tu as accompli ! 🌟",
  "Petit pas par petit pas, la magie grandit. 🍃"
];

// ==========================================
// 2. UTILITAIRES
// ==========================================
const sauvegarder = () => localStorage.setItem('fee_du_logis_v3', JSON.stringify(state));

const charger = () => {
  const data = localStorage.getItem('fee_du_logis_v3');
  if (data) {
    state = JSON.parse(data);
    if (!state.tasks) state.tasks = [];
    if (!state.creatures) state.creatures = [{ id: 'fleur', xp: 0 }];
    if (!state.creatureActive) state.creatureActive = 'fleur';
    if (!state.heureNotif) state.heureNotif = '08:00';
    if (state.lastValidatedDate === undefined) state.lastValidatedDate = null;
  }
};

const aujourdhui = () => new Date().toISOString().split('T')[0];

function calculerProchaineDate(baseDate, frequence) {
  let d = new Date(baseDate);
  if (frequence === 'Quotidienne')    d.setDate(d.getDate() + 1);
  else if (frequence === 'Tous les 3 jours') d.setDate(d.getDate() + 3);
  else if (frequence === 'Hebdomadaire')     d.setDate(d.getDate() + 7);
  else if (frequence === 'Bimensuelle')      d.setDate(d.getDate() + 14);
  else if (frequence === 'Mensuelle')        d.setMonth(d.getMonth() + 1);
  else return null;
  return d.toISOString().split('T')[0];
}

// ==========================================
// 3. SONS
// ==========================================
function jouerSon(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const g = ctx.createGain();
    g.connect(ctx.destination);
    const osc = ctx.createOscillator();
    if (type === 'win') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.3);
      g.gain.setValueAtTime(0.3, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);
      g.gain.setValueAtTime(0.3, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    }
    osc.connect(g);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch(e) {}
}

// ==========================================
// 4. AFFICHAGE
// ==========================================
function mettreAJourUI() {
  document.getElementById('diamond-count').textContent = state.diamonds;
  document.getElementById('day-count').textContent = state.dayCount;

  const creatureEtat = state.creatures.find(c => c.id === state.creatureActive);
  const creatureCatalogue = catalogue.find(c => c.id === state.creatureActive);

  if (creatureEtat && creatureCatalogue) {
    const stadeIdx = Math.min(4, Math.floor(creatureEtat.xp / 500));
    const xpDansStade = creatureEtat.xp % 500;
    document.getElementById('creature-emoji').textContent = creatureCatalogue.stades[stadeIdx];
    document.getElementById('creature-stage').textContent = `Stade ${stadeIdx + 1}. ${creatureCatalogue.nom}`;
    const barre = document.getElementById('xp-fill');
    if (barre) barre.style.width = (xpDansStade / 500 * 100) + '%';
    document.getElementById('xp-current').textContent = xpDansStade;
  }

  const feu = document.getElementById('streak-fire');
  if (feu) {
    feu.style.display = state.lastValidatedDate === aujourdhui() ? 'inline-block' : 'none';
  }

  afficherTaches();
}

function changerMantra() {
  const el = document.getElementById('mantra-container');
  if (!el) return;
  el.textContent = phrasesPositives[Math.floor(Math.random() * phrasesPositives.length)];
  el.style.opacity = '1';
  setTimeout(() => { el.style.opacity = '0'; }, 4000);
}

function afficherTaches() {
  const listeJour = document.getElementById('tasks-list');
  const listeFutur = document.getElementById('future-tasks-list');
  const dateAuj = aujourdhui();

  // Tâches du jour : dues aujourd'hui OU cochées aujourd'hui
  let tJour = state.tasks.filter(t => {
    const dueAujourdhui = t.prochaineDate && t.prochaineDate <= dateAuj;
    const cocheeAujourdhui = t.datesFaites?.includes(dateAuj);
    return dueAujourdhui || cocheeAujourdhui;
  });

  // Tâches futures : dans le futur ET pas cochées aujourd'hui
  let tFutur = state.tasks.filter(t => {
    const dansFutur = t.prochaineDate && t.prochaineDate > dateAuj;
    const cocheeAujourdhui = t.datesFaites?.includes(dateAuj);
    return dansFutur && !cocheeAujourdhui;
  });

  // Tri : non-cochées en haut
  const tri = (a, b) => {
    const aF = a.datesFaites?.includes(dateAuj) ? 1 : 0;
    const bF = b.datesFaites?.includes(dateAuj) ? 1 : 0;
    if (aF !== bF) return aF - bF;
    return (a.prochaineDate || '').localeCompare(b.prochaineDate || '');
  };

  tJour.sort(tri);
  tFutur.sort(tri);

  if (listeJour) {
    listeJour.innerHTML = tJour.map(t => genererHtmlTache(t, true)).join('') ||
      '<p style="text-align:center; color:#a594b5; margin:20px 0;">🌿 Rien pour aujourd\'hui !</p>';
  }

  if (listeFutur) {
    listeFutur.innerHTML = tFutur.map(t => genererHtmlTache(t, false)).join('') ||
      '<p style="text-align:center; color:#a594b5; margin:20px 0;">🌿 Libre !</p>';
  }
}

function genererHtmlTache(tache, estAuj) {
  const faite = tache.datesFaites?.includes(aujourdhui());
  return `
    <div class="task-card ${faite ? 'completed' : ''}">
      <input type="checkbox" ${faite ? 'checked' : ''}
             onclick="event.stopPropagation(); cocherTache(${tache.id})"
             class="task-checkbox">
      <div class="task-info" onclick="ouvrirPourModifier(${tache.id})">
        <div class="task-name">${tache.nom}</div>
        <div class="task-piece">${tache.piece || 'Maison'}</div>
        <div class="task-frequence">⏳ ${tache.frequence || 'Ponctuelle'}</div>
      </div>
      <div class="task-actions-group">
        <span class="task-xp-badge">+${tache.xp} XP</span>
        <div class="task-btns">
          <span onclick="ouvrirPourModifier(${tache.id})" class="edit-icon">✏️</span>
          <div id="delete-zone-${tache.id}" class="delete-zone">
            <button onclick="event.stopPropagation(); demanderSuppression(${tache.id})" class="delete-btn">🗑️</button>
          </div>
        </div>
      </div>
    </div>`;
}

// ==========================================
// 5. ACTIONS
// ==========================================
window.cocherTache = (id) => {
  const tache = state.tasks.find(t => t.id === id);
  if (!tache) return;
  const dateAuj = aujourdhui();
  if (!tache.datesFaites) tache.datesFaites = [];
  const dejaFaite = tache.datesFaites.includes(dateAuj);
  const creature = state.creatures.find(c => c.id === state.creatureActive);

  if (!dejaFaite) {
    // --- ACTIONS : VALIDER LA TÂCHE ---
    jouerSon('win');
    // Si tu as une fonction animerXP, elle s'active ici
    if (window.event && typeof animerXP === 'function') {
        animerXP(window.event.clientX, window.event.clientY); 
    }

    tache.datesFaites.push(dateAuj);

    // 1. Gain individuel par tâche (Nouveau !)
    state.diamonds = (state.diamonds || 0) + 1; 

    // 2. XP de la créature
    if (creature) {
        creature.xp = (creature.xp || 0) + (tache.xp || 10);
    }

    // 3. Bonus de série quotidienne (10 + bonus)
    if (state.lastValidatedDate !== dateAuj) {
        state.dayCount = (state.dayCount || 0) + 1;
        const bonusSerie = Math.min(state.dayCount, 20); 
        state.diamonds += (10 + bonusSerie); 
        state.lastValidatedDate = dateAuj;
    }

    // Gestion des dates
    tache.datePrecedente = tache.prochaineDate; 
    if (tache.prochaineDate <= dateAuj) {
        tache.prochaineDate = calculerProchaineDate(dateAuj, tache.frequence);
    }
    
    if (typeof changerMantra === 'function') changerMantra();

  } else {
    // --- ACTIONS : DÉCOCHER LA TÂCHE ---
    jouerSon('loss');
    tache.datesFaites = tache.datesFaites.filter(d => d !== dateAuj);
    
    // 1. On retire le diamant de la tâche
    state.diamonds = Math.max(0, state.diamonds - 1);

    // 2. Retrait de l'XP
    if (creature) {
        creature.xp = Math.max(0, (creature.xp || 0) - (tache.xp || 10));
    }

    // 3. Annulation du bonus quotidien complet (si c'était la seule tâche faite)
    const encore = state.tasks.some(t => t.datesFaites?.includes(dateAuj));
    if (!encore) {
        const bonusSerie = Math.min(state.dayCount, 20);
        state.diamonds = Math.max(0, state.diamonds - (10 + bonusSerie));
        state.dayCount = Math.max(0, state.dayCount - 1);
        state.lastValidatedDate = null;
    }

    if (tache.datePrecedente) {
        tache.prochaineDate = tache.datePrecedente;
    }
  }

  sauvegarder();
  mettreAJourUI();
};

window.ouvrirPourModifier = (id) => {
  const tache = state.tasks.find(t => t.id === id);
  if (!tache) return;
  document.getElementById('task-nom').value = tache.nom;
  document.getElementById('task-piece').value = tache.piece;
  document.getElementById('task-xp').value = tache.xp;
  document.getElementById('task-frequence').value = tache.frequence;
  document.getElementById('btn-sauvegarder').onclick = () => {
    tache.nom = document.getElementById('task-nom').value;
    tache.piece = document.getElementById('task-piece').value;
    tache.xp = parseInt(document.getElementById('task-xp').value);
    tache.frequence = document.getElementById('task-frequence').value;
    sauvegarder();
    fermerModal();
    mettreAJourUI();
  };
  document.getElementById('task-modal').classList.remove('hidden');
};

window.demanderSuppression = (id) => {
  const zone = document.getElementById(`delete-zone-${id}`);
  if (zone) {
    zone.innerHTML = `
      <button onclick="event.stopPropagation(); supprimerDefinitif(${id})"
              class="btn-confirm-del">Valider</button>
      <button onclick="event.stopPropagation(); mettreAJourUI()"
              class="btn-cancel-del">Annuler</button>`;
  }
};

window.supprimerDefinitif = (id) => {
  state.tasks = state.tasks.filter(t => t.id !== id);
  sauvegarder();
  mettreAJourUI();
};

function ajouterNouvelleTache() {
  const nom = document.getElementById('task-nom').value.trim();
  if (!nom) return;
  const lancementValue = document.getElementById('task-lancement').value;
  let d = new Date();
  const joursEnPlus = parseInt(String(lancementValue).replace('+', '')) || 0;
  d.setDate(d.getDate() + joursEnPlus);
  state.tasks.push({
    id: Date.now(),
    nom,
    piece: document.getElementById('task-piece').value,
    xp: parseInt(document.getElementById('task-xp').value) || 10,
    frequence: document.getElementById('task-frequence').value,
    prochaineDate: d.toISOString().split('T')[0],
    datesFaites: []
  });
  sauvegarder();
  fermerModal();
  mettreAJourUI();
}

// ==========================================
// 6. BOUTIQUE
// ==========================================
window.ouvrirBoutique = () => {
  document.getElementById('shop-diamonds').textContent = state.diamonds;
  const grille = document.getElementById('shop-items');
  grille.innerHTML = catalogue.map(item => {
    const possedee = state.creatures.find(c => c.id === item.id);
    const estActive = state.creatureActive === item.id;
    return `
      <div style="background:#fdfaf5; padding:10px; border-radius:15px;
                  text-align:center; border:1px solid #eaddff; box-sizing:border-box;">
        <div style="font-size:30px;">${item.stades[4]}</div>
        <div style="font-size:14px; margin:5px 0;">${item.nom}</div>
        <button onclick="acheter('${item.id}', ${item.prix})"
          style="background:${estActive ? '#e8a0b4' : possedee ? '#aaa' : '#5e9aca'};
                 color:white; border:none; border-radius:10px;
                 padding:8px; cursor:pointer; width:100%; font-size:14px;">
          ${estActive ? '✓ Active' : possedee ? 'Choisir' : '💎 ' + item.prix}
        </button>
      </div>`;
  }).join('');
  document.getElementById('shop-modal').classList.remove('hidden');
};

window.acheter = (id, prix) => {
  const possedee = state.creatures.find(c => c.id === id);
  if (possedee) {
    state.creatureActive = id;
  } else if (state.diamonds >= prix) {
    state.diamonds -= prix;
    state.creatures.push({ id, xp: 0 });
    state.creatureActive = id;
    jouerSon('win');
  } else {
    alert('Pas assez de diamants ! 💎');
    return;
  }
  sauvegarder();
  mettreAJourUI();
  document.getElementById('shop-modal').classList.add('hidden');
};

// ==========================================
// 7. NOTIFICATIONS
// ==========================================
function planifierRappelQuotidien(heure) {
  if (!('serviceWorker' in navigator)) return;
  const [h, m] = heure.split(':').map(Number);
  const cible = new Date();
  cible.setHours(h, m, 0, 0);
  if (cible <= new Date()) cible.setDate(cible.getDate() + 1);
  navigator.serviceWorker.ready.then(reg => {
    if (reg.active) {
      reg.active.postMessage({ type: 'PLANIFIER_NOTIF', timestamp: cible.getTime() });
    }
  });
}

// ==========================================
// 8. MODALS & INIT
// ==========================================
function fermerModal() {
  document.getElementById('task-modal').classList.add('hidden');
  document.getElementById('shop-modal').classList.add('hidden');
  document.getElementById('notif-modal').classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
  charger();
  mettreAJourUI();

  if (state.heureNotif) {
    Notification.requestPermission().then(perm => {
      if (perm === 'granted') planifierRappelQuotidien(state.heureNotif);
    });
  }

  document.getElementById('add-task-btn').onclick = () => {
    document.getElementById('task-nom').value = '';
    document.getElementById('btn-sauvegarder').onclick = ajouterNouvelleTache;
    document.getElementById('task-modal').classList.remove('hidden');
  };

  document.getElementById('notif-btn').onclick = () => {
    document.getElementById('notif-time').value = state.heureNotif || '08:00';
    document.getElementById('notif-modal').classList.remove('hidden');
  };

  document.getElementById('btn-sauver-notif').onclick = () => {
    const heure = document.getElementById('notif-time').value;
    if (heure) {
      state.heureNotif = heure;
      sauvegarder();
      Notification.requestPermission().then(perm => {
        if (perm === 'granted') {
          planifierRappelQuotidien(heure);
          fermerModal();
        }
      });
    }
  };

  document.getElementById('btn-annuler').onclick = fermerModal;
  document.getElementById('btn-annuler-notif').onclick = fermerModal;
  document.getElementById('diamonds-btn').onclick = window.ouvrirBoutique;
  document.getElementById('btn-fermer-boutique').onclick = fermerModal;

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
});