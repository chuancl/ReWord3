
import React, { useEffect, useState, useRef } from 'react';
import { Volume2, ArrowLeft, BookOpen, Star, Layers, Share2, Quote, GitBranch, Globe, Loader2, Tag, History, GraduationCap, Briefcase, Split, AlignLeft, Hash } from 'lucide-react';
import { playWordAudio, playUrl } from '../utils/audio';

interface WordDetailProps {
  word: string;
  onBack: () => void;
}

// --- Enhanced Interfaces for Youdao JSON ---

// 1. Basic / EC
interface TrObject { l?: { i?: string[] }; }
interface EcWord { usphone?: string; ukphone?: string; trs?: { tr?: TrObject[]; }[]; }
interface EcData { word?: EcWord[]; exam_type?: string[]; }

// 2. Collins
interface CollinsSentence { sent_orig?: string; sent_trans?: string; }
interface CollinsTranEntry { pos_entry?: { pos?: string; pos_tips?: string }; tran?: string; exam_sents?: CollinsSentence[]; }
interface CollinsEntryWrapper { entry?: { tran_entry?: CollinsTranEntry[]; }[]; }
interface CollinsData { collins_entries?: { entries?: CollinsEntryWrapper; star?: number; }[]; }

// 3. Phrases (phrs)
interface PhrItem { headword?: { l?: { i?: string } }; trs?: { tr?: { l?: { i?: string } }[]; }[]; }
interface PhrsData { phrs?: PhrItem[]; }

// 4. Synonyms (syno)
interface SynoItem { pos?: string; tran?: string; ws?: { w?: string }[]; }
interface SynoData { synos?: { syno?: SynoItem; }[]; }

// 5. Relatives / Roots (rel_word)
interface RelItem { pos?: string; words?: { word?: string; tran?: string }[]; }
interface RelWordData { rels?: { rel?: RelItem; }[]; }

// 6. Etymology (etym)
interface EtymData { etyms?: { zh?: { word?: string; desc?: string; source?: string }; }; }

// 7. Bilingual Sentences (blng_sents_part)
interface SentencePair { sentence?: string; translation?: string; "sentence-audio"?: string; }
interface BilingualSentenceData { "sentence-pair"?: SentencePair[]; }

// 8. English-English (ee)
interface EeItem { pos?: string; tr?: { l?: { i?: string } }[]; }
interface EeData { word?: { trs?: EeItem[] }; }

// 9. Special/Professional (special)
interface SpecialItem { nat?: string; trs?: { tr?: { l?: { i?: string } } }[]; } // Simplified structure assumption
interface SpecialEntry { k?: string; v?: string; }
interface SpecialCoList { gene?: string; entries?: SpecialEntry[]; }
interface SpecialData { co_list?: SpecialCoList[]; summary?: { sources?: { [key:string]: { hits: number } } }; }

// 10. Discrimination (discrim)
interface DiscrimItem { title?: string; desc?: string; }
interface DiscrimData { word?: string; discrims?: DiscrimItem[]; }

// Root Response
interface YoudaoResponse {
  ec?: EcData;
  collins?: CollinsData;
  phrs?: PhrsData;
  syno?: SynoData;
  rel_word?: RelWordData;
  etym?: EtymData;
  blng_sents_part?: BilingualSentenceData;
  ee?: EeData;
  special?: SpecialData;
  discrim?: DiscrimData;
}

// --- Navigation Config ---
const SECTIONS = [
  { id: 'basic', label: '基础释义', icon: Hash },
  { id: 'collins', label: '柯林斯双解', icon: Star },
  { id: 'ee', label: '英英释义', icon: Globe },
  { id: 'special', label: '专业释义', icon: Briefcase },
  { id: 'phrases', label: '常用词组', icon: Layers },
  { id: 'synonyms', label: '同近义词', icon: Share2 },
  { id: 'discrim', label: '词义辨析', icon: Split },
  { id: 'roots', label: '词根词源', icon: GitBranch },
  { id: 'etym', label: '词源典故', icon: History },
  { id: 'sentences', label: '双语例句', icon: Quote },
];

