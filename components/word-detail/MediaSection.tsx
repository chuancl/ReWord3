
import React, { useState } from 'react';
import { Youtube, Tv, Music, Volume2, ExternalLink, PlayCircle, Disc, Mic2, PauseCircle } from 'lucide-react';
import { WordVideoData, VideoSentsData, MusicSentsData } from '../../types/youdao';
import { SourceBadge } from './SourceBadge';
import { playUrl, stopAudio } from '../../utils/audio';

interface MediaSectionProps {
    wordVideos?: WordVideoData;
    videoSents?: VideoSentsData;
    musicSents?: MusicSentsData;
}

export const MediaSection: React.FC<MediaSectionProps> = ({ wordVideos, videoSents, musicSents }) => {
    const videos = wordVideos?.word_videos || [];
    
    // Enhanced data extraction
    const realVideos = videoSents?.video_sent || (videoSents as any)?.sent || [];
    
    // Music data extraction strategy
    const music = musicSents?.sents_data || musicSents?.music_sent || (musicSents as any)?.songs || [];

    // Local state to track which music item is currently "active" in UI (for play icon toggle)
    // Note: Actual audio state is handled globally in utils/audio.ts, this is just for UI feedback
    const [playingMusicIndex, setPlayingMusicIndex] = useState<number | null>(null);

    const handlePlayMusic = async (url: string, index: number) => {
        if (playingMusicIndex === index) {
            // Toggle off
            stopAudio();
            setPlayingMusicIndex(null);
        } else {
            // Play new
            setPlayingMusicIndex(index);
            try {
                await playUrl(url);
                setPlayingMusicIndex(null); // Reset icon when done
            } catch (e) {
                setPlayingMusicIndex(null);
            }
        }
    };

    return (
        <div className="space-y-8">
            {/* Video Lectures */}
            {videos.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                        <Youtube className="w-5 h-5 text-red-600" />
                        <h3 className="text-lg font-bold text-slate-800">视频讲解</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {videos.map((v, idx) => (
                            <a key={idx} href={v.video?.url} target="_blank" rel="noopener noreferrer" className="group block relative rounded-xl overflow-hidden aspect-video bg-slate-900 border border-slate-200 shadow-sm hover:shadow-md transition">
                                {v.video?.cover && <img src={v.video.cover} className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition" alt={v.video?.title} />}
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg mb-2 group-hover:scale-110 transition-transform">
                                        <Youtube className="w-6 h-6 text-white fill-white" />
                                    </div>
                                    <p className="text-white font-bold text-center text-sm line-clamp-2 drop-shadow-md px-2">{v.video?.title}</p>
                                </div>
                            </a>
                        ))}
                    </div>
                    <SourceBadge source="word_video" />
                </div>
            )}

            {/* Real Scene Videos */}
            {realVideos.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                        <Tv className="w-5 h-5 text-purple-600" />
                        <h3 className="text-lg font-bold text-slate-800">实景视频</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {realVideos.map((v: any, idx: number) => (
                            <div key={idx} className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
                                <a href={v.url} target="_blank" rel="noopener noreferrer" className="block relative aspect-video bg-slate-900 group">
                                    {v.cover && <img src={v.cover} className="w-full h-full object-cover opacity-90 group-hover:opacity-75 transition" />}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center group-hover:bg-white/30 transition">
                                            <Volume2 className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                </a>
                                <div className="p-4">
                                    {v.sents?.map((s: any, sIdx: number) => (
                                        <div key={sIdx} className="space-y-1">
                                            <p className="text-sm font-medium text-slate-800 line-clamp-2" title={s.eng}>{s.eng}</p>
                                            <p className="text-xs text-slate-500 line-clamp-1">{s.chn}</p>
                                        </div>
                                    ))}
                                    {v.source && <div className="text-[10px] text-slate-400 mt-2 text-right">— {v.source}</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                    <SourceBadge source="video_sents" />
                </div>
            )}

            {/* Music */}
            {music.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                        <Music className="w-5 h-5 text-pink-500" />
                        <h3 className="text-lg font-bold text-slate-800">原声歌曲</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {music.map((m: any, idx: number) => {
                            // Determine display URLs
                            const snippetUrl = m.playUrl; 
                            const fullUrl = m.link || m.url;

                            return (
                                <div key={idx} className="flex flex-col bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-pink-200 transition group">
                                    {/* Top: Metadata Row */}
                                    <div className="p-4 flex items-center gap-4 bg-slate-50/50">
                                        <div className="relative shrink-0">
                                            <div className={`w-14 h-14 rounded-full border-2 border-white shadow-sm overflow-hidden flex items-center justify-center bg-pink-100 ${playingMusicIndex === idx ? 'animate-spin-slow' : ''}`}>
                                                {m.cover ? (
                                                    <img src={m.cover} className="w-full h-full object-cover" alt={m.song_name} />
                                                ) : (
                                                    <Disc className="w-6 h-6 text-pink-400" />
                                                )}
                                            </div>
                                            {/* Status Dot */}
                                            {playingMusicIndex === idx && (
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-pink-500 rounded-full border-2 border-white flex items-center justify-center">
                                                    <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-slate-800 truncate text-sm" title={m.song_name}>{m.song_name || 'Unknown Song'}</h4>
                                            <div className="flex items-center text-xs text-slate-500 mt-1">
                                                <Mic2 className="w-3 h-3 mr-1 text-slate-400"/>
                                                <span className="truncate">{m.singer || 'Unknown Artist'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Middle: Lyrics Snippet */}
                                    <div className="px-4 py-3 flex-1 border-t border-b border-slate-50 bg-white">
                                        {m.sents?.map((s: any, sIdx: number) => (
                                            <div key={sIdx} className="space-y-1">
                                                <p className="font-serif italic text-slate-700 text-sm leading-relaxed border-l-2 border-pink-300 pl-3">
                                                    "{s.eng}"
                                                </p>
                                                {s.chn && <p className="text-xs text-slate-400 pl-3">{s.chn}</p>}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Bottom: Actions */}
                                    <div className="px-4 py-3 flex items-center justify-between bg-slate-50/80">
                                        {/* Play Snippet */}
                                        {snippetUrl ? (
                                            <button 
                                                onClick={() => handlePlayMusic(snippetUrl, idx)}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                                                    playingMusicIndex === idx 
                                                    ? 'bg-pink-100 text-pink-600 ring-1 ring-pink-200' 
                                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200'
                                                }`}
                                            >
                                                {playingMusicIndex === idx ? <PauseCircle className="w-4 h-4"/> : <PlayCircle className="w-4 h-4"/>}
                                                {playingMusicIndex === idx ? 'Playing...' : '试听片段'}
                                            </button>
                                        ) : (
                                            <span className="text-xs text-slate-300 select-none">无试听</span>
                                        )}

                                        {/* Full Link */}
                                        {fullUrl && (
                                            <a 
                                                href={fullUrl} 
                                                target="_blank" 
                                                rel="noreferrer" 
                                                className="text-xs text-slate-400 hover:text-pink-600 flex items-center transition-colors"
                                                title="跳转到完整歌曲"
                                            >
                                                完整版 <ExternalLink className="w-3 h-3 ml-1" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <SourceBadge source="music_sents" />
                </div>
            )}
        </div>
    );
};
