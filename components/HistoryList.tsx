"use client";

import { useState } from "react";
import type { HistoryItem } from "@/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface HistoryListProps {
  items: HistoryItem[];
}

export default function HistoryList({ items }: HistoryListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getWordCount = (content: string) => {
    return content.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // Truncate function keeping it exactly to ~60 characters avoiding mid-word cutoffs if possible
  const truncate = (str: string, n: number) => {
    return str.length > n ? str.slice(0, n - 1) + "..." : str;
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      {items.map((item) => {
        const isExpanded = expandedId === item.id;
        
        return (
          <div 
            key={item.id}
            className={`ghost-border rounded-lg p-6 transition-colors duration-200 cursor-pointer ${
              isExpanded ? "bg-[#242424]" : "bg-transparent hover:bg-[#242424]"
            }`}
            onClick={() => toggleExpand(item.id)}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                <h3 className="text-on-surface text-headline-md mb-2">
                  {truncate(item.request.topic, 60)}
                </h3>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <span className="px-2 py-1 text-label-md rounded bg-[#414755]/30 text-on-surface">
                    {item.request.outputType.replace(/_/g, " ")}
                  </span>
                  <span className="px-2 py-1 text-label-md rounded bg-[#414755]/30 text-on-surface">
                    {item.request.citationFormat}
                  </span>
                  <span className="text-outline text-sm">
                    {formatDate(item.createdAt)}
                  </span>
                  <span className="text-outline text-sm flex items-center gap-1 before:content-['•'] before:mr-1 before:text-outline/50">
                    {getWordCount(item.response.content)} words
                  </span>
                </div>
              </div>
              <div className="shrink-0 text-outline">
                <svg 
                  className={`w-6 h-6 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {isExpanded && (
              <div 
                className="mt-8 pt-6 border-t border-[rgba(65,71,85,0.2)] cursor-default"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="prose prose-invert prose-p:text-on-surface prose-headings:text-on-surface prose-a:text-primary max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {item.response.content}
                  </ReactMarkdown>
                </div>
                {item.response.sources && item.response.sources.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-[rgba(65,71,85,0.2)]">
                    <h4 className="text-headline-md font-bold mb-4 text-on-surface">Sources & Citations</h4>
                    <ul className="flex flex-col gap-4">
                      {item.response.sources.map((source, index) => (
                        <li key={index} className="flex flex-col bg-[#1B1B1B] p-5 rounded-lg ghost-border">
                          <a 
                            href={source.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-body-lg font-semibold text-primary hover:text-[#2297E2] transition-colors mb-2 inline-flex items-center gap-1 w-fit"
                          >
                            {source.title}
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                              <polyline points="15 3 21 3 21 9"></polyline>
                              <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                          </a>
                          <div className="text-label-md text-outline flex flex-wrap gap-x-4 gap-y-2">
                            {source.author && (
                              <span className="flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                {source.author}
                              </span>
                            )}
                            {source.publishedDate && (
                              <span className="flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                {source.publishedDate}
                              </span>
                            )}
                            <span className="flex items-center gap-1 capitalize">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                              {source.domain}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
