"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { GenerateResponse } from "@/types";

interface OutputDisplayProps {
  response: GenerateResponse | null;
  isLoading: boolean;
}

export default function OutputDisplay({ response, isLoading }: OutputDisplayProps) {
  if (isLoading) {
    return (
      <div className="w-full min-h-[400px] p-6 md:p-8 rounded-xl glassmorphism ghost-border flex flex-col gap-6 animate-pulse">
        <div className="h-8 bg-surface-container-highest rounded-md w-1/3"></div>
        <div className="flex flex-col gap-3 mt-4">
          <div className="h-4 bg-surface-container-high rounded-md w-full"></div>
          <div className="h-4 bg-surface-container-high rounded-md w-5/6"></div>
          <div className="h-4 bg-surface-container-high rounded-md w-full"></div>
          <div className="h-4 bg-surface-container-high rounded-md w-4/5"></div>
        </div>
        <div className="flex flex-col gap-3 mt-6">
          <div className="h-4 bg-surface-container-high rounded-md w-full"></div>
          <div className="h-4 bg-surface-container-high rounded-md w-11/12"></div>
          <div className="h-4 bg-surface-container-high rounded-md w-full"></div>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="w-full min-h-[400px] h-full p-6 md:p-8 rounded-xl glassmorphism ghost-border flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-outline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
        </div>
        <h3 className="text-headline-md font-semibold text-on-surface mb-2">Ready to Research</h3>
        <p className="text-body-md text-outline max-w-sm mx-auto">
          Fill out the form on the left with your topic and requirements. The AI will generate a highly structured, well-cited response here.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-6 md:p-8 rounded-xl glassmorphism ghost-border">
      <div className="prose prose-invert prose-p:text-on-surface prose-headings:text-on-surface prose-a:text-primary max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {response.content}
        </ReactMarkdown>
      </div>

      {response.sources && response.sources.length > 0 && (
        <div className="mt-12 pt-8 border-t border-outline-variant/30">
          <h3 className="text-headline-md font-bold mb-6">Sources & Citations</h3>
          <ul className="flex flex-col gap-4">
            {response.sources.map((source, index) => (
              <li key={index} className="flex flex-col bg-surface-container-low p-5 rounded-lg ghost-border">
                <a 
                  href={source.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-body-lg font-semibold text-primary hover:text-primary-container transition-colors mb-2 inline-flex items-center gap-1 w-fit"
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
  );
}
