import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-clips',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clips.component.html',
  styleUrl: './clips.component.css'
})
export class ClipsComponent implements OnInit {
  videos: any[] = [];
  currentVideoIndex = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchTwitchClips();
  }

  fetchTwitchClips(): void {
    const apiUrl =
      'https://gist.githubusercontent.com/poudyalanil/ca84582cbeb4fc123a13290a586da925/raw/14a27bd0bcd0cd323b35ad79cf3b493dddf6216b/videos.json'; // Replace with your API endpoint
    this.http.get<any[]>(apiUrl).subscribe({
      next: (videos) => {
        this.videos = videos.map((video) => ({
          ...video,
          uploadTime: new Date(video.uploadTime) // Parse uploadTime as a Date object
        }));
        console.log('Fetched video links:', this.videos);
      },
      error: (err) => {
        console.error('Error fetching video links:', err);
      }
    });
  }

  playNextVideo(videoPlayer: HTMLVideoElement): void {
    if (this.currentVideoIndex < this.videos.length - 1) {
      this.currentVideoIndex++;
      videoPlayer.src = this.videos[this.currentVideoIndex].videoUrl;
      videoPlayer.load();
      videoPlayer.play();
    } else {
      console.log('No more videos to play.');
    }
  }
}