export const WordDetail: React.FC<WordDetailProps> = ({ word, onBack }) => {
  const [data, setData] = useState<YoudaoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('basic');

  // Refs for scrolling
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const observer = useRef<IntersectionObserver | null>(null);

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

  // Scroll Spy Logic
  useEffect(() => {
    if (loading || !data) return;

    // Disconnect old observer
    if (observer.current) observer.current.disconnect();

    const options = {
      root: null,
      rootMargin: '-20% 0px -70% 0px', // Trigger when section is near top
      threshold: 0
    };

    observer.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, options);

    Object.values(sectionRefs.current).forEach(el => {
      if (el) observer.current?.observe(el);
    });

    return () => observer.current?.disconnect();
  }, [data, loading]);

  const scrollToSection = (id: string) => {
    const el = sectionRefs.current[id];
    if (el) {
      // Offset for fixed header
      const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-slate-500 text-sm">正在深度查询 "{word}" 的全科释义...</p>
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
  const ee = data.ee?.word?.trs || [];
  const special = data.special?.co_list || [];
  const discrim = data.discrim?.discrims || [];

  // Helper to determine which sections have data
  const hasData = (id: string) => {
      switch(id) {
          case 'basic': return !!ec;
          case 'collins': return !!collins;
          case 'ee': return ee.length > 0;
          case 'special': return special.length > 0;
          case 'phrases': return phrases.length > 0;
          case 'synonyms': return synonyms.length > 0;
          case 'roots': return roots.length > 0;
          case 'etym': return !!etym;
          case 'sentences': return sentences.length > 0;
          case 'discrim': return discrim.length > 0;
          default: return false;
      }
  };

  const activeSectionsList = SECTIONS.filter(s => hasData(s.id));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      
      {/* 1. Navbar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 h-16 flex items-center shadow-sm">
          <button onClick={onBack} className="p-2 -ml-2 mr-4 hover:bg-slate-100 rounded-full transition text-slate-500 hover:text-slate-800">
              <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-slate-800 capitalize truncate font-serif">{word}</h1>
          <div className="ml-auto flex items-center gap-3">
              <a href={`https://dict.youdao.com/result?word=${word}&lang=en`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 font-medium hover:underline flex items-center bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 transition">
                  <Globe className="w-3.5 h-3.5 mr-1.5" /> 网页版
              </a>
          </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
              
              {/* 2. Left Sidebar Navigation */}
              <nav className="hidden lg:block w-64 shrink-0 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar pr-2">
                  <div className="space-y-1">
                      {activeSectionsList.map(section => (
                          <button
                              key={section.id}
                              onClick={() => scrollToSection(section.id)}
                              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                                  activeSection === section.id 
                                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                                  : 'text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-sm'
                              }`}
                          >
                              <section.icon className={`w-4 h-4 mr-3 ${activeSection === section.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                              {section.label}
                          </button>
                      ))}
                  </div>
              </nav>

              {/* 3. Main Content Area */}
              <div className="flex-1 w-full space-y-8 min-w-0">
                  
                  {/* Basic Info */}
                  <div id="basic" ref={el => sectionRefs.current['basic'] = el} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500 pointer-events-none">
                          <BookOpen className="w-48 h-48" />
                      </div>
                      
                      <div className="relative z-10">
                          <div className="flex flex-col md:flex-row md:items-end gap-4 mb-5">
                              <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight font-serif">{word}</h1>
                              
                              <div className="flex gap-3 mb-1.5">
                                  {wordInfo?.ukphone && (
                                      <div className="flex items-center gap-2 cursor-pointer bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition group/sound select-none" onClick={() => playWordAudio(word, 'UK')}>
                                          <span className="text-xs font-bold text-slate-400 group-hover/sound:text-blue-500">UK</span>
                                          <span className="font-mono text-sm text-slate-600 group-hover/sound:text-blue-700">/{wordInfo.ukphone}/</span>
                                          <Volume2 className="w-3.5 h-3.5 text-slate-400 group-hover/sound:text-blue-600" />
                                      </div>
                                  )}
                                  {wordInfo?.usphone && (
                                      <div className="flex items-center gap-2 cursor-pointer bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition group/sound select-none" onClick={() => playWordAudio(word, 'US')}>
                                          <span className="text-xs font-bold text-slate-400 group-hover/sound:text-blue-500">US</span>
                                          <span className="font-mono text-sm text-slate-600 group-hover/sound:text-blue-700">/{wordInfo.usphone}/</span>
                                          <Volume2 className="w-3.5 h-3.5 text-slate-400 group-hover/sound:text-blue-600" />
                                      </div>
                                  )}
                              </div>
                          </div>

                          {tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-6">
                                  {tags.map((tag, i) => (
                                      <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-white border border-slate-200 text-slate-500 shadow-sm">
                                          {tag}
                                      </span>
                                  ))}
                              </div>
                          )}

                          <div className="space-y-3">
                              {wordInfo?.trs?.map((trWrapper, idx) => {
                                  const def = trWrapper.tr?.[0]?.l?.i?.[0];
                                  if (!def) return null;
                                  // Split POS and Def if possible (basic heuristic)
                                  const match = def.match(/^([a-z]+\.)\s*(.*)/);
                                  return (
                                      <div key={idx} className="flex items-start gap-3 text-lg text-slate-700">
                                          {match ? (
                                              <>
                                                  <span className="font-serif font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded text-base italic">{match[1]}</span>
                                                  <span className="font-medium pt-0.5">{match[2]}</span>
                                              </>
                                          ) : (
                                              <span className="font-medium">{def}</span>
                                          )}
                                      </div>
                                  );
                              })}
                          </div>
                      </div>
                  </div>

                  {/* Collins */}
                  {hasData('collins') && (
                      <div id="collins" ref={el => sectionRefs.current['collins'] = el} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                          <div className="bg-amber-50/50 px-8 py-5 border-b border-amber-100 flex items-center justify-between">
                              <h3 className="font-bold text-amber-900 flex items-center text-lg">
                                  <Star className="w-5 h-5 mr-2 text-amber-500 fill-amber-500" />
                                  柯林斯英汉双解
                              </h3>
                              {collins?.star !== undefined && (
                                  <div className="flex items-center bg-white px-3 py-1 rounded-full border border-amber-100 shadow-sm">
                                      <span className="text-xs font-bold text-amber-800 mr-2 uppercase">Usage Level</span>
                                      <div className="flex">
                                          {[...Array(5)].map((_, i) => (
                                              <Star key={i} className={`w-3.5 h-3.5 ${i < (collins.star || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                                          ))}
                                      </div>
                                  </div>
                              )}
                          </div>
                          
                          <div className="divide-y divide-slate-100">
                              {collins?.entries?.entry?.map((entry, eIdx) => (
                                  <div key={eIdx}>
                                      {entry.tran_entry?.map((te, tIdx) => (
                                          <div key={tIdx} className="p-8 hover:bg-slate-50/50 transition group">
                                              <div className="flex gap-5">
                                                  <div className="shrink-0 flex flex-col items-center w-8 pt-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
                                                      <span className="text-xs font-bold bg-slate-200 text-slate-600 w-6 h-6 flex items-center justify-center rounded-full">
                                                          {tIdx + 1}
                                                      </span>
                                                  </div>
                                                  
                                                  <div className="flex-1 space-y-4">
                                                      <div className="flex flex-wrap items-baseline gap-2">
                                                          {te.pos_entry?.pos && (
                                                              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase tracking-wide">
                                                                  {te.pos_entry.pos}
                                                              </span>
                                                          )}
                                                          <div 
                                                            className="text-base text-slate-800 font-medium leading-relaxed [&>b]:text-slate-900 [&>b]:bg-yellow-100 [&>b]:px-1 [&>b]:rounded"
                                                            dangerouslySetInnerHTML={{ __html: te.tran || '' }} 
                                                          />
                                                      </div>
                                                      
                                                      {te.exam_sents && te.exam_sents.length > 0 && (
                                                          <div className="space-y-3 pt-2">
                                                              {te.exam_sents.slice(0, 3).map((ex, exIdx) => (
                                                                  <div key={exIdx} className="flex gap-3 pl-2 border-l-2 border-slate-100 hover:border-blue-300 transition-colors cursor-pointer group/ex" onClick={() => playWordAudio(ex.sent_orig || '', 'US')}>
                                                                      <Volume2 className="w-4 h-4 text-slate-300 mt-0.5 shrink-0 group-hover/ex:text-blue-500 transition-colors" />
                                                                      <div>
                                                                          <p className="text-sm text-slate-700 font-medium group-hover/ex:text-blue-700 transition-colors">
                                                                              {ex.sent_orig}
                                                                          </p>
                                                                          <p className="text-sm text-slate-500 mt-0.5">
                                                                              {ex.sent_trans}
                                                                          </p>
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

                  {/* English-English */}
                  {hasData('ee') && (
                      <div id="ee" ref={el => sectionRefs.current['ee'] = el} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                              <Globe className="w-5 h-5 text-indigo-500" />
                              <h3 className="text-lg font-bold text-slate-800">英英释义 (English Definition)</h3>
                          </div>
                          <div className="space-y-6">
                              {ee.map((item, idx) => (
                                  <div key={idx} className="flex gap-4">
                                      <div className="shrink-0 w-16 text-right">
                                          <span className="text-xs font-bold font-serif text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100 italic">
                                              {item.pos}
                                          </span>
                                      </div>
                                      <ul className="flex-1 list-disc list-outside ml-4 space-y-2 marker:text-slate-300">
                                          {item.tr?.map((t, tIdx) => (
                                              <li key={tIdx} className="text-sm text-slate-700 leading-relaxed pl-1">
                                                  {t.l?.i}
                                              </li>
                                          ))}
                                      </ul>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

                  {/* Professional / Special */}
                  {hasData('special') && (
                      <div id="special" ref={el => sectionRefs.current['special'] = el} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                              <Briefcase className="w-5 h-5 text-slate-600" />
                              <h3 className="text-lg font-bold text-slate-800">专业释义 (Professional)</h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {special.map((field, idx) => (
                                  <div key={idx} className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 pb-2 border-b border-slate-200">
                                          {field.gene}
                                      </div>
                                      <ul className="space-y-2">
                                          {field.entries?.slice(0, 5).map((e, eIdx) => (
                                              <li key={eIdx} className="flex justify-between items-start text-sm">
                                                  <span className="text-slate-600 mr-2">{e.k}</span>
                                                  <span className="font-medium text-slate-800 text-right">{e.v}</span>
                                              </li>
                                          ))}
                                      </ul>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

                  {/* Phrases */}
                  {hasData('phrases') && (
                      <div id="phrases" ref={el => sectionRefs.current['phrases'] = el} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
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
                      </div>
                  )}

                  {/* Synonyms */}
                  {hasData('synonyms') && (
                      <div id="synonyms" ref={el => sectionRefs.current['synonyms'] = el} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
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
                      </div>
                  )}

                  {/* Discrimination */}
                  {hasData('discrim') && (
                      <div id="discrim" ref={el => sectionRefs.current['discrim'] = el} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                              <Split className="w-5 h-5 text-orange-500" />
                              <h3 className="text-lg font-bold text-slate-800">词义辨析 (Discrimination)</h3>
                          </div>
                          <div className="space-y-6">
                              {discrim.map((item, idx) => (
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
                      </div>
                  )}

                  {/* Roots */}
                  {hasData('roots') && (
                      <div id="roots" ref={el => sectionRefs.current['roots'] = el} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
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
                      </div>
                  )}

                  {/* Etymology */}
                  {hasData('etym') && (
                      <div id="etym" ref={el => sectionRefs.current['etym'] = el} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                              <History className="w-5 h-5 text-amber-600" />
                              <h3 className="text-lg font-bold text-slate-800">词源典故 (Etymology)</h3>
                          </div>
                          <div className="prose prose-sm prose-slate max-w-none bg-amber-50/50 p-6 rounded-xl border border-amber-100 text-slate-700 leading-relaxed font-serif">
                              <p className="font-bold text-lg mb-2 text-amber-900">{etym?.word}</p>
                              <p>{etym?.desc}</p>
                              {etym?.source && <p className="text-xs text-amber-500/60 mt-4 text-right">—— {etym.source}</p>}
                          </div>
                      </div>
                  )}

                  {/* Bilingual Sentences */}
                  {hasData('sentences') && (
                      <div id="sentences" ref={el => sectionRefs.current['sentences'] = el} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                              <Quote className="w-5 h-5 text-blue-500" />
                              <h3 className="text-lg font-bold text-slate-800">双语例句 (Sentences)</h3>
                          </div>
                          <div className="space-y-4">
                              {sentences.slice(0, 8).map((s, idx) => (
                                  <div key={idx} className="group cursor-pointer p-4 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100" onClick={() => s["sentence-audio"] && playUrl(s["sentence-audio"])}>
                                      <div className="flex gap-4">
                                          <div className="mt-1 w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                                              {idx + 1}
                                          </div>
                                          <div className="flex-1">
                                              <p className="text-base text-slate-800 mb-1.5 group-hover:text-blue-700 transition-colors leading-relaxed" dangerouslySetInnerHTML={{ __html: s.sentence || '' }} />
                                              <p className="text-sm text-slate-500">{s.translation}</p>
                                          </div>
                                          {s["sentence-audio"] && <Volume2 className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity mt-1.5" />}
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

                  <div className="text-center py-8 text-slate-400 text-xs">
                      © ContextLingo - Data Sources: Youdao, Collins
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};
