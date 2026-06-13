import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';

export default function TaskForm() {
  const { addTask, isTaskModalOpen, setIsTaskModalOpen } = useTasks();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Trabalho');
  const [priority, setPriority] = useState('Média');
  
  const [dueDate, setDueDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  if (!isTaskModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      dueDate
    });

    // Reset formulário
    setTitle('');
    setDescription('');
    setCategory('Trabalho');
    setPriority('Média');
    setDueDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsTaskModalOpen(false)}>
      <div className="modal-container card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="card-title" style={{ margin: 0 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--color-primary)'}}>
              <path d="M12 5v14"/>
              <path d="M5 12h14"/>
            </svg>
            Nova Tarefa
          </h2>
          <button className="modal-close-btn" onClick={() => setIsTaskModalOpen(false)} title="Fechar">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <div className="form-group">
            <label className="form-label">Título da Tarefa *</label>
            <input
              type="text"
              className="form-control"
              placeholder="O que precisa ser feito?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={100}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Descrição (Opcional)</label>
            <textarea
              className="form-control"
              placeholder="Adicione detalhes sobre a tarefa..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              maxLength={250}
              style={{resize: 'none'}}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Categoria</label>
            <div className="segmented-control">
              {['Trabalho', 'Pessoal', 'Estudos'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`segmented-control-btn ${category === cat ? 'active' : ''}`}
                  data-cat={cat}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Prioridade</label>
            <div className="segmented-control">
              {['Alta', 'Média', 'Baixa'].map((prio) => (
                <button
                  key={prio}
                  type="button"
                  className={`segmented-control-btn ${priority === prio ? 'active' : ''}`}
                  data-prio={prio}
                  onClick={() => setPriority(prio)}
                >
                  {prio}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Data de Conclusão</label>
            <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
              <input
                type="date"
                className="form-control"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                style={{paddingLeft: '40px'}}
              />
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{
                  position: 'absolute',
                  left: '14px',
                  color: 'var(--text-secondary)',
                  pointerEvents: 'none'
                }}
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
          </div>

          <button type="submit" className="btn-submit">
            Criar Tarefa
          </button>
        </form>
      </div>
    </div>
  );
}
