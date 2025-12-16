
import React from 'react';
import { Layers, Share2, Split, GitBranch, History } from 'lucide-react';
import { PhrsData, SynoData, RelWordData, EtymData } from '../../types/youdao';
import { SourceBadge } from './SourceBadge';

interface RelationshipSectionProps {
    phrs?: PhrsData;
    syno?: SynoData;
    discrim?: { discrims?: { title?: string; desc?: string }[] };
    relWord?: RelWordData;
    etym?: EtymData;
}

export const RelationshipSection: React.FC<RelationshipSectionProps> = ({ phrs, syno, discrim, relWord, etym }) => {
    const phrases = phrs?.phrs || [];
    const synonyms = syno?.synos || [];
    const discrims = discrim?.discrims || [];
    const roots = relWord?.rels || [];
    const etymData = etym?.etyms?.zh || etym?.etyms?.en;

    return (
        <div className="space-y-8">
            {/* Phrases */}
            {phrases.length > 0 && (
                <div id="phrases" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                        <Layers className="w-5 h-5 text-green-600" />
                        <h3 className="text-lg font-bold text-slate-800">常用词组 (Phrases)</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {phrases.slice(0, 15).map((phr, idx) => {
                            const head = phr.headword?.l?.i;
                            const trans = phr.trs?.[0]?.tr?.[0]?.l?.i;
                            if (!head || !trans) return null;
                            return (
                                <div key={idx} className="flex flex-col p-3 rounded-lg border border-slate-100 hover:border-green-200 hover:bg-green-50/30 transition group">
                                    <span className="font-bold text-slate-700 group-hover:text-green-700 mb-1">{head}</span>
                                    <span className="text-xs text-slate-500 truncate" title={trans}>{trans}</span>
                                </div>
                            );
                        })}
                    </div>
                    <SourceBadge source="phrs" />
                </div>
            )}

            {/* Synonyms */}
            {synonyms.length > 0 && (
                <div id="synonyms" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                        <Share2 className="w-5 h-5 text-purple-500" />
                        <h3 className="text-lg font-bold text-slate-800">同近义词 (Synonyms)</h3>
                    </div>
                    <div className="space-y-4">
                        {synonyms.map((group, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="shrink-0 sm:w-32 pt-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-white bg-slate-400 px-1.5 py-0.5 rounded italic">{group.syno?.pos || 'N/A'}</span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-700">{group.syno?.tran}</p>
                                </div>
                                <div className="flex flex-wrap gap-2 flex-1">
                                    {group.syno?.ws?.map((w, wIdx) => (
                                        <span key={wIdx} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:border-purple-300 hover:text-purple-600 transition cursor-default shadow-sm">
                                            {w.w}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <SourceBadge source="syno" />
                </div>
            )}

            {/* Discrimination */}
            {discrims.length > 0 && (
                <div id="discrim" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                        <Split className="w-5 h-5 text-orange-500" />
                        <h3 className="text-lg font-bold text-slate-800">词义辨析 (Discrimination)</h3>
                    </div>
                    <div className="space-y-6">
                        {discrims.map((item, idx) => (
                            <div key={idx} className="group">
                                <h4 className="font-bold text-slate-800 mb-2 flex items-center">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mr-2"></span>
                                    {item.title}
                                </h4>
                                <p className="text-sm text-slate-600 leading-relaxed pl-3.5 border-l border-slate-200 group-hover:border-orange-200 transition-colors">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                    <SourceBadge source="discrim" />
                </div>
            )}

            {/* Roots */}
            {roots.length > 0 && (
                <div id="roots" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                        <GitBranch className="w-5 h-5 text-rose-500" />
                        <h3 className="text-lg font-bold text-slate-800">词根词源 (Roots & Cognates)</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {roots.map((r, idx) => (
                            <div key={idx} className="bg-rose-50/30 rounded-xl p-5 border border-rose-100">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-bold text-rose-600 uppercase bg-rose-50 px-2 py-1 rounded">
                                        {r.rel?.pos}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {r.rel?.words?.slice(0, 8).map((w, wIdx) => (
                                        <div key={wIdx} className="flex justify-between items-baseline text-sm">
                                            <span className="font-bold text-slate-700">{w.word}</span>
                                            <span className="text-slate-500 text-xs">{w.tran}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <SourceBadge source="rel_word" />
                </div>
            )}

            {/* Etymology */}
            {etymData && (
                <div id="etym" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                        <History className="w-5 h-5 text-amber-600" />
                        <h3 className="text-lg font-bold text-slate-800">词源典故 (Etymology)</h3>
                    </div>
                    <div className="prose prose-sm prose-slate max-w-none bg-amber-50/50 p-6 rounded-xl border border-amber-100 text-slate-700 leading-relaxed font-serif">
                        <p className="font-bold text-lg mb-2 text-amber-900">{etymData.word}</p>
                        <p>{etymData.desc}</p>
                        {etymData.source && <p className="text-xs text-amber-500/60 mt-4 text-right">—— {etymData.source}</p>}
                    </div>
                    <SourceBadge source="etym" />
                </div>
            )}
        </div>
    );
};
