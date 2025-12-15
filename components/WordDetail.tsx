import React, { useEffect, useState } from 'react';
import { Volume2, ArrowLeft, BookOpen, Star, Layers, Share2, Quote, GitBranch, AlignLeft, Globe, Loader2, Tag, ArrowRight, History } from 'lucide-react';
import { playWordAudio, playUrl } from '../utils/audio';

interface WordDetailProps {
  word: string;
  onBack: () => void;
}

// --- Specific Interfaces for Youdao JSON structure (Flattened) ---

// 1. Basic / EC
interface TrObject {
  l?: {
    i?: string[];
  };
}

interface EcWord {
  usphone?: string;
  ukphone?: string;
  trs?: {
    tr?: TrObject[];
  }[];
}

interface EcData {
  word?: EcWord[];
  exam_type?: string[];
}

// 2. Collins
interface CollinsSentence {
  sent_orig?: string;
  sent_trans?: string;
}

interface CollinsTranEntry {
  pos_entry?: {
    pos?: string;
    pos_tips?: string;
  };
  tran?: string; // HTML string often containing <br> or <b>
  exam_sents?: CollinsSentence[];
}

interface CollinsEntryWrapper {
  entry?: {
    tran_entry?: CollinsTranEntry[];
  }[];
}

interface CollinsData {
  collins_entries?: {
    entries?: CollinsEntryWrapper;
    star?: number;
  }[];
}

// 3. Phrases (phrs)
interface PhrItem {
  headword?: {
    l?: {
      i?: string;
    };
  };
  trs?: {
    tr?: {
      l?: {
        i?: string;
      };
    }[];
  }[];
}

interface PhrsData {
  phrs?: PhrItem[];
}

// 4. Synonyms (syno)
interface SynoWord {
  w?: string;
}

interface SynoItem {
  pos?: string;
  tran?: string;
  ws?: SynoWord[];
}

interface SynoData {
  synos?: {
    syno?: SynoItem;
  }[];
}

// 5. Relatives / Roots (rel_word)
interface RelWord {
  word?: string;
  tran?: string;
}

interface RelItem {
  pos?: string;
  words?: RelWord[];
}

interface RelWordData {
  rels?: {
    rel?: RelItem;
  }[];
}

// 6. Etymology (etym)
interface EtymData {
  etyms?: {
    zh?: {
      word?: string;
      desc?: string;
      source?: string;
    };
  };
}

// 7. Bilingual Sentences (blng_sents_part)
interface SentencePair {
  sentence?: string;
  translation?: string;
  "aligned-words"?: {
    src?: {
      chars?: string;
    };
  };
  "sentence-audio"?: string; 
}

interface BilingualSentenceData {
  "sentence-pair"?: SentencePair[];
}

// Root Response
interface YoudaoResponse {
  meta?: {
    input?: string;
  };
  ec?: EcData;
  collins?: CollinsData;
  phrs?: PhrsData;
  syno?: SynoData;
  rel_word?: RelWordData;
  etym?: EtymData;
  blng_sents_part?: BilingualSentenceData;
}

