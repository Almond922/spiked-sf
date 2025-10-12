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

interface Props {
	isOpen: boolean;
	onClose: () => void;
	templates: Template[]; // includes both prebuilt and custom (allTemplates)
	transcriptText: string; // pre-joined transcript string
	sessionToken?: string | null;
	isDarkMode?: boolean;
	backendUrl?: string; // optional override for API endpoint
}

const PdfTemplateDialog: React.FC<Props> = ({ isOpen, onClose, templates, transcriptText, sessionToken, isDarkMode, backendUrl }) => {
	const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
	const [includeTranscript, setIncludeTranscript] = useState(false);
	const [isRunning, setIsRunning] = useState(false);
	const [progressText, setProgressText] = useState('');
	const [pdfUrl, setPdfUrl] = useState<string | null>(null);

	useEffect(() => {
		if (!isOpen) {
			setSelectedIds(new Set());
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
		if ((!selectedIds || selectedIds.size === 0) && !includeTranscript) {
			alert('Please select at least one template or enable Transcript to include in the PDF.');
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

					addHeader();
					yPosition = 40;

					// Title
					doc.setFont('helvetica', 'bold');
					doc.setFontSize(20);
					doc.setTextColor(textPrimary);
					doc.text('Selected Templates Output', margin, yPosition);
					yPosition += 12;

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

						doc.setFont('helvetica', 'normal');
						doc.setFontSize(10);
						const lines = doc.splitTextToSize(item.response, contentWidth);
						doc.text(lines, margin, yPosition);
						yPosition += lines.length * 5 + 8;
					}

					// Transcript section (optional)
					if (includeTranscript && transcriptText && transcriptText.trim()) {
						checkPageBreak(30);
						doc.setFont('helvetica', 'bold');
						doc.setFontSize(12);
						doc.text('Transcript', margin, yPosition);
						yPosition += 8;
						doc.setFont('helvetica', 'normal');
						doc.setFontSize(9);
						const transcriptLines = doc.splitTextToSize(transcriptText, contentWidth);
						doc.text(transcriptLines, margin, yPosition);
						yPosition += transcriptLines.length * 4.5 + 8;
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
			<div className="absolute inset-0 bg-black/40" onClick={() => { if (!isRunning) onClose(); }} />
			<div className={`relative w-[min(760px,95%)] max-h-[85vh] overflow-y-auto rounded-lg p-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
				<div className="flex items-center justify-between mb-3">
					<h3 className="text-lg font-semibold">Save PDF — Select Templates</h3>
					<div className="flex items-center space-x-2">
						{isRunning && <div className="text-sm opacity-80">{progressText}</div>}
						<button onClick={() => { if (!isRunning) onClose(); }} className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 text-sm">Close</button>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<h4 className="text-sm font-medium mb-2">Prebuilt Templates</h4>
						<div className="space-y-2">
							{grouped.prebuilt.map(t => (
								<label key={t.id} className="flex items-start space-x-2 cursor-pointer">
									<input type="checkbox" checked={selectedIds.has(t.id)} onChange={() => toggle(t.id)} disabled={isRunning} />
									<div className="text-sm">
										<div className="font-semibold">{t.name}</div>
										<div className="text-xs text-gray-500">{t.description}</div>
									</div>
								</label>
							))}
						</div>
					</div>
					<div>
						<h4 className="text-sm font-medium mb-2">Custom Templates</h4>
						<div className="space-y-2">
							{grouped.custom.length === 0 && <div className="text-xs text-gray-500">No custom templates</div>}
							{grouped.custom.map(t => (
								<label key={t.id} className="flex items-start space-x-2 cursor-pointer">
									<input type="checkbox" checked={selectedIds.has(t.id)} onChange={() => toggle(t.id)} disabled={isRunning} />
									<div className="text-sm">
										<div className="font-semibold">{t.name}</div>
										<div className="text-xs text-gray-500">{t.description}</div>
									</div>
								</label>
							))}
						</div>
					</div>
				</div>

				<div className="mt-4 flex items-center justify-between">
					<div className="flex items-center space-x-3">
						<label className="flex items-center space-x-2">
							<input type="checkbox" checked={includeTranscript} onChange={(e) => setIncludeTranscript(e.target.checked)} disabled={isRunning} />
							<span className="text-sm text-gray-500">Include Transcript</span>
						</label>
					</div>
					<div className="flex items-center justify-end space-x-2">
					<button onClick={() => { setSelectedIds(new Set(templates.map(t => t.id))); }} disabled={isRunning} className="px-3 py-2 rounded-md text-sm bg-gray-100 hover:bg-gray-200">Select All</button>
					<button onClick={() => { setSelectedIds(new Set()); }} disabled={isRunning} className="px-3 py-2 rounded-md text-sm bg-gray-100 hover:bg-gray-200">Clear</button>
					<button onClick={runAndGenerate} disabled={isRunning || ((selectedIds.size === 0) && !includeTranscript)} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">Run & Generate PDF</button>
					</div>
				</div>

				{pdfUrl && (
					<div className="mt-4 flex items-center justify-between">
						<div className="text-sm text-gray-500">PDF ready</div>
						<a href={pdfUrl} download={`SpikedAI_Selected_Templates_${new Date().toISOString().split('T')[0]}.pdf`} className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700">Download PDF</a>
					</div>
				)}
				{progressText && !isRunning && <div className="mt-3 text-sm text-gray-500">{progressText}</div>}
			</div>
		</div>
	);
};

export default PdfTemplateDialog;
