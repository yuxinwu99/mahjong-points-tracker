from typing import List

class Player:
    def __init__(self, name: str):
        self.name = name
        self.points = []
    
    def get_name(self) -> str:
        return self.name

    def get_cur_points(self) -> int:
        return sum(self.points)

    def add_point_history(self, point: int):
        self.points.append(point)

class Round:
    def __init__(self, players: List[Player], dealer_index: int):
        self.winner = None
        self.players = players
        self.dealer_index = dealer_index
        self.multiplier = 0
        self.scores_before = [player.get_cur_points() for player in players]
        self.scores_after = None
        self.score_changes = None

    def set_winner(self, winner_index: int, multiplier: int):
        self.winner = self.players[winner_index].get_name()
        self.multiplier = multiplier
    
    def update_score_with_change(self, score_changes: List[int]):
        self.score_changes = score_changes
        self.scores_after = [score_changes[i] + self.scores_before[i] for i in range(4)]
    
    def get_round_info(self):
        print('========================================')
        print(f'Dealer: {self.players[self.dealer_index].get_name()}')
        print(f'Winner: {self.winner if self.winner else "N/A"} (x{self.multiplier})')
        print('----------------------------------------')
        print(f'Scores Before: {self.scores_before}')
        print(f'Score Changes: {self.score_changes}')
        print(f'Scores After:  {self.scores_after}')
        print('========================================\n')

class Game:
    def __init__(self, player_names, dealer_index=0, base_score=5):
        self.players = [Player(name) for name in player_names]
        self.dealer_index = dealer_index
        self.base_score = base_score
        self.consecutive_win_count = 0
        self.round_history = []
        self.cur_round = Round(self.players, self.dealer_index)
    
    def handle_round_end(self, winner_index: int, multiplier: int, field_points: List[int]):
        """
        winner_index: 0-3
        multiplier: Win strength (provided by user)
        field_points: Points from Gold/Flowers/Kongs for each player
        """
        temp_changes = [0, 0, 0, 0]
        self.cur_round.set_winner(winner_index, multiplier)
        winner_fp = field_points[winner_index]

        # 1. Winner collects from everyone
        # Formula: (Base * Multiplier * DealerMult) + Winner_Field
        for i in range(4):
            if i == winner_index:
                continue
            
            # Base part
            base_payout = self.base_score * multiplier
            # Apply 2x if winner OR payer is dealer
            if winner_index == self.dealer_index or i == self.dealer_index:
                base_payout *= 2
            
            # Total payout to winner (includes their full field points)
            total_to_winner = base_payout + winner_fp
            
            temp_changes[winner_index] += total_to_winner
            temp_changes[i] -= total_to_winner

        # 2. Loser "Water" Transfers (Field differences among losers only)
        losers = [idx for idx in range(4) if idx != winner_index]
        for idx, i in enumerate(losers):
            for j in losers[idx + 1:]:
                # Higher field points receives from lower
                diff = field_points[i] - field_points[j]
                temp_changes[i] += diff
                temp_changes[j] -= diff

        # 3. Update scores and round state
        self.cur_round.update_score_with_change(temp_changes)
        for i in range(4):
            self.players[i].add_point_history(temp_changes[i])
        
        self.cur_round.get_round_info()
        self.round_history.append(self.cur_round)

        # 4. Update Dealer for the next round
        if winner_index == self.dealer_index:
            self.consecutive_win_count += 1
            print(f"Lian Zhuang! {self.players[winner_index].get_name()} stays dealer (Count: {self.consecutive_win_count})")
        else:
            self.dealer_index = (self.dealer_index + 1) % 4
            self.consecutive_win_count = 0
            print(f"Dealer moves to {self.players[self.dealer_index].get_name()}")
        
        self.cur_round = Round(self.players, self.dealer_index)

# Example Usage
if __name__ == "__main__":
    game = Game(['Player A', 'Player B', 'Player C', 'Player D'])

    print("--- Round 1: Dealer (A) wins with Ping Hu (1x) ---")
    # A wins, multiplier 1, field points [2, 1, 1, 1]
    # A collects (5*1*2) + 2 = 12 from each B, C, D. Total +36.
    # Losers (B, C, D) have identical field points (1), so no extra water transfers.
    game.handle_round_end(0, 1, [2, 1, 1, 1])

    print("--- Round 2: Non-dealer (B) wins with Multiplier 2 ---")
    # B wins, multiplier 2, field points [0, 5, 2, 1]
    # B collects from A (dealer): (5*2*2) + 5 = 25
    # B collects from C: (5*2*1) + 5 = 15
    # B collects from D: (5*2*1) + 5 = 15
    # Total B gain: 25 + 15 + 15 = 55
    # Water transfers among losers (A=0, C=2, D=1):
    # C vs A: C receives 2.
    # D vs A: D receives 1.
    # C vs D: C receives 1.
    # Final Changes: A: -25-2-1 = -28, C: -15+2+1 = -12, D: -15+1-1 = -15
    game.handle_round_end(1, 2, [0, 5, 2, 1])

    print("\nFinal Total Scores:")
    for p in game.players:
        print(f"{p.name}: {p.get_cur_points()}")
