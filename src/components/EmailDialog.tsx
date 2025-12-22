import React, { useState, useEffect } from 'react';
import { Mail, X, ChevronRight, Loader2 } from 'lucide-react';

interface EmailDialogProps {
    isOpen: boolean;
    onClose: () => void;
    defaultSubject: string;
    transcriptText: string;
    meetingUrl?: string;
    isDarkMode: boolean;
    sessionToken?: string | null;
    backendUrl?: string;
}

const EmailDialog: React.FC<EmailDialogProps> = ({
    isOpen,
    onClose,
    defaultSubject,
    transcriptText,
    meetingUrl,
    isDarkMode,
    sessionToken,
    backendUrl
}) => {
    const [emailSignature, setEmailSignature] = useState(`
---
Powered by SpikedAI - Next-Generation Meeting Intelligence
https://www.spiked.ai
    `.trim());
    const [showSignatureEditor, setShowSignatureEditor] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedSummary, setGeneratedSummary] = useState<string>('');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (isOpen && !generatedSummary && !isGenerating) {
            generateSummary();
        }
    }, [isOpen]);

    const generateSummary = async () => {
        if (!sessionToken) {
            setError('Not authenticated. Please sign in to generate summaries.');
            return;
        }

        setIsGenerating(true);
        setError('');

        try {
            // Generate a professional meeting summary using the AI
            const summaryPrompt = `Generate a professional, concise meeting summary in plain text format (NO MARKDOWN). Include:
1. A brief executive summary (2-3 sentences)
2. Key discussion points (use * for bullet points, not - or other characters)
3. Action items with owners (if any mentioned)
4. Next steps or decisions made

IMPORTANT: Do not use any markdown formatting like ##, ###, **, __, or []. Use only plain text with simple * for bullet points. Do not include greetings or signatures.`;

            const resp = await fetch((backendUrl || '') + '/api/process-template', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${sessionToken}` 
                },
                body: JSON.stringify({ 
                    prompt: summaryPrompt, 
                    transcript: transcriptText 
                })
            });

            if (!resp.ok) {
                throw new Error(`Failed to generate summary: ${resp.status}`);
            }

            const data = await resp.json();
            let summary = data.response || data.toString();
            
            // Clean up any markdown residue
            summary = summary
                .replace(/#{1,6}\s+/g, '') // Remove markdown headers
                .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
                .replace(/__([^_]+)__/g, '$1') // Remove bold (alternative)
                .replace(/\*([^*]+)\*/g, '$1') // Remove italic (but keep * bullet points at line start)
                .replace(/_([^_]+)_/g, '$1') // Remove italic (alternative)
                .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links but keep text
                .replace(/`([^`]+)`/g, '$1') // Remove inline code
                .replace(/```[\s\S]*?```/g, '') // Remove code blocks
                .trim();
            
            setGeneratedSummary(summary);
        } catch (err) {
            console.error('Error generating summary:', err);
            setError('Failed to generate meeting summary. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    if (!isOpen) return null;

    const formatEmailBody = (signature: string) => {
        const date = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        let emailBody = '';

        // Context line
        emailBody += `Please find below the summary of our meeting held on ${date}.\n\n`;

        // Meeting URL if available
        if (meetingUrl) {
            emailBody += `Meeting Recording: ${meetingUrl}\n\n`;
        }

        // Divider
        emailBody += `${'─'.repeat(60)}\n`;
        emailBody += `MEETING SUMMARY\n`;
        emailBody += `${'─'.repeat(60)}\n\n`;

        // Generated summary
        if (generatedSummary) {
            emailBody += generatedSummary;
        } else if (isGenerating) {
            emailBody += 'Generating meeting summary...\n';
        } else if (error) {
            emailBody += `Error: ${error}\n`;
        }

        emailBody += `\n\n`;
        emailBody += `${'─'.repeat(60)}\n\n`;

        // Signature
        emailBody += signature;

        return emailBody;
    };

    const handleGmailClick = () => {
        const emailBody = formatEmailBody(emailSignature);
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&tf=1&su=${encodeURIComponent(defaultSubject)}&body=${encodeURIComponent(emailBody)}`;
        window.open(gmailUrl, '_blank');
    };

    const handleYahooClick = () => {
        const emailBody = formatEmailBody(emailSignature);
        const yahooUrl = `https://compose.mail.yahoo.com/?subject=${encodeURIComponent(defaultSubject)}&body=${encodeURIComponent(emailBody)}`;
        window.open(yahooUrl, '_blank');
    };

    const handleOutlookClick = () => {
        const emailBody = formatEmailBody(emailSignature);
        const outlookUrl = `https://outlook.live.com/mail/0/deeplink/compose?subject=${encodeURIComponent(defaultSubject)}&body=${encodeURIComponent(emailBody)}`;
        window.open(outlookUrl, '_blank');
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div
                className="absolute inset-0 backdrop-blur-sm bg-black/40"
                onClick={onClose}
            />

            <div className={`relative w-[95%] max-w-2xl rounded-xl shadow-2xl transform transition-all duration-300 scale-100 ${
                isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
                <div className={`flex items-center justify-between p-6 border-b ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                    <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                            <Mail className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                        </div>
                        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Share Meeting Summary
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg transition-colors ${
                            isDarkMode ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-300' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Status Section */}
                    {isGenerating && (
                        <div className={`flex items-center justify-center space-x-2 p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'}`}>
                            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                            <span className="text-sm font-medium">Generating professional summary...</span>
                        </div>
                    )}

                    {error && (
                        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-red-900/20 border border-red-500/30' : 'bg-red-50 border border-red-200'}`}>
                            <p className="text-sm text-red-600">{error}</p>
                            <button 
                                onClick={generateSummary}
                                className="mt-2 text-sm font-medium text-red-600 hover:text-red-700 underline"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {generatedSummary && !error && (
                        <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-green-900/20 border-green-500/30' : 'bg-green-50 border-green-200'}`}>
                            <div className="flex items-center space-x-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-sm font-medium text-green-600">Summary Generated</span>
                            </div>
                            <div className={`text-xs max-h-40 overflow-y-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                <pre className="whitespace-pre-wrap font-sans">{generatedSummary.slice(0, 300)}{generatedSummary.length > 300 ? '...' : ''}</pre>
                            </div>
                        </div>
                    )}

                    {/* Email Signature Editor */}
                    <div className="space-y-2">
                        <button
                            onClick={() => setShowSignatureEditor(!showSignatureEditor)}
                            className={`flex items-center text-sm font-medium ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                            <ChevronRight className={`w-4 h-4 mr-1 transform transition-transform ${showSignatureEditor ? 'rotate-90' : ''}`} />
                            Customize Email Signature
                        </button>

                        {showSignatureEditor && (
                            <div className="space-y-2">
                                <textarea
                                    value={emailSignature}
                                    onChange={(e) => setEmailSignature(e.target.value)}
                                    rows={4}
                                    className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 transition-shadow font-mono ${
                                        isDarkMode ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-500/50' : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500/50'
                                    }`}
                                    placeholder="Enter your email signature..."
                                />
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={handleGmailClick}
                            disabled={isGenerating || !generatedSummary}
                            className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg text-white transition-all shadow-lg ${
                                isGenerating || !generatedSummary
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-red-500 hover:bg-red-600 shadow-red-500/20 hover:shadow-red-500/40'
                            }`}
                        >
                            <Mail className="w-5 h-5 mr-2" />
                            Open in Gmail
                        </button>
                        <button
                            onClick={handleYahooClick}
                            disabled={isGenerating || !generatedSummary}
                            className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg text-white transition-all shadow-lg ${
                                isGenerating || !generatedSummary
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-purple-500 hover:bg-purple-600 shadow-purple-500/20 hover:shadow-purple-500/40'
                            }`}
                        >
                            <Mail className="w-5 h-5 mr-2" />
                            Open in Yahoo
                        </button>
                        <button
                            onClick={handleOutlookClick}
                            disabled={isGenerating || !generatedSummary}
                            className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg text-white transition-all shadow-lg ${
                                isGenerating || !generatedSummary
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20 hover:shadow-blue-500/40'
                            }`}
                        >
                            <Mail className="w-5 h-5 mr-2" />
                            Open in Outlook
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailDialog;