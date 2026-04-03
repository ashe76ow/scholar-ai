import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t ghost-border bg-[#0E0E0E] py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <span className="text-body-lg font-bold block mb-4">ScholarAI</span>
            <p className="text-on-surface-variant text-body-md max-w-sm">
              The premier AI research assistant designed specifically for academic rigor and premium workflows.
            </p>
          </div>
          <div>
            <h4 className="text-label-md text-on-surface mb-6">Product</h4>
            <ul className="space-y-4">
              <li><Link href="/features" className="text-on-surface-variant hover:text-on-surface transition-colors text-body-md">Features</Link></li>
              <li><Link href="/pricing" className="text-on-surface-variant hover:text-on-surface transition-colors text-body-md">Pricing</Link></li>
              <li><Link href="/changelog" className="text-on-surface-variant hover:text-on-surface transition-colors text-body-md">Changelog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-label-md text-on-surface mb-6">Legal</h4>
            <ul className="space-y-4">
              <li><Link href="/privacy" className="text-on-surface-variant hover:text-on-surface transition-colors text-body-md">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-on-surface-variant hover:text-on-surface transition-colors text-body-md">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t ghost-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-on-surface-variant text-body-md">
            &copy; {new Date().getFullYear()} ScholarAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
