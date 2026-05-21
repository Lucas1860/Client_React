import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookAPI } from '../api';
import { toast } from 'sonner';
import { ArrowLeft, Plus, X } from 'lucide-react';

const emptyQuestion = {
  text: '',
  options: [
    { letter: 'А', text: '', characterWeights: {}, achievementTags: {} },
    { letter: 'Б', text: '', characterWeights: {}, achievementTags: {} },
  ],
  order: 0,
  startOffset: null,
  endOffset: null,
};

const emptyAchievement = { name: '', description: '', imageUrl: '', requiredTags: {} };
const emptyFigurine = { characterId: '', name: '', description: '', imageUrl: '' };

export default function AddBookPage() {
  const navigate = useNavigate();
  const [bookData, setBookData] = useState({
    title: '', author: '', description: '', coverImageUrl: '',
    classes: [], type: '', genres: [],
    fullText: '',
  });
  const [questions, setQuestions] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [figurines, setFigurines] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const textareaRef = useRef(null);

  const allGenres = ['роман', 'повесть', 'поэма', 'рассказ', 'драма', 'трагедия', 'фантастика', 'психологический', 'эпопея'];
  const classOptions = [1,2,3,4,5,6,7,8,9,10,11];

  const handleTextSelection = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start !== end) {
      setCurrentQuestion({ ...emptyQuestion, startOffset: start, endOffset: end });
      setQuestionModalOpen(true);
    }
  };

  const addOption = () => {
    if (currentQuestion.options.length >= 4) { toast.error('Максимум 4 варианта'); return; }
    const newLetter = String.fromCharCode(65 + currentQuestion.options.length);
    setCurrentQuestion({ ...currentQuestion, options: [...currentQuestion.options, { letter: newLetter, text: '', characterWeights: {}, achievementTags: {} }] });
  };

  const removeOption = (idx) => {
    if (currentQuestion.options.length <= 2) return;
    const newOptions = currentQuestion.options.filter((_, i) => i !== idx);
    newOptions.forEach((opt, i) => opt.letter = String.fromCharCode(65 + i));
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const updateOption = (idx, field, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[idx][field] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const updateWeight = (optIdx, type, key, value) => {
    const newOptions = [...currentQuestion.options];
    if (!newOptions[optIdx][type]) newOptions[optIdx][type] = {};
    newOptions[optIdx][type][key] = parseInt(value) || 0;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const addWeightKey = (optIdx, type) => {
    const key = prompt('Введите название персонажа или тега:');
    if (key) updateWeight(optIdx, type, key, 0);
  };

  const saveQuestion = () => {
    if (!currentQuestion.text) { toast.error('Введите текст вопроса'); return; }
    if (currentQuestion.options.some(opt => !opt.text)) { toast.error('Заполните все варианты ответов'); return; }
    setQuestions([...questions, { ...currentQuestion, order: questions.length }]);
    setQuestionModalOpen(false);
    setCurrentQuestion(null);
    toast.success('Вопрос добавлен');
  };

  const removeQuestion = (idx) => setQuestions(questions.filter((_, i) => i !== idx));

  const addAchievement = () => setAchievements([...achievements, { ...emptyAchievement }]);
  const updateAchievement = (idx, field, value) => {
    const newArr = [...achievements];
    newArr[idx][field] = value;
    setAchievements(newArr);
  };
  const addAchievementTag = (idx) => {
    const tag = prompt('Название тега (например "honor"):');
    if (tag) {
      const weight = parseInt(prompt('Необходимое количество:') || '0');
      const newArr = [...achievements];
      newArr[idx].requiredTags[tag] = weight;
      setAchievements(newArr);
    }
  };
  const removeAchievement = (idx) => setAchievements(achievements.filter((_, i) => i !== idx));

  const addFigurine = () => setFigurines([...figurines, { ...emptyFigurine }]);
  const updateFigurine = (idx, field, value) => {
    const newArr = [...figurines];
    newArr[idx][field] = value;
    setFigurines(newArr);
  };
  const removeFigurine = (idx) => setFigurines(figurines.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!bookData.title || !bookData.author) { toast.error('Заполните название и автора'); return; }
    if (bookData.classes.length === 0) toast.error('Выберите хотя бы один класс');
    if (!bookData.type) toast.error('Выберите тип');
    if (!bookData.fullText) toast.error('Вставьте текст книги');

    try {
      const bookRes = await bookAPI.create(bookData);
      const bookId = bookRes.data.id;

      for (const q of questions) {
        const { startOffset, endOffset, order, text, options } = q;
        const questionPayload = { bookId, text, options: options.map(opt => ({ letter: opt.letter, text: opt.text, characterWeights: opt.characterWeights, achievementTags: opt.achievementTags })), order };
        const qRes = await bookAPI.createQuestion(bookId, questionPayload);
        await bookAPI.addQuestionAnchor(bookId, { questionId: qRes.data.id, startOffset, endOffset, order });
      }
      for (const ach of achievements) await bookAPI.createAchievement(bookId, ach);
      for (const fig of figurines) await bookAPI.createFigurine(bookId, fig);

      toast.success('Книга успешно добавлена!');
      navigate('/catalog');
    } catch (err) {
      console.error(err);
      toast.error('Ошибка при добавлении книги');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button onClick={() => navigate('/catalog')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6">
        <ArrowLeft size={20} /> Назад в каталог
      </button>
      <h1 className="text-3xl font-semibold mb-8">Добавить книгу</h1>

      {/* Основная информация */}
      <div className="bg-card rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Основная информация</h2>
        <div className="space-y-4">
          <input type="text" placeholder="Название *" value={bookData.title} onChange={e => setBookData({...bookData, title: e.target.value})} className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
          <input type="text" placeholder="Автор *" value={bookData.author} onChange={e => setBookData({...bookData, author: e.target.value})} className="w-full px-4 py-2 bg-input-background border border-border rounded-md" />
          <textarea placeholder="Описание" rows={3} value={bookData.description} onChange={e => setBookData({...bookData, description: e.target.value})} className="w-full px-4 py-2 bg-input-background border border-border rounded-md" />
          <input type="url" placeholder="URL обложки" value={bookData.coverImageUrl} onChange={e => setBookData({...bookData, coverImageUrl: e.target.value})} className="w-full px-4 py-2 bg-input-background border border-border rounded-md" />
          <div><label className="block mb-1">Классы *</label><div className="flex flex-wrap gap-2">{classOptions.map(c => (
            <button key={c} type="button" onClick={() => setBookData({...bookData, classes: bookData.classes.includes(c) ? bookData.classes.filter(x=>x!==c) : [...bookData.classes, c]})} className={`px-3 py-1 border rounded-md transition-colors ${bookData.classes.includes(c) ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:bg-muted'}`}>{c}</button>
          ))}</div></div>
          <div><label className="block mb-1">Тип *</label><div className="flex gap-4">{['Русская классика', 'Зарубежная классика'].map(t => (
            <label key={t} className="flex items-center gap-2"><input type="radio" name="type" checked={bookData.type === t} onChange={() => setBookData({...bookData, type: t})} className="w-4 h-4" /> {t}</label>
          ))}</div></div>
          <div><label className="block mb-1">Жанры *</label><div className="grid grid-cols-3 gap-2">{allGenres.map(g => (
            <label key={g} className="flex items-center gap-2"><input type="checkbox" checked={bookData.genres.includes(g)} onChange={() => setBookData({...bookData, genres: bookData.genres.includes(g) ? bookData.genres.filter(x=>x!==g) : [...bookData.genres, g]})} className="w-4 h-4" /> <span className="capitalize">{g}</span></label>
          ))}</div></div>
        </div>
      </div>

      {/* Текст и вопросы */}
      <div className="bg-card rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Текст книги и вопросы</h2>
        <p className="text-sm text-muted-foreground mb-2">Выделите фрагмент текста и нажмите кнопку "Добавить вопрос"</p>
        <div className="relative">
          <textarea ref={textareaRef} value={bookData.fullText} onChange={e => setBookData({...bookData, fullText: e.target.value})} onMouseUp={handleTextSelection} rows={20} className="w-full px-4 py-3 bg-input-background border border-border rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Вставьте полный текст книги..." />
          <button type="button" onClick={handleTextSelection} className="absolute top-2 right-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">+ Вопрос</button>
        </div>
        {questions.length > 0 && <div className="mt-4 text-sm text-muted-foreground">Добавлено вопросов: {questions.length}</div>}
        {questions.map((q, idx) => (
          <div key={idx} className="mt-2 p-2 bg-muted rounded flex justify-between items-center">
            <span>Вопрос: {q.text} (offset {q.startOffset}–{q.endOffset})</span>
            <button onClick={() => removeQuestion(idx)} className="text-destructive"><X size={16} /></button>
          </div>
        ))}
      </div>

      {/* Достижения */}
      <div className="bg-card rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-semibold">Достижения</h2><button onClick={addAchievement} className="text-primary flex items-center gap-1"><Plus size={16} /> Добавить</button></div>
        {achievements.map((ach, idx) => (
          <div key={idx} className="border border-border p-4 mt-3 rounded-md">
            <input placeholder="Название" value={ach.name} onChange={e => updateAchievement(idx, 'name', e.target.value)} className="w-full mb-2 p-2 bg-input-background border border-border rounded-md" />
            <input placeholder="Описание" value={ach.description} onChange={e => updateAchievement(idx, 'description', e.target.value)} className="w-full mb-2 p-2 bg-input-background border border-border rounded-md" />
            <input placeholder="URL изображения" value={ach.imageUrl} onChange={e => updateAchievement(idx, 'imageUrl', e.target.value)} className="w-full mb-2 p-2 bg-input-background border border-border rounded-md" />
            <div className="mb-2"><span className="font-medium">Требуемые теги:</span> {Object.entries(ach.requiredTags).map(([k,v]) => <span key={k} className="inline-block bg-muted px-2 py-1 rounded text-sm mr-2">{k}: {v}</span>)} <button onClick={() => addAchievementTag(idx)} className="text-primary text-sm">+ добавить тег</button></div>
            <button onClick={() => removeAchievement(idx)} className="text-destructive text-sm">Удалить</button>
          </div>
        ))}
      </div>

      {/* Фигурки */}
      <div className="bg-card rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-semibold">Фигурки</h2><button onClick={addFigurine} className="text-primary flex items-center gap-1"><Plus size={16} /> Добавить</button></div>
        {figurines.map((fig, idx) => (
          <div key={idx} className="border border-border p-4 mt-3 rounded-md">
            <input placeholder="characterId (grinev, masha, shvabrin, pugachev, neutral)" value={fig.characterId} onChange={e => updateFigurine(idx, 'characterId', e.target.value)} className="w-full mb-2 p-2 bg-input-background border border-border rounded-md" />
            <input placeholder="Название фигурки" value={fig.name} onChange={e => updateFigurine(idx, 'name', e.target.value)} className="w-full mb-2 p-2 bg-input-background border border-border rounded-md" />
            <input placeholder="Описание" value={fig.description} onChange={e => updateFigurine(idx, 'description', e.target.value)} className="w-full mb-2 p-2 bg-input-background border border-border rounded-md" />
            <input placeholder="URL изображения" value={fig.imageUrl} onChange={e => updateFigurine(idx, 'imageUrl', e.target.value)} className="w-full mb-2 p-2 bg-input-background border border-border rounded-md" />
            <button onClick={() => removeFigurine(idx)} className="text-destructive text-sm">Удалить</button>
          </div>
        ))}
      </div>

      <button onClick={handleSubmit} className="w-full py-3 bg-primary text-primary-foreground rounded-md hover:bg-destructive transition-colors font-medium">Загрузить книгу</button>

      {/* Модалка вопроса */}
      {questionModalOpen && currentQuestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-card rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Добавить вопрос</h2>
            <input type="text" placeholder="Текст вопроса" value={currentQuestion.text} onChange={e => setCurrentQuestion({...currentQuestion, text: e.target.value})} className="w-full p-2 bg-input-background border border-border rounded-md mb-4" />
            <div className="space-y-4">
              {currentQuestion.options.map((opt, oi) => (
                <div key={oi} className="border border-border p-3 rounded-md bg-background">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{opt.letter}.</span>
                    <input value={opt.text} onChange={e => updateOption(oi, 'text', e.target.value)} placeholder="Текст варианта" className="flex-1 p-2 bg-input-background border border-border rounded-md" />
                    {currentQuestion.options.length > 2 && <button onClick={() => removeOption(oi)} className="text-destructive"><X size={16} /></button>}
                  </div>
                  <div className="ml-6 mt-2">
                    <div className="text-sm font-medium">Веса персонажей:</div>
                    {Object.entries(opt.characterWeights).map(([char, w]) => (
                      <div key={char} className="flex gap-2 items-center mt-1"><span>{char}</span><input type="number" value={w} onChange={e => updateWeight(oi, 'characterWeights', char, e.target.value)} className="w-20 p-1 bg-input-background border border-border rounded-md" /><button onClick={() => { const newOpt = {...opt}; delete newOpt.characterWeights[char]; updateOption(oi, 'characterWeights', newOpt.characterWeights); }} className="text-destructive text-xs">✖</button></div>
                    ))}
                    <button onClick={() => addWeightKey(oi, 'characterWeights')} className="text-primary text-sm mt-1">+ добавить персонажа</button>
                  </div>
                  <div className="ml-6 mt-2">
                    <div className="text-sm font-medium">Теги достижений:</div>
                    {Object.entries(opt.achievementTags).map(([tag, w]) => (
                      <div key={tag} className="flex gap-2 items-center mt-1"><span>{tag}</span><input type="number" value={w} onChange={e => updateWeight(oi, 'achievementTags', tag, e.target.value)} className="w-20 p-1 bg-input-background border border-border rounded-md" /><button onClick={() => { const newOpt = {...opt}; delete newOpt.achievementTags[tag]; updateOption(oi, 'achievementTags', newOpt.achievementTags); }} className="text-destructive text-xs">✖</button></div>
                    ))}
                    <button onClick={() => addWeightKey(oi, 'achievementTags')} className="text-primary text-sm mt-1">+ добавить тег</button>
                  </div>
                </div>
              ))}
              <button onClick={addOption} className="text-primary flex items-center gap-1"><Plus size={16} /> Добавить вариант</button>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setQuestionModalOpen(false)} className="flex-1 py-2 border border-border rounded-md hover:bg-muted">Отмена</button>
              <button onClick={saveQuestion} className="flex-1 py-2 bg-primary text-primary-foreground rounded-md hover:bg-destructive">Сохранить вопрос</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}