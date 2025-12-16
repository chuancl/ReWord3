
import React, { useState, useEffect, useRef } from 'react';
import { Youtube, Tv, Music, Volume2, ExternalLink, PlayCircle, Disc, Mic2, PauseCircle, ArrowLeft, ArrowRight, Subtitles, User, Link as LinkIcon } from 'lucide-react';
import { WordVideoData, VideoSentsData, MusicSentsData, MusicSentItem } from '../../types/youdao';
import { SourceBadge } from './SourceBadge';
import { playUrl, stopAudio } from '../../utils/audio';

// --- 1. Video Lectures Section ---
export const VideoLectureSection: React.FC<{ wordVideos?: WordVideoData }> = ({ wordVideos }) => {
    const videos = wordVideos?.word_videos || [];
    const [activeLectureIndex, setActiveLectureIndex] = useState(0);
    const [isLecturePlaying, setIsLecturePlaying] = useState(false);

    useEffect(() => { stopAudio(); setIsLecturePlaying(false); }, [activeLectureIndex]);

    if (videos.length === 0) return null;

    const activeLecture = videos[activeLectureIndex];

    const handlePrev = (e?: React.MouseEvent) => { e?.stopPropagation(); setActiveLectureIndex(p => Math.max(0, p - 1)); };
    const handleNext = (e?: React.MouseEvent) => { e?.stopPropagation(); setActiveLectureIndex(p => Math.min(videos.length - 1, p + 1)); };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex items-center gap-2 px-8 py-5 border-b border-slate-100 bg-red-50/30">
                <Youtube className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-bold text-slate-800">视频讲解</h3>
                <span className="text-xs text-red-500 font-medium bg-red-50 px-2 py-0.5 rounded-full ml-auto">
                    {activeLectureIndex + 1} / {videos.length}
                </span>
            </div>
            
            <div className="relative w-full h-[520px] bg-slate-900 flex items-center justify-center overflow-hidden perspective-1000 group select-none">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-800">
                    {activeLecture?.video?.cover && <img src={activeLecture.video.cover} className="w-full h-full object-cover opacity-10 blur-xl scale-110" />}
                </div>

                {videos.map((v, idx) => {
                    const offset = idx - activeLectureIndex;
                    const absOffset = Math.abs(offset);
                    if (absOffset > 2) return null;

                    const isActive = offset === 0;
                    const xTranslate = offset * 65; 
                    const scale = isActive ? 1 : 1 - (absOffset * 0.15);
                    const rotateY = offset > 0 ? -30 : (offset < 0 ? 30 : 0);
                    const zIndex = 20 - absOffset;
                    const opacity = isActive ? 1 : 0.5;

                    return (
                        <div key={idx} onClick={() => setActiveLectureIndex(idx)} className={`absolute w-[90vw] aspect-video sm:w-[750px] sm:h-[422px] rounded-xl shadow-2xl transition-all duration-500 ease-out cursor-pointer ${isActive ? 'z-30 ring-1 ring-white/20' : 'z-10 hover:opacity-80'}`} style={{ left: '50%', transform: `translateX(calc(-50% + ${xTranslate}%)) scale(${scale}) perspective(1000px) rotateY(${rotateY}deg)`, zIndex, opacity }}>
                            <div className={`w-full h-full rounded-xl overflow-hidden bg-black relative border border-white/10 group/card`}>
                                {isActive && isLecturePlaying ? (
                                    <video src={v.video?.url} controls autoPlay className="w-full h-full object-contain" onEnded={() => setIsLecturePlaying(false)} controlsList="nodownload" />
                                ) : (
                                    <>
                                        {v.video?.cover ? <img src={v.video.cover} className="w-full h-full object-cover opacity-90" /> : <div className="w-full h-full flex items-center justify-center bg-slate-800"><Youtube className="w-16 h-16 text-slate-600" /></div>}
                                        <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent"><h4 className="text-white font-bold text-lg md:text-xl drop-shadow-md line-clamp-2">{v.video?.title}</h4></div>
                                        {isActive && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition group/play" onClick={(e) => { e.stopPropagation(); setIsLecturePlaying(true); stopAudio(); }}>
                                                <div className="w-20 h-20 rounded-full bg-red-600/90 backdrop-blur-md flex items-center justify-center border border-white/20 transition-transform hover:scale-110 shadow-xl"><PlayCircle className="w-10 h-10 text-white fill-white ml-1" /></div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
                {videos.length > 1 && (
                    <>
                        <button onClick={handlePrev} disabled={activeLectureIndex === 0} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 transition z-40 backdrop-blur-sm"><ArrowLeft className="w-8 h-8" /></button>
                        <button onClick={handleNext} disabled={activeLectureIndex === videos.length - 1} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 transition z-40 backdrop-blur-sm"><ArrowRight className="w-8 h-8" /></button>
                    </>
                )}
            </div>
            <SourceBadge source="word_video" />
        </div>
    );
};

// --- 2. Video Scenes Section ---
export const VideoSceneSection: React.FC<{ videoSents?: VideoSentsData }> = ({ videoSents }) => {
    const realVideos = videoSents?.sents_data || videoSents?.video_sent || (videoSents as any)?.sent || [];
    const [activeVideoIndex, setActiveVideoIndex] = useState(0);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [subtitleTrackUrl, setSubtitleTrackUrl] = useState<string | null>(null);

    useEffect(() => { stopAudio(); setIsVideoPlaying(false); }, [activeVideoIndex]);

    const activeVideo = realVideos[activeVideoIndex];

    useEffect(() => {
        if (!activeVideo) { setSubtitleTrackUrl(null); return; }
        let vttContent = "WEBVTT\n\n";
        let hasContent = false;
        if (activeVideo.subtitle_srt) {
            vttContent += activeVideo.subtitle_srt.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2').replace(/<[^>]+>/g, '');
            hasContent = true;
        } else if (activeVideo.sents && activeVideo.sents.length > 0) {
            const combinedText = activeVideo.sents.map((s: any) => `${s.eng || ''}\n${s.chn || ''}`).join('\n\n');
            vttContent += `1\n00:00.000 --> 10:00.000\n${combinedText}`;
            hasContent = true;
        }
        if (hasContent) {
            const blob = new Blob([vttContent], { type: 'text/vtt' });
            const url = URL.createObjectURL(blob);
            setSubtitleTrackUrl(url);
            return () => URL.revokeObjectURL(url);
        } else { setSubtitleTrackUrl(null); }
    }, [activeVideo]);

    if (realVideos.length === 0) return null;

    const handlePrev = (e?: React.MouseEvent) => { e?.stopPropagation(); setActiveVideoIndex(p => Math.max(0, p - 1)); };
    const handleNext = (e?: React.MouseEvent) => { e?.stopPropagation(); setActiveVideoIndex(p => Math.min(realVideos.length - 1, p + 1)); };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex items-center gap-2 px-8 py-5 border-b border-slate-100 bg-purple-50/30">
                <Tv className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-bold text-slate-800">实景视频</h3>
                <span className="text-xs text-purple-500 font-medium bg-purple-50 px-2 py-0.5 rounded-full ml-auto">
                    {activeVideoIndex + 1} / {realVideos.length}
                </span>
            </div>
            <div className="relative w-full h-[520px] bg-slate-900 flex items-center justify-center overflow-hidden perspective-1000 group select-none">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-800">
                    {activeVideo && (activeVideo.video_cover || activeVideo.cover) && <img src={activeVideo.video_cover || activeVideo.cover} className="w-full h-full object-cover opacity-10 blur-xl scale-110" />}
                </div>
                {realVideos.map((v: any, idx: number) => {
                    const offset = idx - activeVideoIndex;
                    const absOffset = Math.abs(offset);
                    if (absOffset > 2) return null;
                    const isActive = offset === 0;
                    const xTranslate = offset * 65; 
                    const scale = isActive ? 1 : 1 - (absOffset * 0.15);
                    const rotateY = offset > 0 ? -30 : (offset < 0 ? 30 : 0);
                    const zIndex = 20 - absOffset;
                    const opacity = isActive ? 1 : 0.5;
                    return (
                        <div key={idx} onClick={() => setActiveVideoIndex(idx)} className={`absolute w-[90vw] aspect-video sm:w-[750px] sm:h-[422px] rounded-xl shadow-2xl transition-all duration-500 ease-out cursor-pointer ${isActive ? 'z-30 ring-1 ring-white/20' : 'z-10 hover:opacity-80'}`} style={{ left: '50%', transform: `translateX(calc(-50% + ${xTranslate}%)) scale(${scale}) perspective(1000px) rotateY(${rotateY}deg)`, zIndex, opacity }}>
                            <div className={`w-full h-full rounded-xl overflow-hidden bg-black relative border border-white/10 group/card`}>
                                {isActive && isVideoPlaying ? (
                                    <video src={v.video || v.url} controls autoPlay className="w-full h-full object-contain" onEnded={() => setIsVideoPlaying(false)} controlsList="nodownload">
                                        {subtitleTrackUrl && <track key={subtitleTrackUrl} default kind="captions" srcLang="en" label="English/Chinese" src={subtitleTrackUrl} />}
                                    </video>
                                ) : (
                                    <>
                                        {(v.video_cover || v.cover) ? <img src={v.video_cover || v.cover} className="w-full h-full object-cover opacity-90" /> : <div className="w-full h-full flex items-center justify-center bg-slate-800"><Tv className="w-16 h-16 text-slate-600" /></div>}
                                        {isActive && <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition group/play" onClick={(e) => { e.stopPropagation(); setIsVideoPlaying(true); stopAudio(); }}><div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 transition-transform hover:scale-110"><PlayCircle className="w-12 h-12 text-white ml-1" /></div></div>}
                                        {isActive && !isVideoPlaying && (
                                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none">
                                                <div className="text-center">
                                                    {v.sents && v.sents.length > 0 ? v.sents.map((s: any, i: number) => <div key={i} className="mb-2 last:mb-0"><p className="text-white text-lg md:text-xl font-bold leading-tight drop-shadow-md font-serif italic">"{s.eng}"</p>{s.chn && <p className="text-white/80 text-sm md:text-base mt-1 font-medium drop-shadow-md">{s.chn}</p>}</div>) : v.subtitle_srt ? <p className="text-white text-base font-medium drop-shadow-md line-clamp-3 leading-relaxed">{v.subtitle_srt.replace(/(\d{2}:\d{2}:\d{2},\d{3})|(\d+\s+)|(-->)/g, '').replace(/<[^>]+>/g, '')}</p> : null}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
                {realVideos.length > 1 && (<><button onClick={handlePrev} disabled={activeVideoIndex === 0} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 transition z-40 backdrop-blur-sm"><ArrowLeft className="w-8 h-8" /></button><button onClick={handleNext} disabled={activeVideoIndex === realVideos.length - 1} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 transition z-40 backdrop-blur-sm"><ArrowRight className="w-8 h-8" /></button></>)}
            </div>
            {activeVideo && (
                <div className="bg-white px-6 py-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">{(activeVideo.contributor || activeVideo.source) && <div className="flex items-center text-xs text-slate-500"><User className="w-3.5 h-3.5 mr-1.5 text-slate-400" /><span>{activeVideo.contributor || activeVideo.source}</span></div>}</div>
                    {(activeVideo.video || activeVideo.url) && <a href={activeVideo.video || activeVideo.url} target="_blank" rel="noreferrer" className="flex items-center text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors"><LinkIcon className="w-3.5 h-3.5 mr-1.5" />原始链接</a>}
                </div>
            )}
            <SourceBadge source="video_sents" />
        </div>
    );
};

// --- 3. Music Section ---
export const MusicSection: React.FC<{ musicSents?: MusicSentsData }> = ({ musicSents }) => {
    const musicList: MusicSentItem[] = musicSents?.sents_data || musicSents?.music_sent || (musicSents as any)?.songs || [];
    const [activeMusicIndex, setActiveMusicIndex] = useState(0);
    const [isMusicPlaying, setIsMusicPlaying] = useState(false);

    useEffect(() => { stopAudio(); setIsMusicPlaying(false); }, [activeMusicIndex]);

    if (musicList.length === 0) return null;

    const activeMusic = musicList[activeMusicIndex];

    const handlePrev = (e?: React.MouseEvent) => { e?.stopPropagation(); setActiveMusicIndex(p => Math.max(0, p - 1)); };
    const handleNext = (e?: React.MouseEvent) => { e?.stopPropagation(); setActiveMusicIndex(p => Math.min(musicList.length - 1, p + 1)); };
    const handlePlayToggle = async (url: string) => {
        if (isMusicPlaying) { stopAudio(); setIsMusicPlaying(false); } 
        else { setIsMusicPlaying(true); try { await playUrl(url); setIsMusicPlaying(false); } catch { setIsMusicPlaying(false); } }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex items-center gap-2 px-8 py-5 border-b border-slate-100 bg-pink-50/30">
                <Music className="w-5 h-5 text-pink-500" />
                <h3 className="text-lg font-bold text-slate-800">原声歌曲</h3>
                <span className="text-xs text-pink-400 font-medium bg-pink-50 px-2 py-0.5 rounded-full ml-auto">
                    {activeMusicIndex + 1} / {musicList.length}
                </span>
            </div>
            <div className="relative w-full h-[320px] bg-slate-900 flex items-center justify-center overflow-hidden perspective-1000 group select-none">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-800/90">
                    {(activeMusic.coverImg || activeMusic.cover) && <img src={activeMusic.coverImg || activeMusic.cover} className="w-full h-full object-cover opacity-20 blur-2xl scale-110" />}
                </div>
                {musicList.map((m, idx) => {
                    const offset = idx - activeMusicIndex;
                    const absOffset = Math.abs(offset);
                    if (absOffset > 2) return null;
                    const isActive = offset === 0;
                    const xTranslate = offset * 60; 
                    const scale = isActive ? 1 : 1 - (absOffset * 0.2);
                    const rotateY = offset > 0 ? -45 : (offset < 0 ? 45 : 0);
                    const zIndex = 20 - absOffset;
                    const opacity = isActive ? 1 : 0.6;
                    return (
                        <div key={idx} onClick={() => setActiveMusicIndex(idx)} className={`absolute w-48 h-48 sm:w-56 sm:h-56 rounded-xl shadow-2xl transition-all duration-500 ease-out cursor-pointer ${isActive ? 'z-30 ring-1 ring-white/20' : 'z-10 hover:opacity-80'}`} style={{ transform: `translateX(${xTranslate}%) scale(${scale}) perspective(1000px) rotateY(${rotateY}deg)`, zIndex, opacity, left: '50%', marginLeft: '-7rem' }}>
                            <div className={`w-full h-full rounded-xl overflow-hidden bg-slate-800 relative border border-white/10 ${isActive && isMusicPlaying ? 'animate-pulse-slow' : ''}`}>
                                {(m.coverImg || m.cover) ? <img src={m.coverImg || m.cover} className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-pink-500 to-rose-600"><Disc className="w-12 h-12 text-white/50" /></div>}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
                                {isActive && <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition group/play" onClick={(e) => { e.stopPropagation(); handlePlayToggle(m.playUrl || m.url || ''); }}><div className={`w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 transition-transform ${isMusicPlaying ? 'scale-100' : 'scale-90 group-hover/play:scale-110'}`}>{isMusicPlaying ? <PauseCircle className="w-6 h-6 text-white" /> : <PlayCircle className="w-6 h-6 text-white ml-0.5" />}</div></div>}
                            </div>
                        </div>
                    );
                })}
                {musicList.length > 1 && (<><button onClick={handlePrev} disabled={activeMusicIndex === 0} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed transition z-40 backdrop-blur-sm"><ArrowLeft className="w-6 h-6" /></button><button onClick={handleNext} disabled={activeMusicIndex === musicList.length - 1} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed transition z-40 backdrop-blur-sm"><ArrowRight className="w-6 h-6" /></button></>)}
            </div>
            <div className="bg-white p-6 md:p-8 min-h-[200px]">
                {activeMusic ? (
                    <div className="max-w-3xl mx-auto text-center space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-300" key={activeMusicIndex}>
                        <div><h4 className="text-xl font-bold text-slate-900 mb-1">{activeMusic.songName || activeMusic.song_name || 'Unknown Song'}</h4><div className="flex items-center justify-center text-sm text-pink-600 font-medium"><Mic2 className="w-3.5 h-3.5 mr-1.5" />{activeMusic.singer || 'Unknown Artist'}</div></div>
                        <div className="relative bg-slate-50 rounded-xl p-6 border border-slate-100 shadow-inner">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {activeMusic.lyricList ? 'Full Lyrics' : 'Lyrics Preview'}
                            </div>
                            
                            <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar px-2">
                                {activeMusic.lyricList && activeMusic.lyricList.length > 0 ? (
                                    <div className="space-y-6 py-2">
                                        {activeMusic.lyricList.map((line, lIdx) => (
                                            <div key={lIdx} className="text-center group">
                                                <p className="font-serif text-slate-800 text-base leading-relaxed group-hover:text-pink-600 transition-colors">{line.content}</p>
                                                {line.translate && <p className="text-sm text-slate-500 mt-1 group-hover:text-slate-600">{line.translate}</p>}
                                            </div>
                                        ))}
                                    </div>
                                ) : (activeMusic.lyric || activeMusic.sents) ? (
                                    <>
                                        {activeMusic.lyric ? (
                                            <div className="font-serif text-slate-700 text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: activeMusic.lyric }} />
                                        ) : (
                                            activeMusic.sents?.map((s: any, sIdx: number) => (
                                                <div key={sIdx}>
                                                    <p className="font-serif text-slate-700 text-lg leading-relaxed">"{s.eng}"</p>
                                                    {s.chn && <p className="text-sm text-slate-500 mt-1">{s.chn}</p>}
                                                </div>
                                            ))
                                        )}
                                        {(!activeMusic.lyricList && !activeMusic.sents && activeMusic.lyricTranslation) && (
                                            <div className="pt-3 border-t border-slate-200/60 mt-2">
                                                <p className="text-sm text-slate-500 font-medium">{activeMusic.lyricTranslation}</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-slate-400 italic text-sm py-4">暂无歌词预览</div>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-center gap-4 pt-2">{(activeMusic.link || activeMusic.url) && <a href={activeMusic.link || activeMusic.url} target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-2 bg-pink-50 text-pink-600 rounded-full text-sm font-bold hover:bg-pink-100 transition"><ExternalLink className="w-4 h-4 mr-2" />在音乐平台收听完整版</a>}</div>
                    </div>
                ) : <div className="text-center text-slate-400 py-10">请选择一首歌曲</div>}
            </div>
            <SourceBadge source="music_sents" />
        </div>
    );
};

// Compatibility export
export const MediaSection: React.FC<any> = (props) => (
    <div className="space-y-8">
        <VideoLectureSection wordVideos={props.wordVideos} />
        <VideoSceneSection videoSents={props.videoSents} />
        <MusicSection musicSents={props.musicSents} />
    </div>
);
