import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

const TaskContext = createContext();

// Mapeia o formato snake_case do banco para camelCase do frontend
const mapFromDb = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description || '',
  category: row.category,
  priority: row.priority,
  dueDate: row.due_date,
  completed: row.completed,
  createdAt: row.created_at,
  userId: row.user_id,
  kanbanStatus: row.kanban_status || 'Em espera'
});

// Mapeia o formato camelCase do frontend para snake_case do banco
const mapToDb = (task) => ({
  title: task.title,
  description: task.description || null,
  category: task.category,
  priority: task.priority,
  due_date: task.dueDate,
  completed: task.completed ?? false,
  kanban_status: task.kanbanStatus || 'Em espera'
});

export const TaskProvider = ({ children }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('Tarefas');
  const [filter, setFilter] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);

  // Estados para as opções dinâmicas buscadas do banco
  const [kanbanStatuses, setKanbanStatuses] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  
  // Estado para controle do modal de tarefas
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  
  // Ref para controlar que a notificação de lembretes ocorra apenas uma vez por login/sessão
  const hasNotifiedRef = useRef(false);

  // Função para engatilhar notificações toast
  const triggerNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 4000);
  };

  // Busca as opções dinâmicas (Kanban Statuses e User Roles) do Supabase
  const fetchOptions = useCallback(async () => {
    if (!user) return;
    
    // Status do Kanban
    const { data: statusData, error: statusError } = await supabase
      .from('kanban_statuses')
      .select('*')
      .order('id', { ascending: true });
      
    if (statusError) {
      console.error('Erro ao buscar status do Kanban:', statusError.message);
    } else {
      setKanbanStatuses(statusData);
    }

    // Roles de usuário
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .order('id', { ascending: true });
      
    if (roleError) {
      console.error('Erro ao buscar roles de usuário:', roleError.message);
    } else {
      setUserRoles(roleData);
    }
  }, [user]);

  // READ: Busca todas as tarefas do Supabase ao montar ou ao mudar o usuário
  const fetchTasks = useCallback(async () => {
    if (!user) {
      setTasks([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar tarefas:', error.message);
      triggerNotification('Erro ao carregar tarefas do banco de dados.');
    } else {
      setTasks(data.map(mapFromDb));
    }
    setIsLoading(false);
  }, [user]);

  // Inicializa dados
  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchOptions();
      hasNotifiedRef.current = false; // reseta ao mudar/entrar de usuário
    } else {
      setTasks([]);
      setKanbanStatuses([]);
      setUserRoles([]);
    }
  }, [user, fetchTasks, fetchOptions]);

  // Sistema de Lembretes: Varre tarefas pendentes próximas ao prazo ou atrasadas
  useEffect(() => {
    if (tasks.length > 0 && !hasNotifiedRef.current) {
      const todayStr = new Date().toISOString().split('T')[0];
      const dueTasks = tasks.filter(task => {
        if (task.completed) return false;
        if (!task.dueDate) return false;
        return task.dueDate <= todayStr;
      });

      if (dueTasks.length > 0) {
        hasNotifiedRef.current = true;
        const msg = dueTasks.length === 1 
          ? `Lembrete: Você tem 1 tarefa pendente vencendo hoje ou atrasada!`
          : `Lembrete: Você tem ${dueTasks.length} tarefas pendentes vencendo hoje ou atrasadas!`;
        triggerNotification(msg);
      }
    }
  }, [tasks]);

  // CREATE: Insere uma nova tarefa no Supabase
  const addTask = async (taskData) => {
    if (!user) {
      triggerNotification('Você precisa estar logado para adicionar tarefas.');
      return;
    }

    const newRow = {
      ...mapToDb({ ...taskData, completed: false, kanbanStatus: 'Em espera' }),
      user_id: user.id
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert(newRow)
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar tarefa:', error.message);
      triggerNotification('Erro ao adicionar tarefa.');
    } else {
      setTasks(prev => [mapFromDb(data), ...prev]);
      triggerNotification('Tarefa adicionada com sucesso!');
      setIsTaskModalOpen(false); // Fecha o modal após cadastrar
    }
  };

  // UPDATE: Alterna o campo completed de uma tarefa no Supabase (com sincronização Kanban)
  const toggleComplete = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const nextCompleted = !task.completed;
    const nextStatus = nextCompleted ? 'Closed' : 'Ativo';

    // Atualização otimista: reflete imediatamente na UI
    setTasks(prev =>
      prev.map(t => t.id === id ? { ...t, completed: nextCompleted, kanbanStatus: nextStatus } : t)
    );

    const { error } = await supabase
      .from('tasks')
      .update({ 
        completed: nextCompleted,
        kanban_status: nextStatus
      })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar tarefa:', error.message);
      // Reverte em caso de erro
      setTasks(prev =>
        prev.map(t => t.id === id ? { ...t, completed: task.completed, kanbanStatus: task.kanbanStatus } : t)
      );
      triggerNotification('Erro ao atualizar tarefa.');
    } else {
      triggerNotification(
        nextCompleted ? 'Tarefa marcada como concluída! 🎉' : 'Tarefa marcada como pendente.'
      );
    }
  };

  // UPDATE: Atualiza todos os campos de uma tarefa no Supabase
  const updateTask = async (updatedTask) => {
    const { error } = await supabase
      .from('tasks')
      .update(mapToDb(updatedTask))
      .eq('id', updatedTask.id);

    if (error) {
      console.error('Erro ao editar tarefa:', error.message);
      triggerNotification('Erro ao editar tarefa.');
    } else {
      setTasks(prev =>
        prev.map(t => t.id === updatedTask.id ? { ...t, ...updatedTask } : t)
      );
      triggerNotification('Tarefa atualizada com sucesso!');
    }
  };

  // UPDATE: Move tarefa entre colunas no Kanban
  const updateTaskStatus = async (id, newStatus) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const isClosed = newStatus === 'Closed';

    // Atualização otimista
    setTasks(prev =>
      prev.map(t => t.id === id ? { ...t, kanbanStatus: newStatus, completed: isClosed } : t)
    );

    const { error } = await supabase
      .from('tasks')
      .update({ 
        kanban_status: newStatus,
        completed: isClosed
      })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar status do Kanban:', error.message);
      // Reverte
      setTasks(prev =>
        prev.map(t => t.id === id ? { ...t, kanbanStatus: task.kanbanStatus, completed: task.completed } : t)
      );
      triggerNotification('Erro ao mover tarefa no Kanban.');
    } else {
      triggerNotification(`Tarefa movida para "${newStatus}"`);
    }
  };

  // DELETE: Remove a tarefa do Supabase
  const deleteTask = async (id) => {
    const previousTasks = tasks;
    setTasks(prev => prev.filter(t => t.id !== id));

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir tarefa:', error.message);
      setTasks(previousTasks);
      triggerNotification('Erro ao excluir tarefa.');
    } else {
      triggerNotification('Tarefa excluída.');
    }
  };

  return (
    <TaskContext.Provider value={{
      tasks,
      isLoading,
      currentTab,
      setCurrentTab,
      filter,
      setFilter,
      searchQuery,
      setSearchQuery,
      notification,
      triggerNotification,
      addTask,
      updateTask,
      toggleComplete,
      deleteTask,
      updateTaskStatus,
      kanbanStatuses,
      userRoles,
      isTaskModalOpen,
      setIsTaskModalOpen,
      fetchTasks,
      fetchOptions
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks deve ser usado dentro de um TaskProvider');
  }
  return context;
};
