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
	const goalsToDisplay = customGoalsProgress.length > 0 
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
	}, [isOpen]);

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

				// build pdf using jspdf (same global used elsewhere)
				try {
					const { jsPDF } = (window as any).jspdf || {};
					if (!jsPDF) throw new Error('jspdf not found on window');
					const doc = new jsPDF();

					// Visual constants copied from meeting-prep report for consistent branding
					const accentRed = '#F44336';
					const textPrimary = '#212121';
					const textSecondary = '#757575';
					const logoBase64 = 'data:image/jpeg;base64,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';

					const pageWidth = doc.internal.pageSize.getWidth();
					const margin = 20;
					const contentWidth = pageWidth - (margin * 2);
					let yPosition: number = 40;

					const checkPageBreak = (requiredHeight: number): void => {
						if (yPosition + requiredHeight > 285) {
							addFooter(); doc.addPage(); addHeader(); yPosition = 40;
						}
					};

					const addHeader = (): void => {
						try {
							if (logoBase64) doc.addImage(logoBase64, 'PNG', margin, 15, 8, 8);
						} catch (err) {
							// ignore image errors
						}
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
						doc.text(`Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${pageCount}`, pageWidth - margin, 290, { align: 'right' });
						doc.text('Confidential & Proprietary. All right reserved to SpikedAI', margin, 290);
					};

					// Helper function to parse and render markdown
					const renderMarkdown = (text: string, leftMargin: number = margin): void => {
						const lines = text.split('\n');
						let inList = false;

						for (let line of lines) {
							const trimmedLine = line.trim();
							
							// Skip empty lines
							if (!trimmedLine) {
								yPosition += 3;
								continue;
							}

							checkPageBreak(15);

							// Heading levels (##, ###, ####)
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

							// Bullet points (* or -)
							const bulletMatch = line.match(/^(\s*)([\*\-])\s+(.+)$/);
							if (bulletMatch) {
								const indent = bulletMatch[1].length;
								const content = bulletMatch[3];
								const bulletX = leftMargin + (indent * 2);
								
								if (!inList) {
									yPosition += 2;
									inList = true;
								}
								
								checkPageBreak(10);
								
								// Render bullet
								doc.setFont('helvetica', 'normal');
								doc.setFontSize(10);
								doc.setTextColor(textPrimary);
								doc.text('•', bulletX, yPosition);
								
								// Render content with bold/italic support
								const processedContent = renderInlineFormatting(content, bulletX + 5, yPosition, contentWidth - (bulletX - margin) - 5);
								yPosition += processedContent.height;
								continue;
							}

							// Numbered lists
							const numberedMatch = line.match(/^(\s*)(\d+)\.\s+(.+)$/);
							if (numberedMatch) {
								const indent = numberedMatch[1].length;
								const number = numberedMatch[2];
								const content = numberedMatch[3];
								const numberX = leftMargin + (indent * 2);
								
								if (!inList) {
									yPosition += 2;
									inList = true;
								}
								
								checkPageBreak(10);
								
								doc.setFont('helvetica', 'normal');
								doc.setFontSize(10);
								doc.setTextColor(textPrimary);
								doc.text(`${number}.`, numberX, yPosition);
								
								const processedContent = renderInlineFormatting(content, numberX + 8, yPosition, contentWidth - (numberX - margin) - 8);
								yPosition += processedContent.height;
								continue;
							}

							// Regular paragraph
							if (inList) {
								yPosition += 3;
								inList = false;
							}
							
							checkPageBreak(10);
							const processedParagraph = renderInlineFormatting(trimmedLine, leftMargin, yPosition, contentWidth);
							yPosition += processedParagraph.height + 3;
						}
					};

					// Helper to handle bold (**text**) and italic (*text*)
					const renderInlineFormatting = (text: string, x: number, y: number, maxWidth: number): { height: number } => {
						doc.setFontSize(10);
						
						// Split text by bold and italic markers
						const segments: Array<{ text: string; bold: boolean; italic: boolean }> = [];
						let remaining = text;

						// Simple parser for **bold** and *italic*
						while (remaining.length > 0) {
							// Check for bold
							const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
							if (boldMatch) {
								segments.push({ text: boldMatch[1], bold: true, italic: false });
								remaining = remaining.slice(boldMatch[0].length);
								continue;
							}

							// Check for italic
							const italicMatch = remaining.match(/^\*([^*]+)\*/);
							if (italicMatch) {
								segments.push({ text: italicMatch[1], bold: false, italic: true });
								remaining = remaining.slice(italicMatch[0].length);
								continue;
							}

							// Regular text until next marker
							const nextMarker = remaining.search(/\*+/);
							if (nextMarker === -1) {
								segments.push({ text: remaining, bold: false, italic: false });
								remaining = '';
							} else {
								segments.push({ text: remaining.slice(0, nextMarker), bold: false, italic: false });
								remaining = remaining.slice(nextMarker);
							}
						}

						// Render segments with word wrapping
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

					addHeader();
					yPosition = 40;

					// Title
					doc.setFont('helvetica', 'bold');
					doc.setFontSize(20);
					doc.setTextColor(textPrimary);
					//doc.text('Selected Templates Output', margin, yPosition);
					//yPosition += 12;

					// timestamp
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

						// Render markdown content
						renderMarkdown(item.response, margin);
						yPosition += 8;
					}

					// Transcript section (optional)
					if (includeTranscript && transcriptText && transcriptText.trim()) {
						checkPageBreak(30);
						doc.setFont('helvetica', 'bold');
						doc.setFontSize(12);
						doc.setTextColor(textPrimary);
						doc.text('Transcript', margin, yPosition);
						yPosition += 8;
						
						// Render transcript as plain text with compact formatting
						doc.setFont('helvetica', 'normal');
						doc.setFontSize(8);
						doc.setTextColor(textPrimary);
						doc.setLineHeightFactor(1.15); // Reduce line spacing
						
						// Use margins for transcript content
						const transcriptMargin = margin + 2;
						const transcriptWidth = contentWidth - 4;
						const transcriptLines = doc.splitTextToSize(transcriptText, transcriptWidth);
						
						for (let line of transcriptLines) {
							// Check if we need a new page (leaving 10mm bottom margin)
							if (yPosition + 3.5 > 270) {
								addFooter(); 
								doc.addPage(); 
								addHeader(); 
								yPosition = 40;
							}
							doc.text(line, transcriptMargin, yPosition);
							yPosition += 3.5;
						}
						yPosition += 4;
						
						// Reset line height
						doc.setLineHeightFactor(1.0);
					}

					// Custom Goals section (optional)
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
								checkPageBreak(20);
								
								// Goal title
								doc.setFont('helvetica', 'bold');
								doc.setFontSize(11);
								doc.setTextColor(textPrimary);
								doc.text(`• ${goalProgress.goal.goal_description}`, margin, yPosition);
								yPosition += 6;
								
								// Goal status and details
								doc.setFont('helvetica', 'normal');
								doc.setFontSize(9);
								
								// Status
								const statusColor = goalProgress.is_achieved ? '#4CAF50' : goalProgress.achievement_percentage >= 50 ? '#FF9800' : '#F44336';
								doc.setTextColor(statusColor);
								doc.text(`Status: ${goalProgress.is_achieved ? 'Achieved' : 'In Progress'}`, margin + 5, yPosition);
								yPosition += 5;
								
								// Achievement percentage
								doc.setTextColor(textSecondary);
								doc.text(`Achievement: ${goalProgress.achievement_percentage.toFixed(0)}%`, margin + 5, yPosition);
								yPosition += 5;
								
								// Confidence score
								if (goalProgress.confidence_score !== undefined) {
									doc.text(`Confidence: ${(goalProgress.confidence_score * 100).toFixed(0)}%`, margin + 5, yPosition);
									yPosition += 5;
								}
								
								// Evidence count
								doc.text(`Evidence Found: ${goalProgress.total_evidence_count}`, margin + 5, yPosition);
								yPosition += 5;
								
								// Summary if available
								if (goalProgress.summary) {
									doc.setFont('helvetica', 'normal');
									doc.setFontSize(8);
									doc.setTextColor(textPrimary);
									const summaryLines = doc.splitTextToSize(goalProgress.summary, contentWidth - 10);
									for (const line of summaryLines) {
										if (yPosition + 3 > 270) {
											addFooter();
											doc.addPage();
											addHeader();
											yPosition = 40;
										}
										doc.text(line, margin + 5, yPosition);
										yPosition += 3;
									}
									yPosition += 2;
								}
								
								// Goal Analysis if available
								const analysis = goalAnalysis[goalProgress.goal.id];
								if (analysis && analysis.trim() && !analysis.startsWith('Generating') && !analysis.startsWith('Error')) {
									checkPageBreak(15);
									doc.setFont('helvetica', 'bold');
									doc.setFontSize(9);
									doc.setTextColor(textPrimary);
									doc.text('Analysis:', margin + 5, yPosition);
									yPosition += 5;
									
									// Render analysis as markdown
									doc.setFont('helvetica', 'normal');
									doc.setFontSize(8);
									doc.setTextColor(textPrimary);
									renderMarkdown(analysis, margin + 10);
									yPosition += 3;
								}
								
								yPosition += 3;
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
				}
		} catch (err) {
			console.error('Error running templates', err);
			setProgressText('Error running templates: ' + String(err));
		} finally {
			setIsRunning(false);
		}

		// (transcript is added inside the PDF generation scope above)
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { if (!isRunning) onClose(); }} />
			<div className={`relative w-[min(800px,95%)] max-h-[90vh] rounded-xl shadow-2xl overflow-hidden ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
				
				{/* Header */}
				<div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-xl font-bold">Save PDF — Select Templates</h3>
							<p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
								Choose templates to include in your report
							</p>
						</div>
						<button 
							onClick={() => { if (!isRunning) onClose(); }} 
							disabled={isRunning}
							className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
							aria-label="Close"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				</div>

				{/* Content */}
				<div className="px-6 py-4 max-h-[calc(90vh-240px)] overflow-y-auto">
					
					{/* Prebuilt Templates */}
					<div className="mb-6">
						<div className="flex items-center justify-between mb-3">
							<h4 className={`text-sm font-semibold uppercase tracking-wide ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
								Prebuilt Templates
							</h4>
							<span className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
								{grouped.prebuilt.filter(t => selectedIds.has(t.id)).length}/{grouped.prebuilt.length} selected
							</span>
						</div>
						<div className="grid gap-2">
							{grouped.prebuilt.map(t => (
								<label 
									key={t.id} 
									className={`flex items-start p-3 rounded-lg cursor-pointer transition-all border ${
										selectedIds.has(t.id) 
											? isDarkMode 
												? 'bg-red-900/20 border-red-500/50 shadow-sm' 
												: 'bg-red-50 border-red-300 shadow-sm'
											: isDarkMode 
												? 'bg-gray-800 border-gray-700 hover:bg-gray-750 hover:border-gray-600' 
												: 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
									} ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
								>
									<input 
										type="checkbox" 
										checked={selectedIds.has(t.id)} 
										onChange={() => toggle(t.id)} 
										disabled={isRunning}
										className="mt-0.5 w-4 h-4 rounded accent-red-600 cursor-pointer"
									/>
									<div className="ml-3 flex-1">
										<div className="font-semibold text-sm">{t.name}</div>
										{t.description && (
											<div className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
												{t.description}
											</div>
										)}
									</div>
								</label>
							))}
						</div>
					</div>

					{/* Custom Templates */}
					<div>
						<div className="flex items-center justify-between mb-3">
							<h4 className={`text-sm font-semibold uppercase tracking-wide ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
								Custom Templates
							</h4>
							{grouped.custom.length > 0 && (
								<span className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
									{grouped.custom.filter(t => selectedIds.has(t.id)).length}/{grouped.custom.length} selected
								</span>
							)}
						</div>
						{grouped.custom.length === 0 ? (
							<div className={`text-center py-8 rounded-lg border-2 border-dashed ${isDarkMode ? 'border-gray-700 text-gray-500' : 'border-gray-300 text-gray-400'}`}>
								<svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
								<p className="text-sm">No custom templates available</p>
							</div>
						) : (
							<div className="grid gap-2">
								{grouped.custom.map(t => (
									<label 
										key={t.id} 
										className={`flex items-start p-3 rounded-lg cursor-pointer transition-all border ${
											selectedIds.has(t.id) 
												? isDarkMode 
													? 'bg-blue-900/20 border-blue-500/50 shadow-sm' 
													: 'bg-blue-50 border-blue-300 shadow-sm'
												: isDarkMode 
													? 'bg-gray-800 border-gray-700 hover:bg-gray-750 hover:border-gray-600' 
													: 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
										} ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
									>
										<input 
											type="checkbox" 
											checked={selectedIds.has(t.id)} 
											onChange={() => toggle(t.id)} 
											disabled={isRunning}
											className="mt-0.5 w-4 h-4 rounded accent-blue-600 cursor-pointer"
										/>
										<div className="ml-3 flex-1">
											<div className="font-semibold text-sm">{t.name}</div>
											{t.description && (
												<div className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
													{t.description}
												</div>
											)}
										</div>
									</label>
								))}
							</div>
						)}
					</div>

					{/* Custom Goals Section */}
					{goalsToDisplay.length > 0 && (
						<div className="mt-6">
							<div className="flex items-center justify-between mb-3">
								<h4 className={`text-sm font-semibold uppercase tracking-wide ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
									Custom Goals
								</h4>
								<span className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
									{selectedGoalIds.size}/{goalsToDisplay.length} selected
								</span>
							</div>
							<div className="grid gap-2">
								{goalsToDisplay.map(goalProgress => (
									<label 
										key={goalProgress.goal.id} 
										className={`flex items-start p-3 rounded-lg cursor-pointer transition-all border ${
											selectedGoalIds.has(goalProgress.goal.id) 
												? isDarkMode 
													? 'bg-purple-900/20 border-purple-500/50 shadow-sm' 
													: 'bg-purple-50 border-purple-300 shadow-sm'
												: isDarkMode 
													? 'bg-gray-800 border-gray-700 hover:bg-gray-750 hover:border-gray-600' 
													: 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
										} ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
									>
										<input 
											type="checkbox" 
											checked={selectedGoalIds.has(goalProgress.goal.id)} 
											onChange={() => {
												setSelectedGoalIds(prev => {
													const copy = new Set(prev);
													if (copy.has(goalProgress.goal.id)) copy.delete(goalProgress.goal.id);
													else copy.add(goalProgress.goal.id);
													return copy;
												});
											}} 
											disabled={isRunning}
											className="mt-0.5 w-4 h-4 rounded accent-purple-600 cursor-pointer"
										/>
										<div className="ml-3 flex-1">
											<div className="font-semibold text-sm">{goalProgress.goal.goal_description}</div>
											<div className={`text-xs mt-1 flex items-center space-x-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
												<span className={`px-2 py-0.5 rounded text-xs font-medium ${
													goalProgress.is_achieved 
														? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
														: goalProgress.achievement_percentage >= 50
														? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
														: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
												}`}>
													{goalProgress.is_achieved ? 'Achieved' : 'In Progress'}
												</span>
												<span>{goalProgress.achievement_percentage.toFixed(0)}% Complete</span>
											</div>
										</div>
									</label>
								))}
							</div>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
					{/* Progress indicator */}
					{isRunning && (
						<div className="mb-3 flex items-center space-x-2">
							<div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent"></div>
							<span className="text-sm">{progressText}</span>
						</div>
					)}

					{/* PDF Ready download */}
					{pdfUrl && (
						<div className={`mb-3 p-3 rounded-lg flex items-center justify-between ${isDarkMode ? 'bg-green-900/20 border border-green-500/50' : 'bg-green-50 border border-green-300'}`}>
							<div className="flex items-center space-x-2">
								<svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
								</svg>
								<span className="text-sm font-medium">PDF ready to download</span>
							</div>
							<a 
								href={pdfUrl} 
								download={`SpikedAI_Selected_Templates_${new Date().toISOString().split('T')[0]}.pdf`} 
								className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-medium"
							>
								Download PDF
							</a>
						</div>
					)}

					<div className="flex items-center justify-between">
						{/* Left side - Include Transcript and Goals */}
						<div className="flex items-center space-x-4">
							<label className={`flex items-center space-x-2 cursor-pointer ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}>
								<input 
									type="checkbox" 
									checked={includeTranscript} 
									onChange={(e) => setIncludeTranscript(e.target.checked)} 
									disabled={isRunning}
									className="w-4 h-4 rounded accent-red-600 cursor-pointer"
								/>
								<span className="text-sm font-medium">Include Transcript</span>
							</label>

							{goalsToDisplay.length > 0 && (
								<label className={`flex items-center space-x-2 cursor-pointer ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}>
									<input 
										type="checkbox" 
										checked={includeGoals} 
										onChange={(e) => setIncludeGoals(e.target.checked)} 
										disabled={isRunning}
										className="w-4 h-4 rounded accent-purple-600 cursor-pointer"
									/>
									<span className="text-sm font-medium">Include Custom Goals</span>
								</label>
							)}
						</div>

						{/* Right side - Action buttons */}
						<div className="flex items-center space-x-2">
							<button 
								onClick={() => { setSelectedIds(new Set(templates.map(t => t.id))); }} 
								disabled={isRunning}
								className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
									isDarkMode 
										? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
										: 'bg-gray-200 hover:bg-gray-300 text-gray-700'
								} ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
							>
								Select All
							</button>
							<button 
								onClick={() => { setSelectedIds(new Set()); }} 
								disabled={isRunning}
								className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
									isDarkMode 
										? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
										: 'bg-gray-200 hover:bg-gray-300 text-gray-700'
								} ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
							>
								Clear
							</button>
							<button 
								onClick={runAndGenerate} 
								disabled={isRunning || ((selectedIds.size === 0) && !includeTranscript && !includeGoals)}
								className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-md ${
									isRunning || ((selectedIds.size === 0) && !includeTranscript && !includeGoals)
										? 'bg-gray-400 cursor-not-allowed text-gray-700'
										: 'bg-red-600 hover:bg-red-700 text-white hover:shadow-lg'
								}`}
							>
								Run & Generate PDF
							</button>
						</div>
					</div>
				</div>

			</div>
		</div>
	);
};

export default PdfTemplateDialog;
