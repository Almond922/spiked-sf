import React, { useState, useEffect, useCallback, SVGProps } from 'react';
import { Book, Settings, FileText, Mic, Layout, ArrowLeft, ChevronDown, Search, ChevronRight, Users, Puzzle, PenTool, LayoutGrid, Target, TrendingUp, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { topics } from './tutorialsdata';
import Heading from '../components/Heading';
import Paragraph from '../components/Paragraph';
import ImageLayout from '../components/ImageLayout';
import TableOfContents from '../components/TableOfContents';

interface Question {
  id: string;
  title: string;
  emoji: string;
  description: string;
  details?: string;
  subQuestions?: SubQuestion[];
}

interface SubQuestion {
  id: string;
  question: string;
  answer: string;
}

interface Item {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

interface Topic {
  cardId: string;
  cardTitle: string;
  cardDescription: string;
  icon: JSX.Element;
  emoji: string;
  items: Item[];
}

// Icon mapping for topics - UPDATED WITH LUCIDE ICONS
const topicIcons: Record<string, JSX.Element> = {
  personalization: <Settings size={18} />,
  content: <FileText size={18} />,
  integrations: <Puzzle size={18} />,
  noteTaker: <PenTool size={18} />,
  layout: <LayoutGrid size={18} />,
  admin: <Users size={18} />,
  coachAssist: <Bot size={18} />,
  gettingStarted: <Bot size={18} />,
  tutorials: <Book size={18} />,
  settings: <Settings size={18} />
};

const TutorialsHub: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<string>('gettingStarted');
  const [selectedArticle, setSelectedArticle] = useState<string>('signup');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    if (selectedTopic && topics[selectedTopic]) {
      const firstItem = topics[selectedTopic].items[0];
      if (firstItem) {
        const firstQuestion = firstItem.questions?.[0];
        if (firstQuestion) {
          setSelectedArticle(firstQuestion.id);
        }
      }
    }
  }, [selectedTopic]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const searchContainer = document.querySelector('.search-container');
      if (showSearchResults && searchContainer && !searchContainer.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSearchResults]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const results: any[] = [];
    Object.entries(topics as Record<string, Topic>).forEach(([topicKey, topic]) => {
      topic.items.forEach(item => {
        item.questions.forEach((question: Question) => {
          const lowerCaseQuery = query.toLowerCase();
          const matchTitle = question.title.toLowerCase().includes(lowerCaseQuery);
          const matchDescription = question.description?.toLowerCase().includes(lowerCaseQuery);

          if (matchTitle || matchDescription) {
            results.push({
              ...question,
              topicKey: topicKey,
              topicTitle: topic.cardTitle,
              itemId: item.id,
            });
          }
        });
      });
    });
    
    setSearchResults(results);
    setShowSearchResults(true);
  }, []);

  const renderArticleContent = () => {
    if (!selectedArticle) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', fontSize: '16px' }}>
          Select a topic from the sidebar to get started
        </div>
      );
    }

    const article = Object.values(topics)
      .flatMap(topic => topic.items)
      .flatMap(item => item.questions)
      .find(q => q.id === selectedArticle);

    if (!article) return null;

    return (
      <div style={{ maxWidth: '900px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#111827', marginBottom: '25px', lineHeight: '1.2' }}>
          {article.title}
        </h1>

        {article.content && article.content.map((block, index) => {
          switch (block.type) {
            case 'toc':
              return <TableOfContents key={index} links={block.links} />;
            
            case 'heading':
              return <div id={block.anchorId}><Heading key={index} text={block.text} /></div>;
            
            case 'paragraph':
              return <Paragraph key={index} htmlContent={block.text} />;
              
            case 'imageLayout':
              return (
                <ImageLayout
                  key={index}
                  htmlContent={block.htmlContent}
                  imgSrc={block.imgSrc}
                  altText={block.altText}
                />
              );
              
            default:
              return null;
          }
        })}

        {article.subQuestions && article.subQuestions.map((subQ) => (
          <div key={subQ.id} id={subQ.id} style={{ scrollMarginTop: '100px', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: 700, color: '#111827', marginBottom: '15px' }}>
              {subQ.question}
            </h2>
            <div
              style={{ fontSize: '16px', lineHeight: '1.7', color: '#4b5563' }}
              dangerouslySetInnerHTML={{ __html: subQ.answer }}
            />
          </div>
        ))}
      </div>
    );
  };

  const currentTopic = topics[selectedTopic];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* UPDATED TOP NAV - SIDEBAR WIDTH NOW 280PX */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        height: '64px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ 
          width: '280px', 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 20px',
          borderRight: '1px solid #E5E7EB',
          height: '100%'
        }}>
          <button
            onClick={() => navigate('/admin')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: '#2563EB',
              border: '1px solid #2563EB',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#2563EB';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#2563EB';
            }}
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        </div>
        
        {/* TOPIC TABS WITH LUCIDE ICONS */}
        <div style={{ display: 'flex', gap: '12px', flex: 1, padding: '0 30px', alignItems: 'center' }}>
          {Object.entries(topics as Record<string, Topic>).map(([key, topic]) => (
            <button
              key={key}
              onClick={() => setSelectedTopic(key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                backgroundColor: selectedTopic === key ? '#EFF6FF' : 'transparent',
                color: selectedTopic === key ? '#2563EB' : '#6B7280',
                border: 'none',
                borderBottom: selectedTopic === key ? '3px solid #2563EB' : '3px solid transparent',
                fontSize: '14px',
                fontWeight: selectedTopic === key ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                height: '64px',
                borderRadius: '0',
                whiteSpace: 'nowrap'
              }}
              onMouseOver={(e) => {
                if (selectedTopic !== key) {
                  e.currentTarget.style.backgroundColor = '#F9FAFB';
                  e.currentTarget.style.color = '#111827';
                }
              }}
              onMouseOut={(e) => {
                if (selectedTopic !== key) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#6B7280';
                }
              }}
            >
              {topicIcons[key] || topic.icon}
              {topic.cardTitle}
            </button>
          ))}
        </div>
        
        {/* UPDATED SEARCH BAR WIDTH */}
        <div style={{ padding: '0 20px', display: 'flex', alignItems: 'center', minWidth: '280px', maxWidth: '350px' }}>
          <div className="search-container" style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              placeholder="Search tutorials..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#2563EB';
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                if (searchQuery.trim() !== '') setShowSearchResults(true);
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#D1D5DB';
                e.currentTarget.style.backgroundColor = '#F9FAFB';
              }}
              style={{
                width: '100%',
                padding: '9px 14px 9px 38px',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s',
                backgroundColor: '#F9FAFB'
              }}
            />
            <Search 
              size={18} 
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9CA3AF'
              }} 
            />
            
            {showSearchResults && searchResults.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                marginTop: '8px',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                maxHeight: '400px',
                overflowY: 'auto',
                zIndex: 1000,
                width: '350px'
              }}>
                <div style={{
  padding: '0 20px',
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  maxWidth: '90vw'   // prevents overflow on small screens
}}>

                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {searchResults.length} Result{searchResults.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {searchResults.map((result: any, index: number) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedTopic(result.topicKey);
                      setSelectedArticle(result.id);
                      setShowSearchResults(false);
                      setSearchQuery('');
                    }}
                    style={{
                      padding: '14px 16px',
                      cursor: 'pointer',
                      borderBottom: index < searchResults.length - 1 ? '1px solid #f3f4f6' : 'none',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', lineHeight: '1.4' }}>
                        {result.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#2563EB', fontWeight: 500 }}>
                        📂 {result.topicTitle}
                      </div>
                      {result.description && (
                        <div style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.5' }}>
                          {result.description.substring(0, 100)}{result.description.length > 100 ? '...' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* UPDATED SIDEBAR WIDTH TO 280PX */}
        <aside style={{
          width: '280px',
          backgroundColor: '#F9FAFB',
          borderRight: '1px solid #E5E7EB',
          overflowY: 'auto',
          padding: '24px 0'
        }}>
          <div style={{ padding: '0 20px 20px 20px' }}>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#111827', marginBottom: '6px', letterSpacing: '-0.3px' }}>
              Questions
            </h2>
            <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.5' }}>
              Browse through {currentTopic?.items.reduce((acc, item) => acc + item.questions.length, 0)} articles
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 16px' }}>
            {currentTopic?.items.map((item) => (
              <div key={item.id}>
                {item.questions.map((question) => (
                  <button
                    key={question.id}
                    onClick={() => setSelectedArticle(question.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      backgroundColor: selectedArticle === question.id ? '#FFFFFF' : 'transparent',
                      border: selectedArticle === question.id ? '1px solid #DBEAFE' : '1px solid transparent',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: selectedArticle === question.id ? 600 : 500,
                      color: selectedArticle === question.id ? '#2563EB' : '#374151',
                      transition: 'all 0.2s',
                      boxShadow: selectedArticle === question.id ? '0 2px 8px rgba(37, 99, 235, 0.1)' : 'none',
                      width: '100%',
                      marginBottom: '4px',
                      lineHeight: '1.4'
                    }}
                    onMouseOver={(e) => {
                      if (selectedArticle !== question.id) {
                        e.currentTarget.style.backgroundColor = '#FFFFFF';
                        e.currentTarget.style.borderColor = '#E5E7EB';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (selectedArticle !== question.id) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.borderColor = 'transparent';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    <span>{question.title}</span>
                    {selectedArticle === question.id && (
                      <ChevronRight size={18} style={{ color: '#2563EB', flexShrink: 0 }} />
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </aside>

        {/* FIXED CONTENT AREA - NO MORE EXCESSIVE PADDING */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          backgroundColor: '#FFFFFF'
        }}>
          <div style={{ padding: '50px 60px', maxWidth: '1100px' }}>
            {renderArticleContent()}
          </div>
        </main>
      </div>

      <style>{`
        * {
          box-sizing: border-box;
        }
        
        h2 {
          font-size: 28px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 16px;
          margin-top: 32px;
        }
        
        h2:first-child {
          margin-top: 0;
        }
        
        p {
          margin-bottom: 16px;
        }
        
        ul, ol {
          margin-bottom: 20px;
          padding-left: 24px;
        }
        
        li {
          margin-bottom: 10px;
          line-height: 1.6;
        }
        
        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        
        ::-webkit-scrollbar-track {
          background: #F3F4F6;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #D1D5DB;
          border-radius: 5px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #9CA3AF;
        }
      `}</style>
    </div>
  );
};

export default TutorialsHub;