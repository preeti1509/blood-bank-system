interface TopBarProps {
  onOpenSidebar: () => void;
}

export default function TopBar({ onOpenSidebar }: TopBarProps) {
  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center md:hidden">
          <button 
            className="text-neutral-400"
            onClick={onOpenSidebar}
          >
            <span className="material-icons">menu</span>
          </button>
          <h1 className="ml-3 text-lg font-medium text-neutral-400">BloodBank Pro</h1>
        </div>
        
        <div className="relative w-64 mx-auto md:mx-0">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-300">
            <span className="material-icons text-sm">search</span>
          </span>
          <input 
            type="text" 
            className="block w-full py-2 pl-10 pr-4 text-sm border rounded-md bg-neutral-100 border-neutral-200 focus:border-primary focus:outline-none" 
            placeholder="Search..." 
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="relative text-neutral-400 hover:text-neutral-600">
            <span className="material-icons">notifications</span>
            <span className="absolute top-0 right-0 w-2 h-2 bg-status-error rounded-full"></span>
          </button>
          
          <button className="text-neutral-400 hover:text-neutral-600">
            <span className="material-icons">help_outline</span>
          </button>
          
          <div className="hidden md:block">
            <div className="flex items-center">
              <img 
                className="w-8 h-8 rounded-full" 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&q=80" 
                alt="User avatar" 
              />
              <span className="ml-2 text-sm font-medium text-neutral-400">Dr. Sarah Johnson</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
