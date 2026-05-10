/**
 * TOEFL Practice Core Logic (RPG Edition - V3.1)
 * Simplified: Removed Leveling System
 */

const TOEFL_APP = {
    questions: [],
    currentIndex: 0,
    currentPassageIndex: 0, 
    playerHp: 100,
    playerExp: parseInt(localStorage.getItem('player_exp')) || 0,
    correctCount: 0,
    streak: 0,
    mode: 'skirmish',
    difficulty: 'medium',
    timerInterval: null,
    timeLeft: 0,

    // Difficulty Settings
    tierConfig: {
        easy:   { time: 45, damage: 10, exp: 15, label: 'Easy' },
        medium: { time: 30, damage: 20, exp: 25, label: 'Medium' },
        hard:   { time: 15, damage: 40, exp: 50, label: 'Hard' }
    },

    initRPG(dataArray, mode = 'skirmish') {
        if (!dataArray || dataArray.length === 0) return alert("Data error.");
        this.questions = dataArray;
        this.mode = mode;
        
        // Show difficulty selection first
        document.addEventListener('DOMContentLoaded', () => this.showDifficultyMenu());
    },

    showDifficultyMenu() {
        const arena = document.getElementById('battle-arena');
        if (!arena) return;
        arena.innerHTML = `
            <div class="difficulty-overlay">
                <p class="wordmark">Prepare for Battle</p>
                <h1>Select Difficulty<em style="color:var(--accent-gold);">.</em></h1>
                <div class="diff-grid">
                    <div class="diff-card easy" onclick="TOEFL_APP.startWithTier('easy')">
                        <h4>Easy</h4>
                        <p>45s Timer<br>10 Damage</p>
                    </div>
                    <div class="diff-card medium" onclick="TOEFL_APP.startWithTier('medium')">
                        <h4>Medium</h4>
                        <p>30s Timer<br>20 Damage</p>
                    </div>
                    <div class="diff-card hard" onclick="TOEFL_APP.startWithTier('hard')">
                        <h4>Hard</h4>
                        <p>15s Timer<br>40 Damage</p>
                    </div>
                </div>
            </div>
        `;
    },

    startWithTier(tier) {
        this.difficulty = tier;
        this.currentIndex = 0;
        this.currentPassageIndex = 0;
        this.playerHp = 100;
        this.correctCount = 0;
        this.streak = 0;

        if (!document.getElementById('combo-overlay')) {
            const div = document.createElement('div');
            div.id = 'combo-overlay';
            div.className = 'combo-text';
            document.body.appendChild(div);
        }

        this.renderEncounter();
        this.updateHUD();
    },

    updateHUD() {
        const hpBar = document.getElementById('hp-bar');
        if(hpBar) {
            hpBar.style.width = this.playerHp + '%';
            document.getElementById('hp-text').innerText = this.playerHp + '/100';
            document.getElementById('exp-bar').style.width = (this.playerExp % 100) + '%';
            document.getElementById('exp-text').innerText = this.playerExp + ' Total XP';
        }
    },

    startTimer() {
        clearInterval(this.timerInterval);
        const config = this.tierConfig[this.difficulty];
        this.timeLeft = (this.mode === 'boss') ? config.time * 2 : config.time;
        
        const timerFill = document.getElementById('timer-fill');
        if (timerFill) {
            timerFill.style.width = '100%';
            timerFill.classList.remove('timer-warning');
        }

        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            const percentage = (this.timeLeft / ((this.mode === 'boss' ? config.time * 2 : config.time))) * 100;
            
            if (timerFill) {
                timerFill.style.width = percentage + '%';
                if (percentage < 30) timerFill.classList.add('timer-warning');
            }

            if (this.timeLeft <= 0) {
                clearInterval(this.timerInterval);
                this.timeOut();
            }
        }, 1000);
    },

    timeOut() {
        const config = this.tierConfig[this.difficulty];
        this.streak = 0;
        this.takeDamage(config.damage);
        this.currentIndex++;
        this.renderEncounter();
    },

    renderEncounter() {
        clearInterval(this.timerInterval);
        const arena = document.getElementById('battle-arena');
        const currentSet = this.mode === 'boss' ? this.questions[this.currentPassageIndex].questions : this.questions;
        
        if (this.currentIndex >= currentSet.length) {
            if (this.mode === 'boss' && this.currentPassageIndex < this.questions.length - 1) {
                this.currentPassageIndex++;
                this.currentIndex = 0;
                this.renderEncounter();
                return;
            }
            this.saveGlobalStats();
            localStorage.setItem('toefl_score', this.correctCount);
            localStorage.setItem('toefl_total', this.getTotalQuestionCount());
            localStorage.setItem('toefl_section', (this.mode === 'boss' ? 'Reading Raid' : 'Grammar Skirmish') + ' (' + this.difficulty.toUpperCase() + ')');
            window.location.href = '../result.html';
            return;
        }

        const q = currentSet[this.currentIndex];
        const config = this.tierConfig[this.difficulty];

        if (this.mode === 'boss') {
            const passageBox = document.getElementById('passage-box');
            if(passageBox) {
                passageBox.innerHTML = this.questions[this.currentPassageIndex].passage;
                passageBox.style.display = 'block';
            }
        }

        arena.innerHTML = `
            <div class="difficulty-badge bg-${this.difficulty}">${config.label} Mode</div>
            <div id="streak-badge" class="streak-counter" style="display:${this.streak > 0 ? 'block' : 'none'}">STREAK: ${this.streak}</div>
            
            <div class="enemy-area">
                <div class="enemy-sprite">${this.mode === 'boss' ? '🗿' : '🦇'}</div>
                <p class="section-meta" id="enemy-name" style="margin-top: 15px; margin-bottom: 0;">${this.mode === 'boss' ? 'Text Titan' : 'Syntax Goblin'}</p>
            </div>

            <div class="timer-container"><div class="timer-fill" id="timer-fill"></div></div>
            
            <div id="quiz-container">
                <div class="question-box" style="border-bottom: none; margin-bottom: 0;">
                    <p class="question-text">Q${this.currentIndex + 1}: ${q.question}</p>
                    <div class="options">
                        ${q.options.map((opt, i) => {
                            const escapedOpt = opt.replace(/'/g, "\\'").replace(/"/g, "&quot;");
                            return `
                                <div class="option-item" onclick="TOEFL_APP.attack('${escapedOpt}')">
                                    <span style="font-weight: bold; color: var(--accent-gold); margin-right: 15px;">[${['A','B','C','D'][i]}]</span> ${opt}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;

        this.startTimer();
    },

    attack(selectedOption) {
        clearInterval(this.timerInterval);
        const currentSet = this.mode === 'boss' ? this.questions[this.currentPassageIndex].questions : this.questions;
        const q = currentSet[this.currentIndex];
        const config = this.tierConfig[this.difficulty];
        const arena = document.getElementById('battle-arena');
        const container = document.getElementById('game-container');

        if (selectedOption === q.answer) {
            this.correctCount++;
            this.streak++;
            let expGained = config.exp;
            if (this.streak >= 3) {
                expGained *= 2; 
                this.triggerComboVisual();
            }
            this.gainExp(expGained);
            this.currentIndex++;
            if(arena) arena.style.boxShadow = "0 0 50px rgba(201, 168, 76, 0.4)";
            setTimeout(() => {
                if(arena) arena.style.boxShadow = "var(--shadow-card)";
                this.renderEncounter();
            }, 300);
        } else {
            this.streak = 0;
            this.takeDamage(config.damage);
            if(container) container.classList.add('damage-flash');
            if(arena) arena.style.animation = "shake 0.4s ease";
            setTimeout(() => {
                if(container) container.classList.remove('damage-flash');
                if(arena) arena.style.animation = "";
                this.renderEncounter();
            }, 400);
        }
    },

    triggerComboVisual() {
        const overlay = document.getElementById('combo-overlay');
        if (overlay) {
            overlay.innerText = "COMBO X" + this.streak + "!";
            overlay.classList.remove('animate-combo');
            void overlay.offsetWidth; 
            overlay.classList.add('animate-combo');
        }
    },

    takeDamage(amount) {
        this.playerHp -= amount;
        if (this.playerHp <= 0) this.playerHp = 0;
        this.updateHUD();
        if (this.playerHp <= 0) {
            clearInterval(this.timerInterval);
            document.getElementById('battle-arena').innerHTML = `
                <div style="text-align: center; padding: 60px 20px;">
                    <h1 style="color: var(--accent-orange); font-size: 64px;">YOU DIED.</h1>
                    <p class="subtitle">Your spirit was broken by the difficulty.</p>
                    <button class="btn-primary" onclick="location.reload()">Reincarnate</button>
                </div>
            `;
            if(document.getElementById('passage-box')) document.getElementById('passage-box').style.display = 'none';
        }
    },

    gainExp(amount) {
        this.playerExp += amount;
        this.updateHUD();
        this.saveGlobalStats();
    },

    saveGlobalStats() {
        localStorage.setItem('player_exp', this.playerExp);
        const totalAllTime = parseInt(localStorage.getItem('total_correct_all_time')) || 0;
        localStorage.setItem('total_correct_all_time', totalAllTime + 1);
    },

    getTotalQuestionCount() {
        if (this.mode === 'boss') return this.questions.reduce((sum, p) => sum + (p.questions ? p.questions.length : 0), 0);
        return this.questions.length;
    }
};
