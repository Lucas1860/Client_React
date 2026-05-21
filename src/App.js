import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './components/AuthContext';
import Navigation from './components/Navigation';
import AuthPage from './pages/AuthPage';
import CatalogPage from './pages/CatalogPage';
import BookDetailPage from './pages/BookDetailPage';
import ReaderPage from './pages/ReaderPage';
import MyShelfPage from './pages/MyShelfPage';
import AllFigurinesPage from './pages/AllFigurinesPage';
import AllAchievementsPage from './pages/AllAchievementsPage';
import MyGroupsPage from './pages/MyGroupsPage';
import GroupPage from './pages/GroupPage';
import AddBookPage from './pages/AddBookPage';

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage isRegister />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }
  return (
    <>
      <Navigation />
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<Navigate to="/catalog" />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/book/:id" element={<BookDetailPage />} />
          <Route path="/reader/:id" element={<ReaderPage />} />
          <Route path="/my-shelf" element={<MyShelfPage />} />
          <Route path="/figurines" element={<AllFigurinesPage />} />
          <Route path="/achievements" element={<AllAchievementsPage />} />
          <Route path="/groups" element={<MyGroupsPage />} />
          <Route path="/group/:id" element={<GroupPage />} />
          {user?.role === 'ADMIN' && <Route path="/add-book" element={<AddBookPage />} />}
          <Route path="*" element={<Navigate to="/catalog" />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" richColors />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}