// 1. ÉTAT DE L'APPLI
let state = {
  diamonds: 0,
  dayCount: 0,
  lastValidatedDate: null,
  tasks: [],
  creatures: [
    { id: 'fleur', xp: 0 }  // La fleur est débloquée dès le début
  ],
  creatureActive: 'fleur'  // Celle qu'on affiche
};

const evolutionData = {
  1: { nom: "Graine", emoji: "🌱" },
  2: { nom: "Pousse", emoji: "🌿" },
  3: { nom: "Chrysalide", emoji: "✨" },
  4: { nom: "Fée", emoji: "🧚" }
};

const catalogue = [
  { id: 'fleur',    nom: 'Fleur parfumée',    prix: 0,   stades: ['🪴','🌱','🌸','🌺','🌹'] },
  { id: 'poule',    nom: 'Poule cui-cui',    prix: 50,  stades: ['🥚','🐣','🐤','🐔','🪽'] },
  { id: 'papillon', nom: 'Papillon libre', prix: 80,  stades: ['🥚','🐛','🫘','🌀','🦋'] },
  { id: 'chaton', nom: 'Chaton poilu', prix: 100, stades: ['🐾','😸','🐈‍⬛','🐈','🐱'] },
  { id: 'fee',      nom: 'Fée du logis',      prix: 120, stades: ['🌱','✨','🌟','🪄','🧚'] },
  { id: 'lune',     nom: 'Lune solaire',     prix: 200, stades: ['🌚','🌑','🌛','🌝','🌞'] },
  { id: 'etoiles',  nom: 'Étoiles brillantes',  prix: 150, stades: ['⚡','✨','🌟','⭐','💫'] },
  { id: 'coeurs',   nom: 'Cœurs d_amour',    prix: 180, stades: ['🧡','💛','💚','🩷','❤️'] },
  { id: 'sirene',   nom: 'Sirène d_argent',   prix: 250, stades: ['🐟','🐳','🧝‍♀️','👸','🧜‍♀️'] },
  { id: 'reine',    nom: 'Reine Queen B',    prix: 220, stades: ['👗','🥻','👠','👑','💍'] },
  { id: 'licorne',  nom: 'Licorne Rose',  prix: 280, stades: ['🥚','🎠','🪅','🌈','🦄'] },
  { id: 'vampire',  nom: 'Vampire de sang',  prix: 300, stades: ['🩸','🦇','🌙','👁️','🧛‍♀️'] },
  { id: 'dragon',   nom: 'Dragonnet',   prix: 350, stades: ['🦕','🦎','🐍','🐲','🐉'] },
  { id: 'phenix',   nom: 'Phénix de ses cendres',   prix: 500, stades: ['🪺','🐦','🔥','⭐','🐦‍🔥'] },
];

// 2. UTILITAIRES
const sauvegarder = () => localStorage.setItem('fee_du_logis_v1', JSON.stringify(state));
const charger = () => {
  const data = localStorage.getItem('fee_du_logis_v1');
  if (data) {
    state = JSON.parse(data);
    if (!state.tasks) state.tasks = [];
    if (!state.creatures) state.creatures = [{ id: 'fleur', xp: 0 }];
    if (!state.creatureActive) state.creatureActive = 'fleur';
  }
};
const aujourdhui = () => new Date().toISOString().split('T')[0];

// 3. SONS
function jouerSon(type) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  if (type === 'win') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.3);
  } else {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(261.63, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(130.81, ctx.currentTime + 0.2);
  }
  
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(); osc.stop(ctx.currentTime + 0.3);
}

