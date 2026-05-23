---
trigger: always_on
---

# Jinjiang Mahjong Scoring Rules

The instructions below describe the rules for Jinjiang mahjong. You are to always follow the rules when implementing any change to the calculation engine.

### 1. Base Score & Streaks

- **Starting Base**: 5 points (customizable at setup).
- **Streak (Lian Zhuang)**: Every consecutive win by a player doubles their personal base score:
  - 0 Wins: **5**
  - 1 Win: **10**
  - 2+ Wins: **20** (Cap)
- **Reset**: If a player loses, their personal streak resets to 0 (Base 5).

### 2. Dealer (Zhuang) Rule

- The Dealer always **doubles** their current personal base score for both winning and losing.
  - Dealer (0 Wins): **10**
  - Dealer (1 Win): **20**
  - Dealer (2+ Wins): **40** (Cap)

### 3. Payout Formula

When a round ends, each loser pays the winner individually:

- **If Loser is the Dealer**:
  `Payout = (Dealer's Base * Round Multiplier) + winner's Field Points`
- **If Loser is NOT the Dealer**:
  `Payout = (Winner's Base * Round Multiplier) + winner's Field Points`

### 4. Water (Loser Settlement)

After the winner is paid, the three losers compare their **Field Points** with each other:

- Losers exchange the **difference** in their field points.

---

### Logic Summary

- **Winner is Dealer**: Everyone pays based on the Dealer's high base (10/20/40).
- **Winner is NOT Dealer**:
  - The Dealer pays based on their high base (10/20/40).
  - Other non-dealers pay based on the Winner's (usually lower) base.
