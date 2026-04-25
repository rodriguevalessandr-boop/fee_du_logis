// ==========================================
// 1. ÉTAT DE L'APPLI (Ajout des clés Notif)
// ==========================================
let state = {
  diamonds: 0,
  dayCount: 0,
  lastValidatedDate: null,
  tasks: [],
  creatures: [{ id: 'fleur', xp: 0 }],
  creatureActive: 'fleur',
  heureNotif: "08:00", // Heure par défaut
  derniereNotif: null  // Pour ne pas spammer
};

const catalogue = [
  { id: 'fleur',    nom: 'Fleur parfumée',         prix: 0,   stades: ['🪴','🌱','🌸','🌺','🌹'] },
  { id: 'poule',    nom: 'Poule cui-cui',           prix: 50,  stades: ['🥚','🐣','🐤','🐔','🪽'] },
  { id: 'papillon', nom: 'Papillon libre',          prix: 80,  stades: ['🥚','🐛','🫘','🌀','🦋'] },
  { id: 'chaton',   nom: 'Chaton poilu',            prix: 100, stades: ['🐾','😸','🐈‍⬛','🐈','🐱'] },
  { id: 'fee',      nom: 'Fée du logis',            prix: 120, stades: ['🌱','✨','🌟','🪄','🧚'] },
  { id: 'lune',     nom: 'Lune solaire',            prix: 200, stades: ['🌚','🌑','🌛','🌝','🌞'] },
  { id: 'etoiles',  nom: 'Étoiles brillantes',      prix: 150, stades: ['⚡','✨','🌟','⭐','💫'] },
  { id: 'coeurs',   nom: 'Cœurs d\'amour',           prix: 180, stades: ['🧡','💛','💚','🩷','❤️'] },
  { id: 'sirene',   nom: 'Sirène d\'argent',         prix: 250, stades: ['🐟','🐳','🧝‍♀️','👸','🧜‍♀️'] },
  { id: 'reine',    nom: 'Reine Queen B',           prix: 220, stades: ['👗','🥻','👠','👑','💍'] },
  { id: 'licorne',  nom: 'Licorne Rose',            prix: 280, stades: ['🥚','🎠','🪅','🌈','🦄'] },
  { id: 'vampire',  nom: 'Vampire de sang',         prix: 300, stades: ['🩸','🦇','🌙','👁️','🧛‍♀️'] },
  { id: 'dragon',   nom: 'Dragonnet',               prix: 350, stades: ['🦕','🦎','🐍','🐲','🐉'] },
  { id: 'phenix',   nom: 'Phénix de ses cendres',   prix: 500, stades: ['🪺','🐦','🔥','⭐','🐦‍🔥'] },
];

// ==========================================
// 2. UTILITAIRES & SONS
// ==========================================
const sauvegarder = () => localStorage.setItem('fee_du_logis_v2', JSON.stringify(state));
const charger = () => {
  const data = localStorage.getItem('fee_du_logis_v2');
  if (data) {
    state = JSON.parse(data);
    if (!state.tasks) state.tasks = [];
    if (!state.heureNotif) state.heureNotif = "08:00";
  }
};
const aujourdhui = () => new Date().toISOString().split('T')[0];

function jouerSon(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const g = ctx.createGain();
    g.connect(ctx.destination);
    if (type === 'win') {
      const osc = ctx.createOscillator();
      osc.type = 'sine'; 
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.2);
      g.gain.setValueAtTime(0.2, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(g);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    } else {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);
      g.gain.setValueAtTime(0.1, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(g);
      osc.start(); osc.stop(ctx.currentTime + 0.1);
    }
  } catch(e) {}
}

// ==========================================
// 3. UI & AFFICHAGE
// ==========================================
function mettreAJourUI() {
  document.getElementById('diamond-count').textContent = state.diamonds;
  document.getElementById('day-count').textContent = state.dayCount;

  const creatureEtat = state.creatures.find(c => c.id === state.creatureActive);
  const creatureCat = catalogue.find(c => c.id === state.creatureActive);
  if (creatureEtat && creatureCat) {
    const stadeIdx = Math.min(4, Math.floor(creatureEtat.xp / 500));
    document.getElementById('creature-emoji').textContent = creatureCat.stades[stadeIdx];
    document.getElementById('creature-stage').textContent = `Stade ${stadeIdx + 1}. ${creatureCat.nom}`;
    document.getElementById('xp-fill').style.width = ((creatureEtat.xp % 500) / 500 * 100) + '%';
    document.getElementById('xp-current').textContent = creatureEtat.xp % 500;
  }

  const feu = document.getElementById('streak-fire');
  if (state.lastValidatedDate === aujourdhui()) {
    feu.style.display = "inline-block";
  } else {
    feu.style.display = "none";
  }

  // MISE À JOUR DU CHAMP HEURE
  const inputHeure = document.getElementById('notif-time');
  if (inputHeure) inputHeure.value = state.heureNotif;

  afficherTaches();
}

function afficherTaches() {
  const listeJour = document.getElementById('tasks-list');
  const listeFutur = document.getElementById('future-tasks-list');
  const dateAuj = aujourdhui();

  let tachesJour = state.tasks.filter(t => t.prochaineDate <= dateAuj);
  tachesJour.sort((a, b) => (a.datesFaites?.includes(dateAuj)) - (b.datesFaites?.includes(dateAuj)));

  let tachesFutur = state.tasks.filter(t => t.prochaineDate > dateAuj);
  tachesFutur.sort((a, b) => a.prochaineDate.localeCompare(b.prochaineDate));

  listeJour.innerHTML = tachesJour.map(t => genererHtmlTache(t, true)).join('') || '<p>🌿 Rien aujourd\'hui.</p>';
  if (listeFutur) listeFutur.innerHTML = tachesFutur.map(t => genererHtmlTache(t, false)).join('') || '<p>Avenir serein...</p>';
}

