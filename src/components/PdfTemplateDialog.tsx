import React, { useEffect, useMemo, useState } from 'react';

interface Template {
    id: number;
    name: string;
    icon?: any;
    theme?: string;
    description?: string;
    prompt: string;
    isCustom?: boolean;
    category?: 'prebuilt' | 'custom';
}

interface CustomGoal {
    id: string;
    goal_description: string;
    evaluation_criteria?: string;
    emoji_icon?: string;
    created_at?: string;
    updated_at?: string;
}

interface CustomGoalProgress {
    goal: CustomGoal;
    is_achieved: boolean;
    evidences: Array<{
        text: string;
        timestamp: string;
        primary_speaker: string;
        match_score: number;
        segment_index: number;
    }>;
    current_evidence_index: number;
    total_evidence_count: number;
    achievement_percentage: number;
    confidence_score?: number;
    summary?: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    templates: Template[]; // includes both prebuilt and custom (allTemplates)
    transcriptText: string; // pre-joined transcript string
    sessionToken?: string | null;
    isDarkMode?: boolean;
    backendUrl?: string; // optional override for API endpoint
    customGoalsProgress?: CustomGoalProgress[]; // custom goals to include in PDF
    goalAnalysis?: Record<string, string>; // goal analysis data
    customGoals?: CustomGoal[]; // fallback custom goals list
}

