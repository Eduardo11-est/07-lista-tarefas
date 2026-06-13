import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const [activeTab, setActiveTab] = useState('entrar'); // 'entrar' | 'cadastrar'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccessMsg(null);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    if (activeTab === 'cadastrar' && password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setIsLoading(true);

    if (activeTab === 'entrar') {
      const { error } = await signIn(email, password);
      if (error) {
        setError(
          error.message === 'Invalid login credentials'
            ? 'E-mail ou senha inválidos. Verifique suas credenciais.'
            : error.message
        );
      }
      // Se sucesso, o AuthContext atualiza a session e o App.jsx renderiza o conteúdo
    } else {
      const { error } = await signUp(email, password);
      if (error) {
        setError(
          error.message.includes('already registered')
            ? 'Este e-mail já está cadastrado. Tente entrar.'
            : error.message
        );
      } else {
        setSuccessMsg('Conta criada com sucesso! Verifique seu e-mail para confirmar o cadastro, ou clique em "Entrar" para acessar.');
        setActiveTab('entrar');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="login-page">
      {/* Painel esquerdo decorativo */}
      <div className="login-left-panel">
        <div className="login-brand">
          <div className="login-brand-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          <span className="login-brand-name">Agilis</span>
        </div>

        <div className="login-hero-text">
          <h1>Agilis</h1>
          <p className="login-slogan">Seu fluxo inteligente.</p>
          <p>Crie, priorize e conclua suas tarefas com elegância. Seu progresso, sempre seguro na nuvem.</p>
        </div>

        <div className="login-features">
          {[
            { icon: '✓', text: 'Tarefas sincronizadas em tempo real' },
            { icon: '✓', text: 'Categorize por Trabalho, Pessoal e Estudos' },
            { icon: '✓', text: 'Análises e calendário integrados' },
          ].map((feat, idx) => (
            <div key={idx} className="login-feature-item">
              <span className="login-feature-check">{feat.icon}</span>
              <span>{feat.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Painel direito com o formulário */}
      <div className="login-right-panel">
        <div className="login-form-card">
          <h2 className="login-form-title">
            {activeTab === 'entrar' ? 'Bem-vindo de volta!' : 'Crie sua conta'}
          </h2>
          <p className="login-form-subtitle">
            {activeTab === 'entrar'
              ? 'Entre com suas credenciais para acessar suas tarefas.'
              : 'Preencha os dados abaixo para começar a usar o Agilis.'}
          </p>

          {/* Abas de navegação */}
          <div className="login-tabs">
            <button
              className={`login-tab-btn ${activeTab === 'entrar' ? 'active' : ''}`}
              onClick={() => handleTabChange('entrar')}
            >
              Entrar
            </button>
            <button
              className={`login-tab-btn ${activeTab === 'cadastrar' ? 'active' : ''}`}
              onClick={() => handleTabChange('cadastrar')}
            >
              Criar Conta
            </button>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Campo de E-mail */}
            <div className="login-field">
              <label className="login-field-label">E-mail</label>
              <div className="login-input-wrapper">
                <svg className="login-input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  type="email"
                  className="login-input"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Campo de Senha */}
            <div className="login-field">
              <label className="login-field-label">Senha</label>
              <div className="login-input-wrapper">
                <svg className="login-input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="login-input"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={activeTab === 'entrar' ? 'current-password' : 'new-password'}
                  required
                />
                <button
                  type="button"
                  className="login-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Campo de Confirmação de Senha (somente no cadastro) */}
            {activeTab === 'cadastrar' && (
              <div className="login-field">
                <label className="login-field-label">Confirmar Senha</label>
                <div className="login-input-wrapper">
                  <svg className="login-input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="login-input"
                    placeholder="Repita a senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>
            )}

            {/* Mensagem de Erro */}
            {error && (
              <div className="login-alert login-alert-error">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            {/* Mensagem de Sucesso */}
            {successMsg && (
              <div className="login-alert login-alert-success">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {successMsg}
              </div>
            )}

            {/* Botão de Submit */}
            <button type="submit" className="login-submit-btn" disabled={isLoading}>
              {isLoading ? (
                <span className="login-spinner" />
              ) : (
                activeTab === 'entrar' ? 'Entrar na conta' : 'Criar minha conta'
              )}
            </button>
          </form>

          {/* Alternar entre abas */}
          <p className="login-switch-text">
            {activeTab === 'entrar' ? (
              <>Não tem uma conta?{' '}
                <button className="login-switch-btn" onClick={() => handleTabChange('cadastrar')}>
                  Criar conta grátis
                </button>
              </>
            ) : (
              <>Já tem uma conta?{' '}
                <button className="login-switch-btn" onClick={() => handleTabChange('entrar')}>
                  Entrar agora
                </button>
              </>
            )}
          </p>
        </div>
        <footer className="login-footer">
          <p>Desenvolvido por: <strong>DEV Eduardo Oliveira</strong></p>
        </footer>
      </div>
    </div>
  );
}
