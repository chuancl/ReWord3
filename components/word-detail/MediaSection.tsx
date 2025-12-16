
import React, { useState, useEffect } from 'react';
import { Youtube, Tv, Music, Volume2, ExternalLink, PlayCircle, Disc, Mic2, PauseCircle, ArrowLeft, ArrowRight } from 'lucide-react';
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
    
    // Updated data extraction for real videos using sents_data (primary)
    // Fallbacks to legacy fields if needed
    const realVideos = videoSents?.sents_data || videoSents?.video_sent || (videoSents as any)?.sent || [];
    
    // Music data extraction strategy: prioritized sents_data
    const musicList: MusicSentItem[] = musicSents?.sents_data || musicSents?.music_sent || (musicSents as any)?.songs || [];

    // --- Music Carousel State ---
    const [activeMusicIndex, setActiveMusicIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    // Stop audio when switching songs
    useEffect(() => {
        stopAudio();
        setIsPlaying(false);
    }, [activeMusicIndex]);

    const handlePrevMusic = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setActiveMusicIndex(prev => Math.max(0, prev - 1));
    };

    const handleNextMusic = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setActiveMusicIndex(prev => Math.min(musicList.length - 1, prev + 1));
    };

    const handlePlayToggle = async (url: string) => {
        if (isPlaying) {
            stopAudio();
            setIsPlaying(false);
        } else {
            setIsPlaying(true);
            try {
                await playUrl(url);
                setIsPlaying(false); // Auto reset when done
            } catch (e) {
                setIsPlaying(false);
            }
        }
    };

    // Get current active music item
    const activeMusic = musicList[activeMusicIndex];

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
                        {realVideos.map((v: any, idx: number) => {
                            // Unified data mapping
                            const cover = v.video_cover || v.cover;
                            const url = v.video || v.url;
                            // Contributor/Source
                            const source = v.contributor || v.source;
                            // Subtitles can come from sents array (legacy) or subtitle_srt (new)
                            const subtitles = v.sents || (v.subtitle_srt ? [{eng: v.subtitle_srt}] : []);

                            return (
                                <div key={idx} className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200 flex flex-col">
                                    <a href={url} target="_blank" rel="noopener noreferrer" className="block relative aspect-video bg-slate-900 group shrink-0">
                                        {cover && <img src={cover} className="w-full h-full object-cover opacity-90 group-hover:opacity-75 transition" />}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center group-hover:bg-white/30 transition">
                                                <Volume2 className="w-5 h-5 text-white" />
                                            </div>
                                        </div>
                                    </a>
                                    <div className="p-4 flex-1 flex flex-col">
                                        <div className="space-y-2 mb-3 flex-1">
                                            {subtitles.length > 0 ? (
                                                subtitles.map((s: any, sIdx: number) => (
                                                    <div key={sIdx} className="space-y-1">
                                                        <p className="text-sm font-medium text-slate-800 line-clamp-3 leading-relaxed" title={s.eng}>
                                                            {s.eng}
                                                        </p>
                                                        {s.chn && <p className="text-xs text-slate-500 line-clamp-1">{s.chn}</p>}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-xs text-slate-400 italic">暂无字幕预览</p>
                                            )}
                                        </div>
                                        {source && (
                                            <div className="text-[10px] text-slate-400 text-right pt-2 border-t border-slate-100 truncate">
                                                — {source}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <SourceBadge source="video_sents" />
                </div>
            )}

            {/* Music 3D Carousel */}
            {musicList.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center gap-2 px-8 py-5 border-b border-slate-100 bg-pink-50/30">
                        <Music className="w-5 h-5 text-pink-500" />
                        <h3 className="text-lg font-bold text-slate-800">原声歌曲</h3>
                        <span className="text-xs text-pink-400 font-medium bg-pink-50 px-2 py-0.5 rounded-full ml-auto">
                            {activeMusicIndex + 1} / {musicList.length}
                        </span>
                    </div>

                    {/* 3D Stage Area */}
                    <div className="relative w-full h-[320px] bg-slate-900 flex items-center justify-center overflow-hidden perspective-1000 group select-none">
                        
                        {/* Background Effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-800/90">
                            {activeMusic.coverImg || activeMusic.cover ? (
                                <img 
                                    src={activeMusic.coverImg || activeMusic.cover} 
                                    className="w-full h-full object-cover opacity-20 blur-2xl scale-110" 
                                    alt="Background"
                                />
                            ) : null}
                        </div>

                        {musicList.map((m, idx) => {
                            const offset = idx - activeMusicIndex;
                            const absOffset = Math.abs(offset);
                            
                            // Visibility Optimization
                            if (absOffset > 2) return null;

                            // 3D Transform
                            const isActive = offset === 0;
                            const xTranslate = offset * 60; // Distance between items
                            const scale = isActive ? 1 : 1 - (absOffset * 0.2);
                            const rotateY = offset > 0 ? -45 : (offset < 0 ? 45 : 0);
                            const zIndex = 20 - absOffset;
                            const opacity = isActive ? 1 : 0.6;

                            const cover = m.coverImg || m.cover;
                            const title = m.songName || m.song_name || 'Unknown Song';

                            return (
                                <div 
                                    key={idx}
                                    onClick={() => setActiveMusicIndex(idx)}
                                    className={`absolute w-48 h-48 sm:w-56 sm:h-56 rounded-xl shadow-2xl transition-all duration-500 ease-out cursor-pointer
                                        ${isActive ? 'z-30 ring-1 ring-white/20' : 'z-10 hover:opacity-80'}`}
                                    style={{
                                        transform: `translateX(${xTranslate}%) scale(${scale}) perspective(1000px) rotateY(${rotateY}deg)`,
                                        zIndex: zIndex,
                                        opacity: opacity,
                                        left: '50%',
                                        marginLeft: '-7rem', // -w/2 (mobile)
                                        // Media query handling via JS logic is tricky here, rely on centering via left 50%
                                    }}
                                >
                                    <div className={`w-full h-full rounded-xl overflow-hidden bg-slate-800 relative border border-white/10 ${isActive && isPlaying ? 'animate-pulse-slow' : ''}`}>
                                        {cover ? (
                                            <img src={cover} className="w-full h-full object-cover" alt={title} />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-pink-500 to-rose-600">
                                                <Disc className="w-12 h-12 text-white/50" />
                                            </div>
                                        )}
                                        
                                        {/* Vinyl/CD Shine Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>

                                        {/* Active Play Overlay */}
                                        {isActive && (
                                            <div 
                                                className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition group/play"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePlayToggle(m.playUrl || m.url || '');
                                                }}
                                            >
                                                <div className={`w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 transition-transform ${isPlaying ? 'scale-100' : 'scale-90 group-hover/play:scale-110'}`}>
                                                    {isPlaying ? (
                                                        <PauseCircle className="w-6 h-6 text-white" />
                                                    ) : (
                                                        <PlayCircle className="w-6 h-6 text-white ml-0.5" />
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Reflection */}
                                    {isActive && (
                                        <div className="absolute -bottom-8 left-0 right-0 h-8 bg-gradient-to-b from-white/10 to-transparent blur-sm transform scale-y-[-1] opacity-40 mask-image-gradient">
                                            {cover && <img src={cover} className="w-full h-full object-cover" />}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Navigation Arrows */}
                        {musicList.length > 1 && (
                            <>
                                <button 
                                    onClick={handlePrevMusic}
                                    disabled={activeMusicIndex === 0}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed transition z-40 backdrop-blur-sm"
                                >
                                    <ArrowLeft className="w-6 h-6" />
                                </button>
                                <button 
                                    onClick={handleNextMusic}
                                    disabled={activeMusicIndex === musicList.length - 1}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed transition z-40 backdrop-blur-sm"
                                >
                                    <ArrowRight className="w-6 h-6" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Info Panel */}
                    <div className="bg-white p-6 md:p-8 min-h-[200px]">
                        {activeMusic ? (
                            <div className="max-w-3xl mx-auto text-center space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-300" key={activeMusicIndex}>
                                <div>
                                    <h4 className="text-xl font-bold text-slate-900 mb-1">
                                        {activeMusic.songName || activeMusic.song_name || 'Unknown Song'}
                                    </h4>
                                    <div className="flex items-center justify-center text-sm text-pink-600 font-medium">
                                        <Mic2 className="w-3.5 h-3.5 mr-1.5" />
                                        {activeMusic.singer || 'Unknown Artist'}
                                    </div>
                                </div>

                                {/* Lyrics Box */}
                                <div className="relative bg-slate-50 rounded-xl p-6 border border-slate-100 shadow-inner">
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        Lyrics Preview
                                    </div>
                                    
                                    {(activeMusic.lyric || activeMusic.sents) ? (
                                        <div className="space-y-4 max-h-40 overflow-y-auto custom-scrollbar">
                                            {activeMusic.lyric ? (
                                                <div 
                                                    className="font-serif text-slate-700 text-lg leading-relaxed"
                                                    dangerouslySetInnerHTML={{ __html: activeMusic.lyric }} 
                                                />
                                            ) : (
                                                activeMusic.sents?.map((s: any, sIdx: number) => (
                                                    <p key={sIdx} className="font-serif text-slate-700 text-lg leading-relaxed">
                                                        "{s.eng}"
                                                    </p>
                                                ))
                                            )}
                                            
                                            {/* Translation */}
                                            {(activeMusic.lyricTranslation || (activeMusic.sents && activeMusic.sents[0]?.chn)) && (
                                                <div className="pt-3 border-t border-slate-200/60 mt-2">
                                                    <p className="text-sm text-slate-500 font-medium">
                                                        {activeMusic.lyricTranslation || activeMusic.sents?.[0]?.chn}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-slate-400 italic text-sm py-4">暂无歌词预览</div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex justify-center gap-4 pt-2">
                                    {(activeMusic.link || activeMusic.url) && (
                                        <a 
                                            href={activeMusic.link || activeMusic.url} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="inline-flex items-center px-4 py-2 bg-pink-50 text-pink-600 rounded-full text-sm font-bold hover:bg-pink-100 transition"
                                        >
                                            <ExternalLink className="w-4 h-4 mr-2" />
                                            在音乐平台收听完整版
                                        </a>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-slate-400 py-10">请选择一首歌曲</div>
                        )}
                    </div>
                    <SourceBadge source="music_sents" />
                </div>
            )}
        </div>
    );
};
