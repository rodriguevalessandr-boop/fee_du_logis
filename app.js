// ==========================================
// 1. ÉTAT & CATALOGUE
// ==========================================
let state = {
   meilleurScore: 0,
  diamonds: 0,
  dayCount: 0,
  lastValidatedDate: null,
  heureNotif: '08:00',
  tasks: [],
  creatures: [{ id: 'fleur', xp: 0 }],
  creatureActive: 'fleur'
};

const catalogue = [
  { id: 'fleur',    nom: 'Fleur à pétales',       prix: 0,   stades: ['🌱','🪴','🌿','🌸','🌹'], nomsStades: ['Petite graine', 'Jolie pousse', 'Plante germée', 'Bourgeon timide', 'Fleur à pétales'] },
  { id: 'poule',    nom: 'Poule cui-cui',         prix: 50,  stades: ['🥚','🐣','🐤','🐔','🪽'], nomsStades: ['Petit œuf', 'Éclosion surprise', 'Poussin duveteux', 'Poule rousse', 'Majestueuse Cocotte'] },
  { id: 'papillon', nom: 'Papillon libre',        prix: 80,  stades: ['🥚','🐛','🫘','🌀','🦋'], nomsStades: ['Petit œuf', 'Chenille Rampante', 'Chrysalide cocoonesque', 'Chrysalide ailée', 'Papillon irisé'] },
  { id: 'chaton',   nom: 'Chaton poilu',          prix: 100, stades: ['🐾','😸','🐈‍⬛','🐈','🐱'], nomsStades: ['Boule de poils', 'Chaton poilu', 'Chaton sur pattes', 'Chaton coquin', 'Chaton devenu Chat'] },
  { id: 'lune',     nom: 'Lune solaire',          prix: 200, stades: ['🌚','🌑','🌛','🌝','🌞'], nomsStades: ['Nouvelle Lune', 'Lune Noire', 'Premier Quartier', 'Pleine Lune', 'Lune de Lumière'] },
  { id: 'etoiles',  nom: 'Étoiles brillantes',    prix: 150, stades: ['⚡','✨','🌟','⭐','💫'], nomsStades: ['Étincelle', 'Éclat céleste', 'Étoile filante', 'Astre brillant', 'Constellation infinie'] },
  { id: 'coeurs',   nom: "Cœurs d'amour",         prix: 180, stades: ['🧡','💛','💚','🩷','❤️'], nomsStades: ['Petit élan', 'Affection douce', 'Amitié sincère', 'Cœur vibrant', 'Grand Amour'] },
  { id: 'sirene',   nom: "Sirène d'argent",       prix: 250, stades: ['🐟','🐳','🧝‍♀️','👸','🧜‍♀️'], nomsStades: ['Petit poisson', 'Grand saut', 'Esprit des eaux', 'Princesse des mers', 'Reine des Océans'] },
  { id: 'reine',    nom: 'Reine Queen B',         prix: 220, stades: ['👗','🥻','👠','👑','💍'], nomsStades: ['Tenue de jour', 'Robe de bal', 'Défilé chic', 'Sacre royal', 'Impératrice du style'] },
  { id: 'licorne',  nom: 'Licorne Rose',          prix: 280, stades: ['🥚','🎠','🪅','🌈','🦄'], nomsStades: ['Œuf étincelant', 'Petit poney', 'Esprit de fête', 'Pont arc-en-ciel', 'Licorne Divine'] },
  { id: 'vampire',  nom: 'Vampire de sang',       prix: 300, stades: ['🩸','🦇','🌙','👁️','🧛‍♀️'], nomsStades: ['Goutte de vie', 'Petit chauve-souris', 'Ombre nocturne', 'Regard mystique', 'Comtesse Immortelle'] },
  { id: 'dragon',   nom: 'Dragonnet',             prix: 350, stades: ['🦕','🦎','🐍','🐲','🐉'], nomsStades: ['Petit lézard', 'Écailles dures', 'Serpent de feu', 'Jeune Dragon', 'Grand Protecteur'] },
  { id: 'phenix',   nom: 'Phénix de ses cendres', prix: 500, stades: ['🪺','🐦','🔥','⭐','🐦‍🔥'], nomsStades: ['Nid de cendres', 'Oisillon gris', 'Première flamme', 'Éclat solaire', 'Phénix Éternel'] }
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
    
    // --- ICI : VÉRIFICATION DE LA SÉRIE (STREAK) ---
    const hier = new Date();
    hier.setDate(hier.getDate() - 1);
    const dateHier = hier.toISOString().split('T')[0];

    // Si la dernière validation est plus vieille qu'hier, on perd la série
    if (state.lastValidatedDate && state.lastValidatedDate < dateHier) {
        state.dayCount = 0; 
    }

    if (!state.tasks) state.tasks = [];
    if (!state.creatureActive) state.creatureActive = 'fleur';
    if (!state.heureNotif) state.heureNotif = '08:00';
    if (state.lastValidatedDate === undefined) state.lastValidatedDate = null;
  }
};

