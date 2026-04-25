// ==========================================
// 1. ÉTAT ET DONNÉES
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
  { id: 'fee',      nom: 'Fée du logis',            prix: 120, stades: ['🌱','✨','🌟','🪄','🧚'] },
  { id: 'chaton',   nom: 'Chaton poilu',            prix: 100, stades: ['🐾','😸','🐈‍⬛','🐈','🐱'] },
  { id: 'licorne',  nom: 'Licorne Rose',            prix: 280, stades: ['🥚','🎠','🪅','🌈','🦄'] }
];

const phrasesPositives = [
    "Chaque petit geste compte pour ton sanctuaire. ✨",
    "Une tâche à la fois, et la magie opère. 🪄",
    "Ta créature est fière de tes efforts ! 🐾",
    "Tu prépares ton bonheur de demain. 🌿",
    "Bravo ! Tu es la reine de ton royaume. 👑",
    "Ta maison te dit merci. 🏠✨",
    "C'est l'heure de briller, petite fée ! 🧚‍♂️"
];

// ==========================================
// 2. FONCTIONS DE BASE
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

// ==========================================
// 3. UI ET AFFICHAGE
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
  feu.style.display = (state.lastValidatedDate === aujourdhui()) ? "inline-block" : "none";

  const inputHeure = document.getElementById('notif-time');
  if (inputHeure) inputHeure.value = state.heureNotif;

  afficherTaches();
}

function afficherTaches() {
  const listeJour = document.getElementById('tasks-list');
  const listeFutur = document.getElementById('future-tasks-list');
  const auj = aujourdhui();

  const tJour = state.tasks.filter(t => t.prochaineDate <= auj);
  const tFutur = state.tasks.filter(t => t.prochaineDate > auj);

  listeJour.innerHTML = tJour.map(t => genererHtmlTache(t, true)).join('') || '<p>🌿 Journée terminée !</p>';
  if (listeFutur) {
    listeFutur.innerHTML = tFutur.map(t => genererHtmlTache(t, false)).join('') || '<p>Rien de prévu.</p>';
  }
}

function genererHtmlTache(tache, estAuj) {
  const faite = tache.datesFaites?.includes(aujourdhui());
  return `
    <div class="task-card ${faite ? 'completed' : ''}" style="border-left-color: ${estAuj ? '#00c2a7' : '#c4a8e8'}">
      <div style="display:flex; align-items:center;">
        <input type="checkbox" ${faite ? 'checked' : ''} onclick="cocherTache(${tache.id})" style="width:20px; height:20px; margin-right:10px;">
        <div>
            <div style="font-weight:bold;">${tache.nom}</div>
            <small>${estAuj ? 'Maintenant' : 'À venir'}</small>
        </div>
      </div>
      <div style="font-weight:bold; color:#2b7bb9;">+${tache.xp} XP</div>
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
// 4. ACTIONS
// ==========================================
window.cocherTache = (id) => {
  const tache = state.tasks.find(t => t.id === id);
  const auj = aujourdhui();
  if (!tache.datesFaites) tache.datesFaites = [];

  const c = state.creatures.find(x => x.id === state.creatureActive);

  if (tache.datesFaites.includes(auj)) {
    tache.datesFaites = tache.datesFaites.filter(d => d !== auj);
    c.xp = Math.max(0, c.xp - tache.xp);
  } else {
    tache.datesFaites.push(auj);
    c.xp += tache.xp;
    changerMantra();
    if (state.lastValidatedDate !== auj) {
      state.dayCount++;
      state.diamonds += 10;
      state.lastValidatedDate = auj;
    }
  }
  sauvegarder(); mettreAJourUI();
};

window.changerHeureNotif = (h) => {
    state.heureNotif = h;
    sauvegarder();
    if ("Notification" in window) Notification.requestPermission();
};

window.ajouterNouvelleTache = () => {
    const nom = document.getElementById('task-nom').value;
    if (!nom) return;
    const lancement = parseInt(document.getElementById('task-lancement').value);
    let d = new Date();
    d.setDate(d.getDate() + lancement);

    state.tasks.push({
        id: Date.now(),
        nom: nom,
        xp: parseInt(document.getElementById('task-xp').value),
        prochaineDate: d.toISOString().split('T')[0],
        datesFaites: []
    });
    sauvegarder(); 
    document.getElementById('task-modal').classList.add('hidden');
    mettreAJourUI();
};

// Vérification Notif (Toutes les 30s)
setInterval(() => {
    const m = new Date();
    const h = `${String(m.getHours()).padStart(2,'0')}:${String(m.getMinutes()).padStart(2,'0')}`;
    if (state.heureNotif === h && state.derniereNotif !== aujourdhui()) {
        if (navigator.serviceWorker?.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'DECLENCHER_NOTIF',
                message: 'C\'est l\'heure de tes missions ! 🧚‍♂️'
            });
            state.derniereNotif = aujourdhui();
            sauvegarder();
        }
    }
}, 30000);

// ==========================================
// 5. BOUTIQUE ET DEMARRAGE
// ==========================================
window.ouvrirBoutique = () => {
    document.getElementById('shop-diamonds').textContent = state.diamonds;
    const grid = document.getElementById('shop-items');
    grid.innerHTML = catalogue.map(i => {
        const p = state.creatures.find(c => c.id === i.id);
        return `<div style="background:#f9f9f9; padding:10px; border-radius:15px; text-align:center;">
            <div style="font-size:30px;">${i.stades[4]}</div>
            <button onclick="acheter('${i.id}', ${i.prix})" style="width:100%; margin-top:5px; border:none; border-radius:8px; background:${p ? '#ccc' : '#00c2a7'}; color:white;">
                ${p ? 'Possédé' : '💎 ' + i.prix}
            </button>
        </div>`;
    }).join('');
    document.getElementById('shop-modal').classList.remove('hidden');
};

window.acheter = (id, prix) => {
    if (state.creatures.find(c => c.id === id)) {
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
  charger(); 
  mettreAJourUI();
  
  document.getElementById('add-task-btn').onclick = () => document.getElementById('task-modal').classList.remove('hidden');
  document.getElementById('btn-annuler').onclick = () => document.getElementById('task-modal').classList.add('hidden');
  document.getElementById('btn-sauvegarder').onclick = window.ajouterNouvelleTache;
  document.getElementById('diamonds-btn').onclick = window.ouvrirBoutique;
  document.getElementById('btn-fermer-boutique').onclick = () => document.getElementById('shop-modal').classList.add('hidden');
});