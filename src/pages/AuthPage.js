import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { Book } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthPage({ isRegister = false }) {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState(isRegister ? 'register' : 'login');
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (activeTab === 'login') {
        await login(formData.username, formData.password);
        navigate('/catalog');
      } else {
        await register({ username: formData.username, email: formData.email, password: formData.password });
        toast.success('Регистрация успешна! Теперь войдите.');
        setActiveTab('login');
        setFormData({ username: '', email: '', password: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Ошибка');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Book className="w-16 h-16 text-primary mx-auto" />
          <h1 className="text-3xl font-semibold mt-2">PlayBook</h1>
          <p className="text-muted-foreground">Образовательная платформа-читалка</p>
        </div>
        <div className="bg-card rounded-lg shadow-lg p-6">
          <div className="flex border-b border-border mb-6">
            <button className={`flex-1 pb-2 ${activeTab === 'login' ? 'border-b-2 border-primary text-primary font-medium' : 'text-muted-foreground'}`} onClick={() => setActiveTab('login')}>Вход</button>
            <button className={`flex-1 pb-2 ${activeTab === 'register' ? 'border-b-2 border-primary text-primary font-medium' : 'text-muted-foreground'}`} onClick={() => setActiveTab('register')}>Регистрация</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Логин" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required />
            {activeTab === 'register' && (
              <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required />
            )}
            <input type="password" placeholder="Пароль" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" required />
            <button type="submit" disabled={loading} className="w-full py-2 bg-primary text-primary-foreground rounded-md hover:bg-destructive transition-colors font-medium">
              {activeTab === 'login' ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}