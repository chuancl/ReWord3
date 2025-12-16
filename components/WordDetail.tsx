
import React, { useEffect, useState, useRef } from 'react';
import { Volume2, ArrowLeft, ArrowRight, BookOpen, Star, Layers, Share2, Quote, GitBranch, Globe, Loader2, Tag, History, GraduationCap, Briefcase, Split, AlignLeft, Hash, Image as ImageIcon, Youtube, Music, Tv, FileQuestion, Network, BarChart2 } from 'lucide-react';
import { playWordAudio, playUrl } from '../utils/audio';

interface WordDetailProps {
  word: string;
  onBack: () => void;
}

// Helper to handle API inconsistency (single object vs array)
const toArray = <T,>(candidate: T | T[] | undefined | null): T[] => {
    if (candidate === undefined || candidate === null) return [];
    return Array.isArray(candidate) ? candidate : [candidate];
};

// --- 1. Basic / EC / Expand EC ---
interface WfObject { name?: string; value?: string; }
interface WfItem { wf?: WfObject; }
interface TrObject { l?: { i?: string[] }; }
interface EcWord { 
    usphone?: string; 
    ukphone?: string; 
    trs?: { tr?: TrObject[]; }[]; 
    return_phrase?: { l?: { i?: string } };
    wfs?: WfItem[]; 
}
interface EcData { word?: EcWord[]; exam_type?: string[]; }

interface ExpandEcItem { transList?: { content?: { sents?: { sentOrig?: string; sentTrans?: string }[] }; trans?: string; }[]; pos?: string; }
interface ExpandEcData { word?: ExpandEcItem[]; }

// --- 2. Collins & Collins Primary ---
interface CollinsSentence { sent_orig?: string; sent_trans?: string; }
interface CollinsTranEntry { 
    pos_entry?: { pos?: string; pos_tips?: string }; 
    tran?: string; 
    exam_sents?: CollinsSentence[] | CollinsSentence; 
}
interface CollinsEntry {
    tran_entry?: CollinsTranEntry[] | CollinsTranEntry;
}
interface CollinsEntryWrapper { 
    entry?: CollinsEntry[] | CollinsEntry; 
}
// Updated: collins_entries is an array representing "super headwords" groups
interface CollinsData { 
    collins_entries?: { 
        entries?: CollinsEntryWrapper; 
        star?: number; 
        headword?: string;
    }[]; 
}

interface CollinsPrimaryExample {
    example?: string;
    tran?: string;
    sense?: { word?: string }; // Added for nested translation structure
}

interface CollinsPrimarySense { 
    definition?: string; 
    word?: string; 
    examples?: CollinsPrimaryExample[]; 
}

interface CollinsPrimaryGramcat { 
    partofspeech?: string; 
    senses?: CollinsPrimarySense[]; 
    audio?: string; 
    audiourl?: string; // Added for Collins audio
}

interface CollinsPrimaryData { gramcat?: CollinsPrimaryGramcat[]; words?: { word?: string }; }

// --- 3. Phrases & Synonyms & Roots ---
interface PhrItem { headword?: { l?: { i?: string } }; trs?: { tr?: { l?: { i?: string } }[]; }[]; }
interface PhrsData { phrs?: PhrItem[]; }
interface SynoItem { pos?: string; tran?: string; ws?: { w?: string }[]; }
interface SynoData { synos?: { syno?: SynoItem; }[]; }
interface RelItem { pos?: string; words?: { word?: string; tran?: string }[]; }
interface RelWordData { rels?: { rel?: RelItem; }[]; }

// --- 4. Etymology ---
interface EtymItem { word?: string; desc?: string; source?: string; }
interface EtymData { etyms?: { zh?: EtymItem; en?: EtymItem }; }

// --- 5. Sentences (Bilingual & Media) ---
interface SentencePair { "sentence-eng"?: string; "sentence-translation"?: string; "sentence-speech"?: string; source?: string; }
interface BilingualSentenceData { "sentence-pair"?: SentencePair[]; }