// 4. MISE À JOUR DE L'INTERFACE
function mettreAJourUI() {
  document.getElementById('diamond-count').textContent = state.diamonds;
  document.getElementById('day-count').textContent = state.dayCount;

  // Trouver la créature active dans le catalogue
  const creatureEtat = state.creatures.find(c => c.id === state.creatureActive);
  const creatureCatalogue = catalogue.find(c => c.id === state.creatureActive);

  if (creatureEtat && creatureCatalogue) {
    // Calculer le stade (0 à 4) selon l'XP de CETTE créature
    const stadeIdx = Math.min(4, Math.floor(creatureEtat.xp / 500));
    const xpDansStade = creatureEtat.xp % 500;

    // Afficher l'emoji du bon stade
    document.getElementById('creature-emoji').textContent = creatureCatalogue.stades[stadeIdx];
    document.getElementById('creature-stage').textContent = `Stade ${stadeIdx + 1}. ${creatureCatalogue.nom}`;

    // Mettre à jour la jauge avec l'XP de CE stade uniquement
    const barre = document.getElementById('xp-fill');
    if (barre) barre.style.width = (xpDansStade / 500 * 100) + '%';
    document.getElementById('xp-current').textContent = xpDansStade;
  }

  // Flamme streak
  const feu = document.getElementById('streak-fire');
  state.dayCount > 0 ? feu.classList.remove('hidden') : feu.classList.add('hidden');

  afficherTaches();
}

function afficherTaches() {
  const liste = document.getElementById('tasks-list');
  const dateJour = aujourdhui();
  
  if (state.tasks.length === 0) {
    liste.innerHTML = '<p style="color:#8a7060; padding:20px; text-align:center; opacity:0.6;">🌿 Aucune tâche pour le moment.</p>';
    return;
  }

  liste.innerHTML = state.tasks.map(tache => {
    const faite = tache.datesFaites && tache.datesFaites.includes(dateJour);
    return `
   <div class="task-card ${faite ? 'completed' : ''}" data-id="${tache.id}">
        <input type="checkbox" ${faite ? 'checked' : ''} onclick="cocherTache(${tache.id})" style="width:22px; height:22px; margin-right:15px;">
        
        <div style="flex:1; cursor:pointer;" onclick="ouvrirPourModifier(${tache.id})">
          <div style="font-weight:bold; ${faite ? 'text-decoration:line-through' : ''}">${tache.nom}</div>
          <small style="color:#8a7060">${tache.piece} • ✏️ Modifier</small>
        </div>

        <div style="font-weight:bold; color:#ff85d2; margin: 0 10px;">+${tache.xp}</div>
        
        <div id="delete-ctrl-${tache.id}">
          <button onclick="demanderSuppression(${tache.id})" style="background:none; border:none; font-size:20px; cursor:pointer;">🗑️</button>
        </div>
      </div>`;
  }).join('');
}

// 5. ACTIONS (GLOBALES)
window.cocherTache = (id) => {
  const tache = state.tasks.find(t => t.id === id);
  const dateJour = aujourdhui();
  if (!tache.datesFaites) tache.datesFaites = [];
  const dejaFaite = tache.datesFaites.includes(dateJour);

  // Trouver la créature active pour modifier son XP
  const creatureActive = state.creatures.find(c => c.id === state.creatureActive);

  if (dejaFaite) {
    tache.datesFaites = tache.datesFaites.filter(d => d !== dateJour);
    if (creatureActive) creatureActive.xp = Math.max(0, creatureActive.xp - tache.xp);
    jouerSon('loss');
  } else {
    tache.datesFaites.push(dateJour);
    if (creatureActive) creatureActive.xp += tache.xp;
    if (state.lastValidatedDate !== dateJour) {
      state.dayCount++;
      state.diamonds += 10;
      state.lastValidatedDate = dateJour;
    }
    jouerSon('win');
  }
  sauvegarder(); mettreAJourUI();
};

// --- SYSTÈME POUBELLE ---
window.demanderSuppression = (id) => {
  const ctrl = document.getElementById(`delete-ctrl-${id}`);
  if(ctrl) {
    ctrl.innerHTML = `<button onclick="supprimerDefinitif(${id})" style="color:white; background:#ff4757; border:none; border-radius:8px; padding:5px 10px; font-size:11px; font-weight:bold; cursor:pointer;">Valider ?</button>`;
  }
};

