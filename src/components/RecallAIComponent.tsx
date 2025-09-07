// src/components/RecallAIComponent.tsx

import React from "react";
import { Play, Pause, X, Loader, Headphones } from "lucide-react";
import RecallLogo from "/recall.png";
import VexaLogo from "/vexa.png";
import { Link } from "react-router-dom";
import { useBot } from "../contexts/BotContext";

import { TranscriptSegment } from "../types"; 

interface RecallAIComponentProps {
  meetingUrl: string;
  isDarkMode: boolean;
}

const RecallAIComponent: React.FC<RecallAIComponentProps> = ({ meetingUrl, isDarkMode }) => {
  const { botStatus, isBotRunning, isTranscribing, toggleTranscription, startBot, stopBot } = useBot();

  const handleStartOrStop = () => {
    if (isBotRunning) {
      stopBot();
    } else {
      startBot(meetingUrl);
    }
  };

  return (
    <div
      className={`px-6 py-4 border-b ${
        isDarkMode ? "border-slate-700/50" : "border-non-photo-blue/30"
      } flex flex-col space-y-4`}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-lg ${
              isDarkMode ? "bg-cerulean/20" : "bg-cerulean/30"
            }`}
          >
            <Headphones className={`w-5 h-5 ${isDarkMode ? "text-cerulean" : "text-berkeley-blue"}`} />
          </div>
          <div>
            <h2 className={`font-bold ${isDarkMode ? "text-white" : "text-berkeley-blue"}`}>
              Live Transcription
            </h2>
            <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
              Real-time meeting insights
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between space-x-2">
        <button
          onClick={handleStartOrStop}
          disabled={!meetingUrl || botStatus === "starting" || botStatus === "stopping"}
          className={`px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 transition-all duration-300 transform hover:scale-105 w-full ${
            meetingUrl && !(botStatus === "starting" || botStatus === "stopping")
              ? isBotRunning
                ? "bg-red-pantone text-white hover:bg-red-500 shadow-lg"
                : "bg-cerulean text-white hover:bg-berkeley-blue shadow-lg"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {botStatus === "starting" || botStatus === "stopping" ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : isBotRunning ? (
            <X className="w-5 h-5" />
          ) : (
            <Headphones className="w-5 h-5" />
          )}
          <span>
            {botStatus === "starting"
              ? "Connecting..."
              : botStatus === "stopping"
              ? "Disconnecting..."
              : isBotRunning
              ? "Stop Listening"
              : "Start Listening"}
          </span>
        </button>
        <button
          onClick={toggleTranscription}
          disabled={!isBotRunning}
          className={`p-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
            isTranscribing
              ? "bg-red-pantone/20 text-red-pantone"
              : "bg-emerald-500/20 text-emerald-500"
          }`}
          title={isTranscribing ? "Pause Transcription" : "Resume Transcription"}
        >
          {isTranscribing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
          <b>Mode R</b>
        </span>
        <img src={RecallLogo} alt="Recall Logo" className="w-4 h-4" />
        <Link
          to="/vexa"
          className="flex items-center space-x-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-full hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
        >
          <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
            Switch to V
          </span>
          <img src={VexaLogo} alt="Vexa Logo" className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default RecallAIComponent;