const aujourdhui = () => new Date().toISOString().split('T')[0];

function calculerProchaineDate(baseDate, frequence) {
    let d = new Date(baseDate);
    if (frequence === 'Quotidienne')        d.setDate(d.getDate() + 1);
    else if (frequence === 'Tous les 3 jours') d.setDate(d.getDate() + 3);
    else if (frequence === 'Hebdomadaire')  d.setDate(d.getDate() + 7);
    else if (frequence === 'Bimensuelle')   d.setDate(d.getDate() + 14);
    else if (frequence === 'Mensuelle')     d.setMonth(d.getMonth() + 1);
    else if (frequence === 'Ponctuelle')    return 'terminee';
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

 // ... à l'intérieur de mettreAJourUI() ...

if (creatureEtat && creatureCatalogue) {
    // Calcul de l'index du stade (0 à 4)
    const stadeIdx = Math.min(4, Math.floor(creatureEtat.xp / 500));
    const xpDansStade = stadeIdx === 4 ? 500 : creatureEtat.xp % 500;
    
    // Récupération du nom personnalisé du stade
    // Si nomsStades existe, on prend le nom correspondant, sinon on met le nom par défaut
    const nomEvolution = creatureCatalogue.nomsStades 
        ? creatureCatalogue.nomsStades[stadeIdx] 
        : creatureCatalogue.nom;

    // Affichage du titre : "Stade X. Nom Personnalisé"
    const titreComplet = `Stade ${stadeIdx + 1}. ${nomEvolution}`;

    // Mise à jour du HTML
    document.getElementById('creature-emoji').textContent = creatureCatalogue.stades[stadeIdx];
    document.getElementById('creature-stage').textContent = titreComplet;
    
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
    const bravoContainer = document.getElementById('bravo-container');
    const dateAuj = aujourdhui();

    if (!listeJour) return;

    // 1. Filtre des tâches
    let tJour = state.tasks.filter(t => {
        const due = t.prochaineDate && t.prochaineDate <= dateAuj;
        const faite = t.datesFaites?.includes(dateAuj);
        return due || faite;
    });

    let tFutur = state.tasks.filter(t => {
        let veille = new Date(t.prochaineDate);
        veille.setDate(veille.getDate() - 1);
        const veilleStr = veille.toISOString().split('T')[0];
        const cocheeAuj = t.datesFaites?.includes(dateAuj);
        return dateAuj >= veilleStr && t.prochaineDate > dateAuj && !cocheeAuj;
    });

    // 2. Tri
    const tri = (a, b) => {
        const aF = a.datesFaites?.includes(dateAuj) ? 1 : 0;
        const bF = b.datesFaites?.includes(dateAuj) ? 1 : 0;
        return aF - bF || (a.prochaineDate || '').localeCompare(b.prochaineDate || '');
    };
    tJour.sort(tri);
    tFutur.sort(tri);

    // 3. Message de victoire
    if (bravoContainer) {
        const toutesFaites = tJour.length > 0 && tJour.every(t => t.datesFaites?.includes(dateAuj));
        bravoContainer.innerHTML = toutesFaites ? `
            <div class="victoire-message" style="text-align:center; background:#f0e6ff; padding:15px; border-radius:15px; margin-bottom:15px; border:2px dashed #d1b3ff; animation: popIn 0.5s ease-out;">
                <div style="font-size:25px;">✨⭐✨</div>
                <h3 style="font-family:'Emilys Candy', cursive; color:#8e44ad; margin:5px 0;">GG ! Félicitations !</h3>
                <p style="color:#6c5ce7; font-size:14px; margin:0;">Le sanctuaire est étincelant. 🧚</p>
            </div>` : "";
    }

    // 4. Rendu HTML
    listeJour.innerHTML = tJour.map(t => genererHtmlTache(t, true)).join('') || 
                          '<p style="text-align:center; color:#a594b5; margin:20px 0;">🌿 Rien pour aujourd\'hui !</p>';

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
                <button onclick="event.stopPropagation(); reporterTache(${tache.id})" class="delete-btn" title="Reporter">📅</button>
                <button onclick="event.stopPropagation(); demanderSuppression(${tache.id})" class="delete-btn">🗑️</button>
            </div>
        </div>
      </div>
    </div>`;
}

// ==========================================
// 5. ACTIONS (Nettoyé)
// ==========================================
window.reporterTache = (id) => {
    const tache = state.tasks.find(t => t.id === id);
    if (!tache) return;
    const demain = new Date();
    demain.setDate(demain.getDate() + 1);
    tache.prochaineDate = demain.toISOString().split('T')[0];
    sauvegarder();
    mettreAJourUI();
};

window.cocherTache = (id) => {
    const tache = state.tasks.find(t => t.id === id);
    if (!tache) return;
    const dateAuj = aujourdhui();
    if (!tache.datesFaites) tache.datesFaites = [];
    const dejaFaite = tache.datesFaites.includes(dateAuj);
    const creature = state.creatures.find(c => c.id === state.creatureActive);

    if (!dejaFaite) {
        jouerSon('win');
        tache.datesFaites.push(dateAuj);
        state.diamonds = (state.diamonds || 0) + 1;
        if (creature) creature.xp = (creature.xp || 0) + (tache.xp || 10);

        if (state.lastValidatedDate !== dateAuj) {
            state.dayCount = (state.dayCount || 0) + 1;
            if (state.dayCount > state.meilleurScore) state.meilleurScore = state.dayCount;
            state.diamonds += (10 + Math.min(state.dayCount, 20));
            state.lastValidatedDate = dateAuj;
        }

        const nouvelleDate = calculerProchaineDate(dateAuj, tache.frequence);
        if (nouvelleDate === 'terminee') {
            setTimeout(() => {
                state.tasks = state.tasks.filter(t => t.id !== tache.id);
                sauvegarder();
                mettreAJourUI();
            }, 1500);
        } else if (nouvelleDate) {
            tache.prochaineDate = nouvelleDate;
        }
    } else {
        jouerSon('loss');
        tache.datesFaites = tache.datesFaites.filter(d => d !== dateAuj);
        state.diamonds = Math.max(0, state.diamonds - 1);
        if (creature) creature.xp = Math.max(0, creature.xp - (tache.xp || 10));

        const encore = state.tasks.some(t => t.datesFaites?.includes(dateAuj));
        if (!encore) {
            state.dayCount = Math.max(0, state.dayCount - 1);
            state.lastValidatedDate = null;
        }
    }
    sauvegarder();
    mettreAJourUI();
};

window.afficherRecord = () => {
    const record = state.meilleurScore || 0;
    const actuel = state.dayCount || 0;
    
    // Petit popup temporaire
    const popup = document.createElement('div');
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border: 2px solid #c4a8e8;
        border-radius: 20px;
        padding: 20px 30px;
        text-align: center;
        z-index: 9999;
        box-shadow: 0 8px 30px rgba(100,70,160,0.2);
        font-family: 'Berkshire Swash', cursive;
        color: #4a3560;
    `;
    popup.innerHTML = `
        <div style="font-size:2rem; margin-bottom:8px;">🏆</div>
        <div style="font-size:1.2rem; margin-bottom:6px;">Record : ${record} jours</div>
        <div style="font-size:0.9rem; color:#a594b5;">Série actuelle : ${actuel} jours</div>
    `;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 3000);
};

