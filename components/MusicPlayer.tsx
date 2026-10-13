"use client";

import { useState } from "react";
import { Music, Disc3, ExternalLink, Play, Pause } from "lucide-react";

export default function MusicPlayer({ url }: { url?: string }) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!url) return null;

  // Detect Spotify
  const spotifyMatch = url.match(/open\.spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/);
  const isSpotify = !!spotifyMatch;

  // Detect YouTube
  let ytId: string | null = null;
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) {
    ytId = ytMatch[1];
  }

  return (
    <div className="music-player-card">
      <div className="music-header">
        <div className={`vinyl ${isPlaying ? "spinning" : ""}`}>
          <Disc3 size={24} className="vinyl-icon" />
        </div>
        <div className="music-info">
          <div className="music-label">
            <Music size={12} className="inline mr-1" /> May Kalakip na Kanta
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="music-title"
            title={url}
          >
            {isSpotify ? "Makinig sa Spotify" : ytId ? "Panoorin sa YouTube" : "Patugtugin ang Kanta"}
            <ExternalLink size={12} className="inline ml-1 opacity-70" />
          </a>
        </div>
        {(isSpotify || ytId) && (
          <button
            type="button"
            className="music-toggle-btn"
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? "Itago ang player" : "Ipakita ang player"}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            <span>{isPlaying ? "Itago" : "Makinig"}</span>
          </button>
        )}
      </div>

      {isPlaying && (
        <div className="music-embed-container">
          {isSpotify && spotifyMatch && (
            <iframe
              src={`https://open.spotify.com/embed/${spotifyMatch[1]}/${spotifyMatch[2]}?utm_source=generator&theme=0`}
              width="100%"
              height="152"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title="Spotify music embed"
              className="rounded-xl shadow-inner"
            />
          )}

          {ytId && !isSpotify && (
            <div className="yt-wrapper">
              <iframe
                src={`https://www.youtube.com/embed/${ytId}?autoplay=1&enablejsapi=1`}
                width="100%"
                height="180"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="YouTube music embed"
                className="rounded-xl shadow-inner"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
