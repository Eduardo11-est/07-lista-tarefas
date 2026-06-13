import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';

export default function KanbanView() {
  const { 
    tasks, 
    kanbanStatuses, 
    updateTaskStatus, 
    toggleComplete, 
    deleteTask 
  } = useTasks();

  const [activeDragId, setActiveDragId] = useState(null);
  const [activeDropColumn, setActiveDropColumn] = useState(null);

  // Status de fallback caso a consulta no banco ainda não tenha retornado
  const defaultColumns = [
    { name: 'Em espera', label: 'Em espera' },
    { name: 'Ativo', label: 'Ativo' },
    { name: 'Resolvido', label: 'Resolvido' },
    { name: 'Closed', label: 'Closed' }
  ];

  const columns = kanbanStatuses.length > 0 ? kanbanStatuses : defaultColumns;

  // Lida com o início do arrasto de um card
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
    setActiveDragId(taskId);
  };

  const handleDragEnd = () => {
    setActiveDragId(null);
    setActiveDropColumn(null);
  };

  // Lida com soltar o card em uma coluna
  const handleDrop = (e, columnStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      updateTaskStatus(taskId, columnStatus);
    }
    setActiveDropColumn(null);
  };

  const handleDragOver = (e, columnStatus) => {
    e.preventDefault();
    if (activeDropColumn !== columnStatus) {
      setActiveDropColumn(columnStatus);
    }
  };

  const handleDragLeave = () => {
    setActiveDropColumn(null);
  };

  // Formata data do card
  const formatCardDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}`;
  };

  return (
    <div className="kanban-container">
      <div className="kanban-header">
        <h2>Quadro Kanban</h2>
        <p>Arraste e solte os cards para atualizar o status em tempo real</p>
      </div>

      <div className="kanban-board">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.kanbanStatus === col.name);
          const isOver = activeDropColumn === col.name;

          return (
            <div 
              key={col.name} 
              className={`kanban-column ${isOver ? 'kanban-column-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, col.name)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.name)}
            >
              <div className="kanban-column-header">
                <span className="kanban-column-dot" data-col={col.name} />
                <h3 className="kanban-column-title">{col.label}</h3>
                <span className="kanban-column-count">{colTasks.length}</span>
              </div>

              <div className="kanban-cards-wrapper">
                {colTasks.length > 0 ? (
                  colTasks.map(task => {
                    const isDragging = activeDragId === task.id;
                    const dateText = formatCardDate(task.dueDate);

                    return (
                      <div 
                        key={task.id}
                        className={`kanban-card ${task.completed ? 'kanban-card-completed' : ''} ${isDragging ? 'kanban-card-dragging' : ''}`}
                        data-status={task.kanbanStatus}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragEnd={handleDragEnd}
                      >
                        <div className="kanban-card-top">
                          <div 
                            className={`custom-checkbox ${task.completed ? 'custom-checkbox-checked' : ''}`}
                            onClick={() => toggleComplete(task.id)}
                          />
                          <button 
                            className="kanban-card-delete-btn"
                            onClick={() => deleteTask(task.id)}
                            title="Excluir tarefa"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                          </button>
                        </div>

                        <div className="kanban-card-body">
                          <h4 className="kanban-card-title">{task.title}</h4>
                          {task.description && (
                            <p className="kanban-card-desc">{task.description}</p>
                          )}
                        </div>

                        <div className="kanban-card-footer">
                          <div className="kanban-card-tags">
                            <span className={`tag tag-${task.category.toLowerCase()}`}>
                              {task.category}
                            </span>
                            <span className={`tag tag-prio-${task.priority.toLowerCase()}`}>
                              {task.priority}
                            </span>
                          </div>
                          
                          {dateText && (
                            <span className="kanban-card-date">
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                              </svg>
                              {dateText}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="kanban-empty-column">
                    <span>Sem tarefas</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
