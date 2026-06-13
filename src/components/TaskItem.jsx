import React from 'react';
import { useTasks } from '../context/TaskContext';

export default function TaskItem({ task }) {
  const { toggleComplete, deleteTask } = useTasks();

  // Função para formatar a data de vencimento de maneira elegante
  const formatDueDate = (dateStr) => {
    if (!dateStr) return '';
    
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const checkDate = new Date(date);
    checkDate.setHours(0,0,0,0);

    if (checkDate.getTime() === today.getTime()) {
      return { text: 'Hoje', status: 'today' };
    } else if (checkDate.getTime() === tomorrow.getTime()) {
      return { text: 'Amanhã', status: 'tomorrow' };
    } else if (checkDate.getTime() < today.getTime() && !task.completed) {
      return { text: `Atrasada (${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')})`, status: 'expired' };
    } else {
      const formatted = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
      return { text: formatted, status: 'normal' };
    }
  };

  const dateInfo = formatDueDate(task.dueDate);

  return (
    <div className={`task-item ${task.completed ? 'task-item-completed' : ''}`}>
      <div className="task-item-left">
        {/* Checkbox circular customizado */}
        <div 
          className={`custom-checkbox ${task.completed ? 'custom-checkbox-checked' : ''}`}
          onClick={() => toggleComplete(task.id)}
          title={task.completed ? "Marcar como pendente" : "Marcar como concluída"}
        />

        <div className="task-item-content">
          <span className="task-item-title">{task.title}</span>
          {task.description && (
            <p className="task-item-desc">{task.description}</p>
          )}
          
          <div className="task-item-meta">
            {/* Tag Categoria */}
            <span className={`tag tag-${task.category.toLowerCase()}`}>
              {task.category}
            </span>
            
            {/* Tag Prioridade */}
            <span className={`tag tag-prio-${task.priority.toLowerCase()}`}>
              {task.priority}
            </span>

            {/* Data de Vencimento com ícone de calendário */}
            <span className={`task-item-date ${dateInfo.status === 'expired' ? 'task-item-date-expired' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {dateInfo.text}
            </span>
          </div>
        </div>
      </div>

      <div className="task-item-right">
        {/* Botão de Excluir (Lixeira) */}
        <button 
          className="action-btn action-btn-delete"
          onClick={() => deleteTask(task.id)}
          title="Excluir tarefa"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            <line x1="10" y1="11" x2="10" y2="17"/>
            <line x1="14" y1="11" x2="14" y2="17"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
