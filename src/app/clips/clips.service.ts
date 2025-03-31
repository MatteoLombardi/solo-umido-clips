import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable()
export class ClipsService {
  private clientId = environment.twitch.clientId;
  private clientSecret = environment.twitch.clientSecret;
  private tokenUrl = environment.twitch.tokenUrl;
  private clipsUrl = environment.twitch.clipsUrl;
  private token: string | null = null;

  constructor(private http: HttpClient) { }

  async getToken(): Promise<string> {
    const body = new URLSearchParams();
    body.set('client_id', this.clientId);
    body.set('client_secret', this.clientSecret);
    body.set('grant_type', 'client_credentials');

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const response: any = await firstValueFrom(this.http.post(this.tokenUrl, body.toString(), { headers }));
    this.token = response.access_token; // Store the access token
    return response.access_token; // Return the access token
  }

  async getClips(broadcasterId: string, first: number = 10): Promise<any> {
    const token = await this.getToken(); // Acquire the access token

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Client-Id': this.clientId,
    });

    const params = {
      broadcaster_id: broadcasterId, // Fetch clips for the broadcaster
      first: first.toString(), // Number of clips to fetch
    };

    return await firstValueFrom(this.http.get(this.clipsUrl, { headers, params }));
  }

  async getGames(gameIds: string[]): Promise<any[]> {
    const token = await this.getToken(); // Acquire the access token

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Client-Id': this.clientId,
    });

    const params = {
      id: gameIds, // Pass game IDs as query parameters
    };

    const response: any = await firstValueFrom(
      this.http.get('https://api.twitch.tv/helix/games', { headers, params })
    );
    return response.data; // Return the list of games
  }

  async getAvailableGames(): Promise<any[]> {
    const token = await this.getToken(); // Ensure a valid token is fetched

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Client-Id': this.clientId,
    });

    const response: any = await firstValueFrom(
      this.http.get('https://api.twitch.tv/helix/games/top', { headers })
    );
    return response.data; // Return the list of games
  }

  getClipsForGame(broadcasterId: string, gameId: string): Promise<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Client-Id': this.clientId,
    });

    const params = {
      broadcaster_id: broadcasterId, // Filter by broadcaster
      game_id: gameId, // Filter by game
      first: '10', // Number of clips to fetch
    };

    return firstValueFrom(
      this.http.get<any>('https://api.twitch.tv/helix/clips', { headers, params })
    );
  }

  async getClipsByGameId(gameId: string, first: number = 10): Promise<any[]> {
    const token = await this.getToken(); // Acquire the access token

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Client-Id': this.clientId,
    });

    const params = {
      game_id: gameId, // Fetch clips for the selected game
      first: first.toString(), // Number of clips to fetch
    };

    const response: any = await firstValueFrom(this.http.get(this.clipsUrl, { headers, params }));
    return response.data || []; // Return the clips or an empty array if none are found
  }

  async getClipsByGameAndBroadcaster(gameId: string, broadcasterId: string, first: number = 10): Promise<any[]> {
    const token = await this.getToken(); // Acquire the access token

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Client-Id': this.clientId,
    });

    const params = {
      game_id: gameId, // Fetch clips for the selected game
      broadcaster_id: broadcasterId, // Fetch clips for the specific broadcaster
      first: first.toString(), // Number of clips to fetch
    };

    const response: any = await firstValueFrom(this.http.get(this.clipsUrl, { headers, params }));
    return response.data || []; // Return the clips or an empty array if none are found
  }

  async getClipsByBroadcaster(broadcasterId: string, first: number = 10): Promise<any[]> {
    const token = await this.getToken(); // Acquire the access token

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Client-Id': this.clientId,
    });

    const params = {
      broadcaster_id: broadcasterId, // Fetch clips for the broadcaster
      first: first.toString(), // Number of clips to fetch
    };

    const response: any = await firstValueFrom(this.http.get(this.clipsUrl, { headers, params }));
    return response.data || []; // Return the clips or an empty array if none are found
  }
}