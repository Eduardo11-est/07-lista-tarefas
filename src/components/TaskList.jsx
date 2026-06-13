import React from 'react';
import { useTasks } from '../context/TaskContext';
import TaskItem from './TaskItem';

export default function TaskList() {
  const { 
    tasks, 
    isLoading,
    filter, 
    setFilter, 
    searchQuery, 
    setSearchQuery,
    setIsTaskModalOpen
  } = useTasks();

  // Filtra as tarefas pelo status e pela barra de busca
  const getFilteredTasks = () => {
    return tasks.filter(task => {
      // Filtro de status
      const matchesStatus = 
        (filter === 'Concluídas' && task.completed) ||
        (filter !== 'Concluídas' && !task.completed);
      
      // Filtro de busca textual
      const matchesSearch = 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesStatus && matchesSearch;
    });
  };

  const filteredTasks = getFilteredTasks();

  return (
    <div className="task-list-container">
      {/* Cabeçalho de filtros e barra de busca */}
      <div className="filters-container">
        <div className="filters-group">
          {['Todas', 'Pendentes', 'Concluídas'].map((status) => (
            <button
              key={status}
              className={`filter-btn ${filter === status ? 'active' : ''}`}
              onClick={() => setFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="search-and-add-wrapper">
          <div className="search-bar">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--text-tertiary)'}}>
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Pesquisar tarefas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button 
            className="btn-add-task-header"
            onClick={() => setIsTaskModalOpen(true)}
            title="Nova Tarefa"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>Nova Tarefa</span>
          </button>
        </div>
      </div>

      {/* Lista de tarefas renderizadas */}
      <div className="task-list-wrapper">
        {isLoading ? (
          // Skeleton de carregamento
          [1, 2, 3].map(i => (
            <div key={i} style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius-md)',
              padding: '20px',
              display: 'flex',
              gap: '16px',
              alignItems: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-input)', flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ height: 16, width: `${70 - i * 10}%`, borderRadius: 6, background: 'var(--bg-input)' }} />
                <div style={{ height: 12, width: '40%', borderRadius: 6, background: 'var(--bg-input)' }} />
              </div>
            </div>
          ))
        ) : filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <TaskItem key={task.id} task={task} />
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
            </div>
            <h3>Nenhuma tarefa encontrada</h3>
            <p>
              {searchQuery 
                ? 'Tente mudar o termo da busca ou o filtro selecionado.' 
                : 'Crie uma nova tarefa no formulário lateral para começar!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