export const WordDetail: React.FC<WordDetailProps> = ({ word, onBack }) => {
  const [data, setData] = useState<YoudaoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`https://dict.youdao.com/jsonapi?q=${encodeURIComponent(word)}`);
        if (!res.ok) throw new Error('API request failed');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
        setError('无法加载词典数据，请检查网络连接。');
      } finally {
        setLoading(false);
      }
    };

    if (word) fetchData();
  }, [word]);

  if (loading) {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-slate-500 text-sm">正在查询 "{word}" ...</p>
        </div>
    );
  }

  if (error || !data) {
      return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col p-8">
              <div className="bg-white p-8 rounded-xl shadow-sm text-center max-w-md w-full">
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-8 h-8 text-red-400" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 mb-2">查询失败</h2>
                  <p className="text-slate-500 mb-6">{error || '未找到该单词的详细释义。'}</p>
                  <button onClick={onBack} className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition">
                      返回上一页
                  </button>
              </div>
          </div>
      );
  }

  // --- Extract Data for Render ---
  const ec = data.ec;
  const wordInfo = ec?.word?.[0];
  const tags = ec?.exam_type || [];
  const collins = data.collins?.collins_entries?.[0];
  const phrases = data.phrs?.phrs || [];
  const synonyms = data.syno?.synos || [];
  const roots = data.rel_word?.rels || [];
  const etym = data.etym?.etyms?.zh;
  const sentences = data.blng_sents_part?.["sentence-pair"] || [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans selection:bg-blue-100">
      {/* 1. Navbar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 h-16 flex items-center shadow-sm">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 mr-2 hover:bg-slate-100 rounded-full transition text-slate-500 hover:text-slate-800"
          >
              <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-slate-800 capitalize truncate">{word}</h1>
          <div className="ml-auto">
              <a 
                href={`https://dict.youdao.com/result?word=${word}&lang=en`} 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-blue-600 font-medium hover:underline flex items-center"
              >
                  <Globe className="w-3.5 h-3.5 mr-1" /> 网页版
              </a>
          </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
          
          {/* 2. Header Card (Phonetics & Basic) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                  <BookOpen className="w-32 h-32" />
              </div>
              
              <div className="relative z-10">
                  <div className="flex flex-col md:flex-row md:items-baseline gap-4 mb-4">
                      <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">{word}</h1>
                      
                      <div className="flex gap-4 text-sm text-slate-500 font-mono bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 w-fit">
                          {wordInfo?.ukphone && (
                              <div 
                                className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition group select-none"
                                onClick={() => playWordAudio(word, 'UK')}
                              >
                                  <span className="text-xs font-sans text-slate-400">UK</span>
                                  <span>/{wordInfo.ukphone}/</span>
                                  <Volume2 className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                              </div>
                          )}
                          {wordInfo?.ukphone && wordInfo?.usphone && <div className="w-px bg-slate-300 h-4 self-center"></div>}
                          {wordInfo?.usphone && (
                              <div 
                                className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition group select-none"
                                onClick={() => playWordAudio(word, 'US')}
                              >
                                  <span className="text-xs font-sans text-slate-400">US</span>
                                  <span>/{wordInfo.usphone}/</span>
                                  <Volume2 className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                              </div>
                          )}
                      </div>
                  </div>

                  {/* Tags */}
                  {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                          {tags.map((tag, i) => (
                              <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                  <Tag className="w-3 h-3 mr-1" />
                                  {tag}
                              </span>
                          ))}
                      </div>
                  )}

                  {/* Basic Definitions (EC) */}
                  <div className="space-y-2">
                      {wordInfo?.trs?.map((trWrapper, idx) => {
                          const def = trWrapper.tr?.[0]?.l?.i?.[0];
                          if (!def) return null;
                          return (
                              <div key={idx} className="text-lg text-slate-700 leading-relaxed font-medium">
                                  {def}
                              </div>
                          );
                      })}
                  </div>
              </div>
          </div>

          {/* 3. Collins Dictionary Section */}
          {collins && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-amber-50/50 px-6 py-4 border-b border-amber-100 flex items-center justify-between">
                      <h3 className="font-bold text-amber-900 flex items-center">
                          <BookOpen className="w-5 h-5 mr-2 text-amber-600" />
                          柯林斯英汉双解
                      </h3>
                      {collins.star !== undefined && (
                          <div className="flex items-center" title={`Collins Star Level: ${collins.star}`}>
                              {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-4 h-4 ${i < (collins.star || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
                                  />
                              ))}
                          </div>
                      )}
                  </div>
                  
                  <div className="divide-y divide-slate-100">
                      {collins.entries?.entry?.map((entry, eIdx) => (
                          <div key={eIdx} className="p-0">
                              {entry.tran_entry?.map((te, tIdx) => (
                                  <div key={tIdx} className="p-6 hover:bg-slate-50/50 transition">
                                      <div className="flex gap-4">
                                          <div className="shrink-0 flex flex-col items-center w-12 pt-1">
                                              <span className="font-serif font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded text-sm mb-1">
                                                  {te.pos_entry?.pos}
                                              </span>
                                              <span className="text-[10px] text-slate-400 text-center leading-tight">
                                                  {eIdx + 1}.{tIdx + 1}
                                              </span>
                                          </div>
                                          
                                          <div className="flex-1 space-y-3">
                                              <div 
                                                className="text-base text-slate-800 font-medium leading-relaxed [&>b]:text-blue-700 [&>b]:bg-blue-50 [&>b]:px-1 [&>b]:rounded"
                                                dangerouslySetInnerHTML={{ __html: te.tran || '' }} 
                                              />
                                              
                                              {te.exam_sents && te.exam_sents.length > 0 && (
                                                  <div className="bg-slate-50 rounded-lg border border-slate-100 p-4 space-y-3 mt-2">
                                                      {te.exam_sents.map((ex, exIdx) => (
                                                          <div key={exIdx} className="group cursor-pointer" onClick={() => playWordAudio(ex.sent_orig || '', 'US')}>
                                                              <div className="flex items-start gap-3">
                                                                  <div className="mt-1 w-1 h-1 rounded-full bg-blue-400 shrink-0"></div>
                                                                  <div>
                                                                      <p className="text-sm text-slate-700 italic font-medium group-hover:text-blue-700 transition-colors">
                                                                          {ex.sent_orig}
                                                                      </p>
                                                                      <p className="text-sm text-slate-500 mt-0.5">
                                                                          {ex.sent_trans}
                                                                      </p>
                                                                  </div>
                                                              </div>
                                                          </div>
                                                      ))}
                                                  </div>
                                              )}
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {/* 4. Relationship Grid (Phrases, Synonyms, Roots) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Phrases */}
              {phrases.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
                      <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold">
                          <Layers className="w-5 h-5 text-indigo-500" />
                          <h3>常用短语</h3>
                      </div>
                      <div className="flex-1 space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                          {phrases.map((phr, idx) => {
                              const head = phr.headword?.l?.i;
                              const trans = phr.trs?.[0]?.tr?.[0]?.l?.i;
                              if (!head || !trans) return null;
                              return (
                                  <div key={idx} className="flex justify-between items-center text-sm group hover:bg-slate-50 p-2 rounded-lg transition border border-transparent hover:border-slate-100">
                                      <span className="font-bold text-slate-700 group-hover:text-indigo-600">{head}</span>
                                      <span className="text-slate-500 text-right max-w-[50%] truncate" title={trans}>{trans}</span>
                                  </div>
                              );
                          })}
                      </div>
                  </div>
              )}

              {/* Roots / Cognates */}
              {roots.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
                      <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold">
                          <GitBranch className="w-5 h-5 text-rose-500" />
                          <h3>同根词 / 词源</h3>
                      </div>
                      <div className="flex-1 space-y-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                          {roots.map((r, idx) => (
                              <div key={idx} className="bg-rose-50/50 rounded-lg p-3 border border-rose-100">
                                  <div className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-2">
                                      {r.rel?.pos} (词性)
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                      {r.rel?.words?.map((w, wIdx) => (
                                          <div key={wIdx} className="bg-white px-2 py-1 rounded border border-rose-100 text-xs shadow-sm flex items-center gap-1 group cursor-default">
                                              <span className="font-bold text-slate-700">{w.word}</span>
                                              <span className="text-slate-400 group-hover:text-rose-500 transition">{w.tran}</span>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {/* Synonyms */}
              {synonyms.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col lg:col-span-2">
                      <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold">
                          <Share2 className="w-5 h-5 text-cyan-500" />
                          <h3>近义词辨析</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {synonyms.map((group, idx) => {
                              const pos = group.syno?.pos;
                              const tran = group.syno?.tran;
                              const words = group.syno?.ws || [];
                              
                              return (
                                  <div key={idx} className="border border-slate-100 rounded-lg p-3 bg-slate-50/50">
                                      <div className="flex items-center gap-2 mb-2">
                                          {pos && <span className="text-xs font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">{pos}</span>}
                                          <span className="text-sm font-medium text-slate-700">{tran}</span>
                                      </div>
                                      <div className="flex flex-wrap gap-1.5">
                                          {words.map((w, wIdx) => (
                                              <span key={wIdx} className="text-xs text-slate-600 bg-white px-2 py-1 rounded border border-slate-200 hover:text-cyan-600 hover:border-cyan-200 transition cursor-default">
                                                  {w.w}
                                              </span>
                                          ))}
                                      </div>
                                  </div>
                              );
                          })}
                      </div>
                  </div>
              )}
          </div>

          {/* 5. Etymology Detail */}
          {etym && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold">
                      <History className="w-5 h-5 text-amber-600" />
                      <h3>词源典故</h3>
                  </div>
                  <div className="prose prose-sm prose-slate max-w-none bg-amber-50/30 p-4 rounded-lg border border-amber-100 text-slate-700 leading-relaxed">
                      <p className="font-bold mb-2">{etym.word}</p>
                      <p>{etym.desc}</p>
                      {etym.source && <p className="text-xs text-slate-400 mt-2 text-right">—— {etym.source}</p>}
                  </div>
              </div>
          )}

          {/* 6. Bilingual Sentences */}
          {sentences.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold">
                      <Quote className="w-5 h-5 text-blue-500" />
                      <h3>双语例句</h3>
                  </div>
                  <div className="space-y-4">
                      {sentences.slice(0, 5).map((s, idx) => (
                          <div key={idx} className="group cursor-pointer p-3 rounded-lg hover:bg-slate-50 transition" onClick={() => s["sentence-audio"] && playUrl(s["sentence-audio"])}>
                              <div className="flex gap-3">
                                  <div className="mt-1 w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                                      {idx + 1}
                                  </div>
                                  <div>
                                      <p className="text-sm font-medium text-slate-800 mb-1 group-hover:text-blue-700 transition-colors" dangerouslySetInnerHTML={{ __html: s.sentence || '' }} />
                                      <p className="text-xs text-slate-500">{s.translation}</p>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}

      </div>
    </div>
  );
};