interface MediaSentSnippet { name?: string; source?: string; streamUrl?: string; imageUrl?: string; sw?: string; } // sw = sentence word highlight?
interface MediaSentItem { eng?: string; chn?: string; snippets?: { snippet?: MediaSentSnippet[] }; }
interface MediaSentsPartData { sent?: MediaSentItem[]; }

// --- 6. EE (English-English) ---
interface EeItem { pos?: string; tr?: { l?: { i?: string }; "similar-words"?: string[] }[]; }
interface EeData { word?: { trs?: EeItem[] }; }

// --- 7. Images (pic_dict) ---
interface PicItem { image?: string; host?: string; }
interface PicDictData { pic?: PicItem[]; }

// --- 8. Videos (word_video, video_sents) ---
interface WordVideoItem { video?: { title?: string; cover?: string; url?: string; }; }
interface WordVideoData { word_videos?: WordVideoItem[]; }

interface VideoSentItem { sents?: { eng?: string; chn?: string }[]; cover?: string; url?: string; source?: string; }
interface VideoSentsData { video_sent?: VideoSentItem[]; }

// --- 9. Music (music_sents) ---
interface MusicSentItem { sents?: { eng?: string; chn?: string }[]; song_name?: string; singer?: string; url?: string; cover?: string; }
interface MusicSentsData { music_sent?: MusicSentItem[]; }

// --- 10. Wikipedia & Web Trans ---
interface WikiDigestData { summarys?: { summary?: string; key?: string }[]; source?: { name?: string; url?: string }; }
interface WebTransItem { key?: string; trans?: { value?: string; support?: number }[]; }
interface WebTransData { web_translation?: WebTransItem[]; }

// --- 11. Exams (individual) ---
interface ExamQuestion { question?: string; answer?: string; choices?: string[]; source?: string; } // Hypothetical structure, adapting to common fields
interface IndividualData { idiomatic?: { level?: string; exam?: { question?: string; answer?: { explain?: string }; choices?: { choice?: string }[] }[] }[]; }

// --- 12. Special (Stats) ---
interface SpecialData { summary?: { sources?: { [key:string]: { hits: number } } }; co_list?: { gene?: string; entries?: { k?: string; v?: string }[] }[]; }

// Root Response
interface YoudaoResponse {
  ec?: EcData;
  expand_ec?: ExpandEcData;
  collins?: CollinsData;
  collins_primary?: CollinsPrimaryData;
  ee?: EeData;
  
  phrs?: PhrsData;
  syno?: SynoData;
  rel_word?: RelWordData;
  etym?: EtymData;
  
  blng_sents_part?: BilingualSentenceData;
  media_sents_part?: MediaSentsPartData;
  video_sents?: VideoSentsData;
  music_sents?: MusicSentsData;
  word_video?: WordVideoData;
  
  pic_dict?: PicDictData;
  wikipedia_digest?: WikiDigestData;
  web_trans?: WebTransData;
  
  special?: SpecialData;
  individual?: IndividualData;
  discrim?: { discrims?: { title?: string; desc?: string }[] };
}

// --- Navigation Config ---
const SECTIONS = [
  { id: 'basic', label: '基础释义', icon: Hash },
  { id: 'images', label: '单词配图', icon: ImageIcon },
  { id: 'expand_ec', label: '扩展释义', icon: BookOpen },
  { id: 'collins_primary', label: '柯林斯 (新)', icon: Star },
  { id: 'collins_old', label: '柯林斯 (旧)', icon: Star },
  { id: 'ee', label: '英英释义', icon: Globe },
  { id: 'video_lecture', label: '视频讲解', icon: Youtube },
  { id: 'video_scene', label: '实景视频', icon: Tv },
  { id: 'music', label: '原声歌曲', icon: Music },
  { id: 'phrases', label: '常用词组', icon: Layers },
  { id: 'synonyms', label: '同近义词', icon: Share2 },
  { id: 'discrim', label: '词义辨析', icon: Split },
  { id: 'roots', label: '词根词源', icon: GitBranch },
  { id: 'etym', label: '词源典故', icon: History },
  { id: 'sentences', label: '双语例句', icon: Quote },
  { id: 'media_sents', label: '原声例句', icon: Volume2 },
  { id: 'exams', label: '考试真题', icon: FileQuestion },
  { id: 'web_trans', label: '网络释义', icon: Network },
  { id: 'wiki', label: '维基百科', icon: BookOpen },
  { id: 'stats', label: '词频统计', icon: BarChart2 },
];

