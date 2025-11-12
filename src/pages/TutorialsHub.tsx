import React, { useState, useEffect, useCallback, SVGProps } from 'react';
import { Book, Settings, FileText, Mic, Layout, ArrowLeft, ChevronDown, Search, Rocket, Zap, Code, Users, Target, NotebookPen, LayoutDashboard, BookOpen, BrainCircuit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { topics } from './tutorialsdata';

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


const ArrowRight: React.FC<SVGProps<SVGSVGElement>> = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.width || "24"}
    height={props.height || "24"}
    viewBox="0 0 24 24"
    fill="none"
    stroke={props.stroke || "currentColor"}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`lucide lucide-arrow-right ${className || ''}`}
    {...props}
  >
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
);

const TutorialsHub: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(true);
  const navigate = useNavigate();


  // Close search results when clicking outside
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

  // ADD THIS THEME USEEFFECT HERE
  useEffect(() => {
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
  
  const renderSidebar = () => {
  if (!selectedTopic) return null;

  const currentTopic = topics[selectedTopic];

  return (
    <>
      {/* Toggle Button - always visible */}
      <button
        onClick={() => setSidebarVisible(!sidebarVisible)}
        style={{
          position: 'fixed',
          left: sidebarVisible ? '280px' : '0px',
          top: '80px',
          zIndex: 100,
          backgroundColor: '#F3F4F6',
          color: '#4B5563',
          border: '1px solid #E5E7EB',
          borderRadius: '0 8px 8px 0',
          padding: '10px 6px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '2px 0 6px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#E5E7EB';
          e.currentTarget.style.boxShadow = '2px 0 10px rgba(0, 0, 0, 0.12)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#F3F4F6';
          e.currentTarget.style.boxShadow = '2px 0 6px rgba(0, 0, 0, 0.08)';
        }}
      >
        {sidebarVisible ? (
          <ChevronDown style={{ width: '18px', height: '18px', transform: 'rotate(90deg)' }} />
        ) : (
          <ChevronDown style={{ width: '18px', height: '18px', transform: 'rotate(-90deg)' }} />
        )}
      </button>

      {/* Console Button - Top Right - only show when sidebar is visible */}
      {sidebarVisible && (
        <button
          onClick={() => navigate('/')}
          style={{
            position: 'fixed',
            right: '30px',
            top: '20px',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#2563EB',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 16px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#1D4ED8';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#2563EB';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(37, 99, 235, 0.3)';
          }}
        >
          <ArrowLeft style={{ width: '14px', height: '14px' }} />
          Console
        </button>
      )}

      {/* Sidebar - conditionally rendered */}
      {sidebarVisible && (
        <div
          style={{
            width: '280px',
            height: '100vh',
            backgroundColor: '#f9fafb',
            borderRight: '1px solid #e5e7eb',
            overflowY: 'auto',
            padding: '20px 0',
            flexShrink: 0,
            transition: 'all 0.3s ease',
          }}
        >
          <div style={{ padding: '0 20px 20px 20px' }}>
            <button
              onClick={() => {
                setSelectedTopic(null);
                setSelectedArticle(null);
              }}
              style={{
                fontSize: '13px',
                color: '#4b5563',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 500,
                padding: '6px 10px',
                borderRadius: '6px',
                transition: 'background-color 0.2s, color 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = '#111827';
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = '#4b5563';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <ArrowLeft style={{ width: '14px', height: '14px' }} />
              Back to topics
            </button>

            <h2
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#111827',
                marginBottom: '8px',
              }}
            >
              {currentTopic.cardTitle}
            </h2>
            <p
              style={{
                fontSize: '13px',
                color: '#6b7280',
                lineHeight: '1.5',
              }}
            >
              {currentTopic.cardDescription}
            </p>
          </div>

          <div style={{ padding: '0 12px' }}>
            {currentTopic.items.map((item) => (
              <div key={item.id} style={{ marginBottom: '12px' }}>
                <button
                  onClick={() => {
                    const firstQuestion = item.questions?.[0];
                    if (firstQuestion) {
                      setSelectedArticle(firstQuestion.id);
                    } else {
                      setSelectedArticle(item.id);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor:
                      selectedArticle === item.id ||
                      item.questions?.some((q: Question) => q.id === selectedArticle)
                        ? '#DBEAFE'
                        : 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '15px',
                    fontWeight: 600,
                    color:
                      selectedArticle === item.id ||
                      item.questions?.some((q: Question) => q.id === selectedArticle)
                        ? '#1E40AF'
                        : '#111827',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseOver={(e) => {
                    if (
                      selectedArticle !== item.id &&
                      !item.questions?.some((q: Question) => q.id === selectedArticle)
                    )
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                  }}
                  onMouseOut={(e) => {
                    if (
                      selectedArticle !== item.id &&
                      !item.questions?.some((q: Question) => q.id === selectedArticle)
                    )
                      e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {item.title}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

  const renderArticleContent = () => {
    if (!selectedArticle) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#9ca3af',
          fontSize: '16px'
        }}>
          Select a topic from the sidebar to get started
        </div>
      );
    }

    const article = Object.values(topics)
      .flatMap(topic => topic.items)
      .flatMap(item => item.questions)
      .find(q => q.id === selectedArticle);

    if (!article) return null;

    if (article.subQuestions && article.subQuestions.length > 0) {
      return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#111827', marginBottom: '25px', lineHeight: '1.2' }}>
            {article.title}
          </h1>
          
          <div style={{
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '10px',
            padding: '20px',
            marginBottom: '30px'
          }}>
            <h2 style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '15px'
            }}>
              IN THIS ARTICLE
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {article.subQuestions.map((subQ: SubQuestion) => (
                <a
                  key={subQ.id}
                  href={`#${subQ.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: '#374151',
                    textDecoration: 'none',
                    fontSize: '15px',
                    transition: 'color 0.2s, transform 0.2s',
                    fontWeight: 500
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.color = '#2563EB'; e.currentTarget.style.transform = 'translateX(3px)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.color = '#374151'; e.currentTarget.style.transform = 'translateX(0)'; }}
                >
                  <span style={{ fontSize: '13px', color: '#9ca3af' }}>#</span>
                  {subQ.question}
                </a>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {article.subQuestions.map((subQ: SubQuestion) => (
              <div key={subQ.id} id={subQ.id} style={{ scrollMarginTop: '100px' }}>
                <h2 style={{
                  fontSize: '26px',
                  fontWeight: 700,
                  color: '#111827',
                  marginBottom: '15px',
                  lineHeight: '1.3'
                }}>
                  {subQ.question}
                </h2>
                <div
                  style={{
                    fontSize: '16px',
                    lineHeight: '1.7',
                    color: '#4b5563',
                  }}
                  dangerouslySetInnerHTML={{ __html: subQ.answer }}
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 700, color: '#111827', marginBottom: '15px', lineHeight: '1.2' }}>
          {article.title}
        </h1>
        
        <div style={{ maxWidth: '800px', lineHeight: '1.7', color: '#374151', fontSize: '17px' }}>
          
          <div
            style={{ fontSize: '16px', lineHeight: '1.7', color: '#4b5563' }}
            dangerouslySetInnerHTML={{ __html: article.details || '' }}
          />
        </div>
      </div>
    );
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const results: any[] = [];
    Object.entries(topics).forEach(([topicKey, topic]: [string, Topic]) => {
      topic.items.forEach(item => {
        item.questions.forEach((question: Question) => {
          const lowerCaseQuery = query.toLowerCase();
          const matchTitle = question.title.toLowerCase().includes(lowerCaseQuery);
          const matchDescription = question.description.toLowerCase().includes(lowerCaseQuery);
          const matchDetails = question.details && question.details.toLowerCase().includes(lowerCaseQuery);

          if (matchTitle || matchDescription || matchDetails) {
            results.push({
              ...question,
              topicKey: topicKey,
              topicTitle: topic.cardTitle,
              itemId: item.id,
              type: 'question'
            });
          }
        });
      });
    });
    
    setSearchResults(results);
    setShowSearchResults(true);
  }, []);

  const renderTopicCards = () => {
    return (
      <div style={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '0',
        boxSizing: 'border-box',
        position: 'relative',
        backgroundColor: '#F8FAFC',
        overflowY: 'auto',
      }}>
        {/* Back Button Box in Top Left */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '30px',
            zIndex: 10,
          }}
        >
          <div
            style={{
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: '10px',
              padding: '8px 14px',
              display: 'inline-flex',
              alignItems: 'center',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
            }}
          >
            <button
              onClick={() => navigate('/admin')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'transparent',
                color: '#4B5563',
                border: 'none',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                padding: '4px 6px',
                borderRadius: '6px',
                transition: 'color 0.2s, background-color 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = '#111827';
                e.currentTarget.style.backgroundColor = '#F3F4F6';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = '#4B5563';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <ArrowLeft
                style={{
                  width: '16px',
                  height: '16px',
                  color: '#6B7280',
                }}
              />
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Search Button in Top Right */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '30px',
          zIndex: 10
        }}>
          <div className="search-container" style={{ position: 'relative', width: '300px' }}>
            <input
              type="text"
              placeholder="Search tutorials..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchQuery.trim() !== '' && setShowSearchResults(true)}
              style={{
                padding: '10px 14px 10px 40px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                width: '100%',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                backgroundColor: '#f9fafb',
                fontWeight: 500,
                color: '#374151'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#2563EB';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
              }}
              onMouseOut={(e) => {
                if (document.activeElement !== e.currentTarget) {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            />
            <Search style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af',
              width: '18px',
              height: '18px'
            }} />
            
            {showSearchResults && searchResults.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '8px',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                maxHeight: '400px',
                overflowY: 'auto',
                zIndex: 100
              }}>
                <div style={{ padding: '10px 16px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#fcfcfc' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>
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
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderBottom: index < searchResults.length - 1 ? '1px solid #f3f4f6' : 'none',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <div style={{ display: 'flex', alignItems: 'start', gap: '10px' }}>
                      <span style={{ fontSize: '20px', flexShrink: 0 }}>{result.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '2px' }}>
                          {result.title}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>
                          {result.topicTitle}
                        </div>
                        <div style={{ fontSize: '12px', color: '#9ca3af', lineHeight: '1.4' }}>
                          {result.description}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Title and Buttons Block - centered at the top */}
        <div style={{
          textAlign: 'center',
          marginBottom: '30px',
          marginTop: '20px',
          width: '100%',
          maxWidth: '800px',
          position: 'relative',
          zIndex: 5,
          padding: '0 20px',
        }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 700,
            color: '#111827',
            marginBottom: '12px',
            lineHeight: '1.2'
          }}>
            SpikedAI Tutorials Hub
          </h1>

          <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: '1.5', marginBottom: '25px' }}>
            Learn step-by-step with clean, simple guided tutorials.
          </p>

          {/* Best Practices and Troubleshooting Buttons - BIGGER */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'center', marginBottom: '10px' }}>
            <button
              onClick={() => setSelectedPage('bestPractices')}
              style={{
                backgroundColor: '#2563EB',
                border: '2px solid #2563EB',
                borderRadius: '12px',
                padding: '16px 32px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 600,
                color: '#FFFFFF',
                transition: 'all 0.3s ease-in-out',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#1D4ED8';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#2563EB';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
              }}
            >
              📋 Best Practices
            </button>

            <button
              onClick={() => setSelectedPage('troubleshooting')}
              style={{
                backgroundColor: '#2563EB',
                border: '2px solid #2563EB',
                borderRadius: '12px',
                padding: '16px 32px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 600,
                color: '#FFFFFF',
                transition: 'all 0.3s ease-in-out',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#1D4ED8';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#2563EB';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
              }}
            >
              🔧 Troubleshooting
            </button>
          </div>

          <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.4', maxWidth: '600px', margin: '0 auto' }}>
            💡 Start with Best Practices to understand the fundamentals before diving into tutorials
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
          maxWidth: '1400px',
          width: '100%',
          padding: '0 30px 40px 30px',
        }}>
         {Object.entries(topics as Record<string, Topic>).map(([key, topic]) => (
  <button
    key={key}
    onClick={() => {
      setSelectedTopic(key);
      setSidebarVisible(true); // ADD THIS LINE - Reset sidebar to visible when selecting new topic
      // Automatically select the first article/question
      const firstItem = topic.items[0];
      if (firstItem) {
        const firstQuestion = firstItem.questions?.[0];
        if (firstQuestion) {
          setSelectedArticle(firstQuestion.id);
        } else {
          setSelectedArticle(firstItem.id);
        }
      }
    }}
    style={{
  
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '24px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease-in-out',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 10px rgba(0,0,0,0.04)',
                minHeight: '200px',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#2563EB';
                e.currentTarget.style.boxShadow = '0 8px 18px -4px rgba(37,99,235,0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.04)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div>
                <div style={{ color: '#2563EB', marginBottom: '12px', fontSize: '22px' }}>
                  {topic.icon}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '6px' }}>
                  {topic.cardTitle}
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
                  {topic.cardDescription}
                </p>
              </div>
              <div style={{
                fontSize: '13px',
                color: '#2563EB',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: '1px solid #EBF5FB',
                backgroundColor: '#EBF5FB',
                padding: '6px 12px',
                borderRadius: '8px',
                width: 'fit-content',
                marginTop: '12px'
              }}>
                Start Tutorial
                <ArrowRight style={{ width: '14px', height: '14px', stroke: '#2563EB' }} />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderSpecialPage = () => {
    if (selectedPage === 'bestPractices') {
      return (
        <div style={{ width: '100vw', minHeight: '100vh', backgroundColor: '#ffffff', overflowY: 'auto' }}>
          {/* Back Button */}
          <div style={{ padding: '30px 40px' }}>
            <button
              onClick={() => setSelectedPage(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'transparent',
                color: '#4B5563',
                border: 'none',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                padding: '8px 14px',
                borderRadius: '6px',
                transition: 'color 0.2s, background-color 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = '#111827';
                e.currentTarget.style.backgroundColor = '#F3F4F6';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = '#4B5563';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <ArrowLeft style={{ width: '16px', height: '16px' }} />
              Back to Tutorials Hub
            </button>
          </div>

          {/* Content */}
          <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 40px 60px 40px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: 700, color: '#111827', marginBottom: '15px' }}>
              📋 Best Practices
            </h1>
            <p style={{ fontSize: '17px', color: '#6b7280', marginBottom: '40px', lineHeight: '1.6' }}>
              Follow these essential guidelines to get the most out of SpikedAI and ensure optimal performance.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <section>
                <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
                  1. Sign Up with Single Sign-On
                </h2>
                <p style={{ fontSize: '16px', color: '#4b5563', lineHeight: '1.7' }}>
                  For the smoothest experience, we recommend signing up using Single Sign-On (SSO) with your Google account. 
                  While you can also sign up manually by entering your name and email address, using SSO provides faster access 
                  and eliminates potential sign-in issues.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
                  2. Complete Personalization Before Joining Meetings
                </h2>
                <p style={{ fontSize: '16px', color: '#4b5563', lineHeight: '1.7', marginBottom: '12px' }}>
                  <strong>This is crucial!</strong> Before you join the bot to any meeting, always set up your personalization settings first. 
                  This ensures you get the exact experience and outputs you need. Configure:
                </p>
                <ul style={{ fontSize: '16px', color: '#4b5563', lineHeight: '1.7', marginLeft: '20px', marginBottom: '12px' }}>
                  <li style={{ marginBottom: '8px' }}><strong>Custom Answer Styles:</strong> Define how you want responses formatted</li>
                  <li style={{ marginBottom: '8px' }}><strong>Customer Goals:</strong> Set your specific objectives for each meeting</li>
                  <li style={{ marginBottom: '8px' }}><strong>Meeting Focus:</strong> Specify what aspects should be prioritized</li>
                  <li style={{ marginBottom: '8px' }}><strong>System Prompt:</strong> Customize AI behavior to match your needs</li>
                </ul>
                <p style={{ fontSize: '16px', color: '#4b5563', lineHeight: '1.7', marginBottom: '12px' }}>
                  After configuring these settings, remember to <strong>save them</strong> so your changes take effect.
                </p>
                <button
                  onClick={() => {
                    setSelectedPage(null);
                    setSelectedTopic('gettingStarted');
                    setSelectedArticle('personalization-before-meeting');
                    setTimeout(() => {
                      const element = document.getElementById('personalization-before-meeting');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }, 100);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#2563EB',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 18px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#1D4ED8';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#2563EB';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(37, 99, 235, 0.2)';
                  }}
                >
                  → Go to Personalization Guide
                </button>
              </section>

              <section>
                <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
                  3. Set Your Preferred Layout
                </h2>
                <p style={{ fontSize: '16px', color: '#4b5563', lineHeight: '1.7' }}>
                  Choose the layout that works best for your workflow. You can select from multiple view options:
                </p>
                <ul style={{ fontSize: '16px', color: '#4b5563', lineHeight: '1.7', marginLeft: '20px', marginTop: '10px' }}>
                  <li style={{ marginBottom: '8px' }}><strong>Full View:</strong> See all meeting components at once</li>
                  <li style={{ marginBottom: '8px' }}><strong>Focus View:</strong> Minimize distractions for concentrated work</li>
                  <li style={{ marginBottom: '8px' }}><strong>Convo + AI:</strong> Balance between conversation and AI assistance</li>
                  <li style={{ marginBottom: '8px' }}><strong>Chat Only:</strong> Simple chat interface for quick interactions</li>
                </ul>
              </section>

              <section>
                <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
                  4. Upload Documents Before Connecting the Bot
                </h2>
                <p style={{ fontSize: '16px', color: '#4b5563', lineHeight: '1.7' }}>
                  Always upload any relevant documents, briefing materials, or reference files <strong>before</strong> you connect 
                  the bot to your meeting. This ensures the AI has full context from the start and can provide more accurate and 
                  relevant assistance during the meeting.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
                  5. Open the Note-Taker Tab
                </h2>
                <p style={{ fontSize: '16px', color: '#4b5563', lineHeight: '1.7' }}>
                  Before connecting your bot to the meeting, make sure to open the note-taker tab. This is essential to ensure 
                  that full transcripts are recorded properly. If you skip this step, you might experience issues with incomplete 
                  transcript recordings later.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
                  6. Connect Your Meeting Bot
                </h2>
                <p style={{ fontSize: '16px', color: '#4b5563', lineHeight: '1.7' }}>
                  Once you've completed all the steps above (personalization, layout setup, document upload, and note-taker tab), 
                  you're ready to paste your meeting link and connect the bot. Following this order ensures everything works smoothly 
                  and you get the best results from your AI meeting assistant.
                </p>
              </section>
            </div>
          </div>
        </div>
      );
    }

    if (selectedPage === 'troubleshooting') {
      return (
        <div style={{ width: '100vw', minHeight: '100vh', backgroundColor: '#ffffff', overflowY: 'auto' }}>
          {/* Back Button */}
          <div style={{ padding: '30px 40px' }}>
            <button
              onClick={() => setSelectedPage(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'transparent',
                color: '#4B5563',
                border: 'none',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                padding: '8px 14px',
                borderRadius: '6px',
                transition: 'color 0.2s, background-color 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = '#111827';
                e.currentTarget.style.backgroundColor = '#F3F4F6';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = '#4B5563';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <ArrowLeft style={{ width: '16px', height: '16px' }} />
              Back to Tutorials Hub
            </button>
          </div>

          {/* Content */}
          <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 40px 60px 40px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: 700, color: '#111827', marginBottom: '15px' }}>
              🔧 Troubleshooting
            </h1>
            <p style={{ fontSize: '17px', color: '#6b7280', marginBottom: '40px', lineHeight: '1.6' }}>
              Common issues and their solutions to help you resolve problems quickly.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <section>
                <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
                  Connection Issues
                </h2>
                <p style={{ fontSize: '16px', color: '#4b5563', lineHeight: '1.7', marginBottom: '10px' }}>
                  <strong>Problem:</strong> Unable to connect to the server or API endpoints.
                </p>
                <p style={{ fontSize: '16px', color: '#4b5563', lineHeight: '1.7' }}>
                  <strong>Solution:</strong> Check your internet connection, verify API credentials, and ensure firewall 
                  settings aren't blocking the connection. Try clearing browser cache and cookies if using web interface.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
                  Slow Performance
                </h2>
                <p style={{ fontSize: '16px', color: '#4b5563', lineHeight: '1.7', marginBottom: '10px' }}>
                  <strong>Problem:</strong> System running slower than expected or timing out.
                </p>
                <p style={{ fontSize: '16px', color: '#4b5563', lineHeight: '1.7' }}>
                  <strong>Solution:</strong> Reduce the size of datasets being processed, implement pagination, clear cache, 
                  and check for any background processes consuming resources. Consider upgrading your plan if consistently hitting limits.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
                  Authentication Errors
                </h2>
                <p style={{ fontSize: '16px', color: '#4b5563', lineHeight: '1.7', marginBottom: '10px' }}>
                  <strong>Problem:</strong> Getting "Unauthorized" or "Invalid credentials" errors.
                </p>
                <p style={{ fontSize: '16px', color: '#4b5563', lineHeight: '1.7' }}>
                  <strong>Solution:</strong> Regenerate API keys, verify environment variables are set correctly, and ensure 
                  tokens haven't expired. Check that you're using the correct authentication method for your integration.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
                  Data Import Failures
                </h2>
                <p style={{ fontSize: '16px', color: '#4b5563', lineHeight: '1.7', marginBottom: '10px' }}>
                  <strong>Problem:</strong> Unable to import or process uploaded files.
                </p>
                <p style={{ fontSize: '16px', color: '#4b5563', lineHeight: '1.7' }}>
                  <strong>Solution:</strong> Verify file format is supported, check file size limits, ensure data is properly 
                  formatted, and remove any special characters that might cause parsing errors.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
                  Still Having Issues?
                </h2>
                <p style={{ fontSize: '16px', color: '#4b5563', lineHeight: '1.7' }}>
                  If you've tried the above solutions and still experiencing problems, contact our support team with 
                  detailed information about the issue, error messages, and steps to reproduce the problem.
                </p>
              </section>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
  <div style={{
    width: '100vw',
    minHeight: '100vh',
    backgroundColor: '#ffffff',
    display: 'flex',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  }}>
    {selectedPage ? (
      renderSpecialPage()
    ) : selectedTopic ? (
      <>
        {renderSidebar()}
        <div style={{
          flex: 1,
          width: sidebarVisible ? 'calc(100vw - 280px)' : '100vw',
          height: '100vh',
          overflowY: 'auto',
          backgroundColor: '#ffffff',
          transition: 'width 0.3s ease'
        }}>
          {renderArticleContent()}
        </div>
      </>
    ) : (
      renderTopicCards()
    )}
  </div>
);
};

export default TutorialsHub;