window.supprimerDefinitif = (id) => {
  state.tasks = state.tasks.filter(t => t.id !== id);
  sauvegarder(); mettreAJourUI();
};

// --- SYSTÈME MODIFICATION ---
window.ouvrirPourModifier = (id) => {
  const tache = state.tasks.find(t => t.id === id);
  document.getElementById('task-nom').value = tache.nom;
  document.getElementById('task-piece').value = tache.piece;
  document.getElementById('task-xp').value = tache.xp;
  
  // On change le comportement du bouton sauvegarder
  document.getElementById('btn-sauvegarder').onclick = () => {
    tache.nom = document.getElementById('task-nom').value;
    tache.piece = document.getElementById('task-piece').value;
    tache.xp = parseInt(document.getElementById('task-xp').value);
    sauvegarder(); fermerModal(); mettreAJourUI();
  };
  document.getElementById('task-modal').classList.remove('hidden');
};

// --- BOUTIQUE ---
window.ouvrirBoutique = () => {
  document.getElementById('shop-diamonds').textContent = state.diamonds;
  const grille = document.getElementById('shop-items');
  grille.innerHTML = catalogue.map(item => {
    const dejaPossedee = state.creatures.find(c => c.id === item.id);
    return `
      <div class="shop-item">
        <div style="font-size:30px">${item.stades[0]}</div>
        <div style="font-weight:bold; margin:5px 0">${item.nom}</div>
        <button onclick="acheter('${item.id}', ${item.prix})"
          style="background:${dejaPossedee ? '#aaa' : '#00c2a7'}; color:white; border:none; border-radius:10px; padding:8px; cursor:pointer; width:100%;">
          ${dejaPossedee ? '✓ Possédée' : '💎 ' + item.prix}
        </button>
      </div>`;
  }).join('');
  document.getElementById('shop-modal').classList.remove('hidden');
};

window.acheter = function(id, prix) {
  const dejaPossedee = state.creatures.find(c => c.id === id);
  if (dejaPossedee) {
    state.creatureActive = id;
    sauvegarder(); mettreAJourUI();
    document.getElementById('shop-modal').classList.add('hidden');
    return;
  }
  if (state.diamonds >= prix) {
    state.diamonds -= prix;
    state.creatures.push({ id: id, xp: 0 });
    state.creatureActive = id;
    jouerSon('win');
    sauvegarder(); mettreAJourUI();
    document.getElementById('shop-modal').classList.add('hidden');
  } else {
    alert("Pas assez de diamants ! 💎");
    jouerSon('loss');
  }
};

function ajouterNouvelleTache() {
  const nom = document.getElementById('task-nom').value;
  if (!nom) return;
  state.tasks.push({
    id: Date.now(),
    nom: nom,
    piece: document.getElementById('task-piece').value,
    xp: parseInt(document.getElementById('task-xp').value) || 10,
    datesFaites: []
  });
  sauvegarder(); fermerModal(); mettreAJourUI();
}

function fermerModal() {
  document.getElementById('task-modal').classList.add('hidden');
  document.getElementById('shop-modal').classList.add('hidden');
}

// 6. INITIALISATION
document.addEventListener('DOMContentLoaded', () => {
  charger();
  mettreAJourUI();

  document.getElementById('add-task-btn').onclick = () => {
    document.getElementById('task-nom').value = "";
    document.getElementById('btn-sauvegarder').onclick = ajouterNouvelleTache;
    document.getElementById('task-modal').classList.remove('hidden');
    // Enregistrer le service worker pour les notifications
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      Notification.requestPermission().then(perm => {
        if (perm === 'granted') {
          reg.active?.postMessage({ type: 'PLANIFIER_NOTIF' });
        }
      });
    });
  }
  };

  document.getElementById('btn-annuler').onclick = fermerModal;
  document.getElementById('diamonds-btn').onclick = window.ouvrirBoutique;
  document.getElementById('btn-fermer-boutique').onclick = fermerModal;
});