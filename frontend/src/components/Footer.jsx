export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-green-800 to-green-900 text-gray-200 py-12 mt-auto">
      <div className="max-w-6xl mx-auto px-6">
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-green-700 pb-6">
              <th className="w-1/4 py-4 font-semibold text-green-300">Product</th>
              <th className="w-1/4 py-4 font-semibold text-green-300">Company</th>
              <th className="w-1/4 py-4 font-semibold text-green-300">Support</th>
              <th className="w-1/4 py-4 font-semibold text-green-300">Legal</th>
            </tr>
            <tr className=" transition-colors">
              <td className="py-3">
                <a href="#esp" className="block cursor-pointer hover:text-white">ESP Modules</a>
                <a href="#led" className="block hover:text-white">LED Drivers</a>
              </td>
              <td className="py-3">
                <a href="#about" className="block hover:text-white">About Us</a>
                <a href="#careers" className="block hover:text-white">Careers</a>
              </td>
              <td className="py-3">
                <a href="#help" className="block hover:text-white">Help Center</a>
                <a href="#contact" className="block hover:text-white">Contact</a>
              </td>
              <td className="py-3">
                <a href="#privacy" className="block hover:text-white">Privacy</a>
                <a href="#terms" className="block hover:text-white">Terms</a>
              </td>
            </tr>
            <tr className="pt-6 text-center">
              <td colSpan="4" className="py-4 text-gray-400 text-xs">
                © 2025 Electronics Hub. All rights reserved.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </footer>
  );
}
