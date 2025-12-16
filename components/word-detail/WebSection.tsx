
import React from 'react';
import { FileQuestion, Network, BookOpen, Volume2, Tag } from 'lucide-react';
import { IndividualData, WebTransData, WikiDigestData } from '../../types/youdao';
import { SourceBadge } from './SourceBadge';
import { playUrl } from '../../utils/audio';

// --- 1. Exams Section ---
export const ExamsSection: React.FC<{ individual?: IndividualData }> = ({ individual }) => {
    const exams = individual?.idiomatic || [];
    if (exams.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                <FileQuestion className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-bold text-slate-800">考试真题 (Exams)</h3>
            </div>
            <div className="space-y-6">
                {exams.map((idiom, idx) => (
                    <div key={idx}>
                        {idiom.exam?.map((q, qIdx) => (
                            <div key={qIdx} className="bg-slate-50 p-5 rounded-xl border border-slate-200 mb-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-bold text-white bg-indigo-500 px-2 py-0.5 rounded">{idiom.level || '真题'}</span>
                                </div>
                                <p className="text-slate-800 font-medium mb-3">{q.question}</p>
                                {q.choices && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                                        {q.choices.map((c, cIdx) => (
                                            <div key={cIdx} className="text-sm text-slate-600 bg-white px-3 py-2 rounded border border-slate-100">{c.choice}</div>
                                        ))}
                                    </div>
                                )}
                                {q.answer && (
                                    <div className="text-sm text-slate-500 pt-3 border-t border-slate-200 mt-3">
                                        <span className="font-bold text-indigo-600 mr-2">解析:</span>
                                        {q.answer.explain}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <SourceBadge source="individual" />
        </div>
    );
};

// --- 2. Web Translation Section ---
export const WebTransSection: React.FC<{ webTrans?: WebTransData }> = ({ webTrans }) => {
    // Robust access: Check both dashed and potential underscored keys just in case, though API is usually dashed.
    const items = webTrans?.['web-translation'] || (webTrans as any)?.['web_translation'] || [];
    
    if (items.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                <Network className="w-5 h-5 text-cyan-600" />
                <h3 className="text-lg font-bold text-slate-800">网络释义 (Web Translation)</h3>
            </div>
            <div className="grid grid-cols-1 gap-6">
                {items.slice(0, 20).map((w, idx) => (
                    <div key={idx} className="flex flex-col p-5 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-cyan-200 transition-colors">
                        {/* Header: Key + Audio */}
                        <div className="flex items-center gap-3 mb-3">
                            <span className="font-bold text-lg text-slate-800">{w.key}</span>
                            {w['key-speech'] && (
                                <button 
                                    className="p-1.5 rounded-full bg-cyan-100 text-cyan-600 hover:bg-cyan-200 transition-colors"
                                    onClick={() => playUrl(`https://dict.youdao.com/dictvoice?audio=${w['key-speech']}`)}
                                    title="播放读音"
                                >
                                    <Volume2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Translations List */}
                        <div className="space-y-3">
                            {w.trans?.map((t, tIdx) => (
                                <div key={tIdx} className="flex flex-col gap-1.5 pl-3 border-l-2 border-slate-200/60 hover:border-cyan-300 transition-colors">
                                    {/* Meaning & Field Tag */}
                                    <div className="flex items-start gap-2 flex-wrap">
                                        <span className="text-sm font-medium text-slate-700 leading-relaxed">{t.value}</span>
                                        {/* Field Tag (e.g. [计算机]) */}
                                        {t.cls?.cl?.[0] && (
                                            <span className="shrink-0 text-[10px] text-cyan-600 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-100 flex items-center h-fit mt-0.5">
                                                <Tag className="w-2.5 h-2.5 mr-1" />
                                                {t.cls.cl[0]}
                                            </span>
                                        )}
                                    </div>
                                    
                                    {/* Summary / Example */}
                                    {t.summary?.line?.[0] && (
                                        <p className="text-xs text-slate-500 italic bg-white p-2 rounded border border-slate-100/50">
                                            {t.summary.line[0]}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <SourceBadge source="web_trans" />
        </div>
    );
};

// --- 3. Wikipedia Section ---
export const WikiSection: React.FC<{ wiki?: WikiDigestData }> = ({ wiki }) => {
    const items = wiki?.summarys || [];
    if (items.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                <BookOpen className="w-5 h-5 text-slate-800" />
                <h3 className="text-lg font-bold text-slate-800">维基百科 (Wikipedia)</h3>
            </div>
            <div className="space-y-4">
                {items.map((w, idx) => (
                    <div key={idx}>
                        <h4 className="font-bold text-slate-700 mb-2">{w.key}</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">{w.summary}</p>
                    </div>
                ))}
                {wiki?.source?.url && (
                    <a href={wiki.source.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline block text-right mt-2">
                        Read more on Wikipedia
                    </a>
                )}
            </div>
            <SourceBadge source="wikipedia_digest" />
        </div>
    );
};
