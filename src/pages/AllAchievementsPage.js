import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { gamificationAPI } from '../api';
import { useAuth } from '../components/AuthContext';

export default function AllAchievementsPage() {
  const { userId } = useAuth();
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    gamificationAPI.getUserAchievements(userId).then(res => setAchievements(res.data));
  }, [userId]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to="/my-shelf" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6">
        <ArrowLeft size={20} /> Назад на полку
      </Link>
      <h1 className="text-3xl font-semibold mb-8">Все достижения</h1>
      {achievements.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg">
          <p className="text-muted-foreground">У вас пока нет достижений. Отвечайте на вопросы во время чтения!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {achievements.map(a => (
            <div key={a.id} className="bg-card rounded-lg p-6 shadow hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                <img src={a.imageUrl} alt={a.name} className="w-20 h-20 rounded-full object-cover" />
              </div>
              <h3 className="font-semibold text-center mb-2">{a.name}</h3>
              <p className="text-sm text-muted-foreground text-center">{a.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}