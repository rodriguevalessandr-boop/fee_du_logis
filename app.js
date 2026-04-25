// ==========================================
// 1. ÉTAT DE L'APPLI
// ==========================================
let state = {
  diamonds: 0,
  dayCount: 0,
  lastValidatedDate: null,
  tasks: [],
  creatures: [{ id: 'fleur', xp: 0 }],
  creatureActive: 'fleur'
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
// 2. UTILITAIRES
// ==========================================
const sauvegarder = () => localStorage.setItem('fee_du_logis_v2', JSON.stringify(state));
const charger = () => {
  const data = localStorage.getItem('fee_du_logis_v2');
  if (data) {
    state = JSON.parse(data);
    if (!state.tasks) state.tasks = [];
  }
};
const aujourdhui = () => new Date().toISOString().split('T')[0];

function jouerSon(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const g = ctx.createGain();
    g.connect(ctx.destination);
    
    if (type === 'win') {
      // Effet "Boing" rigolo : une note qui glisse très vite vers le haut
      const osc = ctx.createOscillator();
      osc.type = 'sine'; 
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.2);
      
      g.gain.setValueAtTime(0.2, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      
      osc.connect(g);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else {
      // Petit "plop" descendant pour le décochage
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
    feu.classList.remove('hidden');
    feu.style.display = "inline-block";
  } else {
    feu.classList.add('hidden');
    feu.style.display = "none";
  }
  afficherTaches();
}

function afficherTaches() {
  const listeJour = document.getElementById('tasks-list');
  const listeFutur = document.getElementById('future-tasks-list');
  const dateAuj = aujourdhui();

  // 1. MISSIONS DU JOUR : Tout ce qui a une date <= aujourd'hui
  let tachesJour = state.tasks.filter(t => t.prochaineDate <= dateAuj);

  // Tri interne : les cochées descendent en bas de la liste du jour
  tachesJour.sort((a, b) => {
    const aFaite = a.datesFaites && a.datesFaites.includes(dateAuj);
    const bFaite = b.datesFaites && b.datesFaites.includes(dateAuj);
    return aFaite - bFaite; 
  });

  // 2. AVENIR : Tout ce qui a une date > aujourd'hui
  let tachesFutur = state.tasks.filter(t => t.prochaineDate > dateAuj);

  // Tri interne : par date, puis les cochées d'avance en bas de leur journée
  tachesFutur.sort((a, b) => {
    if (a.prochaineDate !== b.prochaineDate) {
      return a.prochaineDate.localeCompare(b.prochaineDate);
    }
    const aFaite = a.datesFaites && a.datesFaites.includes(dateAuj);
    const bFaite = b.datesFaites && b.datesFaites.includes(dateAuj);
    return aFaite - bFaite;
  });

  // AFFICHAGE
  listeJour.innerHTML = tachesJour.map(t => genererHtmlTache(t, true)).join('') 
    || '<p style="text-align:center; padding:20px; opacity:0.5;">🌿 Rien pour aujourd\'hui.</p>';

  if (listeFutur) {
    listeFutur.innerHTML = tachesFutur.map(t => genererHtmlTache(t, false)).join('') 
      || '<p style="text-align:center; font-size:0.8rem; padding:10px; opacity:0.5;">Avenir serein...</p>';
  }
}

function genererHtmlTache(tache, estAujourdhui) {
  const dateAuj = aujourdhui();
  const faite = tache.datesFaites && tache.datesFaites.includes(dateAuj);
  
  let libelleLabel = "À faire";
  if (!estAujourdhui && tache.prochaineDate) {
      const diffTime = new Date(tache.prochaineDate) - new Date(dateAuj);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) libelleLabel = "Demain !";
      else if (diffDays === 2) libelleLabel = "Après-demain";
      else if (diffDays <= 7) libelleLabel = "Cette semaine";
      else libelleLabel = "Plus tard";
  }

  return `
    <div class="task-card ${faite ? 'completed' : ''}" style="border-left: 5px solid ${estAujourdhui ? '#00c2a7' : '#c4a8e8'}; display: flex; align-items: center; justify-content: space-between;">
      <div style="display: flex; align-items: center; flex: 1;">
        <input type="checkbox" ${faite ? 'checked' : ''} onclick="cocherTache(${tache.id})" style="width:22px; height:22px; margin-right:15px;">
        <div onclick="ouvrirPourModifier(${tache.id})">
          <div style="font-weight:bold; ${faite ? 'text-decoration:line-through; opacity: 0.6;' : ''}">${tache.nom}</div>
          <small style="color:#8a7060">${tache.piece} • ${estAujourdhui ? 'Aujourd\'hui' : libelleLabel}</small>
        </div>
      </div>
      
      <div style="display: flex; align-items: center; gap: 10px;">
<span style="background: #e0f2ff; color: #2b7bb9; padding: 6px 12px; border-radius: 12px; font-weight: 900; border: 2px solid #2b7bb9; display: flex; align-items: center; justify-content: center; gap: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); min-width: 80px;">
  <span style="font-size: 1.4rem;">+${tache.xp}</span>
  <span style="font-size: 0.7rem; margin-top: 4px;">XP</span>
</span>
</span>
        </span>
        <div id="delete-zone-${tache.id}">
          <button onclick="demanderSuppression(${tache.id})" style="background:none; border:none; font-size:20px; cursor:pointer; opacity: 0.5;">🗑️</button>
        </div>
      </div>
    </div>`;
}

// ==========================================
// 4. ACTIONS
// ==========================================
window.cocherTache = (id) => {
  const tache = state.tasks.find(t => t.id === id);
  const dateAuj = aujourdhui();
  if (!tache.datesFaites) tache.datesFaites = [];
  
  const dejaFaite = tache.datesFaites.includes(dateAuj);
  const creature = state.creatures.find(c => c.id === state.creatureActive);

  if (dejaFaite) {
    // ON DÉCOCHE
    tache.datesFaites = tache.datesFaites.filter(d => d !== dateAuj);
    if (creature) creature.xp = Math.max(0, creature.xp - tache.xp);
    jouerSon('loss');
  } else {
    // ON COCHE
    tache.datesFaites.push(dateAuj);
    if (creature) creature.xp += tache.xp;
    
    // On gagne des diamants seulement si c'est la première fois de la journée
    if (state.lastValidatedDate !== dateAuj) {
      state.dayCount++;
      state.diamonds += 10;
      state.lastValidatedDate = dateAuj;
    }
    jouerSon('win');
  }
  
  sauvegarder(); 
  mettreAJourUI();
};

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
  const lancementValue = document.getElementById('task-lancement').value;
  if (!nom) return;
  let d = new Date();
  const joursEnPlus = parseInt(lancementValue.replace("+", ""));
  d.setDate(d.getDate() + joursEnPlus);
  state.tasks.push({
    id: Date.now(),
    nom: nom,
    piece: document.getElementById('task-piece').value,
    xp: parseInt(document.getElementById('task-xp').value) || 10,
    frequence: document.getElementById('task-frequence').value,
    prochaineDate: d.toISOString().split('T')[0],
    datesFaites: []
  });
  sauvegarder(); fermerModal(); mettreAJourUI();
}

