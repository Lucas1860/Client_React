import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { bookAPI } from '../api';

export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);

  useEffect(() => {
    bookAPI.getById(id).then(res => setBook(res.data)).catch(() => navigate('/catalog'));
  }, [id, navigate]);

  if (!book) return <div className="p-8 text-center">Загрузка...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button onClick={() => navigate('/catalog')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6">
        <ArrowLeft size={20} /> Назад в каталог
      </button>
      <div className="grid md:grid-cols-[300px,1fr] gap-8">
        <div className="bg-card rounded-lg overflow-hidden shadow-lg">
          <img src={book.coverImageUrl} alt={book.title} className="w-full aspect-[2/3] object-cover" />
        </div>
        <div>
          <h1 className="text-3xl font-semibold mb-2">{book.title}</h1>
          <p className="text-xl text-muted-foreground mb-6">{book.author}</p>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Описание</h2>
            <p className="leading-relaxed">{book.description}</p>
          </div>
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3">Теги</h2>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-card text-foreground rounded-md border border-border">Класс: {book.classes?.join(', ')}</span>
              <span className="px-3 py-1 bg-card text-foreground rounded-md border border-border">{book.type}</span>
              {book.genres?.map(g => <span key={g} className="px-3 py-1 bg-card text-foreground rounded-md border border-border capitalize">{g}</span>)}
            </div>
          </div>
          <Link to={`/reader/${book.id}`} className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-destructive transition-colors font-medium">
            <BookOpen size={20} /> Читать
          </Link>
        </div>
      </div>
    </div>
  );
}