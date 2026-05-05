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
        multiplier: Win strength (Ping Hu=1, Zi Mo=2, You Jin=5, etc.)
        field_points: Points from Gold/Flowers/Kongs for each player
        """
        temp_changes = [0, 0, 0, 0]
        self.cur_round.set_winner(winner_index, multiplier)

        # 1. Calculate Base Payout (Dealer vs Non-Dealer)
        # current_base starts at self.base_score and doubles for Lian Zhuang
        current_base = self.base_score * (2 ** self.consecutive_win_count)
        
        # Winner's gain from each other player
        for i in range(4):
            if i == winner_index:
                continue
            
            payout = current_base * multiplier
            # If winner is dealer OR payer is dealer, double the payout
            if winner_index == self.dealer_index or i == self.dealer_index:
                payout *= 2
            
            temp_changes[winner_index] += payout
            temp_changes[i] -= payout

        # 2. Calculate "Water" Transfers (comparing field points between all pairs)
        fp = list(field_points)
        for i in range(4):
            for j in range(i + 1, 4):
                diff = fp[i] - fp[j]
                # If i has more points, j pays i the difference
                temp_changes[i] += diff
                temp_changes[j] -= diff

        # 3. Update scores and round state
        self.cur_round.update_score_with_change(temp_changes)
        for i in range(4):
            self.players[i].add_point_history(temp_changes[i])
        
        # Display results before archiving
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
        
        # Create a new round object for the next round
        self.cur_round = Round(self.players, self.dealer_index)

# Example Usage
if __name__ == "__main__":
    game = Game(['Player A', 'Player B', 'Player C', 'Player D'])

    print("--- Round 1: Dealer (A) wins with Ping Hu (1x) ---")
    # A wins, multiplier 1, field points (A=2, B=1, C=0, D=0)
    game.handle_round_end(0, 1, [2, 1, 0, 0])

    print("--- Round 2: Non-dealer (B) wins with You Jin (5x) ---")
    # B wins, multiplier 5, field points (A=0, B=5, C=2, D=1)
    game.handle_round_end(1, 5, [0, 5, 2, 1])

    print("\nFinal Total Scores:")
    for p in game.players:
        print(f"{p.name}: {p.get_cur_points()}")