const SourceBadge = ({ source }: { source: string }) => (
    <div className="mt-4 pt-3 border-t border-slate-50 flex justify-end">
        <span className="text-[10px] text-slate-300 font-mono tracking-wide uppercase">Source: {source}</span>
    </div>
);

export const WordDetail: React.FC<WordDetailProps> = ({ word, onBack }) => {
  const [data, setData] = useState<YoudaoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('basic');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

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
    if (observer.current) observer.current.disconnect();

    const options = {
      root: null,
      rootMargin: '-20% 0px -70% 0px', 
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
      const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  const handlePrevImage = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setActiveImageIndex(prev => Math.max(0, prev - 1));
  };
  
  const handleNextImage = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setActiveImageIndex(prev => Math.min(images.length - 1, prev + 1));
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
                  <BookOpen className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-slate-800 mb-2">查询失败</h2>
                  <p className="text-slate-500 mb-6">{error || '未找到该单词的详细释义。'}</p>
                  <button onClick={onBack} className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition">
                      返回上一页
                  </button>
              </div>
          </div>
      );
  }

  // --- Extract Data ---
  const ec = data.ec;
  const expandEc = data.expand_ec?.word || [];
  const wordInfo = ec?.word?.[0];
  const tags = ec?.exam_type || [];
  const collinsEntries = data.collins?.collins_entries || [];
  const collinsPrimary = data.collins_primary?.gramcat || [];
  const ee = data.ee?.word?.trs || [];
  
  const phrases = data.phrs?.phrs || [];
  const synonyms = data.syno?.synos || [];
  const roots = data.rel_word?.rels || [];
  const etym = data.etym?.etyms?.zh || data.etym?.etyms?.en; 
  
  const sentences = data.blng_sents_part?.["sentence-pair"] || [];
  const mediaSents = data.media_sents_part?.sent || [];
  const videoSents = data.video_sents?.video_sent || [];
  const musicSents = data.music_sents?.music_sent || [];
  const wordVideos = data.word_video?.word_videos || [];
  
  const images = data.pic_dict?.pic || [];
  const wiki = data.wikipedia_digest?.summarys || [];
  const webTrans = data.web_trans?.web_translation || [];
  const exams = data.individual?.idiomatic || [];
  const stats = data.special;
  const discrim = data.discrim?.discrims || [];

  // Helper to determine which sections have data
  const hasData = (id: string) => {
      switch(id) {
          case 'basic': return !!ec;
          case 'images': return images.length > 0;
          case 'expand_ec': return expandEc.length > 0;
          case 'collins_primary': return collinsPrimary.length > 0;
          case 'collins_old': return collinsEntries.length > 0;
          case 'ee': return ee.length > 0;
          case 'video_lecture': return wordVideos.length > 0;
          case 'video_scene': return videoSents.length > 0;
          case 'music': return musicSents.length > 0;
          case 'phrases': return phrases.length > 0;
          case 'synonyms': return synonyms.length > 0;
          case 'roots': return roots.length > 0;
          case 'etym': return !!etym;
          case 'sentences': return sentences.length > 0;
          case 'media_sents': return mediaSents.length > 0;
          case 'exams': return exams.length > 0;
          case 'web_trans': return webTrans.length > 0;
          case 'wiki': return wiki.length > 0;
          case 'stats': return !!stats && (!!stats.summary || !!stats.co_list);
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
                  
                  {/* Basic Info (Images removed from here) */}
                  <div id="basic" ref={el => sectionRefs.current['basic'] = el} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 relative overflow-hidden group">
                      <div className="flex flex-col gap-4">
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

                              {/* WFS (Word Forms) Section */}
                              {wordInfo?.wfs && wordInfo.wfs.length > 0 && (
                                  <div className="flex flex-wrap gap-x-4 gap-y-2 mb-5 text-sm">
                                      {wordInfo.wfs.map((item, i) => (
                                          <div key={i} className="flex items-center text-slate-600 bg-slate-100/50 px-2 py-1 rounded border border-slate-200/50">
                                              <span className="text-slate-400 mr-1.5 text-xs scale-90 origin-right">{item.wf?.name}</span>
                                              <span className="font-semibold text-slate-700">{item.wf?.value}</span>
                                          </div>
                                      ))}
                                  </div>
                              )}

                              <div className="space-y-3">
                                  {wordInfo?.trs?.map((trWrapper, idx) => {
                                      const def = trWrapper.tr?.[0]?.l?.i?.[0];
                                      if (!def) return null;
                                      const match = def.match(/^([a-z]+\.)\s*(.*)/);
                                      return (
                                          <div key={idx} className="flex items-start gap-3 text-lg text-slate-700">
                                              {match ? (
                                                  <>
                                                      <span className="font-serif font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded text-base italic min-w-[3rem] text-center">{match[1]}</span>
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
                          <SourceBadge source="ec" />
                      </div>
                  </div>

                  {/* Images Section (3D Coverflow Carousel) */}
                  {hasData('images') && (
                      <div id="images" ref={el => sectionRefs.current['images'] = el} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                              <ImageIcon className="w-5 h-5 text-rose-500" />
                              <h3 className="text-lg font-bold text-slate-800">单词配图 (Images)</h3>
                          </div>
                          
                          {/* 3D Stage */}
                          <div className="relative w-full h-[400px] flex items-center justify-center bg-slate-900 rounded-xl overflow-hidden group select-none perspective-1000">
                              
                              {/* Background Glow */}
                              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-blue-500/10 blur-[100px] rounded-full"></div>
                              </div>

                              {images.map((img, idx) => {
                                  const offset = idx - activeImageIndex;
                                  const absOffset = Math.abs(offset);
                                  
                                  // Visibility Optimization: Only render nearby items
                                  if (absOffset > 2) return null;

                                  // 3D Transform Calculation
                                  const isActive = offset === 0;
                                  const xTranslate = offset * 55; // 55% shift per item
                                  const scale = 1 - (absOffset * 0.15); // Scale down neighbors
                                  const rotateY = offset > 0 ? -45 : (offset < 0 ? 45 : 0); // Rotate inward
                                  const zIndex = 10 - absOffset;
                                  const opacity = 1 - (absOffset * 0.3);

                                  return (
                                      <div 
                                          key={idx}
                                          onClick={() => setActiveImageIndex(idx)}
                                          className={`absolute w-[60%] h-[75%] rounded-xl shadow-2xl transition-all duration-500 ease-out cursor-pointer origin-center
                                              ${isActive ? 'border-2 border-white/20 ring-1 ring-white/10' : 'brightness-50 hover:brightness-75'}`}
                                          style={{
                                              transform: `translateX(${xTranslate}%) scale(${scale}) perspective(1000px) rotateY(${rotateY}deg)`,
                                              zIndex: zIndex,
                                              opacity: opacity,
                                              // Ensure center alignment for absolute items
                                              left: '20%', // (100% - 60%)/2
                                          }}
                                      >
                                          <img 
                                              src={img.image} 
                                              className="w-full h-full object-cover rounded-xl" 
                                              alt={`${word} ${idx + 1}`}
                                              loading="lazy"
                                          />
                                          
                                          {/* Reflection Effect (Simple Gradient) */}
                                          {isActive && (
                                               <div className="absolute -bottom-6 left-0 right-0 h-6 bg-gradient-to-b from-white/20 to-transparent blur-sm transform scale-y-[-1] opacity-50 mask-image-gradient"></div>
                                          )}
                                      </div>
                                  );
                              })}

                              {/* Navigation Controls */}
                              {images.length > 1 && (
                                  <>
                                      <button 
                                          onClick={handlePrevImage}
                                          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 text-white shadow-lg transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed"
                                          disabled={activeImageIndex === 0}
                                      >
                                          <ArrowLeft className="w-6 h-6" />
                                      </button>
                                      <button 
                                          onClick={handleNextImage}
                                          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 text-white shadow-lg transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed"
                                          disabled={activeImageIndex === images.length - 1}
                                      >
                                          <ArrowRight className="w-6 h-6" />
                                      </button>
                                  </>
                              )}

                              {/* Indicators */}
                              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                                  {images.slice(0, 5).map((_, dotIdx) => (
                                      <div 
                                          key={dotIdx} 
                                          className={`w-2 h-2 rounded-full transition-all duration-300 ${dotIdx === activeImageIndex ? 'w-6 bg-blue-500' : 'bg-white/30 hover:bg-white/50'}`}
                                      />
                                  ))}
                              </div>
                          </div>
                          <SourceBadge source="pic_dict" />
                      </div>
                  )}

                  {/* Expand EC */}
                  {hasData('expand_ec') && (
                      <div id="expand_ec" ref={el => sectionRefs.current['expand_ec'] = el} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                              <BookOpen className="w-5 h-5 text-emerald-500" />
                              <h3 className="text-lg font-bold text-slate-800">扩展释义 (Expanded)</h3>
                          </div>
                          <div className="space-y-6">
                              {expandEc.map((item, idx) => (
                                  <div key={idx}>
                                      {item.pos && <span className="inline-block mb-2 font-serif font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 italic text-sm">{item.pos}</span>}
                                      <ul className="space-y-3 pl-2">
                                          {item.transList?.map((t, tIdx) => (
                                              <li key={tIdx} className="group">
                                                  <div className="font-medium text-slate-800">{t.trans}</div>
                                                  {t.content?.sents?.map((s, sIdx) => (
                                                      <div key={sIdx} className="mt-1.5 pl-3 border-l-2 border-slate-200 text-sm text-slate-600 group-hover:border-emerald-300 transition-colors">
                                                          <p>{s.sentOrig}</p>
                                                          <p className="text-slate-400 text-xs">{s.sentTrans}</p>
                                                      </div>
                                                  ))}
                                              </li>
                                          ))}
                                      </ul>
                                  </div>
                              ))}
                          </div>
                          <SourceBadge source="expand_ec" />
                      </div>
                  )}

                  {/* Collins Primary (New) */}
                  {hasData('collins_primary') && (
                      <div id="collins_primary" ref={el => sectionRefs.current['collins_primary'] = el} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                          <div className="bg-amber-50/50 px-8 py-5 border-b border-amber-100 flex items-center justify-between">
                              <h3 className="font-bold text-amber-900 flex items-center text-lg">
                                  <Star className="w-5 h-5 mr-2 text-amber-500 fill-amber-500" />
                                  柯林斯双解 (新)
                              </h3>
                              {/* Display highest star from all groups if available, or just from the first */}
                              {collinsEntries[0]?.star !== undefined && (
                                  <div className="flex items-center bg-white px-3 py-1 rounded-full border border-amber-100 shadow-sm">
                                      <span className="text-xs font-bold text-amber-800 mr-2 uppercase">Level</span>
                                      <div className="flex">
                                          {[...Array(5)].map((_, i) => (
                                              <Star key={i} className={`w-3.5 h-3.5 ${i < (collinsEntries[0].star || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                                          ))}
                                      </div>
                                  </div>
                              )}
                          </div>
                          
                          <div className="p-8 space-y-8">
                              {collinsPrimary.map((cat, cIdx) => (
                                  <div key={cIdx}>
                                      <div className="flex items-center gap-3 mb-4">
                                          {cat.partofspeech && (
                                              <div className="text-sm font-bold text-amber-700 bg-amber-50 inline-block px-2 py-1 rounded border border-amber-100">
                                                  {cat.partofspeech}
                                              </div>
                                          )}
                                          {cat.audiourl && (
                                              <button 
                                                  onClick={() => playUrl(cat.audiourl!)}
                                                  className="p-1.5 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
                                                  title="Play Collins Audio"
                                              >
                                                  <Volume2 className="w-4 h-4" />
                                              </button>
                                          )}
                                      </div>
                                      
                                      <div className="space-y-6">
                                          {cat.senses?.map((sense, sIdx) => (
                                              <div key={sIdx} className="flex gap-4 group">
                                                  <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold shrink-0 group-hover:bg-amber-100 group-hover:text-amber-700 transition-colors">{sIdx + 1}</div>
                                                  <div className="flex-1">
                                                      <div className="text-slate-800 font-medium mb-1">
                                                          {sense.word && <span className="mr-2 text-amber-900 font-bold">{sense.word}</span>}
                                                          {sense.definition}
                                                      </div>
                                                      {sense.examples && (
                                                          <div className="space-y-1 mt-2">
                                                              {sense.examples.map((ex, exIdx) => (
                                                                  <div key={exIdx} className="text-sm text-slate-600 pl-3 border-l-2 border-slate-200">
                                                                      <p>{ex.example}</p>
                                                                      {(ex.sense?.word || ex.tran) && (
                                                                          <p className="text-slate-400 text-xs mt-0.5">
                                                                              {ex.sense?.word || ex.tran}
                                                                          </p>
                                                                      )}
                                                                  </div>
                                                              ))}
                                                          </div>
                                                      )}
                                                  </div>
                                              </div>
                                          ))}
                                      </div>
                                  </div>
                              ))}
                          </div>
                          <SourceBadge source="collins_primary" />
                      </div>
                  )}

                  {/* Collins Old */}
                  {hasData('collins_old') && (
                      <div id="collins_old" ref={el => sectionRefs.current['collins_old'] = el} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                          <div className="bg-amber-50/50 px-8 py-5 border-b border-amber-100 flex items-center justify-between">
                              <h3 className="font-bold text-amber-900 flex items-center text-lg">
                                  <Star className="w-5 h-5 mr-2 text-amber-500" />
                                  柯林斯双解 (旧)
                              </h3>
                          </div>

                          <div className="p-8">
                              {collinsEntries.map((entryGroup, groupIdx) => (
                                  <div key={groupIdx} className="mb-10 last:mb-0">
                                      {/* Header for this group: Headword + Star */}
                                      <div className="flex items-center justify-between mb-4 bg-amber-50/30 p-3 rounded-lg border border-amber-100">
                                          <div className="flex items-baseline gap-3">
                                              <span className="font-bold text-amber-900 text-xl">{entryGroup.headword || word}</span>
                                              {collinsEntries.length > 1 && (
                                                  <span className="text-xs text-amber-700/60 font-bold uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-amber-100">Definition Group {groupIdx + 1}</span>
                                              )}
                                          </div>
                                          {entryGroup.star !== undefined && (
                                              <div className="flex items-center bg-white px-3 py-1 rounded-full border border-amber-100 shadow-sm">
                                                  <div className="flex">
                                                      {[...Array(5)].map((_, i) => (
                                                          <Star key={i} className={`w-3.5 h-3.5 ${i < (entryGroup.star || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                                                      ))}
                                                  </div>
                                              </div>
                                          )}
                                      </div>

                                      <div className="divide-y divide-slate-100">
                                          {toArray(entryGroup.entries?.entry).map((entry, eIdx) => (
                                              <div key={eIdx}>
                                                  {toArray(entry.tran_entry).map((te, tIdx) => (
                                                      <div key={tIdx} className="py-4 first:pt-0 last:pb-0">
                                                          <div className="flex gap-4">
                                                              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                                                  {/* If simple numbers are needed, use tIdx+1. Or could be dot points */}
                                                                  {tIdx + 1}
                                                              </div>
                                                              <div className="flex-1">
                                                                  {te.pos_entry && (
                                                                      <div className="mb-1">
                                                                          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mr-2">{te.pos_entry.pos}</span>
                                                                          {te.pos_entry.pos_tips && <span className="text-xs text-slate-400">({te.pos_entry.pos_tips})</span>}
                                                                      </div>
                                                                  )}
                                                                  <div className="mb-2 text-slate-800 font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: te.tran || '' }} />
                                                                  {te.exam_sents && (
                                                                      <div className="space-y-2 pl-3 border-l-2 border-slate-200 mt-2">
                                                                          {toArray(te.exam_sents).slice(0, 3).map((ex, exIdx) => (
                                                                              <div key={exIdx} className="text-sm group/ex">
                                                                                  <p className="text-slate-700 font-medium group-hover/ex:text-blue-700 transition-colors cursor-text">{ex.sent_orig}</p>
                                                                                  <p className="text-slate-400 text-xs mt-0.5">{ex.sent_trans}</p>
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
                              ))}
                          </div>
                          <SourceBadge source="collins" />
                      </div>
                  )}

                  {/* English-English */}
                  {hasData('ee') && (
                      <div id="ee" ref={el => sectionRefs.current['ee'] = el} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                              <Globe className="w-5 h-5 text-indigo-500" />
                              <h3 className="text-lg font-bold text-slate-800">英英释义 (English-English)</h3>
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
                                                  {t['similar-words'] && (
                                                      <span className="block text-xs text-slate-400 mt-1">
                                                          Synonyms: {t['similar-words'].join(', ')}
                                                      </span>
                                                  )}
                                              </li>
                                          ))}
                                      </ul>
                                  </div>
                              ))}
                          </div>
                          <SourceBadge source="ee" />
                      </div>
                  )}

                  {/* Video Lectures */}
                  {hasData('video_lecture') && (
                      <div id="video_lecture" ref={el => sectionRefs.current['video_lecture'] = el} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                              <Youtube className="w-5 h-5 text-red-600" />
                              <h3 className="text-lg font-bold text-slate-800">视频讲解</h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {wordVideos.map((v, idx) => (
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
                  {hasData('video_scene') && (
                      <div id="video_scene" ref={el => sectionRefs.current['video_scene'] = el} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                              <Tv className="w-5 h-5 text-purple-600" />
                              <h3 className="text-lg font-bold text-slate-800">实景视频</h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {videoSents.map((v, idx) => (
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
                  {hasData('music') && (
                      <div id="music" ref={el => sectionRefs.current['music'] = el} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                              <Music className="w-5 h-5 text-pink-500" />
                              <h3 className="text-lg font-bold text-slate-800">原声歌曲</h3>
                          </div>
                          <div className="space-y-4">
                              {musicSents.map((m, idx) => (
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
                          <SourceBadge source="phrs" />
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
                          <SourceBadge source="syno" />
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
                          <SourceBadge source="discrim" />
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
                          <SourceBadge source="rel_word" />
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
                          <SourceBadge source="etym" />
                      </div>
                  )}

                  {/* Bilingual Sentences */}
                  {hasData('sentences') && (
                      <div id="sentences" ref={el => sectionRefs.current['sentences'] = el} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                              <Quote className="w-5 h-5 text-blue-500" />
                              <h3 className="text-lg font-bold text-slate-800">双语例句 (Bilingual Sentences)</h3>
                          </div>
                          <div className="space-y-4">
                              {sentences.slice(0, 8).map((s, idx) => (
                                  <div key={idx} className="group cursor-pointer p-4 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100" onClick={() => s["sentence-speech"] && playUrl(`https://dict.youdao.com/dictvoice?audio=${s["sentence-speech"]}`)}>
                                      <div className="flex gap-4">
                                          <div className="mt-1 w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                                              {idx + 1}
                                          </div>
                                          <div className="flex-1">
                                              <p className="text-base text-slate-800 mb-1.5 group-hover:text-blue-700 transition-colors leading-relaxed" dangerouslySetInnerHTML={{ __html: s["sentence-eng"] || '' }} />
                                              <p className="text-sm text-slate-500">{s["sentence-translation"]}</p>
                                          </div>
                                          {s["sentence-speech"] && <Volume2 className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity mt-1.5" />}
                                      </div>
                                  </div>
                              ))}
                          </div>
                          <SourceBadge source="blng_sents_part" />
                      </div>
                  )}

                  {/* Media Sentences */}
                  {hasData('media_sents') && (
                      <div id="media_sents" ref={el => sectionRefs.current['media_sents'] = el} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                              <Volume2 className="w-5 h-5 text-teal-600" />
                              <h3 className="text-lg font-bold text-slate-800">原声例句 (Media Sentences)</h3>
                          </div>
                          <div className="space-y-4">
                              {mediaSents.map((s, idx) => (
                                  <div key={idx} className="bg-teal-50/30 p-4 rounded-xl border border-teal-100">
                                      <div className="flex gap-3">
                                          <div className="flex-1">
                                              <p className="text-slate-800 mb-1" dangerouslySetInnerHTML={{ __html: s.eng || '' }} />
                                              <p className="text-sm text-slate-500">{s.chn}</p>
                                          </div>
                                      </div>
                                      {s.snippets?.snippet && s.snippets.snippet.length > 0 && (
                                          <div className="mt-3 flex items-center justify-end gap-2">
                                              <span className="text-xs text-slate-400">来源: {s.snippets.snippet[0].source}</span>
                                              {s.snippets.snippet[0].streamUrl && (
                                                  <button 
                                                      className="p-1.5 bg-teal-100 text-teal-600 rounded-full hover:bg-teal-200 transition"
                                                      onClick={() => playUrl(s.snippets!.snippet![0].streamUrl!)}
                                                  >
                                                      <Volume2 className="w-3.5 h-3.5" />
                                                  </button>
                                              )}
                                          </div>
                                      )}
                                  </div>
                              ))}
                          </div>
                          <SourceBadge source="media_sents_part" />
                      </div>
                  )}

                  {/* Exam Questions */}
                  {hasData('exams') && (
                      <div id="exams" ref={el => sectionRefs.current['exams'] = el} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
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
                  {hasData('web_trans') && (
                      <div id="web_trans" ref={el => sectionRefs.current['web_trans'] = el} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                              <Network className="w-5 h-5 text-cyan-600" />
                              <h3 className="text-lg font-bold text-slate-800">网络释义 (Web Translation)</h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {webTrans.slice(0, 20).map((w, idx) => (
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
                  {hasData('wiki') && (
                      <div id="wiki" ref={el => sectionRefs.current['wiki'] = el} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                              <BookOpen className="w-5 h-5 text-slate-800" />
                              <h3 className="text-lg font-bold text-slate-800">维基百科 (Wikipedia)</h3>
                          </div>
                          <div className="space-y-4">
                              {wiki.map((w, idx) => (
                                  <div key={idx}>
                                      <h4 className="font-bold text-slate-700 mb-2">{w.key}</h4>
                                      <p className="text-sm text-slate-600 leading-relaxed">{w.summary}</p>
                                  </div>
                              ))}
                              {data?.wikipedia_digest?.source?.url && (
                                  <a href={data.wikipedia_digest.source.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline block text-right mt-2">
                                      Read more on Wikipedia
                                  </a>
                              )}
                          </div>
                          <SourceBadge source="wikipedia_digest" />
                      </div>
                  )}

                  {/* Stats / Special */}
                  {hasData('stats') && (
                      <div id="stats" ref={el => sectionRefs.current['stats'] = el} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
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

                  <div className="text-center py-8 text-slate-400 text-xs">
                      © ContextLingo - Data Sources: Youdao, Collins, Wikipedia
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};
