export default function Navbar() {
  return (
    <nav className="flex items-center justify-center bg-gradient-to-r from-green-600 via-green-500 to-green-400 py-4 px-6 shadow-lg">
      <div className="flex flex-nowrap items-center space-x-50 text-gray-200 text-4xl font-semibold tracking-wide">
        <div>
        </div>
        <div className="flex items-center justify-center space-x-15 ml-20">
            <a href="#esp" className="hover:text-white transition-colors">Esp</a>
            <a href="#led" className="hover:text-white transition-colors">Led</a>
            <a href="#wire" className="hover:text-white transition-colors">Wire</a>
            <a href="#battery" className="hover:text-white transition-colors">Battery</a></div>        
      </div>
    </nav>
  );
}

