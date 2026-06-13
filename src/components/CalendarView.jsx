import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';

export default function CalendarView() {
  const { tasks, toggleComplete } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Estado para controlar o modal de tarefas do dia selecionado
  const [selectedDateTasks, setSelectedDateTasks] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Nomes dos meses e dias da semana
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekdayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Navegar para o mês anterior
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  // Navegar para o próximo mês
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Obter informações sobre os dias do mês atual
  const getDaysInMonth = () => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const totalDaysPrev = new Date(year, month, 0).getDate();

    const days = [];

    // Preencher dias do mês anterior (inativos no grid)
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = totalDaysPrev - i;
      const dateStr = `${year}-${(month === 0 ? 12 : month).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
      days.push({
        day: dayNum,
        isCurrentMonth: false,
        dateStr,
        tasks: []
      });
    }

    // Preencher dias do mês atual
    const today = new Date();
    for (let i = 1; i <= totalDays; i++) {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
      const isToday = 
        today.getDate() === i && 
        today.getMonth() === month && 
        today.getFullYear() === year;

      // Filtrar tarefas vinculadas a essa data específica
      const dayTasks = tasks.filter(t => t.dueDate === dateStr);

      days.push({
        day: i,
        isCurrentMonth: true,
        isToday,
        dateStr,
        tasks: dayTasks
      });
    }

    // Preencher dias do próximo mês para completar o grid (múltiplo de 7)
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const dateStr = `${year}-${(month + 2 === 13 ? 1 : month + 2).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
      days.push({
        day: i,
        isCurrentMonth: false,
        dateStr,
        tasks: []
      });
    }

    return days;
  };

  const daysGrid = getDaysInMonth();

  // Função para abrir o modal de tarefas de um dia específico
  const handleDayClick = (dayInfo) => {
    if (!dayInfo.isCurrentMonth || dayInfo.tasks.length === 0) return;
    
    // Formatar data legível para o cabeçalho do modal
    const [y, m, d] = dayInfo.dateStr.split('-').map(Number);
    const formattedDate = `${d.toString().padStart(2, '0')} de ${monthNames[m - 1]} de ${y}`;
    
    setSelectedDateTasks({
      dateLabel: formattedDate,
      dateStr: dayInfo.dateStr,
      tasks: dayInfo.tasks
    });
  };

  // Cores de fundo das tarefas no calendário por categoria
  const getCategoryColor = (cat, completed) => {
    if (completed) return 'var(--border-color)';
    const colors = {
      'Trabalho': '#e0f2fe',
      'Pessoal': '#dcfce7',
      'Estudos': '#fef3c7'
    };
    return colors[cat] || 'var(--bg-input)';
  };

  const getCategoryTextColor = (cat, completed) => {
    if (completed) return 'var(--text-tertiary)';
    const colors = {
      'Trabalho': '#0369a1',
      'Pessoal': '#15803d',
      'Estudos': '#b45309'
    };
    return colors[cat] || 'var(--text-secondary)';
  };

  // Atualiza a lista de tarefas no modal quando alguma é concluída/reaberta
  const handleToggleCompleteInModal = (taskId) => {
    toggleComplete(taskId);
    
    // Atualiza o estado das tarefas no modal dinamicamente
    setSelectedDateTasks(prev => {
      if (!prev) return null;
      const updatedTasks = prev.tasks.map(t => 
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
      return {
        ...prev,
        tasks: updatedTasks
      };
    });
  };

  return (
    <div className="calendar-container" style={{animation: 'fadeIn 0.3s ease-out'}}>
      {/* Cabeçalho do Calendário */}
      <div className="calendar-header">
        <h2 className="calendar-month-title">
          {monthNames[month]} {year}
        </h2>
        <div className="calendar-nav-buttons">
          <button className="calendar-nav-btn" onClick={handlePrevMonth} title="Mês Anterior">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <button className="calendar-nav-btn" onClick={handleNextMonth} title="Próximo Mês">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Dias da semana */}
      <div className="calendar-grid-weekdays">
        {weekdayNames.map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Grid de dias do mês */}
      <div className="calendar-grid-days">
        {daysGrid.map((dayInfo, index) => (
          <div
            key={index}
            className={`calendar-day-cell ${!dayInfo.isCurrentMonth ? 'calendar-day-cell-inactive' : ''} ${dayInfo.isToday ? 'calendar-day-today' : ''}`}
            onClick={() => handleDayClick(dayInfo)}
            style={{ cursor: (dayInfo.isCurrentMonth && dayInfo.tasks.length > 0) ? 'pointer' : 'default' }}
          >
            <span className="calendar-day-number">{dayInfo.day}</span>
            
            <div className="calendar-day-tasks">
              {dayInfo.tasks.map(task => (
                <div
                  key={task.id}
                  className={`calendar-task-bar ${task.completed ? 'calendar-task-bar-completed' : ''}`}
                  style={{
                    backgroundColor: getCategoryColor(task.category, task.completed),
                    color: getCategoryTextColor(task.category, task.completed),
                    borderLeft: `3px solid ${task.completed ? 'var(--text-tertiary)' : (task.priority === 'Alta' ? 'var(--color-danger)' : (task.priority === 'Média' ? '#f59e0b' : 'var(--text-secondary)'))}`
                  }}
                  title={task.title}
                >
                  {task.title}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal elegante de visualização de tarefas do dia */}
      {selectedDateTasks && (
        <div className="modal-overlay" onClick={() => setSelectedDateTasks(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedDateTasks(null)}>×</button>
            <h3 style={{marginBottom: '16px', fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary)'}}>
              Tarefas para {selectedDateTasks.dateLabel}
            </h3>
            
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
              {selectedDateTasks.tasks.map(task => (
                <div 
                  key={task.id} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: 'var(--bg-primary)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div 
                    className={`custom-checkbox ${task.completed ? 'custom-checkbox-checked' : ''}`}
                    onClick={() => handleToggleCompleteInModal(task.id)}
                  />
                  <div style={{flex: 1}}>
                    <span style={{
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      textDecoration: task.completed ? 'line-through' : 'none',
                      color: task.completed ? 'var(--text-tertiary)' : 'var(--text-primary)'
                    }}>
                      {task.title}
                    </span>
                    <div style={{display: 'flex', gap: '8px', marginTop: '4px'}}>
                      <span className={`tag tag-${task.category.toLowerCase()}`} style={{fontSize: '0.65rem', padding: '1px 6px'}}>
                        {task.category}
                      </span>
                      <span className={`tag tag-prio-${task.priority.toLowerCase()}`} style={{fontSize: '0.65rem', padding: '1px 6px'}}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
