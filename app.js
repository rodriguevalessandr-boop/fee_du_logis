// ==========================================
// 1. ÉTAT & CATALOGUE
// ==========================================
let state = {
    diamonds: 0,
    dayCount: 0,
    lastValidatedDate: null,
    tasks: [],
    creatures: [{ id: 'fleur', xp: 0 }],
    creatureActive: 'fleur',
    heureNotif: '08:00'
};

const catalogue = [
    { id: 'fleur',    nom: 'Fleur parfumée',         prix: 0,   stades: ['🌱','🪴','🪴','🌸','🌺','🌹'] },
    { id: 'poule',    nom: 'Poule cui-cui',          prix: 50,  stades: ['🥚','🐣','🐤','🐔','🪽'] },
    { id: 'papillon', nom: 'Papillon libre',         prix: 80,  stades: ['🥚','🐛','🫘','🌀','🦋'] },
    { id: 'chaton',   nom: 'Chaton poilu',           prix: 100, stades: ['🐾','😸','🐈‍⬛','🐈','🐱'] },
    { id: 'fee',      nom: 'Fée du logis',           prix: 120, stades: ['🌱','✨','🌟','🪄','🧚'] },
    { id: 'lune',     nom: 'Lune solaire',           prix: 200, stades: ['🌚','🌑','🌛','🌝','🌞'] },
    { id: 'etoiles',  nom: 'Étoiles brillantes',     prix: 150, stades: ['⚡','✨','🌟','⭐','💫'] },
    { id: 'coeurs',   nom: "Cœurs d'amour",          prix: 180, stades: ['🧡','💛','💚','🩷','❤️'] },
    { id: 'sirene',   nom: "Sirène d'argent",        prix: 250, stades: ['🐟','🐳','🧝‍♀️','👸','🧜‍♀️'] },
    { id: 'reine',    nom: 'Reine Queen B',          prix: 220, stades: ['👗','🥻','👠','👑','💍'] },
    { id: 'licorne',  nom: 'Licorne Rose',           prix: 280, stades: ['🥚','🎠','🪅','🌈','🦄'] },
    { id: 'vampire',  nom: 'Vampire de sang',        prix: 300, stades: ['🩸','🦇','🌙','👁️','🧛‍♀️'] },
    { id: 'dragon',   nom: 'Dragonnet',              prix: 350, stades: ['🦕','🦎','🐍','🐲','🐉'] },
    { id: 'phenix',   nom: 'Phénix de ses cendres',  prix: 500, stades: ['🪺','🐦','🔥','⭐','🐦‍🔥'] },
];

// ==========================================
// 2. UTILITAIRES & SAUVEGARDE
// ==========================================
const sauvegarder = () => localStorage.setItem('fee_du_logis_v3', JSON.stringify(state));

const charger = () => {
    const data = localStorage.getItem('fee_du_logis_v3');
    if (data) {
        state = JSON.parse(data);
        if (!state.tasks) state.tasks = [];
        if (!state.creatures) state.creatures = [{ id: 'fleur', xp: 0 }];
    }
};

const aujourdhui = () => new Date().toISOString().split('T')[0];

function calculerProchaineDate(baseDate, frequence) {
    let d = new Date(baseDate);
    if (frequence === 'Quotidienne') d.setDate(d.getDate() + 1);
    else if (frequence === '3 jours') d.setDate(d.getDate() + 3);
    else if (frequence === 'Hebdomadaire') d.setDate(d.getDate() + 7);
    else if (frequence === 'Bimensuelle') d.setDate(d.getDate() + 14);
    else if (frequence === 'Mensuelle') d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
}

// ==========================================
// 3. SONS & ANIMATIONS
// ==========================================
function jouerSon(type) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const g = ctx.createGain();
        const osc = ctx.createOscillator();
        g.connect(ctx.destination);
        osc.connect(g);
        if (type === 'win') {
            osc.frequency.setValueAtTime(523, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1046, ctx.currentTime + 0.3);
            g.gain.setValueAtTime(0.2, ctx.currentTime);
        } else {
            osc.frequency.setValueAtTime(300, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);
            g.gain.setValueAtTime(0.2, ctx.currentTime);
        }
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    } catch(e) {}
}

function animerXP(x, y) {
    const p = document.createElement('div');
    p.className = 'xp-particle';
    p.innerHTML = '✨';
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    document.body.appendChild(p);
    setTimeout(() => {
        const target = document.querySelector('.xp-container')?.getBoundingClientRect();
        if (target) {
            p.style.left = target.left + 'px';
            p.style.top = target.top + 'px';
            p.style.opacity = '0';
        }
    }, 50);
    setTimeout(() => p.remove(), 800);
}

