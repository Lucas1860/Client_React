import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X, Check } from 'lucide-react';
import { bookAPI } from '../api';
import BookCard from '../components/BookCard';
import * as Dialog from '@radix-ui/react-dialog';
import * as Checkbox from '@radix-ui/react-checkbox';

export default function CatalogPage() {
  const [books, setBooks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ classes: [], types: [], genres: [] });
  const [allGenres, setAllGenres] = useState([]);

  useEffect(() => {
    bookAPI.getAll().then(res => {
      setBooks(res.data);
      setFiltered(res.data);
      const genresSet = new Set();
      res.data.forEach(book => book.genres?.forEach(g => genresSet.add(g)));
      setAllGenres(Array.from(genresSet));
    });
  }, []);

  useEffect(() => {
    let result = books;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
    }
    if (filters.classes.length) {
      result = result.filter(b => b.classes?.some(c => filters.classes.includes(c)));
    }
    if (filters.types.length) {
      result = result.filter(b => filters.types.includes(b.type));
    }
    if (filters.genres.length) {
      result = result.filter(b => b.genres?.some(g => filters.genres.includes(g)));
    }
    setFiltered(result);
  }, [search, filters, books]);

  const toggleClass = (classNum) => {
    setFilters(prev => ({
      ...prev,
      classes: prev.classes.includes(classNum) ? prev.classes.filter(c => c !== classNum) : [...prev.classes, classNum]
    }));
  };
  const toggleType = (type) => {
    setFilters(prev => ({
      ...prev,
      types: prev.types.includes(type) ? prev.types.filter(t => t !== type) : [...prev.types, type]
    }));
  };
  const toggleGenre = (genre) => {
    setFilters(prev => ({
      ...prev,
      genres: prev.genres.includes(genre) ? prev.genres.filter(g => g !== genre) : [...prev.genres, genre]
    }));
  };
  const clearFilters = () => setFilters({ classes: [], types: [], genres: [] });
  const hasActiveFilters = filters.classes.length > 0 || filters.types.length > 0 || filters.genres.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Поиск по названию или автору..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <Dialog.Root open={filterOpen} onOpenChange={setFilterOpen}>
          <Dialog.Trigger asChild>
            <button className="px-6 py-2 bg-card border border-border rounded-md hover:bg-muted transition-colors flex items-center gap-2">
              <SlidersHorizontal size={20} /> Фильтры
              {hasActiveFilters && <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">{filters.classes.length + filters.types.length + filters.genres.length}</span>}
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto z-50 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <Dialog.Title className="text-xl font-semibold">Фильтры</Dialog.Title>
                <Dialog.Close asChild><button className="p-1 hover:bg-muted rounded"><X size={20} /></button></Dialog.Close>
              </div>
              {/* Классы */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Класс</h3>
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(11)].map((_, i) => {
                    const classNum = i + 1;
                    const isSelected = filters.classes.includes(classNum);
                    return (
                      <button
                        key={classNum}
                        onClick={() => toggleClass(classNum)}
                        className={`py-2 px-3 rounded-md border transition-colors ${isSelected ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:bg-muted'}`}
                      >{classNum}</button>
                    );
                  })}
                </div>
              </div>
              {/* Типы */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Тип</h3>
                <div className="space-y-2">
                  {['Русская классика', 'Зарубежная классика'].map(type => (
                    <label key={type} className="flex items-center gap-3 cursor-pointer">
                      <Checkbox.Root checked={filters.types.includes(type)} onCheckedChange={() => toggleType(type)} className="w-5 h-5 bg-background border border-border rounded flex items-center justify-center data-[state=checked]:bg-primary data-[state=checked]:border-primary">
                        <Checkbox.Indicator><Check className="w-4 h-4 text-primary-foreground" /></Checkbox.Indicator>
                      </Checkbox.Root>
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Жанры */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Жанры</h3>
                <div className="space-y-2">
                  {allGenres.map(genre => (
                    <label key={genre} className="flex items-center gap-3 cursor-pointer">
                      <Checkbox.Root checked={filters.genres.includes(genre)} onCheckedChange={() => toggleGenre(genre)} className="w-5 h-5 bg-background border border-border rounded flex items-center justify-center data-[state=checked]:bg-primary data-[state=checked]:border-primary">
                        <Checkbox.Indicator><Check className="w-4 h-4 text-primary-foreground" /></Checkbox.Indicator>
                      </Checkbox.Root>
                      <span className="capitalize">{genre}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={clearFilters} className="flex-1 py-2 border border-border rounded-md hover:bg-muted">Очистить</button>
                <Dialog.Close asChild><button className="flex-1 py-2 bg-primary text-primary-foreground rounded-md hover:bg-destructive">Применить</button></Dialog.Close>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Книги не найдены</p>
          {hasActiveFilters && <button onClick={clearFilters} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-destructive">Очистить фильтры</button>}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filtered.map(book => <BookCard key={book.id} book={book} />)}
        </div>
      )}
    </div>
  );
}