window.reporterTache = (id) => {
    const tache = state.tasks.find(t => t.id === id);
    if (!tache) return;
const demain = new Date();
demain.setDate(demain.getDate() + 1);
const demainStr = demain.toISOString().split('T')[0];
};

// Missions du jour : dues aujourd'hui ou avant, OU cochées aujourd'hui
window.reporterTache = (id) => {
    const tache = state.tasks.find(t => t.id === id);
    if (!tache) return;
    const demain = new Date();
    demain.setDate(demain.getDate() + 1);
    tache.prochaineDate = demain.toISOString().split('T')[0];
    sauvegarder();
    mettreAJourUI();
};

// Masquer/afficher les tâches cochées
window.toggleMasquer = (listId, btn) => {
    const liste = document.getElementById(listId);
    const cartes = liste.querySelectorAll('.task-card.completed');
    const masquees = btn.dataset.masque === 'oui';
    cartes.forEach(c => c.style.display = masquees ? '' : 'none');
    btn.dataset.masque = masquees ? 'non' : 'oui';
    btn.textContent = masquees ? '👁️ Masquer les faites' : '👁️ Afficher les faites';
};

// Masquer/afficher toute la section Avenir
window.toggleSection = (listId, btn) => {
    const liste = document.getElementById(listId);
    const masquee = liste.style.display === 'none';
    liste.style.display = masquee ? '' : 'none';
    btn.textContent = masquee ? '👁️ Masquer l\'Avenir' : '👁️ Afficher l\'Avenir';
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
    // Recalculer la prochaine date si la fréquence a changé
    const nouvelleDate = calculerProchaineDate(aujourdhui(), tache.frequence);
    if (nouvelleDate && nouvelleDate !== 'terminee') {
        tache.prochaineDate = nouvelleDate;
    }
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
  if (!state.meilleurScore) state.meilleurScore = 0;
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