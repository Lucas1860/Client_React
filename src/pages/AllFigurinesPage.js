import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { gamificationAPI } from '../api';
import { useAuth } from '../components/AuthContext';

export default function AllFigurinesPage() {
  const { userId } = useAuth();
  const [figurines, setFigurines] = useState([]);

  useEffect(() => {
    gamificationAPI.getUserFigurines(userId).then(res => setFigurines(res.data));
  }, [userId]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to="/my-shelf" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6">
        <ArrowLeft size={20} /> Назад на полку
      </Link>
      <h1 className="text-3xl font-semibold mb-8">Все фигурки</h1>
      {figurines.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg">
          <p className="text-muted-foreground">У вас пока нет фигурок. Прочитайте книгу до конца!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {figurines.map(f => (
            <div key={f.id} className="bg-card rounded-lg p-4 shadow hover:shadow-lg transition-shadow">
              <div className="aspect-square overflow-hidden rounded-lg mb-3 bg-muted">
                <img src={f.imageUrl} alt={f.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-semibold text-center">{f.name}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}