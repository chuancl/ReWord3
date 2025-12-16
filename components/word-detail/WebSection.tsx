
import React from 'react';
import { FileQuestion, Network, BookOpen, BarChart2 } from 'lucide-react';
import { IndividualData, WebTransData, WikiDigestData, SpecialData } from '../../types/youdao';
import { SourceBadge } from './SourceBadge';

interface WebSectionProps {
    individual?: IndividualData;
    webTrans?: WebTransData;
    wiki?: WikiDigestData;
    special?: SpecialData;
}

export const WebSection: React.FC<WebSectionProps> = ({ individual, webTrans, wiki, special }) => {
    const exams = individual?.idiomatic || [];
    const webTranslations = webTrans?.web_translation || [];
    const wikiSummaries = wiki?.summarys || [];
    const stats = special;

    return (
        <div className="space-y-8">
            {/* Exam Questions */}
            {exams.length > 0 && (
                <div id="exams" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
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
            )}

            {/* Web Translation */}
            {webTranslations.length > 0 && (
                <div id="web_trans" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                        <Network className="w-5 h-5 text-cyan-600" />
                        <h3 className="text-lg font-bold text-slate-800">网络释义 (Web Translation)</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {webTranslations.slice(0, 20).map((w, idx) => (
                            <div key={idx} className="flex flex-col p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="font-bold text-slate-700 mb-1">{w.key}</span>
                                <span className="text-sm text-slate-500">
                                    {w.trans?.map(t => t.value).join('; ')}
                                </span>
                            </div>
                        ))}
                    </div>
                    <SourceBadge source="web_trans" />
                </div>
            )}

            {/* Wikipedia */}
            {wikiSummaries.length > 0 && (
                <div id="wiki" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                        <BookOpen className="w-5 h-5 text-slate-800" />
                        <h3 className="text-lg font-bold text-slate-800">维基百科 (Wikipedia)</h3>
                    </div>
                    <div className="space-y-4">
                        {wikiSummaries.map((w, idx) => (
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
            )}

            {/* Stats / Special */}
            {(stats?.summary?.sources || stats?.co_list) && (
                <div id="stats" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                        <BarChart2 className="w-5 h-5 text-gray-600" />
                        <h3 className="text-lg font-bold text-slate-800">词频与统计 (Statistics)</h3>
                    </div>
                    {stats?.summary?.sources && (
                        <div className="mb-6">
                            <h4 className="text-sm font-bold text-slate-600 mb-3">词频分布</h4>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(stats.summary.sources).map(([key, val]: [string, any]) => (
                                    <div key={key} className="px-3 py-2 bg-slate-50 rounded border border-slate-200 flex flex-col items-center min-w-[80px]">
                                        <span className="text-xs text-slate-400 uppercase">{key}</span>
                                        <span className="font-bold text-slate-800">{val?.hits || 0}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {stats?.co_list && (
                        <div>
                            <h4 className="text-sm font-bold text-slate-600 mb-3">搭配统计</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {stats.co_list.map((co, idx) => (
                                    <div key={idx} className="bg-slate-50 p-3 rounded-lg">
                                        <div className="text-xs font-bold text-slate-400 mb-2">{co.gene}</div>
                                        <ul className="space-y-1">
                                            {co.entries?.slice(0, 5).map((e, eIdx) => (
                                                <li key={eIdx} className="flex justify-between text-sm">
                                                    <span className="text-slate-600">{e.k}</span>
                                                    <span className="text-slate-400">{e.v}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <SourceBadge source="special" />
                </div>
            )}
        </div>
    );
};
