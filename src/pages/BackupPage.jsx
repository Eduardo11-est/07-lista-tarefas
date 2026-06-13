import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

export default function BackupPage() {
  const { tasks, fetchTasks, triggerNotification } = useTasks();
  const { user } = useAuth();
  
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Lógica para exportar tarefas do usuário como JSON
  const handleExportBackup = () => {
    setIsExporting(true);
    try {
      if (tasks.length === 0) {
        triggerNotification('Não há tarefas para exportar no momento.');
        setIsExporting(false);
        return;
      }

      // Prepara os dados limpos sem metadados internos irrelevantes do Postgres
      const backupData = tasks.map(t => ({
        title: t.title,
        description: t.description,
        category: t.category,
        priority: t.priority,
        dueDate: t.dueDate,
        completed: t.completed,
        kanbanStatus: t.kanbanStatus
      }));

      const dataStr = JSON.stringify(backupData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const dateStr = new Date().toISOString().split('T')[0];
      const exportFileDefaultName = `taskflow_backup_${dateStr}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      triggerNotification('Backup exportado com sucesso! Salve o arquivo JSON com segurança. 💾');
    } catch (error) {
      console.error('Erro ao exportar backup:', error);
      triggerNotification('Falha ao exportar backup.');
    } finally {
      setIsExporting(false);
    }
  };

  // Lógica para processar o JSON importado
  const processImportedFile = async (file) => {
    if (!file) return;
    
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      triggerNotification('Formato de arquivo inválido. Por favor, envie um arquivo .json.');
      return;
    }

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        if (!Array.isArray(importedData)) {
          throw new Error('O backup deve conter uma lista de tarefas.');
        }

        if (importedData.length === 0) {
          throw new Error('O backup está vazio.');
        }

        // Validação estrutural simples
        const isValid = importedData.every(t => t.title && t.category && t.priority);
        if (!isValid) {
          throw new Error('O arquivo de backup não possui o formato correto do TaskFlow.');
        }

        // Prepara para inserção em lote no Supabase
        const rowsToInsert = importedData.map(task => ({
          title: task.title,
          description: task.description || null,
          category: task.category,
          priority: task.priority,
          due_date: task.dueDate || new Date().toISOString().split('T')[0],
          completed: task.completed ?? false,
          kanban_status: task.kanbanStatus || 'Em espera',
          user_id: user.id
        }));

        // Inserção em lote (bulk insert) no Supabase
        const { error } = await supabase
          .from('tasks')
          .insert(rowsToInsert);

        if (error) {
          throw error;
        }

        // Atualiza a listagem de tarefas no frontend
        await fetchTasks();
        triggerNotification(`Backup restaurado! ${rowsToInsert.length} tarefas importadas com sucesso! 🎉`);
      } catch (err) {
        console.error('Erro ao importar backup:', err);
        triggerNotification(`Erro ao restaurar dados: ${err.message}`);
      } finally {
        setIsImporting(false);
      }
    };

    reader.onerror = () => {
      triggerNotification('Erro ao ler o arquivo selecionado.');
      setIsImporting(false);
    };

    reader.readAsText(file);
  };

  // Lógica de Drag & Drop de arquivo
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImportedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      processImportedFile(e.target.files[0]);
    }
  };

  return (
    <div className="backup-container" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="backup-header">
        <h1>Central de Backup e Restauração</h1>
        <p>Proteja suas informações exportando seus dados locais ou restaure um backup existente a qualquer momento.</p>
      </div>

      <div className="backup-grid">
        {/* Card de Exportação */}
        <div className="card backup-card-action">
          <div className="backup-card-icon export-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <h3>Exportar Backup</h3>
          <p>
            Baixe todas as suas tarefas ativas, concluídas e do Kanban em um arquivo seguro formato JSON. Guarde este arquivo em seu computador.
          </p>
          <div className="backup-info-badge">
            Total de tarefas prontas para exportação: <strong>{tasks.length}</strong>
          </div>
          <button 
            className="btn-submit btn-export" 
            onClick={handleExportBackup}
            disabled={isExporting}
          >
            {isExporting ? 'Processando...' : 'Fazer Download do Backup'}
          </button>
        </div>

        {/* Card de Importação */}
        <div className="card backup-card-action">
          <div className="backup-card-icon import-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </div>
          <h3>Restaurar Backup</h3>
          <p>
            Envie um arquivo de backup do TaskFlow (`.json`) para restaurar e mesclar suas tarefas antigas diretamente no seu banco de dados atual.
          </p>
          
          <div 
            className={`file-drop-zone ${dragActive ? 'active' : ''} ${isImporting ? 'loading' : ''}`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            {isImporting ? (
              <div className="import-loading-state">
                <div className="spinner-small" />
                <span>Restaurando dados no Supabase...</span>
              </div>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-tertiary)' }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="12" y1="18" x2="12" y2="12"/>
                  <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
                <p>Arraste e solte o arquivo <strong>.json</strong> aqui</p>
                <span>ou</span>
                <label className="file-input-label">
                  Procurar Arquivo
                  <input 
                    type="file" 
                    accept=".json" 
                    onChange={handleFileInput}
                    style={{ display: 'none' }}
                  />
                </label>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="card backup-security-notice" style={{ marginTop: '24px' }}>
        <h4>⚠️ Aviso de Segurança e Importação</h4>
        <ul>
          <li>A importação de dados <strong>mesclará</strong> as tarefas importadas com as tarefas atualmente cadastradas. Nenhuma tarefa existente será sobrescrita ou excluída durante o processo.</li>
          <li>Certifique-se de importar apenas arquivos JSON gerados pelo próprio aplicativo TaskFlow para evitar inconsistências e falhas no carregamento de campos essenciais.</li>
        </ul>
      </div>
    </div>
  );
}
