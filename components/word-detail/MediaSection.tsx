
import React, { useState } from 'react';
import { Youtube, Tv, Music, Volume2, ExternalLink, PlayCircle, Disc, Mic2, PauseCircle } from 'lucide-react';
import { WordVideoData, VideoSentsData, MusicSentsData, MusicSentItem } from '../../types/youdao';
import { SourceBadge } from './SourceBadge';
import { playUrl, stopAudio } from '../../utils/audio';

interface MediaSectionProps {
    wordVideos?: WordVideoData;
    videoSents?: VideoSentsData;
    musicSents?: MusicSentsData;
}

export const MediaSection: React.FC<MediaSectionProps> = ({ wordVideos, videoSents, musicSents }) => {
    const videos = wordVideos?.word_videos || [];
    
    // Enhanced data extraction for real videos
    const realVideos = videoSents?.video_sent || (videoSents as any)?.sent || [];
    
    // Music data extraction strategy: prioritized sents_data
    const musicList: MusicSentItem[] = musicSents?.sents_data || musicSents?.music_sent || (musicSents as any)?.songs || [];

    // Local state to track which music item is currently "active" in UI
    const [playingMusicIndex, setPlayingMusicIndex] = useState<number | null>(null);

    const handlePlayMusic = async (url: string, index: number) => {
        if (playingMusicIndex === index) {
            // Toggle off (Stop)
            stopAudio();
            setPlayingMusicIndex(null);
        } else {
            // Play new
            setPlayingMusicIndex(index);
            try {
                // playUrl internally calls stopAudio() to ensure exclusivity
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
            {musicList.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                        <Music className="w-5 h-5 text-pink-500" />
                        <h3 className="text-lg font-bold text-slate-800">原声歌曲</h3>
                    </div>
                    <div className="space-y-4">
                        {musicList.map((m, idx) => {
                            // Unified field mapping based on user specs and fallbacks
                            const title = m.songName || m.song_name || 'Unknown Song';
                            const artist = m.singer || 'Unknown Artist';
                            const cover = m.coverImg || m.cover;
                            const playLink = m.playUrl || m.url; // Snippet
                            const fullLink = m.link || m.url;    // Full
                            const lyricHtml = m.lyric || '';
                            const lyricTrans = m.lyricTranslation || '';
                            const legacySents = m.sents;

                            return (
                                <div key={idx} className="flex flex-col sm:flex-row gap-5 bg-pink-50/20 p-5 rounded-2xl border border-pink-100 hover:border-pink-200 transition-all group">
                                    {/* Left: Album Art & Controls */}
                                    <div className="flex sm:flex-col items-center gap-4 shrink-0 sm:w-24">
                                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shadow-md border border-pink-100 bg-white">
                                            {cover ? (
                                                <img src={cover} className="w-full h-full object-cover" alt={title} />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-pink-50">
                                                    <Disc className="w-8 h-8 text-pink-300" />
                                                </div>
                                            )}
                                            {/* Overlay Play Status */}
                                            {playingMusicIndex === idx && (
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                                                    <div className="w-3 h-3 bg-pink-500 rounded-full animate-ping"></div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex gap-2">
                                            {playLink && (
                                                <button 
                                                    onClick={() => handlePlayMusic(playLink, idx)}
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                                        playingMusicIndex === idx 
                                                        ? 'bg-pink-500 text-white shadow-lg shadow-pink-200 scale-110' 
                                                        : 'bg-white text-pink-500 border border-pink-200 hover:bg-pink-50'
                                                    }`}
                                                    title={playingMusicIndex === idx ? "Pause" : "Play Snippet"}
                                                >
                                                    {playingMusicIndex === idx ? <PauseCircle className="w-5 h-5"/> : <PlayCircle className="w-5 h-5"/>}
                                                </button>
                                            )}
                                            {fullLink && (
                                                <a 
                                                    href={fullLink} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    className="w-8 h-8 rounded-full flex items-center justify-center bg-white text-slate-400 border border-slate-200 hover:text-pink-500 hover:border-pink-200 transition-colors"
                                                    title="完整版链接"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Info & Lyrics */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <div className="mb-3">
                                            <h4 className="text-base font-bold text-slate-800 leading-tight">{title}</h4>
                                            <div className="flex items-center text-xs text-slate-500 mt-1">
                                                <Mic2 className="w-3 h-3 mr-1 text-pink-400"/>
                                                <span>{artist}</span>
                                            </div>
                                        </div>

                                        {/* Lyrics Area */}
                                        <div className="bg-white rounded-xl border border-pink-50 p-4 shadow-sm relative overflow-hidden">
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-pink-400 opacity-50"></div>
                                            
                                            {/* Primary Lyric (HTML support for highlights) */}
                                            {(lyricHtml || legacySents) ? (
                                                <div className="space-y-3">
                                                    {lyricHtml ? (
                                                        <div 
                                                            className="font-serif text-slate-700 text-base leading-relaxed"
                                                            dangerouslySetInnerHTML={{ __html: lyricHtml }} 
                                                        />
                                                    ) : (
                                                        legacySents?.map((s: any, sIdx: number) => (
                                                            <p key={sIdx} className="font-serif text-slate-700 text-base leading-relaxed">
                                                                "{s.eng}"
                                                            </p>
                                                        ))
                                                    )}
                                                    
                                                    {/* Translation */}
                                                    {(lyricTrans || (legacySents && legacySents[0]?.chn)) && (
                                                        <div className="pt-2 border-t border-slate-50 mt-1">
                                                            <p className="text-sm text-slate-500">
                                                                {lyricTrans || legacySents?.[0]?.chn}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-xs text-slate-400 italic">暂无歌词预览</div>
                                            )}
                                        </div>
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
