import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#131313]">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#95CCFF] opacity-[0.03] blur-[100px] rounded-full" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7 flex flex-col items-start gap-8">
            <h1 className="text-display-lg text-on-surface">
              Research without <br />compromise.
            </h1>
            <p className="text-body-lg text-on-surface-variant max-w-xl">
              ScholarAI combines advanced reasoning with academic precision to help students research, synthesize, and write faster than ever before.
            </p>
            <div className="flex flex-wrap items-center gap-6 mt-4">
              <Link href="/signup" className="btn-primary text-body-lg px-6 py-3">
                Start for free
              </Link>
              <Link href="/features" className="btn-secondary text-body-lg px-6 py-3">
                See how it works
              </Link>
            </div>
            <div className="flex items-center gap-4 mt-8 pt-8 border-t ghost-border w-full max-w-md">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-[#131313] bg-[#2E2E2E]" />
                ))}
              </div>
              <p className="text-body-md text-on-surface-variant flex-1 ml-2">
                <strong className="text-on-surface font-semibold">Trusted by 10,000+</strong> students globally.
              </p>
            </div>
          </div>
          
          <div className="lg:col-span-5 relative w-full mt-12 lg:mt-0">
            <div className="glassmorphism p-8 rounded-[8px] ghost-border hover-lift transition-all duration-300">
              <div className="w-full h-8 flex items-center mb-8 border-b ghost-border pb-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#414755]" />
                  <div className="w-3 h-3 rounded-full bg-[#414755]" />
                  <div className="w-3 h-3 rounded-full bg-[#414755]" />
                </div>
              </div>
              <div className="space-y-5">
                <div className="h-6 w-3/4 bg-[#2E2E2E] rounded-[4px]" />
                <div className="space-y-3">
                  <div className="h-4 w-full bg-[#1B1B1B] rounded-[4px]" />
                  <div className="h-4 w-5/6 bg-[#1B1B1B] rounded-[4px]" />
                  <div className="h-4 w-4/6 bg-[#1B1B1B] rounded-[4px]" />
                </div>
              </div>
              <div className="mt-10 pt-6 border-t ghost-border">
                <div className="h-12 w-full bg-[#2297E2] opacity-80 rounded-[4px] bloom-effect" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-[#0E0E0E]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start mb-24">
            <h2 className="text-headline-lg text-on-surface">
              Built for depth.<br />Designed for speed.
            </h2>
            <p className="text-body-lg text-on-surface-variant pt-2">
              We stripped away the noise so you can focus on the signal. ScholarAI gives you the tools to analyze dense academic papers and extract meaningful insights in seconds.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#1B1B1B] p-10 rounded-[8px] hover-lift transition-all duration-300 hover:bg-[#242424]">
              <div className="w-12 h-12 rounded-[4px] bg-[#2E2E2E] mb-8 flex items-center justify-center text-primary">01</div>
              <h3 className="text-headline-md text-on-surface mb-6">Semantic Synthesis</h3>
              <p className="text-body-md text-on-surface-variant">
                Upload multiple PDFs and instantly see cross-references, contradictions, and supporting evidence mapped out visually.
              </p>
            </div>
            <div className="bg-[#1B1B1B] p-10 rounded-[8px] hover-lift transition-all duration-300 hover:bg-[#242424]">
              <div className="w-12 h-12 rounded-[4px] bg-[#2E2E2E] mb-8 flex items-center justify-center text-primary">02</div>
              <h3 className="text-headline-md text-on-surface mb-6">Citation Integrity</h3>
              <p className="text-body-md text-on-surface-variant">
                Every claim generated by ScholarAI includes inline citations directly linked back to the exact paragraph in your source material.
              </p>
            </div>
            <div className="bg-[#1B1B1B] p-10 rounded-[8px] hover-lift transition-all duration-300 hover:bg-[#242424]">
              <div className="w-12 h-12 rounded-[4px] bg-[#2E2E2E] mb-8 flex items-center justify-center text-primary">03</div>
              <h3 className="text-headline-md text-on-surface mb-6">Format Agnostic</h3>
              <p className="text-body-md text-on-surface-variant">
                Export to APA, MLA, Chicago, or directly to LaTeX. We handle the formatting nuances so you can handle the thinking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-[#131313] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#95CCFF] opacity-[0.02] blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 glassmorphism p-12 md:p-20 rounded-[8px] ghost-border">
          <h2 className="text-display-md text-on-surface mb-8">
            Ready to elevate your research?
          </h2>
          <p className="text-body-lg text-on-surface-variant mb-12 max-w-2xl mx-auto">
            Join thousands of academics and students pushing the boundaries of what's possible with AI-assisted research.
          </p>
          <Link href="/signup" className="btn-primary text-body-lg px-10 py-5 inline-block">
            Get started for free
          </Link>
        </div>
      </section>
    </div>
  );
}
