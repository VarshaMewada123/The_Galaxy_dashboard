import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* BRAND */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <ShieldCheck className="h-6 w-6 text-blue-500" />
            <span className="text-xl font-bold text-white">
              MedVault.ai
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Secure. Intelligent. Universal.
          </p>
        </div>

        {/* PRODUCT */}
        <div>
          <h4 className="text-white font-bold mb-4">Product</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/features" className="hover:text-blue-400 focus:outline-none focus:text-blue-400">
                Features
              </Link>
            </li>
            <li>
              <Link to="/pricing" className="hover:text-blue-400 focus:outline-none focus:text-blue-400">
                Pricing
              </Link>
            </li>
            <li>
              <Link to="/api" className="hover:text-blue-400 focus:outline-none focus:text-blue-400">
                API
              </Link>
            </li>
          </ul>
        </div>

        {/* COMPANY */}
        <div>
          <h4 className="text-white font-bold mb-4">Company</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/about" className="hover:text-blue-400 focus:outline-none focus:text-blue-400">
                About
              </Link>
            </li>
            <li>
              <Link to="/blog" className="hover:text-blue-400 focus:outline-none focus:text-blue-400">
                Blog
              </Link>
            </li>
            <li>
              <Link to="/careers" className="hover:text-blue-400 focus:outline-none focus:text-blue-400">
                Careers
              </Link>
            </li>
          </ul>
        </div>

        {/* LEGAL */}
        <div>
          <h4 className="text-white font-bold mb-4">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/privacy-policy" className="hover:text-blue-400 focus:outline-none focus:text-blue-400">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-blue-400 focus:outline-none focus:text-blue-400">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link to="/compliance" className="hover:text-blue-400 focus:outline-none focus:text-blue-400">
                HIPAA Compliance
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
        © {year} MedVault.ai. All rights reserved.
      </div>
    </footer>
  );
};
