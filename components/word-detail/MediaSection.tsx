
import React from 'react';
import { Youtube, Tv, Music, Volume2 } from 'lucide-react';
import { WordVideoData, VideoSentsData, MusicSentsData } from '../../types/youdao';
import { SourceBadge } from './SourceBadge';

interface MediaSectionProps {
    wordVideos?: WordVideoData;
    videoSents?: VideoSentsData;
    musicSents?: MusicSentsData;
}

export const MediaSection: React.FC<MediaSectionProps> = ({ wordVideos, videoSents, musicSents }) => {
    const videos = wordVideos?.word_videos || [];
    const realVideos = videoSents?.video_sent || [];
    const music = musicSents?.music_sent || [];

    return (
        <div className="space-y-8">
            {/* Video Lectures */}
            {videos.length > 0 && (
                <div id="video_lecture" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
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
                <div id="video_scene" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                        <Tv className="w-5 h-5 text-purple-600" />
                        <h3 className="text-lg font-bold text-slate-800">实景视频</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {realVideos.map((v, idx) => (
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
                                    {v.sents?.map((s, sIdx) => (
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
                <div id="music" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                        <Music className="w-5 h-5 text-pink-500" />
                        <h3 className="text-lg font-bold text-slate-800">原声歌曲</h3>
                    </div>
                    <div className="space-y-4">
                        {music.map((m, idx) => (
                            <div key={idx} className="flex gap-4 items-center bg-pink-50/30 p-4 rounded-xl border border-pink-100">
                                <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
                                    <Music className="w-6 h-6 text-pink-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    {m.sents?.map((s, sIdx) => (
                                        <div key={sIdx}>
                                            <p className="font-serif text-slate-800 italic text-lg leading-relaxed">"{s.eng}"</p>
                                            <p className="text-sm text-slate-500 mt-1">{s.chn}</p>
                                        </div>
                                    ))}
                                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                                        <span className="font-bold text-slate-600">{m.song_name}</span>
                                        <span>•</span>
                                        <span>{m.singer}</span>
                                        {m.url && <a href={m.url} target="_blank" rel="noreferrer" className="ml-auto text-pink-500 hover:underline">去试听</a>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <SourceBadge source="music_sents" />
                </div>
            )}
        </div>
    );
};
