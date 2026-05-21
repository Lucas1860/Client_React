import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Book, Users, Library, Plus, LogOut } from 'lucide-react';

export default function Navigation() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = () => { logout(); navigate('/login'); };

  //if (!user) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-card border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/catalog" className="flex items-center space-x-2">
              <Book className="w-8 h-8 text-primary" />
              <span className="font-semibold text-xl text-foreground">PlayBook</span>
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link to="/catalog" className={`px-3 py-2 rounded-md transition-colors ${isActive('/catalog') ? 'text-primary font-semibold' : 'text-foreground hover:text-primary'}`}>Каталог</Link>
              <Link to="/groups" className={`px-3 py-2 rounded-md transition-colors ${isActive('/groups') ? 'text-primary font-semibold' : 'text-foreground hover:text-primary'}`}>Мои группы</Link>
              <Link to="/my-shelf" className={`px-3 py-2 rounded-md transition-colors ${isActive('/my-shelf') ? 'text-primary font-semibold' : 'text-foreground hover:text-primary'}`}>Моя полка</Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user.role === 'ADMIN' && (
              <Link to="/add-book" className="hidden md:flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-destructive transition-colors">
                <Plus size={18} /> <span>Добавить книгу</span>
              </Link>
            )}
            <button onClick={handleLogout} className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-muted transition-colors text-foreground">
              <LogOut size={18} /> <span className="hidden sm:inline">Выйти</span>
            </button>
          </div>
        </div>
        <div className="md:hidden pb-3 flex space-x-4">
          <Link to="/catalog" className={`flex-1 text-center py-2 rounded-md transition-colors ${isActive('/catalog') ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'}`}>Каталог</Link>
          <Link to="/groups" className={`flex-1 text-center py-2 rounded-md transition-colors ${isActive('/groups') ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'}`}>Группы</Link>
          <Link to="/my-shelf" className={`flex-1 text-center py-2 rounded-md transition-colors ${isActive('/my-shelf') ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'}`}>Полка</Link>
        </div>
      </div>
    </nav>
  );
}