// ==========================================
// 5. BOUTIQUE & MODIF
// ==========================================
window.ouvrirPourModifier = (id) => {
  const tache = state.tasks.find(t => t.id === id);
  document.getElementById('task-nom').value = tache.nom;
  document.getElementById('task-piece').value = tache.piece;
  document.getElementById('task-xp').value = tache.xp;
  document.getElementById('btn-sauvegarder').onclick = () => {
    tache.nom = document.getElementById('task-nom').value;
    tache.piece = document.getElementById('task-piece').value;
    tache.xp = parseInt(document.getElementById('task-xp').value);
    sauvegarder(); fermerModal(); mettreAJourUI();
  };
  document.getElementById('task-modal').classList.remove('hidden');
};

window.ouvrirBoutique = () => {
  document.getElementById('shop-diamonds').textContent = state.diamonds;
  const grille = document.getElementById('shop-items');
  grille.innerHTML = catalogue.map(item => {
    const possedee = state.creatures.find(c => c.id === item.id);
    return `<div class="shop-item"><div style="font-size:35px;">${item.stades[4]}</div><div style="font-weight:bold; margin:5px 0">${item.nom}</div>
        <button onclick="acheter('${item.id}', ${item.prix})" style="background:${possedee ? '#aaa' : '#00c2a7'}; color:white; border:none; border-radius:10px; padding:8px; width:100%;">${possedee ? '✓ Utiliser' : '💎 ' + item.prix}</button></div>`;
  }).join('');
  document.getElementById('shop-modal').classList.remove('hidden');
};

window.acheter = (id, prix) => {
  const possedee = state.creatures.find(c => c.id === id);
  if (possedee) state.creatureActive = id;
  else if (state.diamonds >= prix) {
    state.diamonds -= prix;
    state.creatures.push({ id: id, xp: 0 });
    state.creatureActive = id;
    jouerSon('win');
  } else { alert("Pas assez de diamants ! 💎"); return; }
  sauvegarder(); mettreAJourUI(); fermerModal();
};

function fermerModal() {
  document.getElementById('task-modal').classList.add('hidden');
  document.getElementById('shop-modal').classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
  charger(); mettreAJourUI();
  document.getElementById('add-task-btn').onclick = () => {
    document.getElementById('task-nom').value = "";
    document.getElementById('btn-sauvegarder').onclick = ajouterNouvelleTache;
    document.getElementById('task-modal').classList.remove('hidden');
  };
  document.getElementById('btn-annuler').onclick = fermerModal;
  document.getElementById('diamonds-btn').onclick = window.ouvrirBoutique;
  document.getElementById('btn-fermer-boutique').onclick = fermerModal;
});
// --- LOGIQUE DES NOTIFICATIONS ---

// 1. Enregistre l'heure choisie par l'utilisateur
window.changerHeureNotif = (heureChoisie) => {
    state.heureNotif = heureChoisie;
    sauvegarder();
    console.log("Réveil réglé à : " + heureChoisie);
};

// 2. Vérifie l'heure toutes les 30 secondes
setInterval(() => {
    if (!state.heureNotif) return;

    const maintenant = new Date();
    // Format HH:mm (ex: 08:00)
    const heureActuelle = `${String(maintenant.getHours()).padStart(2, '0')}:${String(maintenant.getMinutes()).padStart(2, '0')}`;

    // Si c'est l'heure et qu'on n'a pas encore notifié aujourd'hui
    if (state.heureNotif === heureActuelle && state.derniereNotif !== aujourdhui()) {
        const sw = navigator.serviceWorker.controller;
        if (sw) {
            sw.postMessage({
                type: 'DECLENCHER_NOTIF',
                message: 'Tes créatures t\'attendent pour leurs missions ! 🧚‍♂️'
            });
            state.derniereNotif = aujourdhui();
            sauvegarder();
        }
    }
}, 30000);

// 3. Initialise l'affichage de l'heure au chargement de la page
// À ajouter à l'intérieur de ton document.addEventListener('DOMContentLoaded', ...
const inputHeure = document.getElementById('notif-time');
if (inputHeure && state.heureNotif) {
    inputHeure.value = state.heureNotif;
}