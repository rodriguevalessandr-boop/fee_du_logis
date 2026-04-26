// ==========================================
// 1. ÉTAT & CATALOGUE COMPLET (14 Créatures)
// ==========================================
let state = {
  diamonds: 0,
  dayCount: 0,
  lastValidatedDate: null,
  tasks: [],
  creatures: [{ id: 'fleur', xp: 0 }],
  creatureActive: 'fleur',
  heureNotif: "08:00",
  derniereNotif: null
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

const phrasesPositives = [
    "Chaque petit geste compte pour ton sanctuaire. ✨",
    "Une tâche à la fois, et la magie opère. 🪄",
    "Ta créature est fière de tes efforts ! 🐾",
    "Tu prépares ton bonheur de demain. 🌿",
    "Bravo ! Tu es la reine de ton royaume. 👑",
    "Ta maison te dit merci. 🏠✨",
    "C'est l'heure de briller, petite fée ! 🧚‍♂️",
    "Regarde tout ce que tu as accompli ! 🌟",
    "Petit pas par petit pas, la magie grandit. 🍃"
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
    const osc = ctx.createOscillator();
    if (type === 'win') {
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.2);
      g.gain.setValueAtTime(0.2, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    } else {
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);
      g.gain.setValueAtTime(0.1, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    }
    osc.connect(g); osc.start(); osc.stop(ctx.currentTime + 0.3);
  } catch(e) {}
}

// ==========================================
// 3. UI ET AFFICHAGE (Calendrier & Phrases)
// ==========================================
function mettreAJourUI() {
  document.getElementById('diamond-count').textContent = state.diamonds;
  document.getElementById('day-count').textContent = state.dayCount;

  const cActuelle = state.creatures.find(c => c.id === state.creatureActive);
  const cInfos = catalogue.find(c => c.id === state.creatureActive);
  
  if (cActuelle && cInfos) {
    const stadeIdx = Math.min(4, Math.floor(cActuelle.xp / 500));
    document.getElementById('creature-emoji').textContent = cInfos.stades[stadeIdx];
    document.getElementById('creature-stage').textContent = `Stade ${stadeIdx + 1}. ${cInfos.nom}`;
    document.getElementById('xp-fill').style.width = ((cActuelle.xp % 500) / 500 * 100) + '%';
    document.getElementById('xp-current').textContent = cActuelle.xp % 500;
  }

  const feu = document.getElementById('streak-fire');
  if (feu) feu.style.display = (state.lastValidatedDate === aujourdhui()) ? "inline-block" : "none";

  const inputHeure = document.getElementById('notif-time');
  if (inputHeure) inputHeure.value = state.heureNotif;

  afficherTaches();
}

function afficherTaches() {
  const listeJour = document.getElementById('tasks-list');
  const listeFutur = document.getElementById('future-tasks-list');
  const dateAuj = aujourdhui();

  // 1. On trie les tâches
  let tJour = state.tasks.filter(t => t.prochaineDate <= dateAuj || (t.datesFaites && t.datesFaites.includes(dateAuj)));
  tJour.sort((a, b) => (a.datesFaites?.includes(dateAuj)) - (b.datesFaites?.includes(dateAuj)));

  let tFutur = state.tasks.filter(t => t.prochaineDate > dateAuj && !(t.datesFaites && t.datesFaites.includes(dateAuj)));
  tFutur.sort((a, b) => a.prochaineDate.localeCompare(b.prochaineDate));

  // 2. On affiche (avec une sécurité si les listes n'existent pas dans le HTML)
  if (listeJour) {
      listeJour.innerHTML = tJour.map(t => genererHtmlTache(t, true)).join('') || '<p style="text-align:center; padding:20px; opacity:0.5;">🌿 Rien pour aujourd\'hui.</p>';
  }
  
  if (listeFutur) {
      listeFutur.innerHTML = tFutur.map(t => genererHtmlTache(t, false)).join('') || '<p style="text-align:center; padding:10px; opacity:0.5;">Avenir serein...</p>';
  }
}

// ON AJOUTE "window." pour que les clics sur Modifier et Supprimer fonctionnent
window.genererHtmlTache = (tache, estAuj) => {
  const faite = tache.datesFaites?.includes(aujourdhui());
  
  return `
    <div class="task-card ${faite ? 'completed' : ''}" style="border-left: 5px solid ${estAuj ? '#00c2a7' : '#c4a8e8'}; display: flex; align-items: center; justify-content: space-between; padding: 15px; background: white; border-radius: 18px; margin-bottom: 10px;">
      
      <div style="display: flex; align-items: center; flex: 1; cursor: pointer;" onclick="ouvrirPourModifier(${tache.id})">
        <input type="checkbox" ${faite ? 'checked' : ''} 
               onclick="event.stopPropagation(); cocherTache(${tache.id})" 
               style="width:22px; height:22px; margin-right:15px; cursor:pointer;">
        <div style="display: flex; flex-direction: column; justify-content: center;">
          <div style="font-weight:bold; ${faite ? 'text-decoration:line-through; opacity:0.6;' : ''}">${tache.nom}</div>
          <small style="color:#8a7060">${tache.piece || 'Maison'} • ${estAuj ? 'Aujourd\'hui' : 'Le ' + tache.prochaineDate}</small>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-weight:bold; color:#2b7bb9;">+${tache.xp} XP</span>
        <div id="delete-zone-${tache.id}">
           <button onclick="event.stopPropagation(); demanderSuppression(${tache.id})" style="background:none; border:none; font-size:20px; cursor:pointer;">🗑️</button>
        </div>
      </div>

    </div>`;
}

