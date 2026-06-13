import React from 'react';
import { useTasks } from '../context/TaskContext';

export default function AnalyticsView({ isSidebar = false }) {
  const { tasks } = useTasks();

  // Cálculos de KPIs básicos
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Distribuição por Categoria
  const categories = ['Trabalho', 'Pessoal', 'Estudos'];
  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = tasks.filter(t => t.category === cat).length;
    return acc;
  }, {});

  // Distribuição por Prioridade
  const priorities = ['Alta', 'Média', 'Baixa'];
  const priorityCounts = priorities.reduce((acc, prio) => {
    acc[prio] = tasks.filter(t => t.priority === prio).length;
    return acc;
  }, {});

  // Preparação de dados para o Gráfico de Rosca (Donut Chart) em SVG
  const radius = 50;
  const circumference = 2 * Math.PI * radius; // ~314.16
  
  // Mapeia os dados da rosca
  let accumulatedPercent = 0;
  const donutSlices = categories.map((cat, idx) => {
    const count = categoryCounts[cat];
    const percentage = totalTasks > 0 ? (count / totalTasks) : 0;
    
    // Configurações das cores HSL
    const colors = {
      'Trabalho': '#0284c7', // Sky blue
      'Pessoal': '#10b981',  // Emerald green
      'Estudos': '#f59e0b'  // Amber orange
    };
    
    const strokeDasharray = `${percentage * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    
    accumulatedPercent += percentage;

    return {
      category: cat,
      count,
      percentage: Math.round(percentage * 100),
      strokeDasharray,
      strokeDashoffset,
      color: colors[cat]
    };
  });

  return (
    <div className={isSidebar ? "analytics-sidebar-mode" : ""} style={{animation: 'fadeIn 0.3s ease-out'}}>
      {/* Grid de KPIs principais */}
      <div className="analytics-grid" style={{ marginBottom: isSidebar ? '16px' : '24px' }}>
        <div className="kpi-card">
          <div className="kpi-icon kpi-icon-indigo">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"/>
              <line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/>
              <line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total</span>
            <span className="kpi-value">{totalTasks}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon kpi-icon-green">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Concluídas</span>
            <span className="kpi-value">{completedTasks}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon kpi-icon-amber">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Pendentes</span>
            <span className="kpi-value">{pendingTasks}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon kpi-icon-blue">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Taxa</span>
            <span className="kpi-value">{completionRate}%</span>
          </div>
        </div>
      </div>

      {/* Seção de Gráficos */}
      <div className="charts-row">
        {/* Gráfico 1: Categorias (Rosca SVG) */}
        <div className="card chart-card">
          <h3 className="card-title" style={{alignSelf: 'flex-start', fontSize: isSidebar ? '1rem' : '1.15rem'}}>Categoria</h3>
          
          {totalTasks > 0 ? (
            <>
              <div className="svg-donut-wrapper" style={{ 
                width: isSidebar ? '140px' : '200px', 
                height: isSidebar ? '140px' : '200px' 
              }}>
                <svg width="100%" height="100%" viewBox="0 0 120 120" style={{transform: 'rotate(-90deg)'}}>
                  {/* Fundo Neutro da rosca */}
                  <circle cx="60" cy="60" r={radius} fill="transparent" stroke="var(--bg-input)" strokeWidth="12" />
                  
                  {/* Slices */}
                  {donutSlices.map((slice) => slice.count > 0 && (
                    <circle
                      key={slice.category}
                      cx="60"
                      cy="60"
                      r={radius}
                      fill="transparent"
                      stroke={slice.color}
                      strokeWidth="12"
                      strokeDasharray={slice.strokeDasharray}
                      strokeDashoffset={slice.strokeDashoffset}
                      strokeLinecap="round"
                    />
                  ))}
                </svg>
                <div className="donut-label">
                  <span className="donut-label-value" style={{ fontSize: isSidebar ? '1.25rem' : '1.6rem' }}>{totalTasks}</span>
                  <span className="donut-label-text" style={{ fontSize: isSidebar ? '0.65rem' : '0.75rem' }}>Tarefas</span>
                </div>
              </div>

              <div className="chart-legend" style={{ gap: isSidebar ? '8px 12px' : '16px', marginTop: isSidebar ? '10px' : '16px' }}>
                {donutSlices.map((slice) => (
                  <div key={slice.category} className="legend-item" style={{ fontSize: isSidebar ? '0.78rem' : '0.85rem' }}>
                    <span className="legend-color" style={{backgroundColor: slice.color}} />
                    <span>{slice.category} ({slice.count})</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{color: 'var(--text-tertiary)', textAlign: 'center', fontSize: '0.85rem', padding: '20px 0'}}>
              Sem dados.
            </div>
          )}
        </div>

        {/* Gráfico 2: Prioridades (Bar Chart CSS/HTML) */}
        <div className="card chart-card" style={{justifyContent: 'flex-start'}}>
          <h3 className="card-title" style={{alignSelf: 'flex-start', marginBottom: '20px', fontSize: isSidebar ? '1rem' : '1.15rem'}}>Prioridade</h3>
          
          {totalTasks > 0 ? (
            <div className="bar-chart-container">
              {priorities.map((prio) => {
                const count = priorityCounts[prio];
                const percentage = totalTasks > 0 ? (count / totalTasks) * 100 : 0;
                
                // Configuração das cores para o preenchimento da barra
                const prioColors = {
                  'Alta': 'var(--color-danger)',
                  'Média': '#f59e0b',
                  'Baixa': 'var(--text-secondary)'
                };

                return (
                  <div key={prio} className="bar-row">
                    <div className="bar-label" style={{ fontSize: isSidebar ? '0.78rem' : '0.85rem', width: isSidebar ? '50px' : '60px' }}>{prio}</div>
                    <div className="bar-track">
                      <div 
                        className="bar-fill" 
                        style={{ 
                          width: `${Math.max(percentage, percentage > 0 ? 10 : 0)}%`, // mínimo de 10% de tamanho visual se > 0
                          backgroundColor: prioColors[prio] 
                        }}
                      >
                        {count > 0 && <span className="bar-value">{count}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{color: 'var(--text-tertiary)', textAlign: 'center', fontSize: '0.85rem', margin: 'auto 0', padding: '20px 0'}}>
              Sem dados.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
