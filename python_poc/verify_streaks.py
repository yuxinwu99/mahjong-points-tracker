from mahjong_calculator import Game

def test_d_streak():
    game = Game(['A', 'B', 'C', 'D'], base_score=5)
    
    print("Scenario: Player D wins 3 times then becomes dealer")
    
    # Round 1: A is Dealer. D wins. (1st win)
    # Expected: D streak 0, mult 1. Payout from A (dealer) = 5*1*2=10. Payout from B,C = 5*1*1=5.
    # Total D gain: 10 + 5 + 5 = 20.
    print("\n--- Round 1: A is Dealer, D wins ---")
    game.handle_round_end(winner_index=3, multiplier=1, field_points=[0, 0, 0, 0])
    
    # Round 2: B is Dealer. D wins. (2nd win)
    # Expected: D streak 1, mult 2. Payout from B (dealer) = 5*1*2*2=20. Payout from A,C = 5*1*1*2=10.
    # Total D gain: 20 + 10 + 10 = 40.
    print("\n--- Round 2: B is Dealer, D wins ---")
    game.handle_round_end(winner_index=3, multiplier=1, field_points=[0, 0, 0, 0])
    
    # Round 3: C is Dealer. D wins. (3rd win)
    # Expected: D streak 2, mult 4. Payout from C (dealer) = 5*1*2*4=40. Payout from A,B = 5*1*1*4=20.
    # Total D gain: 40 + 20 + 20 = 80.
    print("\n--- Round 3: C is Dealer, D wins ---")
    game.handle_round_end(winner_index=3, multiplier=1, field_points=[0, 0, 0, 0])
    
    # Round 4: D is Dealer. D wins. (4th win)
    # Expected: D streak 3, mult 4. Payout from A,B,C = 5*1*2*4=40 each.
    # Total D gain: 40 + 40 + 40 = 120.
    print("\n--- Round 4: D is Dealer, D wins ---")
    game.handle_round_end(winner_index=3, multiplier=1, field_points=[0, 0, 0, 0])

    print("\n--- Round 5: D is Dealer, D wins with Zi Mo (2x) ---")
    # Expected: D streak 4, mult 4. Payout from A,B,C = 5*2*2*4=80 each.
    game.handle_round_end(winner_index=3, multiplier=2, field_points=[0, 0, 0, 0])

if __name__ == "__main__":
    test_d_streak()
