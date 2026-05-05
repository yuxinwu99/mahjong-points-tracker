const translations = {
    en: {
        setup_desc: "New Game Setup",
        players: "Players",
        base_score: "Base Score",
        start_game: "Start Game",
        round: "ROUND",
        dealer: "DEALER",
        end_round: "End Round",
        end_session: "End Session",
        history: "Round History",
        round_results: "Round Results",
        who_won: "Who won?",
        multiplier: "Multiplier (Fan)",
        field_points: "Field Points (Gold/Flowers/Kongs)",
        cancel: "Cancel",
        calculate: "Calculate",
        wins: "wins",
        lian: "Lian",
        confirm_end: "Are you sure you want to end the session? All current scores will be lost.",
        select_winner: "Please select a winner",
        p1_name: "Player 1",
        p2_name: "Player 2",
        p3_name: "Player 3",
        p4_name: "Player 4"
    },
    zh: {
        setup_desc: "新游戏设置",
        players: "玩家",
        base_score: "底分",
        start_game: "开始游戏",
        round: "回合",
        dealer: "庄家",
        end_round: "结束回合",
        end_session: "结束游戏",
        history: "历史纪录",
        round_results: "回合结果",
        who_won: "谁赢了?",
        multiplier: "番数 (倍率)",
        field_points: "台费 (金/花/杠)",
        cancel: "取消",
        calculate: "计算",
        wins: "获胜",
        lian: "连庄",
        confirm_end: "您确定要结束游戏吗？所有当前分数都将丢失。",
        select_winner: "请选择获胜者",
        p1_name: "玩家 1",
        p2_name: "玩家 2",
        p3_name: "玩家 3",
        p4_name: "玩家 4"
    }
};

let currentLang = 'en';
let game = null;
let selectedWinnerIndex = null;

// DOM Elements
const setupScreen = document.getElementById('setup-screen');
const gameScreen = document.getElementById('game-screen');
const setupForm = document.getElementById('setup-form');
const roundModal = document.getElementById('round-modal');
const roundForm = document.getElementById('round-form');
const scoreboardGrid = document.getElementById('scoreboard-grid');
const winnerSelect = document.getElementById('winner-select');
const fieldPointsInputs = document.getElementById('field-points-inputs');
const roundHistoryList = document.getElementById('round-history-list');

const displayRoundNum = document.getElementById('display-round-num');
const displayDealerName = document.getElementById('display-dealer-name');
const displayLianZhuang = document.getElementById('display-lian-zhuang');
const btnLang = document.getElementById('btn-lang');

// Language Toggle
btnLang.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'zh' : 'en';
    updateLanguage();
});

function updateLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            el.textContent = translations[currentLang][key];
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[currentLang][key]) {
            el.placeholder = translations[currentLang][key];
        }
    });
    
    // Update dynamic elements
    if (game) {
        updateHeader();
        updateScoreboard();
        // Redraw history
        roundHistoryList.innerHTML = '';
        game.roundHistory.forEach(res => addHistoryItem(res));
    }
}

// Setup Game
setupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const names = [
        document.getElementById('player1').value,
        document.getElementById('player2').value,
        document.getElementById('player3').value,
        document.getElementById('player4').value
    ];
    const baseScore = parseInt(document.getElementById('base-score').value);
    
    game = new Game(names, baseScore);
    initGameUI();
    setupScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
});

function initGameUI() {
    updateScoreboard();
    updateHeader();
}

function updateHeader() {
    displayRoundNum.textContent = game.roundNum;
    displayDealerName.textContent = game.players[game.dealerIndex].name;
    if (game.consecutiveWinCount > 0) {
        displayLianZhuang.textContent = `${translations[currentLang].lian} ${game.consecutiveWinCount}`;
        displayLianZhuang.classList.remove('hidden');
    } else {
        displayLianZhuang.classList.add('hidden');
    }
}

function updateScoreboard() {
    scoreboardGrid.innerHTML = '';
    game.players.forEach((player, i) => {
        const isDealer = i === game.dealerIndex;
        const card = document.createElement('div');
        card.className = `player-score ${isDealer ? 'dealer' : ''}`;
        
        const pts = player.points;
        const ptsClass = pts > 0 ? 'plus' : (pts < 0 ? 'minus' : '');
        
        card.innerHTML = `
            <span class="p-name">${player.name}${isDealer ? ' (D)' : ''}</span>
            <span class="p-points ${ptsClass}">${pts}</span>
        `;
        scoreboardGrid.appendChild(card);
    });
}

// Round End Flow
document.getElementById('btn-next-round').addEventListener('click', () => {
    openRoundModal();
});

function openRoundModal() {
    winnerSelect.innerHTML = '';
    fieldPointsInputs.innerHTML = '';
    selectedWinnerIndex = null;

    game.players.forEach((p, i) => {
        // Winner Selection
        const opt = document.createElement('div');
        opt.className = 'p-option';
        opt.textContent = p.name;
        opt.onclick = () => {
            document.querySelectorAll('.p-option').forEach(el => el.classList.remove('selected'));
            opt.classList.add('selected');
            selectedWinnerIndex = i;
        };
        winnerSelect.appendChild(opt);

        // Field Points Inputs
        const fpDiv = document.createElement('div');
        fpDiv.className = 'fp-input-row';
        fpDiv.innerHTML = `
            <label>${p.name}</label>
            <input type="number" class="fp-val" data-idx="${i}" value="0">
        `;
        fieldPointsInputs.appendChild(fpDiv);
    });

    roundModal.classList.remove('hidden');
}

roundForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (selectedWinnerIndex === null) {
        alert(translations[currentLang].select_winner);
        return;
    }

    const multiplier = parseInt(document.getElementById('input-multiplier').value);
    const fps = Array.from(document.querySelectorAll('.fp-val')).map(el => parseInt(el.value) || 0);

    const result = game.handleRoundEnd(selectedWinnerIndex, multiplier, fps);
    
    addHistoryItem(result);
    updateScoreboard();
    updateHeader();
    roundModal.classList.add('hidden');
    
    // Reset multiplier for next round
    document.getElementById('input-multiplier').value = 1;
});

document.getElementById('btn-cancel-round').addEventListener('click', () => {
    roundModal.classList.add('hidden');
});

function addHistoryItem(result) {
    const item = document.createElement('div');
    item.className = 'history-item';
    
    const winnerName = game.players[result.winnerIndex].name;
    const changesHtml = result.scoreChanges.map((change, i) => {
        const cls = change > 0 ? 'plus' : (change < 0 ? 'minus' : '');
        return `<span class="change ${cls}">${change > 0 ? '+' : ''}${change}</span>`;
    }).join('');

    item.innerHTML = `
        <div class="hist-top">
            <span>${translations[currentLang].round} ${result.roundNum}</span>
            <span class="hist-winner">${winnerName} ${translations[currentLang].wins} (x${result.multiplier})</span>
        </div>
        <div class="hist-changes">
            ${changesHtml}
        </div>
    `;
    roundHistoryList.prepend(item);
}

document.getElementById('btn-end-game').addEventListener('click', () => {
    if (confirm(translations[currentLang].confirm_end)) {
        location.reload();
    }
});

// Register PWA Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').then(reg => {
            console.log('SW registered:', reg);
        }).catch(err => {
            console.log('SW registration failed:', err);
        });
    });
}
