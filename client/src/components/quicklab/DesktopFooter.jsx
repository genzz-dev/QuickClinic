export default function DesktopFooter() {
  return (
    <footer className="bg-lab-black-900 dark:bg-black text-lab-black-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">
              <span className="text-white">Quick</span>
              <span className="text-lab-yellow-400">Lab</span>
            </h3>
            <p className="text-lab-black-400">Your trusted healthcare companion</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Quick Ecosystem</h4>
            <ul className="space-y-2 text-lab-black-400">
              <li>
                <a href="#" className="hover:text-lab-yellow-400 transition-colors">
                  QuickClinic
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-lab-yellow-400 transition-colors">
                  QuickMed
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-lab-yellow-400 transition-colors">
                  QuickLab
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-lab-yellow-400 transition-colors">
                  QuickInsure
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Resources</h4>
            <ul className="space-y-2 text-lab-black-400">
              <li>
                <a href="#" className="hover:text-lab-yellow-400 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-lab-yellow-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-lab-yellow-400 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-lab-yellow-400 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Stay Connected</h4>
            <p className="text-lab-black-400 mb-4">Subscribe for health tips and updates</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2 rounded bg-lab-black-800 text-white border border-lab-black-700 focus:border-lab-yellow-400 focus:outline-none"
              />
              <button className="btn-quicklab-primary">Join</button>
            </div>
          </div>
        </div>

        <div className="border-t border-lab-black-800 pt-8 text-center text-lab-black-400">
          <p>&copy; 2025 Quick Healthcare Ecosystem. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
