// ==========================================
// 1. ÉTAT & CATALOGUE
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
  { id: 'fleur',    nom: 'Fleur parfumée',       prix: 0,   stades: ['🪴','🌱','🌸','🌺','🌹'] },
  { id: 'poule',    nom: 'Poule cui-cui',         prix: 50,  stades: ['🥚','🐣','🐤','🐔','🪽'] },
  { id: 'papillon', nom: 'Papillon libre',        prix: 80,  stades: ['🥚','🐛','🫘','🌀','🦋'] },
  { id: 'chaton',   nom: 'Chaton poilu',          prix: 100, stades: ['🐾','😸','🐈‍⬛','🐈','🐱'] },
  { id: 'fee',      nom: 'Fée du logis',          prix: 120, stades: ['🌱','✨','🌟','🪄','🧚'] },
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
    if (state.lastValidatedDate === undefined) state.lastValidatedDate = null;
  }
};
const aujourdhui = () => new Date().toISOString().split('T')[0];


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

  // Créature
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

// Flamme — Visible dès qu'on a au moins 1 jour de série
  const feu = document.getElementById('streak-fire');
  if (feu) {
   if (state.lastValidatedDate === aujourdhui()) {
      feu.style.display = 'inline-block';
    } else {
      feu.style.display = 'none';
    }
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

  // 1. FILTRAGE MISSIONS DU JOUR
  let tJour = state.tasks.filter(t => {
    const faiteAuj = t.datesFaites?.includes(dateAuj);
    return (t.prochaineDate <= dateAuj) || (faiteAuj && (!t.datePrecedente || t.datePrecedente <= dateAuj));
  });

  // 2. FILTRAGE AVENIR
  let tFutur = state.tasks.filter(t => {
    const faiteAuj = t.datesFaites?.includes(dateAuj);
    const estVraimentAvenir = t.prochaineDate > dateAuj || (faiteAuj && t.datePrecedente > dateAuj);
    return estVraimentAvenir && !tJour.includes(t);
  });

  // 3. FONCTION DE TRI UNIQUE (La même pour les deux listes)
  const monSuperTri = (a, b) => {
    const aF = a.datesFaites?.includes(dateAuj) ? 1 : 0;
    const bF = b.datesFaites?.includes(dateAuj) ? 1 : 0;
    
    // Priorité 1 : État (Non-coché en haut)
    if (aF !== bF) return aF - bF;
    // Priorité 2 : Date (La plus ancienne/urgente en haut)
    if (a.prochaineDate !== b.prochaineDate) return a.prochaineDate.localeCompare(b.prochaineDate);
    // Priorité 3 : Nom (Ordre alphabétique si tout le reste est pareil)
    return a.nom.localeCompare(b.nom);
  };

  // On applique le tri aux deux listes
  tJour.sort(monSuperTri);
  tFutur.sort(monSuperTri);

  // 4. AFFICHAGE
  if (listeJour) listeJour.innerHTML = tJour.map(t => genererHtmlTache(t, true)).join('') || '<p>🌿 Rien aujourd\'hui.</p>';
  if (listeFutur) listeFutur.innerHTML = tFutur.map(t => genererHtmlTache(t, false)).join('') || '<p>Avenir serein...</p>';
}
function genererHtmlTache(tache, estAuj) {
  const faite = tache.datesFaites?.includes(aujourdhui());
  
  return `
    <div class="task-card ${faite ? 'completed' : ''}" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 15px; background: white; border-radius: 20px; margin-bottom: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); border: 1px solid #f0e6ff;">
      
      <div style="display: flex; align-items: center; flex: 1; cursor: pointer;" onclick="ouvrirPourModifier(${tache.id})">
        
        <input type="checkbox" ${faite ? 'checked' : ''} 
               onclick="event.stopPropagation(); cocherTache(${tache.id})" 
               style="width:22px; height:22px; margin-right:12px; cursor:pointer; flex-shrink:0;">
        
        <span style="font-size: 1.2rem; margin-right: 10px; display: flex; align-items: center;">🌸</span>
        
        <div style="display: flex; flex-direction: column; justify-content: center;">
          <div style="font-weight: 600; color: #4a3560; ${faite ? 'text-decoration:line-through; opacity:0.5;' : ''}">
            ${tache.nom}
          </div>
          <small style="color: #a594b5; font-size: 0.8rem;">
            ${tache.piece || 'Maison'} • ${estAuj ? "Aujourd'hui" : 'Le ' + tache.prochaineDate} • <span style="font-style: italic; color: #6d5d8e;">✏️ Modifier</span>
          </small>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 12px; flex-shrink:0;">
        <span style="font-weight:bold; color:#7fb3d5; font-size: 0.85rem;">+${tache.xp} XP</span>
        <div id="delete-zone-${tache.id}" style="display: flex; align-items: center;">
          <button onclick="event.stopPropagation(); demanderSuppression(${tache.id})" 
                  style="background:none; border:none; font-size:18px; cursor:pointer; opacity:0.6; padding: 5px;">
            🗑️
          </button>
        </div>
      </div>
    </div>`;
}

