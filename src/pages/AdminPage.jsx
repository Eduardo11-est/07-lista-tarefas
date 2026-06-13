import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { supabase } from '../supabaseClient';

export default function AdminPage() {
  const { profile, user } = useAuth();
  const { userRoles, triggerNotification } = useTasks();

  const [activeSubTab, setActiveSubTab] = useState('cadastro'); // 'cadastro' | 'acessos'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('Usuário');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lista de perfis de usuários para o painel de acessos
  const [usersList, setUsersList] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Busca todos os usuários cadastrados
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar usuários:', error.message);
      triggerNotification('Erro ao carregar lista de usuários.');
    } else {
      setUsersList(data);
    }
    setIsLoadingUsers(false);
  };

  useEffect(() => {
    if (profile?.role === 'Administrador' && activeSubTab === 'acessos') {
      fetchUsers();
    }
  }, [profile, activeSubTab]);

  // Bloqueio de Segurança: Acesso restrito
  if (!profile || profile.role !== 'Administrador') {
    return (
      <div className="access-denied-container">
        <div className="access-denied-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h2>Acesso Restrito</h2>
        <p>Você não tem privilégios de Administrador para acessar esta página.</p>
      </div>
    );
  }

  // Lida com o cadastro de novos usuários (Chama a stored procedure RPC do Supabase)
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!email || !password || !selectedRole) {
      triggerNotification('Por favor, preencha todos os campos.');
      return;
    }

    if (password.length < 6) {
      triggerNotification('A senha precisa ter no mínimo 6 caracteres.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.rpc('create_new_user', {
        new_email: email,
        new_password: password,
        new_role: selectedRole
      });

      if (error) {
        throw new Error(error.message);
      }

      triggerNotification('Usuário cadastrado com sucesso! 🎉');
      setEmail('');
      setPassword('');
      setSelectedRole('Usuário');
    } catch (err) {
      console.error('Erro ao criar usuário:', err.message);
      triggerNotification(`Erro ao cadastrar usuário: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Altera a role de um usuário
  const handleRoleChange = async (userId, newRole) => {
    const previousUsers = [...usersList];
    
    // Atualização otimista local
    setUsersList(prev => 
      prev.map(u => u.id === userId ? { ...u, role: newRole } : u)
    );

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      console.error('Erro ao atualizar role do usuário:', error.message);
      setUsersList(previousUsers); // Reverte
      triggerNotification('Erro ao alterar permissão do usuário.');
    } else {
      triggerNotification('Permissão do usuário atualizada!');
    }
  };

  // Formata datas para visualização
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Nunca';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Painel de Administração</h1>
        <p>Cadastre novos membros da equipe e gerencie permissões de acesso (RBAC)</p>
      </div>

      {/* Abas Internas da Administração */}
      <div className="admin-tabs">
        <button 
          className={`admin-tab-btn ${activeSubTab === 'cadastro' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('cadastro')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/>
            <line x1="17" y1="11" x2="23" y2="11"/>
          </svg>
          Cadastrar Novo Usuário
        </button>

        <button 
          className={`admin-tab-btn ${activeSubTab === 'acessos' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('acessos')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          Controle de Acessos
        </button>
      </div>

      <div className="admin-content card">
        {activeSubTab === 'cadastro' ? (
          <div className="admin-form-section">
            <h2 className="card-title">Criar Conta de Usuário</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
              Insira as credenciais do novo usuário. Após a criação, ele poderá fazer login imediatamente com este e-mail e senha.
            </p>

            <form onSubmit={handleCreateUser} className="admin-form">
              <div className="form-group">
                <label className="form-label">E-mail do Usuário</label>
                <input 
                  type="email" 
                  className="form-control"
                  placeholder="exemplo@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Senha Inicial</label>
                <input 
                  type="password" 
                  className="form-control"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nível de Acesso (Role)</label>
                <select 
                  className="form-control"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  disabled={isSubmitting}
                >
                  {userRoles.length > 0 ? (
                    userRoles.map(role => (
                      <option key={role.name} value={role.name}>{role.label}</option>
                    ))
                  ) : (
                    <>
                      <option value="Usuário">Usuário</option>
                      <option value="Administrador">Administrador</option>
                    </>
                  )}
                </select>
              </div>

              <button 
                type="submit" 
                className="btn-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner-small" />
                    Cadastrando...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14"/>
                      <path d="M12 5v14"/>
                    </svg>
                    Cadastrar Usuário
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="admin-users-section">
            <h2 className="card-title">Gerenciar Níveis de Acesso</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
              Visualize todos os membros cadastrados na plataforma e altere suas permissões de acesso instantaneamente.
            </p>

            {isLoadingUsers ? (
              <div className="admin-loading">
                <div className="spinner-small" />
                Carregando usuários...
              </div>
            ) : usersList.length > 0 ? (
              <div className="table-responsive">
                <table className="admin-users-table">
                  <thead>
                    <tr>
                      <th>E-mail</th>
                      <th>Data de Criação</th>
                      <th>Último Acesso</th>
                      <th>Permissão (Role)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map(u => (
                      <tr key={u.id}>
                        <td>
                          <div className="user-email-cell">
                            <div className="user-avatar-placeholder">
                              {u.email.substring(0,2).toUpperCase()}
                            </div>
                            <span>{u.email}</span>
                            {u.id === user.id && <span className="self-tag">(Você)</span>}
                          </div>
                        </td>
                        <td>{formatDate(u.created_at)}</td>
                        <td>{formatDate(u.last_sign_in_at)}</td>
                        <td>
                          <select 
                            className="form-control role-select"
                            value={u.role || 'Usuário'}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            disabled={u.id === user.id} // Impede despromover a si próprio
                            title={u.id === user.id ? "Você não pode mudar a própria permissão" : "Alterar permissão"}
                          >
                            {userRoles.length > 0 ? (
                              userRoles.map(role => (
                                <option key={role.name} value={role.name}>{role.label}</option>
                              ))
                            ) : (
                              <>
                                <option value="Usuário">Usuário</option>
                                <option value="Administrador">Administrador</option>
                              </>
                            )}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="admin-empty">
                <p>Nenhum usuário cadastrado.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