const PdfTemplateDialog: React.FC<Props> = ({ isOpen, onClose, templates, transcriptText, sessionToken, isDarkMode, backendUrl, customGoalsProgress = [], goalAnalysis = {}, customGoals = [] }) => {
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [selectedGoalIds, setSelectedGoalIds] = useState<Set<string>>(new Set());
    const [includeTranscript, setIncludeTranscript] = useState(false);
    const [includeGoals, setIncludeGoals] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [progressText, setProgressText] = useState('');
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    // Use customGoalsProgress if available, otherwise create from customGoals
    const goalsToDisplay = useMemo(() => {
        return customGoalsProgress.length > 0 
            ? customGoalsProgress 
            : customGoals.map(goal => ({
                goal,
                is_achieved: false,
                evidences: [],
                current_evidence_index: 0,
                total_evidence_count: 0,
                achievement_percentage: 0,
                confidence_score: undefined,
                summary: undefined
            }));
    }, [customGoalsProgress, customGoals]);

    useEffect(() => {
        if (!isOpen) {
            setSelectedIds(new Set());
            setSelectedGoalIds(new Set());
            setIsRunning(false);
            setProgressText('');
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
                setPdfUrl(null);
            }
        }
    }, [isOpen, pdfUrl]);

    const grouped = useMemo(() => {
        return {
            prebuilt: templates.filter(t => t.category === 'prebuilt'),
            custom: templates.filter(t => t.category === 'custom')
        };
    }, [templates]);

    const toggle = (id: number) => {
        setSelectedIds(prev => {
            const copy = new Set(prev);
            if (copy.has(id)) copy.delete(id); else copy.add(id);
            return copy;
        });
    };

    const runAndGenerate = async () => {
        if ((!selectedIds || selectedIds.size === 0) && !includeTranscript && !includeGoals) {
            alert('Please select at least one template, enable Transcript, or enable Custom Goals to include in the PDF.');
            return;
        }
        if (!sessionToken) {
            alert('Not authenticated. Please sign in to run templates.');
            return;
        }

        setIsRunning(true);
        setProgressText('Preparing...');

        const chosen = templates.filter(t => selectedIds.has(t.id));
        const responses: { template: Template; response: string }[] = [];

        try {
            for (let i = 0; i < chosen.length; i++) {
                const t = chosen[i];
                setProgressText(`Running: ${t.name} (${i + 1}/${chosen.length})`);
                const resp = await fetch((backendUrl || '') + '/api/process-template', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionToken}` },
                    body: JSON.stringify({ prompt: t.prompt, transcript: transcriptText })
                });
                if (!resp.ok) {
                    const text = await resp.text();
                    responses.push({ template: t, response: `Error: ${resp.status} ${text}` });
                    continue;
                }
                const data = await resp.json();
                responses.push({ template: t, response: data.response || (data || '').toString() });
            }

            setProgressText('Generating PDF...');

            const { jsPDF } = (window as any).jspdf || {};
            if (!jsPDF) throw new Error('jspdf not found on window');
            const doc = new jsPDF();

            const accentRed = '#F44336';
            const textPrimary = '#212121';
            const textSecondary = '#757575';
            const logoBase64 = 'data:image/jpeg;base64,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';

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 20;
            const contentWidth = pageWidth - (margin * 2);
            const bottomMargin = 15;
            let yPosition: number = 40;

            const addHeader = (): void => {
                try {
                    if (logoBase64) doc.addImage(logoBase64, 'PNG', margin, 15, 8, 8);
                } catch (err) {}
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(18);
                doc.setTextColor(textPrimary);
                doc.text('SpikedAI', margin + 11, 21);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                doc.setTextColor(textSecondary);
                doc.text('Selected Templates Report', pageWidth - margin, 20, { align: 'right' });
                doc.setDrawColor(accentRed);
                doc.setLineWidth(0.5);
                doc.line(margin, 25, pageWidth - margin, 25);
            };

            const addFooter = (): void => {
                const pageCount = doc.internal.getNumberOfPages();
                doc.setFontSize(8);
                doc.setTextColor(textSecondary);
                doc.text(`Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${pageCount}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
                doc.text('Confidential & Proprietary. All right reserved to SpikedAI', margin, pageHeight - 8);
            };

            const checkPageBreak = (requiredHeight: number): void => {
                if (yPosition + requiredHeight > pageHeight - bottomMargin) {
                    addFooter(); doc.addPage(); addHeader(); yPosition = 40;
                }
            };

            const renderInlineFormatting = (text: string, x: number, y: number, maxWidth: number): { height: number } => {
                doc.setFontSize(10);
                const segments: Array<{ text: string; bold: boolean; italic: boolean }> = [];
                let remaining = text;
                while (remaining.length > 0) {
                    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
                    if (boldMatch) {
                        segments.push({ text: boldMatch[1], bold: true, italic: false });
                        remaining = remaining.slice(boldMatch[0].length);
                        continue;
                    }
                    const italicMatch = remaining.match(/^\*([^*]+)\*/);
                    if (italicMatch) {
                        segments.push({ text: italicMatch[1], bold: false, italic: true });
                        remaining = remaining.slice(italicMatch[0].length);
                        continue;
                    }
                    const nextMarker = remaining.search(/\*+/);
                    if (nextMarker === -1) {
                        segments.push({ text: remaining, bold: false, italic: false });
                        remaining = '';
                    } else {
                        segments.push({ text: remaining.slice(0, nextMarker), bold: false, italic: false });
                        remaining = remaining.slice(nextMarker);
                    }
                }
                let currentX = x;
                let currentY = y;
                let lineHeight = 5;
                let totalHeight = lineHeight;
                for (const segment of segments) {
                    if (!segment.text) continue;
                    doc.setFont('helvetica', segment.bold ? 'bold' : segment.italic ? 'italic' : 'normal');
                    const words = segment.text.split(' ');
                    for (let i = 0; i < words.length; i++) {
                        const word = words[i] + (i < words.length - 1 ? ' ' : '');
                        const wordWidth = doc.getTextWidth(word);
                        if (currentX + wordWidth > x + maxWidth && currentX > x) {
                            currentY += lineHeight;
                            currentX = x;
                            totalHeight += lineHeight;
                            checkPageBreak(10);
                        }
                        doc.text(word, currentX, currentY);
                        currentX += wordWidth;
                    }
                }
                return { height: totalHeight };
            };

            const renderMarkdown = (text: string, leftMargin: number = margin): void => {
                const lines = text.split('\n');
                let inList = false;
                for (let line of lines) {
                    const trimmedLine = line.trim();
                    if (!trimmedLine) { yPosition += 3; continue; }
                    checkPageBreak(15);
                    const h1Match = line.match(/^#\s+(.+)$/);
                    const h2Match = line.match(/^##\s+(.+)$/);
                    const h3Match = line.match(/^###\s+(.+)$/);
                    const h4Match = line.match(/^####\s+(.+)$/);
                    if (h2Match) {
                        checkPageBreak(15);
                        if (inList) { yPosition += 3; inList = false; }
                        doc.setFont('helvetica', 'bold');
                        doc.setFontSize(14);
                        doc.setTextColor(textPrimary);
                        doc.text(h2Match[1], leftMargin, yPosition);
                        yPosition += 10;
                        continue;
                    } else if (h3Match) {
                        checkPageBreak(12);
                        if (inList) { yPosition += 2; inList = false; }
                        doc.setFont('helvetica', 'bold');
                        doc.setFontSize(12);
                        doc.setTextColor(textPrimary);
                        doc.text(h3Match[1], leftMargin, yPosition);
                        yPosition += 8;
                        continue;
                    } else if (h4Match) {
                        checkPageBreak(10);
                        if (inList) { yPosition += 2; inList = false; }
                        doc.setFont('helvetica', 'bold');
                        doc.setFontSize(11);
                        doc.setTextColor(textPrimary);
                        doc.text(h4Match[1], leftMargin, yPosition);
                        yPosition += 7;
                        continue;
                    } else if (h1Match) {
                        checkPageBreak(18);
                        if (inList) { yPosition += 3; inList = false; }
                        doc.setFont('helvetica', 'bold');
                        doc.setFontSize(16);
                        doc.setTextColor(textPrimary);
                        doc.text(h1Match[1], leftMargin, yPosition);
                        yPosition += 12;
                        continue;
                    }
                    const bulletMatch = line.match(/^(\s*)([\*\-])\s+(.+)$/);
                    if (bulletMatch) {
                        const indent = bulletMatch[1].length;
                        const content = bulletMatch[3];
                        const bulletX = leftMargin + (indent * 2);
                        if (!inList) { yPosition += 2; inList = true; }
                        checkPageBreak(10);
                        doc.setFont('helvetica', 'normal');
                        doc.setFontSize(10);
                        doc.setTextColor(textPrimary);
                        doc.text('•', bulletX, yPosition);
                        const processedContent = renderInlineFormatting(content, bulletX + 5, yPosition, contentWidth - (bulletX - margin) - 5);
                        yPosition += processedContent.height;
                        continue;
                    }
                    const numberedMatch = line.match(/^(\s*)(\d+)\.\s+(.+)$/);
                    if (numberedMatch) {
                        const indent = numberedMatch[1].length;
                        const number = numberedMatch[2];
                        const content = numberedMatch[3];
                        const numberX = leftMargin + (indent * 2);
                        if (!inList) { yPosition += 2; inList = true; }
                        checkPageBreak(10);
                        doc.setFont('helvetica', 'normal');
                        doc.setFontSize(10);
                        doc.setTextColor(textPrimary);
                        doc.text(`${number}.`, numberX, yPosition);
                        const processedContent = renderInlineFormatting(content, numberX + 8, yPosition, contentWidth - (numberX - margin) - 8);
                        yPosition += processedContent.height;
                        continue;
                    }
                    if (inList) { yPosition += 3; inList = false; }
                    checkPageBreak(10);
                    const processedParagraph = renderInlineFormatting(trimmedLine, leftMargin, yPosition, contentWidth);
                    yPosition += processedParagraph.height + 3;
                }
            };

            addHeader();
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(textSecondary);
            doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);
            yPosition += 12;

            for (let i = 0; i < responses.length; i++) {
                const item = responses[i];
                checkPageBreak(30);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(12);
                doc.setTextColor(textPrimary);
                doc.text(item.template.name, margin, yPosition);
                yPosition += 8;
                renderMarkdown(item.response, margin);
                yPosition += 8;
            }

            // --- BORDERED TRANSCRIPT SECTION ---
            if (includeTranscript && transcriptText && transcriptText.trim()) {
                checkPageBreak(30);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(12);
                doc.setTextColor(textPrimary);
                doc.text('Transcript', margin, yPosition);
                yPosition += 8;

                const transcriptLines = doc.splitTextToSize(transcriptText, contentWidth - 10);
                const boxPadding = 5;
                const lineHeight = 5;

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                
                // Starting border
                doc.setDrawColor(200, 200, 200);
                let boxStartY = yPosition - 4;

                for (let i = 0; i < transcriptLines.length; i++) {
                    if (yPosition + lineHeight > pageHeight - 15) {
                        // Close border on current page
                        doc.line(margin, boxStartY, margin, yPosition); // Left
                        doc.line(pageWidth - margin, boxStartY, pageWidth - margin, yPosition); // Right
                        doc.line(margin, yPosition, pageWidth - margin, yPosition); // Bottom
                        
                        addFooter();
                        doc.addPage();
                        addHeader();
                        yPosition = 40;
                        boxStartY = yPosition - 4;
                        doc.setFontSize(9);
                    }
                    
                    // Top border for the start of any box section
                    if (yPosition === 40 || i === 0) {
                        doc.line(margin, boxStartY, pageWidth - margin, boxStartY);
                    }

                    doc.text(transcriptLines[i], margin + boxPadding, yPosition);
                    
                    // Side borders for the current line
                    doc.line(margin, yPosition - 5, margin, yPosition + 1);
                    doc.line(pageWidth - margin, yPosition - 5, pageWidth - margin, yPosition + 1);

                    yPosition += lineHeight;
                }
                // Final bottom border
                doc.line(margin, yPosition - 4, pageWidth - margin, yPosition - 4);
                yPosition += 10;
            }

            if (includeGoals && selectedGoalIds.size > 0 && goalsToDisplay.length > 0) {
                const selectedGoals = goalsToDisplay.filter(gp => selectedGoalIds.has(gp.goal.id));
                if (selectedGoals.length > 0) {
                    checkPageBreak(30);
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(12);
                    doc.setTextColor(textPrimary);
                    doc.text('Custom Goals Status & Analysis', margin, yPosition);
                    yPosition += 10;

                    for (const goalProgress of selectedGoals) {
                        checkPageBreak(25);
                        doc.setFont('helvetica', 'bold');
                        doc.setFontSize(11);
                        doc.setTextColor(textPrimary);
                        doc.text(`• ${goalProgress.goal.goal_description}`, margin, yPosition);
                        yPosition += 6;
                        doc.setFont('helvetica', 'normal');
                        doc.setFontSize(9);
                        const statusColor = goalProgress.is_achieved ? '#4CAF50' : goalProgress.achievement_percentage >= 50 ? '#FF9800' : '#F44336';
                        doc.setTextColor(statusColor);
                        doc.text(`Status: ${goalProgress.is_achieved ? 'Achieved' : 'In Progress'}`, margin + 5, yPosition);
                        yPosition += 5;
                        doc.setTextColor(textSecondary);
                        doc.text(`Achievement: ${goalProgress.achievement_percentage.toFixed(0)}%`, margin + 5, yPosition);
                        yPosition += 5;
                        if (goalProgress.confidence_score !== undefined) {
                            doc.text(`Confidence: ${(goalProgress.confidence_score * 100).toFixed(0)}%`, margin + 5, yPosition);
                            yPosition += 5;
                        }
                        doc.text(`Evidence Found: ${goalProgress.total_evidence_count}`, margin + 5, yPosition);
                        yPosition += 5;

                        if (goalProgress.summary) {
                            const summaryLines = doc.splitTextToSize(goalProgress.summary, contentWidth - 10);
                            for (const line of summaryLines) {
                                checkPageBreak(5);
                                doc.text(line, margin + 5, yPosition);
                                yPosition += 4;
                            }
                        }
                        const analysis = goalAnalysis[goalProgress.goal.id];
                        if (analysis && analysis.trim() && !analysis.startsWith('Generating')) {
                            checkPageBreak(15);
                            doc.setFont('helvetica', 'bold');
                            doc.text('Analysis:', margin + 5, yPosition);
                            yPosition += 5;
                            doc.setFont('helvetica', 'normal');
                            const analysisLines = doc.splitTextToSize(analysis, contentWidth - 15);
                            for (const line of analysisLines) {
                                checkPageBreak(5);
                                doc.text(line, margin + 10, yPosition);
                                yPosition += 4;
                            }
                        }
                        yPosition += 5;
                    }
                }
            }

            addFooter();
            const blob = doc.output('blob');
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
            setProgressText('PDF ready. Click Download to save.');
        } catch (err) {
            console.error('PDF generation error', err);
            setProgressText('Failed to generate PDF: ' + String(err));
        } finally {
            setIsRunning(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { if (!isRunning) onClose(); }} />
            <div className={`relative w-[min(800px,95%)] max-h-[90vh] rounded-xl shadow-2xl overflow-hidden ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
                
                <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold">Save PDF — Select Content</h3>
                            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Choose templates and goals to include</p>
                        </div>
                        <button onClick={() => { if (!isRunning) onClose(); }} disabled={isRunning} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                <div className="px-6 py-4 max-h-[calc(90vh-240px)] overflow-y-auto">
                    <div className="mb-6">
                        <h4 className={`text-sm font-semibold uppercase tracking-wide mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Prebuilt Templates</h4>
                        <div className="grid gap-2">
                            {grouped.prebuilt.map(t => (
                                <label key={t.id} className={`flex items-start p-3 rounded-lg cursor-pointer transition-all border ${selectedIds.has(t.id) ? (isDarkMode ? 'bg-red-900/20 border-red-500/50' : 'bg-red-50 border-red-300') : (isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200')} ${isRunning ? 'opacity-50' : ''}`}>
                                    <input type="checkbox" checked={selectedIds.has(t.id)} onChange={() => toggle(t.id)} disabled={isRunning} className="mt-0.5 w-4 h-4 rounded accent-red-600" />
                                    <div className="ml-3 flex-1"><div className="font-semibold text-sm">{t.name}</div></div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {goalsToDisplay.length > 0 && (
                        <div>
                            <h4 className={`text-sm font-semibold uppercase tracking-wide mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Custom Goals</h4>
                            <div className="grid gap-2">
                                {goalsToDisplay.map(gp => (
                                    <label key={gp.goal.id} className={`flex items-start p-3 rounded-lg cursor-pointer transition-all border ${selectedGoalIds.has(gp.goal.id) ? (isDarkMode ? 'bg-purple-900/20 border-purple-500/50' : 'bg-purple-50 border-purple-300') : (isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200')} ${isRunning ? 'opacity-50' : ''}`}>
                                        <input type="checkbox" checked={selectedGoalIds.has(gp.goal.id)} onChange={() => { setSelectedGoalIds(prev => { const copy = new Set(prev); if (copy.has(gp.goal.id)) copy.delete(gp.goal.id); else copy.add(gp.goal.id); return copy; }); }} disabled={isRunning} className="mt-0.5 w-4 h-4 rounded accent-purple-600" />
                                        <div className="ml-3 flex-1"><div className="font-semibold text-sm">{gp.goal.goal_description}</div></div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="checkbox" checked={includeTranscript} onChange={(e) => setIncludeTranscript(e.target.checked)} disabled={isRunning} className="w-4 h-4 rounded accent-red-600" />
                                <span className="text-sm font-medium">Transcript</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="checkbox" checked={includeGoals} onChange={(e) => setIncludeGoals(e.target.checked)} disabled={isRunning} className="w-4 h-4 rounded accent-purple-600" />
                                <span className="text-sm font-medium">Goals</span>
                            </label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button onClick={() => { 
                                setSelectedIds(new Set(templates.map(t => t.id))); 
                                setSelectedGoalIds(new Set(goalsToDisplay.map(g => g.goal.id)));
                            }} disabled={isRunning} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}>Select All</button>
                            <button onClick={() => { setSelectedIds(new Set()); setSelectedGoalIds(new Set()); }} disabled={isRunning} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}>Clear</button>
                            
                            {pdfUrl ? (
                                <a href={pdfUrl} download={`Report_${new Date().toISOString().split('T')[0]}.pdf`} className="px-5 py-2 rounded-lg bg-green-600 text-white text-sm font-bold">Download</a>
                            ) : (
                                <button onClick={runAndGenerate} disabled={isRunning} className="px-5 py-2 rounded-lg bg-red-600 text-white text-sm font-bold disabled:bg-gray-400">
                                    {isRunning ? progressText : 'Run & Generate'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PdfTemplateDialog;