import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskProvider, useTasks } from './context/TaskContext';
import Navbar from './components/Navbar';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import AnalyticsView from './components/AnalyticsView';
import CalendarView from './components/CalendarView';
import KanbanView from './components/KanbanView';
import AdminPage from './pages/AdminPage';
import BackupPage from './pages/BackupPage';
import LoginPage from './pages/LoginPage';
import './App.css';

function AppContent() {
  const { currentTab, notification } = useTasks();

  return (
    <div className="app-container">
      {/* Barra de Navegação Superior */}
      <Navbar />

      {/* Conteúdo Principal Dinâmico */}
      <main className="main-content">
        {currentTab === 'Tarefas' && (
          <div className="tasks-layout">
            <AnalyticsView isSidebar={true} />
            <TaskList />
          </div>
        )}

        {currentTab === 'Kanban' && (
          <KanbanView />
        )}

        {currentTab === 'Calendário' && (
          <CalendarView />
        )}

        {currentTab === 'Backup' && (
          <BackupPage />
        )}

        {currentTab === 'Administração' && (
          <AdminPage />
        )}
      </main>

      {/* Rodapé de Crédito de Desenvolvimento */}
      <footer className="app-footer">
        <p>Desenvolvido por: <strong>DEV Eduardo Oliveira</strong></p>
      </footer>

      {/* Modal global de criação de tarefas */}
      <TaskForm />

      {/* Notificação Toast Flutuante */}
      {notification && (
        <div className="notification-toast">
          {notification}
        </div>
      )}
    </div>
  );
}

function AppConsumer() {
  const { session, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-loading-spinner"></div>
        <p>Carregando o Agilis...</p>
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  return (
    <TaskProvider>
      <AppContent />
    </TaskProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppConsumer />
    </AuthProvider>
  );
}