// ==========================================
// 5. ACTIONS
// ==========================================
window.cocherTache = (id) => {
  console.log("Tentative de cochage de la tâche :", id); // Pour vérifier dans la console
  const tache = state.tasks.find(t => t.id === id);
  const dateAuj = aujourdhui();
  
  if (!tache) return; // Sécurité si la tâche n'existe pas
  if (!tache.datesFaites) tache.datesFaites = [];
  
  const dejaFaite = tache.datesFaites.includes(dateAuj);
  const creature = state.creatures.find(c => c.id === state.creatureActive);

  if (!dejaFaite) {
    // --- ACTIONS : VALIDER LA TÂCHE ---
    jouerSon('win');
    tache.datesFaites.push(dateAuj);
ajouterXP(tache.xp || 10);
    // Attribution de l'XP (Vérification stricte)
    if (creature) {
        creature.xp = (creature.xp || 0) + (tache.xp || 10);
        console.log("XP gagné ! Nouveau total :", creature.xp);
    }
    
    // Bonus quotidien (diamants + flamme)
    if (state.lastValidatedDate !== dateAuj) {
        state.dayCount = (state.dayCount || 0) + 1;
        state.diamonds = (state.diamonds || 0) + 10;
        state.lastValidatedDate = dateAuj;
    }

    // Gestion de la date
    tache.datePrecedente = tache.prochaineDate; 
    if (tache.prochaineDate <= dateAuj) {
        tache.prochaineDate = calculerProchaineDate(dateAuj, tache.frequence);
    }
    
    if (typeof changerMantra === 'function') changerMantra();

  } else {
    // --- ACTIONS : DÉCOCHER LA TÂCHE ---
    jouerSon('loss');
    tache.datesFaites = tache.datesFaites.filter(d => d !== dateAuj);
    
    // Retrait de l'XP
    if (creature) {
        creature.xp = Math.max(0, (creature.xp || 0) - (tache.xp || 10));
    }

    // Restauration de la date
    if (tache.datePrecedente) {
        tache.prochaineDate = tache.datePrecedente;
    }

    // Annulation du bonus si plus aucune tâche n'est faite aujourd'hui
    const encore = state.tasks.some(t => t.datesFaites?.includes(dateAuj));
    if (!encore) {
        state.dayCount = Math.max(0, (state.dayCount || 0) - 1);
        state.diamonds = Math.max(0, (state.diamonds || 0) - 10);
        state.lastValidatedDate = null;
    }
  }

  // SAUVEGARDE ET MISE À JOUR (Crucial pour le tri !)
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
    zone.innerHTML = `<button onclick="supprimerDefinitif(${id})"
      style="color:white; background:#ff4757; border:none; border-radius:8px;
             padding:5px 10px; font-size:11px; font-weight:bold; cursor:pointer;">
      Valider ?</button>`;
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
  const joursEnPlus = parseInt(lancementValue.replace('+', '')) || 0;
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
        <div style="font-weight:bold; font-size:12px; margin:5px 0;">${item.nom}</div>
        <button onclick="acheter('${item.id}', ${item.prix})"
          style="background:${estActive ? '#c4a8e8' : possedee ? '#aaa' : '#00c2a7'};
                 color:white; border:none; border-radius:10px;
                 padding:8px; cursor:pointer; width:100%; font-size:12px;">
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
    state.creatures.push({ id: id, xp: 0 });
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
function planifierNotification(heure) {
    if (!('serviceWorker' in navigator)) return;
    const [h, m] = heure.split(':').map(Number);
    const cible = new Date();
    cible.setHours(h, m, 0, 0);
    if (cible <= new Date()) cible.setDate(cible.getDate() + 1);
    navigator.serviceWorker.ready.then(reg => {
        if (reg.active) {
            reg.active.postMessage({
                type: 'PLANIFIER_NOTIF',
                timestamp: cible.getTime()
            });
        }
    });
}

window.changerHeureNotif = (heure) => {
    state.heureNotif = heure;
    sauvegarder();
    Notification.requestPermission().then(perm => {
        if (perm === 'granted') planifierNotification(heure);
    });
};
// ==========================================
// 7. MODALS & INIT
// ==========================================
function fermerModal() {
    document.getElementById('task-modal').classList.add('hidden');
    document.getElementById('shop-modal').classList.add('hidden');
    document.getElementById('notif-modal').classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
  charger();
  mettreAJourUI();
  // Planifier la notif au démarrage avec l'heure sauvegardée
if (state.heureNotif) {
    Notification.requestPermission().then(perm => {
        if (perm === 'granted') planifierNotification(state.heureNotif);
    });
}

  document.getElementById('add-task-btn').onclick = () => {
    document.getElementById('task-nom').value = '';
    document.getElementById('btn-sauvegarder').onclick = ajouterNouvelleTache;
    document.getElementById('task-modal').classList.remove('hidden');
  };

  document.getElementById('btn-annuler').onclick = fermerModal;
  document.getElementById('diamonds-btn').onclick = window.ouvrirBoutique;
  document.getElementById('btn-fermer-boutique').onclick = fermerModal;

  // Service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
  // Réveil
document.getElementById('notif-btn').onclick = () => {
    const input = document.getElementById('notif-time');
    input.value = state.heureNotif || '08:00';
    document.getElementById('notif-modal').classList.remove('hidden');
};

document.getElementById('btn-annuler-notif').onclick = () => {
    document.getElementById('notif-modal').classList.add('hidden');
};

document.getElementById('btn-sauver-notif').onclick = () => {
    const heure = document.getElementById('notif-time').value;
    if (heure) {
        window.changerHeureNotif(heure);
        document.getElementById('notif-modal').classList.add('hidden');
    }
};
});
function calculerProchaineDate(baseDate, frequence) {
    let d = new Date(baseDate);
    if (frequence === 'Quotidienne') {
        d.setDate(d.getDate() + 1);
    } else if (frequence === 'Hebdomadaire') {
        d.setDate(d.getDate() + 7);
    } else if (frequence === 'Bimensuelle') {
        d.setDate(d.getDate() + 14);
    } else if (frequence === 'Mensuelle') {
        d.setMonth(d.getMonth() + 1);
    } else {
        // Pour les tâches ponctuelles, on la décale de 100 ans pour qu'elle disparaisse du "Aujourd'hui"
        d.setFullYear(d.getFullYear() + 100);
    }
    return d.toISOString().split('T')[0];
}
function ajouterXP(montant) {
    console.log("Animation de la barre d'XP : +", montant);
    const xpFill = document.getElementById('xp-fill');
    if (xpFill) {
        // On récupère la largeur actuelle (ex: "30%")
        let largeurActuelle = parseFloat(xpFill.style.width) || 0;
        let nouvelleLargeur = largeurActuelle + (montant / 5); // Ajuste le /5 pour que ça remplisse plus ou moins vite
        
        // On bloque à 100%
        if (nouvelleLargeur > 100) nouvelleLargeur = 100;
        
        // On applique le changement visuel
        xpFill.style.width = nouvelleLargeur + "%";
    }
}