function genererHtmlTache(tache, estAujourdhui) {
  const dateAuj = aujourdhui();
  const faite = tache.datesFaites?.includes(dateAuj);
  return `
    <div class="task-card ${faite ? 'completed' : ''}" style="border-left: 5px solid ${estAujourdhui ? '#00c2a7' : '#c4a8e8'}; display: flex; align-items: center; justify-content: space-between;">
      <div style="display: flex; align-items: center; flex: 1;">
        <input type="checkbox" ${faite ? 'checked' : ''} onclick="cocherTache(${tache.id})" style="width:22px; height:22px; margin-right:15px;">
        <div onclick="ouvrirPourModifier(${tache.id})">
          <div style="font-weight:bold; ${faite ? 'text-decoration:line-through; opacity: 0.6;' : ''}">${tache.nom}</div>
          <small>${tache.piece} • ${estAujourdhui ? 'Aujourd\'hui' : 'À venir'}</small>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="background: #e0f2ff; color: #2b7bb9; padding: 6px 12px; border-radius: 12px; font-weight: 900; border: 2px solid #2b7bb9; display: flex; align-items: center; gap: 4px;">
          <span style="font-size: 1.4rem;">+${tache.xp}</span>
          <span style="font-size: 0.7rem; margin-top: 4px;">XP</span>
        </span>
        <button onclick="demanderSuppression(${tache.id})" style="background:none; border:none; font-size:20px;">🗑️</button>
      </div>
    </div>`;
}

// ==========================================
// 4. ACTIONS & NOTIFS
// ==========================================
window.changerHeureNotif = (heure) => {
    state.heureNotif = heure;
    sauvegarder();
    console.log("Nouvelle heure enregistrée :", heure);
    
    // Test immédiat : demande la permission si ce n'est pas fait
    if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
    }
};

window.cocherTache = (id) => {
  const tache = state.tasks.find(t => t.id === id);
  const dateAuj = aujourdhui();
  if (!tache.datesFaites) tache.datesFaites = [];
  const dejaFaite = tache.datesFaites.includes(dateAuj);
  const creature = state.creatures.find(c => c.id === state.creatureActive);

  if (dejaFaite) {
    tache.datesFaites = tache.datesFaites.filter(d => d !== dateAuj);
    if (creature) creature.xp = Math.max(0, creature.xp - tache.xp);
    jouerSon('loss');
  } else {
    tache.datesFaites.push(dateAuj);
    if (creature) creature.xp += tache.xp;
    if (state.lastValidatedDate !== dateAuj) {
      state.dayCount++;
      state.diamonds += 10;
      state.lastValidatedDate = dateAuj;
    }
    jouerSon('win');
  }
  sauvegarder(); mettreAJourUI();
};

// Vérification Notif toutes les 30s
setInterval(() => {
    if (!state.heureNotif) return;
    const m = new Date();
    const maintenant = `${String(m.getHours()).padStart(2, '0')}:${String(m.getMinutes()).padStart(2, '0')}`;
    if (state.heureNotif === maintenant && state.derniereNotif !== aujourdhui()) {
        const sw = navigator.serviceWorker?.controller;
        if (sw) {
            sw.postMessage({ type: 'DECLENCHER_NOTIF', message: 'C\'est l\'heure de tes missions ! 🧚‍♂️' });
            state.derniereNotif = aujourdhui();
            sauvegarder();
        }
    }
}, 30000);

// ==========================================
// 5. INITIALISATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  charger();
  mettreAJourUI();

  document.getElementById('add-task-btn').onclick = () => {
    document.getElementById('task-nom').value = "";
    document.getElementById('btn-sauvegarder').onclick = ajouterNouvelleTache;
    document.getElementById('task-modal').classList.remove('hidden');
  };
  
  document.getElementById('btn-annuler').onclick = () => document.getElementById('task-modal').classList.add('hidden');
  document.getElementById('diamonds-btn').onclick = window.ouvrirBoutique;
  document.getElementById('btn-fermer-boutique').onclick = () => document.getElementById('shop-modal').classList.add('hidden');
});

// Fonctions manquantes pour que ça tourne
window.demanderSuppression = (id) => {
    const zone = document.getElementById(`delete-zone-${id}`);
    if (zone) zone.innerHTML = `<button onclick="supprimerDefinitif(${id})" style="background:#ff4757; color:white; border:none; border-radius:8px; padding:5px 8px; font-size:11px;">OK ?</button>`;
};
window.supprimerDefinitif = (id) => {
    state.tasks = state.tasks.filter(t => t.id !== id);
    sauvegarder(); mettreAJourUI();
};
function ajouterNouvelleTache() {
    const nom = document.getElementById('task-nom').value;
    const lancement = document.getElementById('task-lancement').value;
    if (!nom) return;
    let d = new Date();
    d.setDate(d.getDate() + parseInt(lancement));
    state.tasks.push({
        id: Date.now(),
        nom: nom,
        piece: document.getElementById('task-piece').value,
        xp: parseInt(document.getElementById('task-xp').value) || 10,
        frequence: document.getElementById('task-frequence').value,
        prochaineDate: d.toISOString().split('T')[0],
        datesFaites: []
    });
    sauvegarder(); document.getElementById('task-modal').classList.add('hidden'); mettreAJourUI();
}