import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-game-filter',
  standalone: true, // Make it standalone
  imports: [CommonModule, FormsModule], // Import necessary modules
  templateUrl: './game-filter.component.html',
  styleUrls: ['./game-filter.component.css'],
})
export class GameFilterComponent {
  @Input() availableGames: any[] = [];
  @Input() broadcasterId: string = ''; // Add broadcaster ID as an input
  @Output() gameSelected = new EventEmitter<{ game: any; broadcasterId: string }>();

  gameFilter: string = '';
  filteredGames: any[] = [];
  selectedGame: any = null; // Store the selected game

  ngOnInit(): void {
    this.filteredGames = this.availableGames;
  }

  filterGames(): void {
    const filter = this.gameFilter.toLowerCase();
    this.filteredGames = this.availableGames.filter((game) =>
      game.name.toLowerCase().includes(filter)
    );
  }

  selectGame(game: any): void {
    this.selectedGame = game; // Store the selected game
    this.gameFilter = game.name; // Set the input value to the selected game name
    this.filteredGames = []; // Hide the dropdown after selection
  }

  submitFilter(): void {
    if (this.selectedGame && this.broadcasterId) {
      this.gameSelected.emit({ game: this.selectedGame, broadcasterId: this.broadcasterId });
    }
  }
}