// ==========================================
// 4. LOGIQUE DES TÂCHES
// ==========================================
window.cocherTache = (id) => {
    const t = state.tasks.find(x => x.id === id);
    const dateAuj = aujourdhui();
    if (!t) return;

    if (!t.datesFaites) t.datesFaites = [];
    const dejaFaite = t.datesFaites.includes(dateAuj);
    const creature = state.creatures.find(c => c.id === state.creatureActive);

    if (!dejaFaite) {
        jouerSon('win');
        if (window.event) animerXP(window.event.clientX, window.event.clientY);
        t.datesFaites.push(dateAuj);
        if (creature) creature.xp += (t.xp || 10);
        if (state.lastValidatedDate !== dateAuj) {
            state.dayCount++;
            state.diamonds += 10;
            state.lastValidatedDate = dateAuj;
        }
        t.prochaineDate = calculerProchaineDate(dateAuj, t.frequence);
    } else {
        t.datesFaites = t.datesFaites.filter(d => d !== dateAuj);
        if (creature) creature.xp = Math.max(0, creature.xp - (t.xp || 10));
    }
    sauvegarder();
    mettreAJourUI();
};

function ajouterNouvelleTache() {
    const nom = document.getElementById('task-nom').value.trim();
    if (!nom) return;
    state.tasks.push({
        id: Date.now(),
        nom: nom,
        piece: document.getElementById('task-piece').value,
        xp: parseInt(document.getElementById('task-xp').value) || 10,
        frequence: document.getElementById('task-frequence').value,
        prochaineDate: aujourdhui(),
        datesFaites: []
    });
    sauvegarder();
    fermerModal();
    mettreAJourUI();
}

window.demanderSuppression = (id) => {
    if(confirm("Supprimer cette tâche ?")) {
        state.tasks = state.tasks.filter(t => t.id !== id);
        sauvegarder();
        mettreAJourUI();
    }
};

// ==========================================
// 5. BOUTIQUE & NOTIFS
// ==========================================
window.ouvrirBoutique = () => {
    document.getElementById('shop-diamonds').textContent = state.diamonds;
    const grille = document.getElementById('shop-items');
    grille.innerHTML = catalogue.map(item => {
        const possedee = state.creatures.find(c => c.id === item.id);
        const active = state.creatureActive === item.id;
        return `
            <div class="shop-card">
                <div style="font-size:30px;">${item.stades[5]}</div>
                <div>${item.nom}</div>
                <button onclick="acheter('${item.id}', ${item.prix})" class="shop-btn ${active?'active':''}">
                    ${active ? '✓' : possedee ? 'Choisir' : '💎 ' + item.prix}
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
    }
    sauvegarder();
    mettreAJourUI();
    fermerModal();
};

function planifierRappel(heure) {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.ready.then(reg => {
        reg.active?.postMessage({ type: 'PLANIFIER_NOTIF', heure: heure });
    });
}

// ==========================================
// 6. UI & AFFICHAGE
// ==========================================
function mettreAJourUI() {
    document.getElementById('diamond-count').textContent = state.diamonds;
    document.getElementById('day-count').textContent = state.dayCount;
    
    const cEtat = state.creatures.find(c => c.id === state.creatureActive);
    const cData = catalogue.find(c => c.id === state.creatureActive);
    
    if (cEtat && cData) {
        const stade = Math.min(5, Math.floor(cEtat.xp / 500));
        document.getElementById('creature-emoji').textContent = cData.stades[stade];
        document.getElementById('creature-stage').textContent = cData.nom;
        document.getElementById('xp-fill').style.width = ((cEtat.xp % 500) / 500 * 100) + '%';
        document.getElementById('xp-current').textContent = cEtat.xp % 500;
    }

    const liste = document.getElementById('tasks-list');
    if (liste) {
        const auj = aujourdhui();
        liste.innerHTML = state.tasks
            .filter(t => t.prochaineDate <= auj || t.datesFaites.includes(auj))
            .map(t => `
                <div class="task-card ${t.datesFaites.includes(auj) ? 'completed' : ''}">
                    <input type="checkbox" ${t.datesFaites.includes(auj) ? 'checked' : ''} onclick="cocherTache(${t.id})">
                    <div class="task-info"><strong>${t.nom}</strong><br><small>${t.piece}</small></div>
                    <button onclick="demanderSuppression(${t.id})">🗑️</button>
                </div>
            `).join('');
    }
}

// ==========================================
// 7. MODALS & INIT
// ==========================================
window.sauvegarderNotif = () => {
    const heure = document.getElementById('notif-time').value;
    if (heure) {
        state.heureNotif = heure;
        sauvegarder();
        document.getElementById('notif-modal').classList.add('hidden');
        planifierRappel(heure);
        alert("Rappel enregistré ! ✨");
    }
};

function fermerModal() {
    document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
}

document.addEventListener('DOMContentLoaded', () => {
    charger();
    mettreAJourUI();

    // Boutons principaux
    document.getElementById('add-task-btn').onclick = () => {
        document.getElementById('task-modal').classList.remove('hidden');
        document.getElementById('btn-sauvegarder').onclick = ajouterNouvelleTache;
    };

    document.getElementById('diamonds-btn').onclick = window.ouvrirBoutique;
    document.getElementById('btn-fermer-boutique').onclick = fermerModal;
    document.getElementById('btn-annuler').onclick = fermerModal;

    // Notifs
    document.getElementById('notif-btn').onclick = () => {
        document.getElementById('notif-time').value = state.heureNotif || "08:00";
        document.getElementById('notif-modal').classList.remove('hidden');
    };
    
    document.getElementById('btn-annuler-notif').onclick = fermerModal;
    document.getElementById('btn-sauver-notif').onclick = () => window.sauvegarderNotif();

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(console.error);
    }
});