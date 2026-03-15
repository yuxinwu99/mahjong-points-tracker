from tabulate import tabulate
class Player:
    def __init__(self, name, is_dealer=False):
        self.name = name
        self.points = 0
        self.is_dealer = is_dealer

    def update_points(self, delta):
        # Update player's points
        self.points += delta

    def reset_for_new_round(self):
        self.is_dealer = False

class Round:
    def display_round_summary(self, player_names, player_objects):
        print(f"\n--- Round Summary (Multiplier: x{self.multiplier}) ---")
        breakdown = self.get_breakdown(player_names)
        table = []
        for i, p in enumerate(player_objects):
            score = self.scores[i]
            winner = f"winner (x{self.multiplier})" if i == self.winner_index else ""
            dealer = "Dealer" if p.is_dealer else ""
            net_change = sum(amt for _, amt in breakdown[i])
            total_points = p.points
            breakdown_str = " ".join([f"{name} {amt:+d}" for name, amt in breakdown[i]])
            table.append([p.name, score, winner, dealer, net_change, total_points, breakdown_str])
        print(tabulate(table, headers=["Player", "Score", "Winner", "Dealer", "Net Change", "Total Points", "Breakdown"], tablefmt="grid"))
    def display_round_scores(self, player_names):
        print("Scores this round:")
        for i, name in enumerate(player_names):
            mark = " (winner)" if i == self.winner_index else ""
            print(f"{name}: {self.scores[i]}{mark}")
    def get_breakdown(self, player_names):
        n = len(self.scores)
        breakdown = [[] for _ in range(n)]
        winner = self.winner_index
        dealer = self.dealer_index
        mult = self.multiplier
        base_dealer = self.base_dealer
        base_player = self.base_player
        # Winner collects from all
        for i in range(n):
            if i == winner:
                continue
            if winner == dealer:
                amount = base_dealer * mult + self.scores[winner]
                breakdown[winner].append((player_names[i], amount))
                breakdown[i].append((player_names[winner], -amount))
            else:
                if i == dealer:
                    amount = base_dealer * mult + self.scores[winner]
                else:
                    amount = base_player * mult + self.scores[winner]
                breakdown[winner].append((player_names[i], amount))
                breakdown[i].append((player_names[winner], -amount))
        # Losers pay difference to other losers
        for i in range(n):
            if i == winner:
                continue
            for j in range(n):
                if j == winner or j == i:
                    continue
                if self.scores[j] > self.scores[i]:
                    diff = self.scores[j] - self.scores[i]
                    breakdown[i].append((player_names[j], -diff))
                    breakdown[j].append((player_names[i], diff))
        return breakdown
    def __init__(self, scores, winner_index, dealer_index, multiplier=1, base_dealer=10, base_player=5):
        self.scores = scores
        self.winner_index = winner_index
        self.dealer_index = dealer_index
        self.multiplier = multiplier
        self.base_dealer = base_dealer
        self.base_player = base_player

    def calculate_net_points(self):
        n = len(self.scores)
        net_points = [0] * n
        winner = self.winner_index
        dealer = self.dealer_index
        mult = self.multiplier
        base_dealer = self.base_dealer
        base_player = self.base_player
        # Winner collects from all
        for i in range(n):
            if i == winner:
                continue
            if winner == dealer:
                amount = base_dealer * mult + self.scores[winner]
                net_points[winner] += amount
                net_points[i] -= amount
            else:
                if i == dealer:
                    amount = base_dealer * mult + self.scores[winner]
                else:
                    amount = base_player * mult + self.scores[winner]
                net_points[winner] += amount
                net_points[i] -= amount
        # Losers pay difference to other losers
        for i in range(n):
            if i == winner:
                continue
            for j in range(n):
                if j == winner or j == i:
                    continue
                if self.scores[j] > self.scores[i]:
                    diff = self.scores[j] - self.scores[i]
                    net_points[i] -= diff
                    net_points[j] += diff
        return net_points

    def next_dealer_and_base(self):
        # Determine next dealer and base
        if self.winner_index == self.dealer_index:
            return self.dealer_index, self.base_dealer
        else:
            return (self.dealer_index + 1) % len(self.scores), 10

class Game:
    def __init__(self, player_names):
        self.players = [Player(name) for name in player_names]
        self.dealer_index = 0
        self.base_dealer = 10
        self.base_player = 5
        self.round_history = []
        self.round_number = 1

    def start_new_round(self, scores, winner_index, multiplier=1):
        # Use current base for calculation
        round_obj = Round(scores, winner_index, self.dealer_index, multiplier, self.base_dealer, self.base_player)
        net_points = round_obj.calculate_net_points()
        for i, delta in enumerate(net_points):
            self.players[i].update_points(delta)
        # Update dealer for this round BEFORE summary print
        next_dealer, _ = round_obj.next_dealer_and_base()
        for i, p in enumerate(self.players):
            p.is_dealer = (i == self.dealer_index)
        print(f"\n--- Round {self.round_number} ---")
        round_obj.display_round_summary([p.name for p in self.players], self.players)
        # Update base for next round
        if winner_index == self.dealer_index:
            if self.base_dealer == 10:
                self.base_dealer = 20
            else:
                self.base_dealer = 20
        else:
            self.base_dealer = 10
        self.dealer_index = next_dealer
        self.round_number += 1

    def display_summary(self):
        # Display current points and dealer
        for p in self.players:
            dealer_mark = " (Dealer)" if p.is_dealer else ""
            print(f"{p.name}: {p.points}{dealer_mark}")


if __name__ == "__main__":
    import sys
    lines = sys.stdin.read().splitlines()
    idx = 0
    player_names = []
    for i in range(4):
        player_names.append(lines[idx].strip())
        idx += 1
    game = Game(player_names)

    while idx < len(lines):
        scores = []
        for i in range(4):
            scores.append(int(lines[idx].strip()))
            idx += 1
        winner_name = lines[idx].strip()
        idx += 1
        winner_index = player_names.index(winner_name)
        multiplier = int(lines[idx].strip())
        idx += 1
        game.start_new_round(scores, winner_index, multiplier)




