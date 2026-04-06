"use client";

import { useState } from "react";
import type { GenerateRequest, OutputType, CitationFormat, EducationLevel } from "@/types";

interface TopicFormProps {
  onSubmit: (request: GenerateRequest) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export default function TopicForm({ onSubmit, isLoading, disabled = false }: TopicFormProps) {
  const [topic, setTopic] = useState("");
  const [outputType, setOutputType] = useState<OutputType>("research_summary");
  const [citationFormat, setCitationFormat] = useState<CitationFormat>("apa");
  const [educationLevel, setEducationLevel] = useState<EducationLevel>("undergraduate");
  const [wordCount, setWordCount] = useState<number>(500);
  const [additionalInstructions, setAdditionalInstructions] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      topic,
      outputType,
      citationFormat,
      educationLevel,
      wordCount,
      additionalInstructions,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 glassmorphism ghost-border rounded-xl p-6 md:p-8">
      <div className="flex flex-col gap-2">
        <label htmlFor="topic" className="text-label-md text-outline">Research Topic</label>
        <input
          id="topic"
          type="text"
          required
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. The socioeconomic impact of universal basic income"
          className="w-full bg-[#0E0E0E] text-on-surface placeholder:text-outline-variant border ghost-border rounded-md px-4 py-3 focus:outline-none focus:border-primary focus:shadow-[0_0_15px_2px_rgba(149,204,255,0.3)] transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="outputType" className="text-label-md text-outline">Output Type</label>
          <select
            id="outputType"
            value={outputType}
            onChange={(e) => setOutputType(e.target.value as OutputType)}
            className="w-full bg-[#0E0E0E] text-on-surface border ghost-border rounded-md px-4 py-3 focus:outline-none focus:border-primary focus:shadow-[0_0_15px_2px_rgba(149,204,255,0.3)] transition-all"
          >
            <option value="research_summary">Research Summary</option>
            <option value="essay">Essay</option>
            <option value="outline">Outline</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="citationFormat" className="text-label-md text-outline">Citation Format</label>
          <select
            id="citationFormat"
            value={citationFormat}
            onChange={(e) => setCitationFormat(e.target.value as CitationFormat)}
            className="w-full bg-[#0E0E0E] text-on-surface border ghost-border rounded-md px-4 py-3 focus:outline-none focus:border-primary focus:shadow-[0_0_15px_2px_rgba(149,204,255,0.3)] transition-all"
          >
            <option value="apa">APA</option>
            <option value="mla">MLA</option>
            <option value="chicago">Chicago</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="educationLevel" className="text-label-md text-outline">Education Level</label>
          <select
            id="educationLevel"
            value={educationLevel}
            onChange={(e) => setEducationLevel(e.target.value as EducationLevel)}
            className="w-full bg-[#0E0E0E] text-on-surface border ghost-border rounded-md px-4 py-3 focus:outline-none focus:border-primary focus:shadow-[0_0_15px_2px_rgba(149,204,255,0.3)] transition-all"
          >
            <option value="high_school">High School</option>
            <option value="undergraduate">Undergraduate</option>
            <option value="graduate">Graduate / Professional</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="wordCount" className="text-label-md text-outline flex justify-between">
            <span>Word Count</span>
            <span>~{wordCount} words</span>
          </label>
          <input
            id="wordCount"
            type="range"
            min="200"
            max="2000"
            step="100"
            value={wordCount}
            onChange={(e) => setWordCount(parseInt(e.target.value))}
            className="w-full accent-primary h-2 cursor-pointer mt-3"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="additionalInstructions" className="text-label-md text-outline">Additional Instructions (Optional)</label>
        <textarea
          id="additionalInstructions"
          value={additionalInstructions}
          onChange={(e) => setAdditionalInstructions(e.target.value)}
          placeholder="Any specific angles, sources to include, or formatting requirements..."
          rows={3}
          className="w-full bg-[#0E0E0E] text-on-surface placeholder:text-outline-variant border ghost-border rounded-md px-4 py-3 focus:outline-none focus:border-primary focus:shadow-[0_0_15px_2px_rgba(149,204,255,0.3)] transition-all resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || disabled}
        className="btn-primary w-full mt-4 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Researching...
          </>
        ) : (
          "Generate Content"
        )}
      </button>
    </form>
  );
}
