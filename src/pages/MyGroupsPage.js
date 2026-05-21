import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { groupAPI } from '../api';
import { useAuth } from '../components/AuthContext';
import { Dialog } from '@radix-ui/react-dialog';
import { Plus, Settings, Users, X } from 'lucide-react';
import { toast } from 'sonner';

export default function MyGroupsPage() {
  const { userId } = useAuth();
  const [groups, setGroups] = useState([]);
  const [joinCode, setJoinCode] = useState('');
  const [createName, setCreateName] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const loadGroups = async () => {
    try {
      const res = await groupAPI.getMyGroups();
      setGroups(res.data);
    } catch { toast.error('Не удалось загрузить группы'); }
  };

  useEffect(() => { loadGroups(); }, [userId]);

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    try {
      await groupAPI.join(joinCode.trim());
      toast.success('Вы вступили в группу');
      setJoinCode('');
      loadGroups();
    } catch { toast.error('Ошибка при вступлении'); }
  };

  const handleCreate = async () => {
    if (!createName.trim()) return;
    try {
      await groupAPI.create(createName);
      toast.success('Группа создана');
      setCreateName('');
      setCreateOpen(false);
      loadGroups();
    } catch { toast.error('Ошибка создания'); }
  };

  const handleDelete = async (groupId) => {
    try {
      await groupAPI.deleteGroup(groupId);
      toast.success('Группа удалена');
      loadGroups();
    } catch { toast.error('Не удалось удалить группу'); }
    setDeleteConfirm(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-8">Мои группы</h1>

      <div className="bg-card rounded-lg shadow p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              placeholder="Код группы"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="flex-1 px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button onClick={handleJoin} className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-destructive transition-colors">Вступить</button>
          </div>
          <button onClick={() => setCreateOpen(true)} className="px-6 py-2 border-2 border-primary text-primary rounded-md hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center gap-2">
            <Plus size={18} /> Создать группу
          </button>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="bg-card rounded-lg shadow p-12 text-center text-muted-foreground">Вы пока не состоите ни в одной группе</div>
      ) : (
        <div className="space-y-4">
          {groups.map(group => (
            <div key={group.id} className="bg-card rounded-lg shadow p-6 flex justify-between items-center">
              <Link to={`/group/${group.id}`} className="flex-1">
                <h2 className="text-xl font-semibold hover:text-primary transition-colors">{group.name}</h2>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1"><Users size={14} /> {group.memberUserIds.length} участников</span>
                  {group.adminUserId === userId && <span className="text-primary font-medium">Администратор</span>}
                  {group.assignedBook && <span className="text-destructive">Назначена книга: {group.assignedBook.bookTitle}</span>}
                </div>
              </Link>
              {group.adminUserId === userId && (
                <div className="relative">
                  <button onClick={() => setDeleteConfirm(deleteConfirm === group.id ? null : group.id)} className="p-2 hover:bg-muted rounded transition-colors">
                    <Settings size={20} />
                  </button>
                  {deleteConfirm === group.id && (
                    <div className="absolute right-0 mt-2 bg-card border border-border rounded shadow-lg p-2 z-10">
                      <button onClick={() => handleDelete(group.id)} className="px-3 py-1 text-destructive hover:bg-muted rounded w-full text-left">Удалить группу</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {createOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Создать группу</h2>
              <button onClick={() => setCreateOpen(false)}><X size={20} /></button>
            </div>
            <input type="text" placeholder="Название группы" value={createName} onChange={e => setCreateName(e.target.value)} className="w-full px-4 py-2 bg-input-background border border-border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-primary" autoFocus />
            <div className="flex gap-3">
              <button onClick={() => setCreateOpen(false)} className="flex-1 py-2 border border-border rounded-md hover:bg-muted">Отмена</button>
              <button onClick={handleCreate} className="flex-1 py-2 bg-primary text-primary-foreground rounded-md hover:bg-destructive">Создать</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}