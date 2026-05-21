import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { groupAPI, progressAPI, bookAPI } from '../api';
import { useAuth } from '../components/AuthContext';
import { ArrowLeft, BookOpen, UserMinus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function GroupPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId, user } = useAuth();
  const [group, setGroup] = useState(null);
  const [membersProgress, setMembersProgress] = useState({});
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [books, setBooks] = useState([]);
  const [completedDetails, setCompletedDetails] = useState(null);

  const loadGroup = async () => {
    try {
      const res = await groupAPI.getGroup(id);
      setGroup(res.data);
      if (res.data.assignedBook) {
        const progRes = await progressAPI.getBatchProgress(res.data.memberUserIds, res.data.assignedBook.bookId);
        const map = {};
        progRes.data.forEach(p => { map[p.userId] = p; });
        setMembersProgress(map);
      }
    } catch {
      toast.error('Группа не найдена');
      navigate('/groups');
    }
  };

  useEffect(() => {
    loadGroup();
    bookAPI.getAll().then(res => setBooks(res.data)).catch(console.error);
  }, [id]);

  const isAdmin = group?.adminUserId === userId;

  const handleAssignBook = async () => {
    if (!selectedBookId || !deadline) { toast.error('Выберите книгу и дату'); return; }
    const book = books.find(b => b.id === selectedBookId);
    if (!book) return;
    try {
      await groupAPI.assignBook(id, selectedBookId, book.title, new Date(deadline));
      toast.success('Книга назначена');
      setAssignModalOpen(false);
      setSelectedBookId('');
      setDeadline('');
      loadGroup();
    } catch { toast.error('Не удалось назначить книгу'); }
  };

  const handleRemoveAssignment = async () => {
    if (!window.confirm('Удалить назначенную книгу?')) return;
    try {
      await groupAPI.removeAssignedBook(id);
      toast.success('Назначение удалено');
      loadGroup();
    } catch { toast.error('Ошибка'); }
  };

  const handleCompleteDeadline = async () => {
    if (!window.confirm('Завершить дедлайн? Книга переместится в "Прочитанное".')) return;
    try {
      await groupAPI.completeDeadline(id);
      toast.success('Дедлайн завершён');
      loadGroup();
    } catch { toast.error('Ошибка'); }
  };

  const handleRemoveMember = async (targetUserId) => {
    if (!window.confirm('Исключить участника?')) return;
    try {
      await groupAPI.removeMember(id, targetUserId);
      toast.success('Участник исключён');
      loadGroup();
    } catch { toast.error('Ошибка'); }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm('Выйти из группы?')) return;
    try {
      await groupAPI.leave(id);
      navigate('/groups');
    } catch (err) { toast.error(err.response?.data?.message || 'Ошибка'); }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm('Удалить группу навсегда?')) return;
    try {
      await groupAPI.deleteGroup(id);
      navigate('/groups');
    } catch { toast.error('Ошибка'); }
  };

  if (!group) return <div className="p-8 text-center">Загрузка...</div>;

  const assignedBook = group.assignedBook;
  const isDeadlinePassed = assignedBook && new Date(assignedBook.deadline) < new Date();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button onClick={() => navigate('/groups')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6">
        <ArrowLeft size={20} /> Назад к группам
      </button>

      {/* Шапка */}
      <div className="bg-card rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-semibold mb-2">{group.name}</h1>
            <div className="flex flex-wrap gap-4 text-sm">
              <span>Код группы: <span className="font-mono font-bold">{group.inviteCode}</span></span>
              {assignedBook && (
                <>
                  <span>Книга: <Link to={`/book/${assignedBook.bookId}`} className="text-primary hover:underline">{assignedBook.bookTitle}</Link></span>
                  <span className={isDeadlinePassed ? 'text-destructive font-medium' : ''}>Дедлайн: {new Date(assignedBook.deadline).toLocaleDateString('ru-RU')}</span>
                  <Link to={`/reader/${assignedBook.bookId}`} className="flex items-center gap-1 text-primary"><BookOpen size={16} /> Читать</Link>
                </>
              )}
            </div>
          </div>
          {isAdmin && (
            <button onClick={handleDeleteGroup} className="p-2 text-destructive hover:bg-destructive/10 rounded transition-colors" title="Удалить группу">
              <Trash2 size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Управление админа */}
      {isAdmin && (
        <div className="bg-card rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Управление группой</h2>
          <div className="flex flex-wrap gap-3">
            {!assignedBook && (
              <button onClick={() => setAssignModalOpen(true)} className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-destructive transition-colors">Назначить книгу</button>
            )}
            {assignedBook && (
              <>
                <button onClick={handleRemoveAssignment} className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/80">Удалить назначенную книгу</button>
                <button onClick={handleCompleteDeadline} className="px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary hover:text-primary-foreground transition-colors">Завершить дедлайн</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Участники */}
      <div className="bg-card rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Участники ({group.memberUserIds.length})</h2>
        <div className="space-y-3">
          {group.memberUserIds.map(mid => {
            const progress = membersProgress[mid];
            return (
              <div key={mid} className="flex items-center justify-between p-3 bg-background rounded-md">
                <div>
                  <span className="font-medium">Пользователь {mid.slice(-6)}</span>
                  {mid === group.adminUserId && <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">Админ</span>}
                  {progress && (
                    <div className="text-sm text-muted-foreground">
                      Прогресс: {progress.percentComplete}% {progress.completed && '✅'}
                      {progress.completed && progress.timeSpentSeconds > 0 && ` (${Math.floor(progress.timeSpentSeconds / 60)} мин)`}
                    </div>
                  )}
                </div>
                {isAdmin && mid !== userId && (
                  <button onClick={() => handleRemoveMember(mid)} className="p-2 text-destructive hover:bg-destructive/10 rounded transition-colors" title="Исключить">
                    <UserMinus size={18} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
        {!isAdmin && (
          <button onClick={handleLeaveGroup} className="mt-4 text-destructive hover:underline">Выйти из группы</button>
        )}
      </div>

      {/* Прочитанное */}
      {group.completedAssignments?.length > 0 && (
        <div className="bg-card rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Прочитанное</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {group.completedAssignments.map((ca, idx) => (
              <button key={idx} onClick={() => setCompletedDetails(ca)} className="text-left p-3 border border-border rounded-md hover:bg-muted transition-colors">
                <div className="font-medium">{ca.bookTitle}</div>
                <div className="text-sm text-muted-foreground">Дедлайн: {new Date(ca.deadline).toLocaleDateString('ru-RU')}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Модалка назначения книги */}
      {assignModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Назначить книгу</h2>
              <button onClick={() => setAssignModalOpen(false)}><X size={20} /></button>
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Книга</label>
              <select value={selectedBookId} onChange={e => setSelectedBookId(e.target.value)} className="w-full px-3 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">-- Выберите книгу --</option>
                {books.map(book => <option key={book.id} value={book.id}>{book.title} – {book.author}</option>)}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Дедлайн</label>
              <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full px-3 py-2 bg-input-background border border-border rounded-md" min={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setAssignModalOpen(false)} className="flex-1 py-2 border border-border rounded-md hover:bg-muted">Отмена</button>
              <button onClick={handleAssignBook} className="flex-1 py-2 bg-primary text-primary-foreground rounded-md hover:bg-destructive">Назначить</button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка результатов прочитанной книги */}
      {completedDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Результаты: {completedDetails.bookTitle}</h2>
              <button onClick={() => setCompletedDetails(null)}><X size={20} /></button>
            </div>
            <div className="space-y-2">
              {completedDetails.memberSnapshots.map(snap => (
                <div key={snap.userId} className="flex justify-between p-2 border-b border-border">
                  <span>Пользователь {snap.userId.slice(-6)}</span>
                  <span>{snap.progressPercent}% {snap.progressPercent === 100 && ` (${Math.floor(snap.timeSpentSeconds / 60)} мин)`}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}