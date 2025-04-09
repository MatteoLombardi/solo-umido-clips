import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { ClipsService } from './clips.service';
import { SafeUrlPipe } from '../shared/safe-url.pipe';
import { GameFilterComponent } from '../game-filter/game-filter.component'; // Import the standalone component

declare const Twitch: any; // Declare Twitch as a global variable

@Component({
  selector: 'app-clips',
  standalone: true,
  imports: [CommonModule, FormsModule, SafeUrlPipe, GameFilterComponent], // Import GameFilterComponent
  templateUrl: './clips.component.html',
  styleUrls: ['./clips.component.css'], // Corrected styleUrls property
  providers: [ClipsService],
})
export class ClipsComponent implements OnInit, AfterViewInit {
  videos: any[] = [];
  currentVideoIndex = 0;
  player: any; // Reference to the Twitch player
  availableGames: any[] = []; // List of all available games
  filteredGames: any[] = []; // Filtered list of games
  gameFilter: string = ''; // Input value for filtering games
  selectedGameId: string = ''; // ID of the selected game

  constructor(
    private clipsService: ClipsService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadTwitchScript().then(() => {
      this.fetchAvailableGames(); // Fetch the list of available games
      this.fetchTwitchClips(); // Fetch default clips
    }).catch((error) => {
      console.error('Error loading Twitch script:', error);
    });
  }

  ngAfterViewInit(): void {
    this.initializePlayer();
  }

  fetchTwitchClips(): void {
    const broadcasterId = '177887601'; // Replace with the actual broadcaster ID
    const numberOfClips = 30; // Number of clips to fetch

    this.clipsService.getClips(broadcasterId, numberOfClips).then(async (response) => {
      let clips = response.data;

      if (!clips || clips.length === 0) {
        console.warn('No clips found.');
        return;
      }

      // Shuffle the clips
      clips = this.shuffleArray(clips);

      // Extract unique game IDs from the clips
      const gameIds = [...new Set(clips.map((clip: any) => clip.game_id))] as string[];

      // Fetch game names using the game IDs
      const games = await this.clipsService.getGames(gameIds as string[]);

      // Map game IDs to game names
      const gameMap = games.reduce((map: any, game: any) => {
        map[game.id] = game.name;
        return map;
      }, {});

      // Map clips to include game names
      this.videos = clips.map((clip: any) => ({
        embedUrl: `${clip.embed_url}&parent=matteolombardi.github.io`, // Replace 'localhost' with your actual domain
        title: clip.title,
        author: clip.creator_name,
        uploadTime: new Date(clip.created_at),
        game: gameMap[clip.game_id] || 'Unknown', // Map game_id to game name
      }));
    }).catch((error) => {
      console.error('Error fetching Twitch clips:', error);
    });
  }

  // Helper function to shuffle an array
  private shuffleArray(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
  }

  fetchAvailableGames(): void {
    this.clipsService.getAvailableGames().then((games) => {
      this.availableGames = games;
      this.filteredGames = games; // Initialize filtered games
    }).catch((error) => {
      console.error('Error fetching available games:', error);
    });
  }

  filterGames(): void {
    const filter = this.gameFilter.toLowerCase();
    this.filteredGames = this.availableGames.filter((game) =>
      game.name.toLowerCase().includes(filter)
    );
  }

  selectGame(game: any): void {
    this.selectedGameId = game.id;
    this.gameFilter = game.name; // Set the input value to the selected game name
    this.filteredGames = []; // Hide the dropdown after selection
  }

  fetchClipsForGame(): void {
    if (!this.selectedGameId) {
      console.warn('No game selected.');
      return;
    }

    const broadcasterId = '177887601'; // Replace with the actual broadcaster ID

    this.clipsService.getClipsForGame(broadcasterId, this.selectedGameId).then((response) => {
      this.videos = response.data.map((clip: any) => ({
        embedUrl: `${clip.embed_url}&parent=matteolombardi.github.io`, // Replace 'localhost' with your actual domain
        title: clip.title,
        author: clip.creator_name,
        uploadTime: new Date(clip.created_at),
        game: clip.game_name || 'Unknown',
      }));
    }).catch((error) => {
      console.error('Error fetching clips for game:', error);
    });
  }

  initializePlayer(): void {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('Player initialization skipped because it is not running in the browser.');
      return;
    }

    if (this.videos.length > 0) {
      const embedUrl = this.videos[this.currentVideoIndex]?.embedUrl;

      // Extract the clip slug from the embed URL
      const clipSlug = this.extractClipSlug(embedUrl);

      if (!clipSlug) {
        console.error('Clip slug is missing or invalid.');
        return;
      }

      // Destroy the existing player if it exists
      if (this.player) {
        this.player.removeEventListener(Twitch.Player.ENDED, this.playNextClip.bind(this));
        this.player.destroy();
      }

      // Ensure the DOM element exists before initializing the player
      setTimeout(() => {
        this.player = new Twitch.Player('twitch-player', {
          width: 640,
          height: 360,
          clip: clipSlug, // Use the clip slug for Twitch clips
          parent: ['matteolombardi.github.io'], // Replace with your actual domain
        });

        // Listen for the "ENDED" event to play the next clip
        this.player.addEventListener(Twitch.Player.ENDED, () => {
          this.playNextClip();
        });
      }, 0); // Delay to ensure the DOM is updated
    }
  }

  extractClipSlug(embedUrl: string): string {
    const url = new URL(embedUrl);
    const clipSlug = url.pathname.split('/').pop(); // Extract the last part of the URL
    return clipSlug || '';
  }

  playNextClip(): void {
    if (this.currentVideoIndex < this.videos.length - 1) {
      this.currentVideoIndex++;
    } else {
      console.log('No more clips to play.');
    }
  }

  loadTwitchScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!isPlatformBrowser(this.platformId)) {
        console.warn('Twitch script loading skipped because it is not running in the browser.');
        resolve();
        return;
      }

      if (typeof Twitch !== 'undefined') {
        resolve(); // Script is already loaded
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://embed.twitch.tv/embed/v1.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Twitch Embed Player script.'));
      document.head.appendChild(script);
    });
  }

  onGameSelected(event: { game: any; broadcasterId: string }): void {
    const { game, broadcasterId } = event;
    this.selectedGameId = game.id; // Store the selected game ID

    // Fetch clips for the broadcaster
    this.clipsService.getClipsByBroadcaster(broadcasterId).then((clips) => {
      if (clips && clips.length > 0) {
        // Filter clips by the selected game ID
        let filteredClips = clips.filter((clip: any) => clip.game_id === this.selectedGameId);

        if (filteredClips.length > 0) {
          // Shuffle the filtered clips
          filteredClips = this.shuffleArray(filteredClips);

          this.videos = filteredClips.map((clip: any) => ({
            embedUrl: `${clip.embed_url}&parent=matteolombardi.github.io`, // Replace 'localhost' with your actual domain
            title: clip.title,
            author: clip.creator_name,
            uploadTime: new Date(clip.created_at),
            game: game.name, // Use the selected game's name
          }));
          this.currentVideoIndex = 0; // Reset to the first clip
        } else {
          console.warn('No clips found for the selected game.');
          this.videos = []; // Clear the videos if no clips are found
        }
      } else {
        console.warn('No clips found for the broadcaster.');
        this.videos = []; // Clear the videos if no clips are found
      }
    }).catch((error) => {
      console.error('Error fetching clips for the broadcaster:', error);
    });
  }
}
