import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { shelfAPI, gamificationAPI } from '../api';
import { useAuth } from '../components/AuthContext';
import BookCard from '../components/BookCard';

export default function MyShelfPage() {
  const { userId } = useAuth();
  const [shelf, setShelf] = useState(null);
  const [figurines, setFigurines] = useState([]);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    shelfAPI.getMyShelf().then(res => setShelf(res.data));
    gamificationAPI.getUserFigurines(userId).then(res => setFigurines(res.data));
    gamificationAPI.getUserAchievements(userId).then(res => setAchievements(res.data));
  }, [userId]);

  if (!shelf) return <div className="p-8 text-center">Загрузка...</div>;

  const recentFigurines = figurines.slice(-3).reverse();
  const recentAchievements = achievements.slice(-3).reverse();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-80 space-y-6">
          <div className="bg-card rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Фигурки</h2>
            {recentFigurines.length === 0 && <p className="text-muted-foreground">Пока нет фигурок</p>}
            {recentFigurines.map(f => (
              <div key={f.id} className="flex items-center gap-3 mb-2">
                <img src={f.imageUrl} alt={f.name} className="w-12 h-12 rounded-full object-cover" />
                <span className="text-foreground">{f.name}</span>
              </div>
            ))}
            {figurines.length > 3 && <Link to="/figurines" className="text-primary hover:text-destructive">Все фигурки →</Link>}
          </div>
          <div className="bg-card rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Достижения</h2>
            {recentAchievements.length === 0 && <p className="text-muted-foreground">Пока нет достижений</p>}
            {recentAchievements.map(a => (
              <div key={a.id} className="flex items-center gap-3 mb-2">
                <img src={a.imageUrl} alt={a.name} className="w-12 h-12 rounded-full object-cover" />
                <div><div className="font-medium">{a.name}</div><div className="text-xs text-muted-foreground">{a.description}</div></div>
              </div>
            ))}
            {achievements.length > 3 && <Link to="/achievements" className="text-primary hover:text-destructive">Все достижения →</Link>}
          </div>
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-semibold mb-6">Моя полка</h1>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {shelf.books?.map(book => <BookCard key={book.bookId} book={{ id: book.bookId, title: book.bookTitle, cover: book.bookCover, author: '' }} />)}
          </div>
          {(!shelf.books || shelf.books.length === 0) && <p className="text-muted-foreground text-center py-8">Вы ещё не прочитали ни одной книги</p>}
        </div>
      </div>
    </div>
  );
}