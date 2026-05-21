import { Link } from 'react-router-dom';

export default function BookCard({ book }) {
  return (
    <Link to={`/book/${book.id}`} className="group">
      <div className="bg-card rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow">
        <div className="aspect-[2/3] overflow-hidden bg-muted">
          <img src={book.cover} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div className="p-4">
          <h3 className="font-semibold mb-1 line-clamp-2 group-hover:text-primary transition-colors">{book.title}</h3>
          <p className="text-sm text-muted-foreground mb-2">{book.author}</p>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs px-2 py-1 bg-muted rounded">{book.classes?.join(', ')} кл.</span>
            <span className="text-xs px-2 py-1 bg-muted rounded capitalize">{book.genres?.[0]}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}