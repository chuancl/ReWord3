
import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, BookOpen, Star, Layers, Share2, Quote, GitBranch, Globe, Loader2, History, Split, Hash, Image as ImageIcon, Youtube, Music, Tv, FileQuestion, Network, Volume2, Briefcase } from 'lucide-react';
import { YoudaoResponse } from '../types/youdao';
import { BasicInfo } from './word-detail/BasicInfo';
import { ImageGallery } from './word-detail/ImageGallery';
import { ExpandEcSection } from './word-detail/ExpandEcSection';
import { CollinsSection } from './word-detail/CollinsSection';
import { EeSection } from './word-detail/EeSection';
import { MediaSection } from './word-detail/MediaSection';
import { RelationshipSection } from './word-detail/RelationshipSection';
import { SentenceSection } from './word-detail/SentenceSection';
import { WebTransSection, ExamsSection, WikiSection } from './word-detail/WebSection';
import { SpecialSection } from './word-detail/SpecialSection';

interface WordDetailProps {
  word: string;
  onBack: () => void;
}

// --- Navigation Config ---
const SECTIONS = [
  { id: 'basic', label: '基础释义', icon: Hash },
  { id: 'images', label: '单词配图', icon: ImageIcon },
  { id: 'expand_ec', label: '扩展释义', icon: BookOpen },
  { id: 'special', label: '专业释义', icon: Briefcase }, // Added Special
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

  // Helper to determine which sections have data
  const hasData = (id: string) => {
      switch(id) {
          case 'basic': return !!data.ec;
          case 'images': return (data.pic_dict?.pic?.length || 0) > 0;
          case 'expand_ec': return (data.expand_ec?.word?.length || 0) > 0;
          case 'special': return (data.special?.entries?.length || 0) > 0; // Check Special
          case 'collins_primary': return (data.collins_primary?.gramcat?.length || 0) > 0;
          case 'collins_old': return (data.collins?.collins_entries?.length || 0) > 0;
          case 'ee': return (data.ee?.word?.trs?.length || 0) > 0;
          case 'video_lecture': return (data.word_video?.word_videos?.length || 0) > 0;
          case 'video_scene': return (data.video_sents?.sents_data?.length || data.video_sents?.video_sent?.length || (data.video_sents as any)?.sent?.length || 0) > 0;
          case 'music': return (data.music_sents?.sents_data?.length || data.music_sents?.music_sent?.length || (data.music_sents as any)?.songs?.length || 0) > 0;
          case 'phrases': return (data.phrs?.phrs?.length || 0) > 0;
          case 'synonyms': return (data.syno?.synos?.length || 0) > 0;
          case 'roots': return (data.rel_word?.rels?.length || 0) > 0;
          case 'etym': return !!(data.etym?.etyms?.zh || data.etym?.etyms?.en);
          case 'sentences': return (data.blng_sents_part?.["sentence-pair"]?.length || 0) > 0;
          case 'media_sents': return (data.media_sents_part?.sent?.length || 0) > 0;
          case 'exams': return !!(data.individual?.examInfo?.questionTypeInfo?.length || data.individual?.pastExamSents?.length || data.individual?.idiomatic?.length);
          case 'web_trans': return (data.web_trans?.["web-translation"]?.length || (data.web_trans as any)?.["web_translation"]?.length || 0) > 0;
          case 'wiki': return (data.wikipedia_digest?.summarys?.length || 0) > 0;
          case 'discrim': return (data.discrim?.discrims?.length || 0) > 0;
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
                  
                  <div id="basic" ref={el => sectionRefs.current['basic'] = el}>
                      <BasicInfo word={word} ec={data.ec} />
                  </div>

                  {hasData('images') && (
                      <div id="images" ref={el => sectionRefs.current['images'] = el}>
                          <ImageGallery word={word} picDict={data.pic_dict} />
                      </div>
                  )}

                  {hasData('expand_ec') && (
                      <div id="expand_ec" ref={el => sectionRefs.current['expand_ec'] = el}>
                          <ExpandEcSection expandEc={data.expand_ec} />
                      </div>
                  )}

                  {hasData('special') && (
                      <div id="special" ref={el => sectionRefs.current['special'] = el}>
                          <SpecialSection special={data.special} />
                      </div>
                  )}

                  {(hasData('collins_primary') || hasData('collins_old')) && (
                      <div ref={el => {
                          if (hasData('collins_primary')) sectionRefs.current['collins_primary'] = el;
                          if (hasData('collins_old')) sectionRefs.current['collins_old'] = el;
                      }}>
                          <CollinsSection word={word} collinsPrimary={data.collins_primary} collinsOld={data.collins} />
                      </div>
                  )}

                  {hasData('ee') && (
                      <div id="ee" ref={el => sectionRefs.current['ee'] = el}>
                          <EeSection ee={data.ee} />
                      </div>
                  )}

                  {/* Video Lectures */}
                  {hasData('video_lecture') && (
                      <div id="video_lecture" ref={el => sectionRefs.current['video_lecture'] = el}>
                          <MediaSection 
                              wordVideos={data.word_video} 
                          />
                      </div>
                  )}

                  {/* Video Scenes */}
                  {hasData('video_scene') && (
                      <div id="video_scene" ref={el => sectionRefs.current['video_scene'] = el}>
                          <MediaSection 
                              videoSents={data.video_sents} 
                          />
                      </div>
                  )}

                  {/* Music - Separate Block */}
                  {hasData('music') && (
                      <div id="music" ref={el => sectionRefs.current['music'] = el}>
                          <MediaSection 
                              musicSents={data.music_sents} 
                          />
                      </div>
                  )}

                  {(hasData('phrases') || hasData('synonyms') || hasData('discrim') || hasData('roots') || hasData('etym')) && (
                      <div ref={el => {
                          if (hasData('phrases')) sectionRefs.current['phrases'] = el;
                          if (hasData('synonyms')) sectionRefs.current['synonyms'] = el;
                          if (hasData('discrim')) sectionRefs.current['discrim'] = el;
                          if (hasData('roots')) sectionRefs.current['roots'] = el;
                          if (hasData('etym')) sectionRefs.current['etym'] = el;
                      }}>
                          <RelationshipSection 
                              phrs={data.phrs} 
                              syno={data.syno} 
                              discrim={data.discrim}
                              relWord={data.rel_word}
                              etym={data.etym}
                          />
                      </div>
                  )}

                  {(hasData('sentences') || hasData('media_sents')) && (
                      <div ref={el => {
                          if (hasData('sentences')) sectionRefs.current['sentences'] = el;
                          if (hasData('media_sents')) sectionRefs.current['media_sents'] = el;
                      }}>
                          <SentenceSection bilingual={data.blng_sents_part} media={data.media_sents_part} />
                      </div>
                  )}

                  {/* Separated Sections for Exams, WebTrans, Wiki */}
                  {hasData('exams') && (
                      <div id="exams" ref={el => sectionRefs.current['exams'] = el}>
                          <ExamsSection individual={data.individual} />
                      </div>
                  )}

                  {hasData('web_trans') && (
                      <div id="web_trans" ref={el => sectionRefs.current['web_trans'] = el}>
                          <WebTransSection webTrans={data.web_trans} />
                      </div>
                  )}

                  {hasData('wiki') && (
                      <div id="wiki" ref={el => sectionRefs.current['wiki'] = el}>
                          <WikiSection wiki={data.wikipedia_digest} />
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
