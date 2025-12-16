
import React from 'react';
import { AudioLines, Lightbulb, PlayCircle, Split } from 'lucide-react';
import { IcibaExtendedResponse } from '../../types/iciba';
import { SourceBadge } from './SourceBadge';

// --- 1. Pronunciation Tips Section ---
export const PronunciationSection: React.FC<{ data?: IcibaExtendedResponse['data'] }> = ({ data }) => {
    const pronunciationData = data?.aiSearchWordPronunciationVo;
    if (!pronunciationData || (!pronunciationData.pronunciation && !pronunciationData.videoUrl)) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                <AudioLines className="w-5 h-5 text-rose-500" />
                <h3 className="text-lg font-bold text-slate-800">发音技巧 (Pronunciation Tips)</h3>
            </div>
            
            <div className="space-y-6">
                {/* Text Tip */}
                {pronunciationData.pronunciation && (
                    <div className="bg-rose-50/50 p-6 rounded-xl border border-rose-100 text-slate-700 leading-relaxed font-medium">
                        {pronunciationData.pronunciation}
                    </div>
                )}

                {/* Video Tip */}
                {pronunciationData.videoUrl && (
                    <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-black">
                        <video 
                            src={pronunciationData.videoUrl} 
                            controls 
                            className="w-full max-h-[400px] aspect-video"
                            controlsList="nodownload"
                        />
                        <div className="bg-slate-900 text-white px-4 py-2 text-xs flex items-center">
                            <PlayCircle className="w-3 h-3 mr-2 text-rose-500" />
                            口型演示视频
                        </div>
                    </div>
                )}
            </div>
            <SourceBadge source="iciba_extended" />
        </div>
    );
};

// --- 2. Mnemonic Assistance Section ---
export const MnemonicSection: React.FC<{ data?: IcibaExtendedResponse['data'] }> = ({ data }) => {
    const etymaData = data?.wordEtymaVo;
    if (!etymaData || (!etymaData.assist && !etymaData.explosion)) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold text-slate-800">单词助记 (Mnemonic)</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Memory Aid */}
                {etymaData.assist && (
                    <div className="bg-amber-50/50 p-6 rounded-xl border border-amber-100 h-full">
                        <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-3 flex items-center">
                            <Lightbulb className="w-3 h-3 mr-1.5" /> 巧记妙招
                        </h4>
                        <p className="text-slate-700 font-medium leading-loose text-lg font-serif">
                            {etymaData.assist}
                        </p>
                    </div>
                )}

                {/* Word Breakdown */}
                {etymaData.explosion && (
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 h-full">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
                            <Split className="w-3 h-3 mr-1.5" /> 结构拆解
                        </h4>
                        <p className="text-slate-600 font-mono text-base leading-relaxed whitespace-pre-wrap">
                            {etymaData.explosion}
                        </p>
                    </div>
                )}
            </div>
            <SourceBadge source="iciba_extended" />
        </div>
    );
};
