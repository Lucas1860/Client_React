import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookAPI, progressAPI } from '../api';
import { useAuth } from '../components/AuthContext';
import { X, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ReaderPage() {
  const { id: bookId } = useParams();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [book, setBook] = useState(null);
  const [questionsMap, setQuestionsMap] = useState({});
  const [answeredIds, setAnsweredIds] = useState(new Set());
  const [progress, setProgress] = useState({ percentComplete: 0, timeSpentSeconds: 0, completed: false });
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const heartbeatInterval = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const bookRes = await bookAPI.getById(bookId);
      setBook(bookRes.data);
      const qRes = await bookAPI.getQuestions(bookId);
      const map = {};
      qRes.data.forEach(q => { map[q.id] = q; });
      setQuestionsMap(map);
      const progRes = await progressAPI.getProgress(userId, bookId);
      setProgress(progRes.data);
      setAnsweredIds(new Set(progRes.data.answeredQuestionIds || []));
    };
    fetchData();
  }, [bookId, userId]);

  useEffect(() => {
    if (!userId || !bookId || progress.completed) return;
    heartbeatInterval.current = setInterval(() => {
      progressAPI.heartbeat(userId, bookId, 10).catch(console.error);
    }, 10000);
    return () => clearInterval(heartbeatInterval.current);
  }, [userId, bookId, progress.completed]);

  const handleFragmentClick = (questionId) => {
    if (answeredIds.has(questionId)) {
      toast.info('Вы уже ответили на этот вопрос');
      return;
    }
    const q = questionsMap[questionId];
    if (q) setCurrentQuestion(q);
  };

  const handleAnswer = async (questionId, optionLetter, characterWeights, achievementTags) => {
    try {
      const answerEvent = { userId, bookId, questionId, selectedOptionLetter: optionLetter, characterWeights, achievementTags };
      const res = await progressAPI.submitAnswer(answerEvent);
      const newProgress = res.data;
      setProgress(newProgress);
      setAnsweredIds(prev => new Set(prev).add(questionId));
      setCurrentQuestion(null);
      toast.success('Ответ принят!');
      if (newProgress.completed) {
        toast.success('Поздравляем! Вы полностью прочитали книгу и получили фигурку!', { duration: 5000 });
        setTimeout(() => navigate(`/book/${bookId}`), 3000);
      }
    } catch (err) {
      toast.error('Ошибка при отправке ответа');
    }
  };

  const renderTextWithLinks = () => {
    const fullText = book.fullText || '';
    const anchors = book.questionAnchors || [];
    if (!anchors.length) return <p>{fullText}</p>;
    const sorted = [...anchors].sort((a, b) => a.startOffset - b.startOffset);
    let lastIndex = 0;
    const parts = [];
    for (const anchor of sorted) {
      if (anchor.startOffset > lastIndex)
        parts.push(<span key={`text-${lastIndex}`}>{fullText.substring(lastIndex, anchor.startOffset)}</span>);
      const isAnswered = answeredIds.has(anchor.questionId);
      parts.push(
        <span
          key={`link-${anchor.questionId}`}
          onClick={() => handleFragmentClick(anchor.questionId)}
          className={`cursor-pointer border-b-2 border-dashed px-1 rounded transition-colors ${isAnswered ? 'bg-green-100 border-green-500' : 'border-primary hover:bg-primary/10'}`}
        >
          {fullText.substring(anchor.startOffset, anchor.endOffset)}
        </span>
      );
      lastIndex = anchor.endOffset;
    }
    if (lastIndex < fullText.length) parts.push(<span key="text-end">{fullText.substring(lastIndex)}</span>);
    return <div className="space-y-4 text-lg leading-relaxed">{parts}</div>;
  };

  // ресайз (без изменений)
  const handleMouseMove = (e) => {
    if (!isResizing) return;
    const newWidth = e.clientX - 64;
    if (newWidth >= 250 && newWidth <= 600) setSidebarWidth(newWidth);
  };
  const handleMouseUp = () => setIsResizing(false);
  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  if (!book) return <div className="p-8 text-center">Загрузка...</div>;

  return (
    <div className="fixed inset-0 top-16 bg-background flex flex-col">
      <div className="bg-card border-b border-border px-4 py-3 flex justify-between items-center">
        <h2 className="font-semibold text-foreground">{book.title}</h2>
        <button onClick={() => navigate(`/book/${bookId}`)} className="p-2 hover:bg-muted rounded-md transition-colors">
          <X size={20} className="text-foreground" />
        </button>
      </div>
      <div className="h-1 bg-muted"><div className="h-full bg-primary transition-all" style={{ width: `${progress.percentComplete}%` }} /></div>
      <div className="flex flex-1 overflow-hidden">
        <div className={`hidden md:block border-r border-border bg-card overflow-y-auto transition-all ${sidebarOpen ? '' : 'w-0'}`} style={{ width: sidebarOpen ? sidebarWidth : 0 }}>
          <div className="p-4">
            {currentQuestion ? (
              <div>
                <h3 className="font-bold mb-4 text-foreground">{currentQuestion.text}</h3>
                <div className="space-y-2">
                  {currentQuestion.options.map((opt) => (
                    <button key={opt.letter} onClick={() => handleAnswer(currentQuestion.id, opt.letter, opt.characterWeights, opt.achievementTags)} className="w-full text-left p-3 bg-input-background border border-border rounded-md hover:border-primary transition-colors">
                      <span className="font-medium mr-2">{opt.letter}.</span> {opt.text}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center">Нажмите на выделенный текст, чтобы ответить на вопрос</p>
            )}
          </div>
        </div>
        {sidebarOpen && <div className="w-1 bg-border hover:bg-primary cursor-col-resize transition-colors" onMouseDown={() => setIsResizing(true)} />}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-3xl mx-auto text-foreground">{renderTextWithLinks()}</div>
        </div>
      </div>
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden fixed bottom-4 right-4 w-12 h-12 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center">
        <HelpCircle size={24} />
      </button>
      {currentQuestion && (
        <div className="md:hidden fixed inset-x-0 bottom-0 bg-card border-t border-border p-4 max-h-[50vh] overflow-y-auto">
          <button onClick={() => setCurrentQuestion(null)} className="float-right p-1"><X size={20} /></button>
          <h3 className="font-bold mb-3">{currentQuestion.text}</h3>
          <div className="space-y-2">
            {currentQuestion.options.map(opt => (
              <button key={opt.letter} onClick={() => handleAnswer(currentQuestion.id, opt.letter, opt.characterWeights, opt.achievementTags)} className="w-full text-left p-2 border border-border rounded-md hover:border-primary">
                {opt.letter}. {opt.text}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}