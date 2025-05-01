
import { Shield } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-kenya-black text-white pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-4">
              <Shield className="h-8 w-8 text-kenya-green mr-2" />
              <span className="font-bold text-xl">KPCMS</span>
            </div>
            <p className="text-gray-300 mb-4">
              Kenya Police Case Management System
            </p>
            <p className="text-kenya-red italic font-medium">
              "Utumishi Kwa Wote"
            </p>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-300 hover:text-white transition">Home</a></li>
              <li><a href="/report-crime" className="text-gray-300 hover:text-white transition">Report a Crime</a></li>
              <li><a href="/track-case" className="text-gray-300 hover:text-white transition">Track a Case</a></li>
              <li><a href="/about" className="text-gray-300 hover:text-white transition">About Us</a></li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition">Terms of Service</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition">Cookie Policy</a></li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-gray-300">Emergency: 999 / 112</li>
              <li className="text-gray-300">Hotline: 0800-000-000</li>
              <li className="text-gray-300">Email: info@kpcms.gov.ke</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Kenya Police Service. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <p className="text-gray-400 text-sm">A service of the Government of Kenya</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
