class Player {
    constructor(name) {
        this.name = name;
        this.history = []; // Array of score changes
    }

    get points() {
        return this.history.reduce((sum, val) => sum + val, 0);
    }

    addHistory(points) {
        this.history.push(points);
    }
}

class Game {
    constructor(playerNames, baseScore = 5) {
        this.players = playerNames.map(name => new Player(name));
        this.baseScore = baseScore;
        this.dealerIndex = 0;
        this.lastWinnerIndex = null;
        this.currentStreakCount = 0;
        this.roundHistory = [];
        this.roundNum = 1;
    }

    handleRoundEnd(winnerIndex, multiplier, fieldPoints) {
        let tempChanges = [0, 0, 0, 0];
        const winnerFp = fieldPoints[winnerIndex];


        let consecutiveWinMult = 1;
        if (winnerIndex === this.lastWinnerIndex) {
            consecutiveWinMult = Math.pow(2, Math.min(2, this.currentStreakCount));
        }

        // 1. Winner collects from everyone
        for (let i = 0; i < 4; i++) {
            if (i === winnerIndex) continue;

            let basePayout = this.baseScore * multiplier * consecutiveWinMult;
            // Apply 2x if winner OR payer is dealer
            if (winnerIndex === this.dealerIndex || i === this.dealerIndex) {
                basePayout *= 2;
            }

            const totalToWinner = basePayout + winnerFp;
            tempChanges[winnerIndex] += totalToWinner;
            tempChanges[i] -= totalToWinner;
        }

        // 2. Loser "Water" Transfers (Field differences among losers only)
        const losers = [0, 1, 2, 3].filter(idx => idx !== winnerIndex);
        for (let i = 0; i < losers.length; i++) {
            for (let j = i + 1; j < losers.length; j++) {
                const idxI = losers[i];
                const idxJ = losers[j];
                const diff = fieldPoints[idxI] - fieldPoints[idxJ];
                tempChanges[idxI] += diff;
                tempChanges[idxJ] -= diff;
            }
        }

        // 3. Update state
        this.players.forEach((player, i) => {
            player.addHistory(tempChanges[i]);
        });

        const roundData = {
            roundNum: this.roundNum,
            dealerIndex: this.dealerIndex,
            winnerIndex,
            multiplier,
            fieldPoints: [...fieldPoints],
            scoreChanges: [...tempChanges],
            scoresAfter: this.players.map(p => p.points)
        };
        this.roundHistory.push(roundData);

        // 4. Update Streak and Dealer for the next round
        if (winnerIndex === this.lastWinnerIndex) {
            this.currentStreakCount++;
        } else {
            this.lastWinnerIndex = winnerIndex;
            this.currentStreakCount = 1;
        }

        if (winnerIndex !== this.dealerIndex) {
            this.dealerIndex = (this.dealerIndex + 1) % 4;
        }

        this.roundNum++;
        return roundData;
    }
}
