import React from 'react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { currentTab, setCurrentTab, tasks, triggerNotification } = useTasks();
  const { user, profile, signOut, updateTheme } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      triggerNotification('Sessão encerrada com sucesso! Até logo! 👋');
    } catch (error) {
      console.error('Erro ao deslogar:', error.message);
      triggerNotification('Erro ao encerrar a sessão.');
    }
  };

  const navItems = [
    {
      name: 'Tarefas',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
          <path d="m9 12 2 2 4-4"/>
        </svg>
      )
    },
    {
      name: 'Kanban',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <line x1="9" y1="3" x2="9" y2="21"/>
          <line x1="15" y1="3" x2="15" y2="21"/>
        </svg>
      )
    },
    {
      name: 'Calendário',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      )
    },
    {
      name: 'Backup',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      )
    }
  ];

  // Adiciona aba Administração se o perfil for Administrador
  if (profile?.role === 'Administrador') {
    navItems.push({
      name: 'Administração',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      )
    });
  }

  // Lógica do contador do Sino de Lembretes/Notificações
  const todayStr = new Date().toISOString().split('T')[0];
  const urgentCount = tasks.filter(t => !t.completed && t.dueDate && t.dueDate <= todayStr).length;

  const handleUrgentClick = () => {
    const urgentTasks = tasks.filter(t => !t.completed && t.dueDate && t.dueDate <= todayStr);
    if (urgentTasks.length > 0) {
      const titles = urgentTasks.map(t => `"${t.title}"`).join(', ');
      triggerNotification(`Tarefas pendentes urgentes: ${titles}`);
    } else {
      triggerNotification('Nenhuma tarefa pendente vencendo hoje ou atrasada! 😊');
    }
  };

  const themePreference = profile?.theme || 'auto';

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <div className="navbar-logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          <span className="navbar-logo-text">Agilis</span>
        </div>

        <nav>
          <ul className="navbar-menu">
            {navItems.map((item) => (
              <li 
                key={item.name} 
                className={`navbar-item ${currentTab === item.name ? 'active' : ''}`}
              >
                <button onClick={() => setCurrentTab(item.name)}>
                  {item.icon}
                  <span>{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="navbar-actions">
          {/* Sino de Notificações Urgentes */}
          <button 
            className={`navbar-urgent-btn ${urgentCount > 0 ? 'has-urgent animate-pulse' : ''}`} 
            onClick={handleUrgentClick} 
            title={urgentCount > 0 ? `${urgentCount} tarefa(s) pendente(s) hoje/atrasada(s)` : 'Sem pendências urgentes hoje'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {urgentCount > 0 && (
              <span className="urgent-badge">{urgentCount}</span>
            )}
          </button>

          {/* Seletor de Tema Persistido */}
          <div className="theme-toggle-group" title="Selecione o Tema">
            <button 
              className={`theme-btn ${themePreference === 'light' ? 'active' : ''}`} 
              onClick={() => updateTheme('light')} 
              title="Tema Claro"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            </button>
            
            <button 
              className={`theme-btn ${themePreference === 'dark' ? 'active' : ''}`} 
              onClick={() => updateTheme('dark')} 
              title="Tema Escuro"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            </button>
            
            <button 
              className={`theme-btn ${themePreference === 'auto' ? 'active' : ''}`} 
              onClick={() => updateTheme('auto')} 
              title="Automático (baseado no horário)"
            >
              <span className="theme-btn-auto-text">AUTO</span>
            </button>
          </div>

          {user && (
            <div className="navbar-user">
              <div className="navbar-user-avatar">
                {user.email ? user.email.substring(0, 2).toUpperCase() : 'U'}
              </div>
              <span className="navbar-user-email">{user.email}</span>
            </div>
          )}

          <button className="navbar-logout-btn" onClick={handleLogout} title="Sair do aplicativo">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
}