function changerMantra() {
    const el = document.getElementById('mantra-container');
    if (el) {
        el.style.opacity = 0;
        setTimeout(() => {
            el.textContent = phrasesPositives[Math.floor(Math.random() * phrasesPositives.length)];
            el.style.opacity = 1;
        }, 300);
    }
}

// ==========================================
// 4. ACTIONS & NOTIFS
// ==========================================
window.cocherTache = (id) => {
  const tache = state.tasks.find(t => t.id === id);
  const auj = aujourdhui();
  if (!tache.datesFaites) tache.datesFaites = [];
  const creature = state.creatures.find(c => c.id === state.creatureActive);

  if (tache.datesFaites.includes(auj)) {
    // DECOCHER : On retire les points et on remet à aujourd'hui
    tache.datesFaites = tache.datesFaites.filter(d => d !== auj);
    if (creature) creature.xp = Math.max(0, creature.xp - tache.xp);
    tache.prochaineDate = auj; 
    jouerSon('loss');
  } else {
    // COCHER : On gagne les points et on calcule la prochaine date
    tache.datesFaites.push(auj);
    if (creature) creature.xp += tache.xp;
    jouerSon('win');
    changerMantra();

    // CALCUL DE LA PROCHAINE DATE SELON LA FRÉQUENCE
    let d = new Date();
    const freq = tache.frequence; // Récupère "Hebdomadaire", etc.
    
    if (freq === "Hebdomadaire") d.setDate(d.getDate() + 7);
    else if (freq === "Bimensuelle") d.setDate(d.getDate() + 14);
    else if (freq === "Tous les 3 jours") d.setDate(d.getDate() + 3);
    else if (freq === "Ponctuelle") d.setFullYear(d.getFullYear() + 1); // Disparaît
    else d.setDate(d.getDate() + 1); // Quotidienne par défaut

    tache.prochaineDate = d.toISOString().split('T')[0];

    // Gestion du Streak (flamme) et Diamants
    if (state.lastValidatedDate !== auj) {
      state.dayCount++;
      state.diamonds += 10;
      state.lastValidatedDate = auj;
    }
  }
  sauvegarder(); mettreAJourUI();
};;

window.changerHeureNotif = (h) => {
    state.heureNotif = h; sauvegarder();
    if ("Notification" in window) Notification.requestPermission();
};

window.demanderSuppression = (id) => {
    const zone = document.getElementById(`delete-zone-${id}`);
    if (zone) zone.innerHTML = `<button onclick="supprimerDefinitif(${id})" style="background:#ff4757; color:white; border:none; border-radius:8px; padding:2px 5px; font-size:10px;">OK?</button>`;
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
    const joursEnPlus = parseInt(lancementValue.replace("+", "")) || 0;
    d.setDate(d.getDate() + joursEnPlus);

    state.tasks.push({
        id: Date.now(),
        nom: nom,
        piece: document.getElementById('task-piece').value,
        xp: parseInt(document.getElementById('task-xp').value) || 10,
        frequence: document.getElementById('task-frequence').value, // <-- TRÈS IMPORTANT
        prochaineDate: d.toISOString().split('T')[0],
        datesFaites: []
    });
    sauvegarder(); document.getElementById('task-modal').classList.add('hidden'); mettreAJourUI();
}

// ==========================================
// 5. BOUTIQUE & START
// ==========================================
window.ouvrirBoutique = () => {
    document.getElementById('shop-diamonds').textContent = state.diamonds;
    const grid = document.getElementById('shop-items');
    grid.innerHTML = catalogue.map(i => {
        const p = state.creatures.find(c => c.id === i.id);
        return `<div style="background:#f9f9f9; padding:10px; border-radius:15px; text-align:center; border:1px solid #eee;">
            <div style="font-size:30px;">${i.stades[4]}</div>
            <div style="font-size:11px;">${i.nom}</div>
            <button onclick="acheter('${i.id}', ${i.prix})" style="width:100%; margin-top:5px; border:none; border-radius:8px; background:${p ? '#ccc' : '#00c2a7'}; color:white; padding:5px;">
                ${p ? (state.creatureActive === i.id ? 'Actif' : 'Choisir') : '💎 ' + i.prix}
            </button>
        </div>`;
    }).join('');
    document.getElementById('shop-modal').classList.remove('hidden');
};

window.acheter = (id, prix) => {
    const possede = state.creatures.find(c => c.id === id);
    if (possede) {
        state.creatureActive = id;
    } else if (state.diamonds >= prix) {
        state.diamonds -= prix;
        state.creatures.push({ id, xp: 0 });
        state.creatureActive = id;
    } else {
        alert("Pas assez de diamants !");
    }
    sauvegarder(); mettreAJourUI(); document.getElementById('shop-modal').classList.add('hidden');
};

document.addEventListener('DOMContentLoaded', () => {
  charger(); mettreAJourUI(); changerMantra();
  document.getElementById('add-task-btn').onclick = () => document.getElementById('task-modal').classList.remove('hidden');
  document.getElementById('btn-annuler').onclick = () => document.getElementById('task-modal').classList.add('hidden');
  document.getElementById('btn-sauvegarder').onclick = window.ajouterNouvelleTache;
  document.getElementById('diamonds-btn').onclick = window.ouvrirBoutique;
  document.getElementById('btn-fermer-boutique').onclick = () => document.getElementById('shop-modal').classList.add('hidden');
});