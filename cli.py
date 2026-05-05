import sys
import os
from main import Game

# ANSI colors for a more "premium" CLI feel
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def clear_screen():
    """Clears the terminal screen."""
    os.system('cls' if os.name == 'nt' else 'clear')

def print_header(text):
    """Prints a styled header."""
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*50}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text.center(50)}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*50}{Colors.ENDC}\n")

def get_input(prompt, default=None, type_cast=str):
    """Helper to get user input with defaults and type casting."""
    while True:
        p = f"{Colors.OKCYAN}{prompt}{Colors.ENDC}"
        if default is not None:
            p += f" [{Colors.WARNING}{default}{Colors.ENDC}]"
        p += ": "
        
        try:
            val = input(p).strip()
        except EOFError:
            print()
            return default
            
        if not val and default is not None:
            return default
        if not val and type_cast != str:
            print(f"{Colors.FAIL}This field is required.{Colors.ENDC}")
            continue
            
        try:
            return type_cast(val)
        except ValueError:
            print(f"{Colors.FAIL}Invalid input. Please enter a {type_cast.__name__}.{Colors.ENDC}")

def main():
    clear_screen()
    print_header("MAHJONG POINTS TRACKER")
    
    # Setup players
    player_names = []
    print(f"{Colors.BOLD}Player Setup{Colors.ENDC}")
    for i in range(4):
        name = get_input(f"Enter name for Player {i+1}", default=f"Player {chr(65+i)}")
        player_names.append(name)
    
    base_score = get_input("Enter base score (points per fan/multiplier)", default=5, type_cast=int)
    
    game = Game(player_names, base_score=base_score)
    
    round_num = 1
    while True:
        clear_screen()
        print_header(f"ROUND {round_num}")
        
        dealer = game.players[game.dealer_index]
        print(f"{Colors.BOLD}Current Dealer:{Colors.ENDC} {Colors.OKGREEN}{dealer.name}{Colors.ENDC}")
        if game.consecutive_win_count > 0:
            print(f"{Colors.BOLD}Lian Zhuang Count:{Colors.ENDC} {Colors.WARNING}{game.consecutive_win_count}{Colors.ENDC}")
        print("-" * 50)
        
        # Select winner
        print(f"{Colors.BOLD}Who won this round?{Colors.ENDC}")
        for i, p in enumerate(game.players):
            dealer_mark = f" {Colors.WARNING}(Dealer){Colors.ENDC}" if i == game.dealer_index else ""
            print(f"  {Colors.OKBLUE}{i}{Colors.ENDC}: {p.name}{dealer_mark}")
        
        while True:
            winner_idx = get_input("Winner index (0-3)", type_cast=int)
            if 0 <= winner_idx <= 3:
                break
            print(f"{Colors.FAIL}Please enter a number between 0 and 3.{Colors.ENDC}")
            
        multiplier = get_input("Multiplier (Fan count / Win strength)", default=1, type_cast=int)
        
        print(f"\n{Colors.BOLD}Enter Field Points (Gold/Flowers/Kongs):{Colors.ENDC}")
        field_points = []
        for i, p in enumerate(game.players):
            fp = get_input(f"  Field points for {p.name}", default=0, type_cast=int)
            field_points.append(fp)
            
        print("\n" + "-" * 50)
        # Note: handle_round_end already prints round info using get_round_info()
        game.handle_round_end(winner_idx, multiplier, field_points)
        print("-" * 50)
        
        # Show current scores
        print(f"\n{Colors.BOLD}Current Standings:{Colors.ENDC}")
        for p in game.players:
            score = p.get_cur_points()
            color = Colors.OKGREEN if score > 0 else (Colors.FAIL if score < 0 else Colors.ENDC)
            print(f"  {p.name.ljust(15)}: {color}{str(score).rjust(5)}{Colors.ENDC}")
            
        print("\n" + "=" * 50)
        cont = get_input("Continue to next round? (y/n)", default="y").lower()
        if cont != 'y':
            break
        round_num += 1

    clear_screen()
    print_header("FINAL RESULTS")
    print(f"{Colors.BOLD}{'Player'.ljust(15)} | {'Total Points'.rjust(12)}{Colors.ENDC}")
    print("-" * 30)
    for p in game.players:
        score = p.get_cur_points()
        color = Colors.OKGREEN if score > 0 else (Colors.FAIL if score < 0 else Colors.ENDC)
        print(f"{p.name.ljust(15)} | {color}{str(score).rjust(12)}{Colors.ENDC}")
    print(f"\n{Colors.OKCYAN}{Colors.BOLD}Thank you for playing!{Colors.ENDC}\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n\n{Colors.WARNING}Game interrupted. Exiting...{Colors.ENDC}")
        sys.exit(0)
