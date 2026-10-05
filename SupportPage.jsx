import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SupportChat from './SupportChat';

const TEST_USERS = [
  { id: 'user1', name: 'Invoker', problem: 'Меня обманули при сделке', status: 'urgent' },
  { id: 'user2', name: 'Zeus', problem: 'Деньги не закинулись на баланс', status: 'urgent' },
  { id: 'user3', name: 'Marci', problem: 'Скин не пришёл после покупки', status: 'waiting' },
  { id: 'user4', name: 'Pudge', problem: 'Возврат средств', status: 'resolved' },
  { id: 'user5', name: 'Juggernaut', problem: 'Не работает сайт', status: 'waiting' }
];

const AVATARS = {
  user1: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&q=80&fit=crop',
  user2: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80&fit=crop',
  user3: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80&fit=crop',
  user4: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=80&q=80&fit=crop',
  user5: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80&fit=crop'
};

const getInitialChat = (userId) => {
  const chats = {
    user1: [
      { text: 'Здравствуйте! Я бот поддержки SkinStar. Опишите вашу проблему.', sender: 'bot', timestamp: Date.now() - 600000 },
      { text: 'Меня обманули! Купил AK-47 у пользователя Scammer123', sender: 'user', timestamp: Date.now() - 580000 },
      { text: 'Вас обманули при сделке? Напишите, какой скин вы покупали.', sender: 'bot', timestamp: Date.now() - 570000 },
      { text: 'AK-47 Asiimov за 2500₽', sender: 'user', timestamp: Date.now() - 550000 },
      { text: 'Спасибо! Информация передана. Подключаю администратора для разбора ситуации.', sender: 'bot', timestamp: Date.now() - 540000 }
    ],
    user2: [
      { text: 'Здравствуйте! Я бот поддержки SkinStar. Опишите вашу проблему.', sender: 'bot', timestamp: Date.now() - 800000 },
      { text: 'Деньги не закинулись на баланс!', sender: 'user', timestamp: Date.now() - 780000 },
      { text: 'Проблема с пополнением требует ручной проверки. Позову администратора.', sender: 'bot', timestamp: Date.now() - 770000 }
    ],
    user3: [
      { text: 'Здравствуйте! Я бот поддержки SkinStar. Опишите вашу проблему.', sender: 'bot', timestamp: Date.now() - 400000 },
      { text: 'Скин не пришёл после покупки', sender: 'user', timestamp: Date.now() - 380000 },
      { text: 'Укажите название скина и номер заказа.', sender: 'bot', timestamp: Date.now() - 370000 },
      { text: 'Arcana on Pudge, заказ #47821', sender: 'user', timestamp: Date.now() - 350000 }
    ],
    user4: [
      { text: 'Здравствуйте! Я бот поддержки SkinStar. Опишите вашу проблему.', sender: 'bot', timestamp: Date.now() - 1200000 },
      { text: 'Хочу вернуть деньги за покупку', sender: 'user', timestamp: Date.now() - 1180000 },
      { text: 'Возврат обрабатывается 3 рабочих дня. Укажите номер сделки.', sender: 'bot', timestamp: Date.now() - 1170000 },
      { text: 'Сделка #33156, передумал покупать', sender: 'user', timestamp: Date.now() - 1150000 },
      { text: 'Возврат одобрен. Проблема решена.', sender: 'admin', timestamp: Date.now() - 1100000 }
    ],
    user5: [
      { text: 'Здравствуйте! Я бот поддержки SkinStar. Опишите вашу проблему.', sender: 'bot', timestamp: Date.now() - 300000 },
      { text: 'Не могу зайти в профиль, выдаёт ошибку 403', sender: 'user', timestamp: Date.now() - 280000 },
      { text: 'Попробуйте описать иначе (попытка 1 из 3).', sender: 'bot', timestamp: Date.now() - 270000 },
      { text: 'Сайт не работает, профиль не открывается', sender: 'user', timestamp: Date.now() - 250000 },
      { text: 'Не могу решить эту проблему. Позову администратора.', sender: 'bot', timestamp: Date.now() - 240000 }
    ]
  };
  return chats[userId] || [{ text: 'Нет сообщений.', sender: 'bot', timestamp: Date.now() }];
};

const SupportPage = ({ setIsLoggedIn, userRole }) => {
  const navigate = useNavigate();
  const isAdmin = userRole === 'admin';
  const [adminReply, setAdminReply] = useState('');
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [activeUserId, setActiveUserId] = useState('user1');
  const [activeChat, setActiveChat] = useState([]);
  const [showBanForm, setShowBanForm] = useState(false);
  const [userToBlock, setUserToBlock] = useState('');
  const [banDuration, setBanDuration] = useState('1h');
  const [banReason, setBanReason] = useState('');
  const [banSuccess, setBanSuccess] = useState('');
  const [banError, setBanError] = useState('');
  const [resolvedChats, setResolvedChats] = useState({});

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('blockedUsers') || '[]');
    setBlockedUsers(stored);

    TEST_USERS.forEach((u) => {
      const key = `supportChat_${u.id}`;
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify(getInitialChat(u.id)));
      }
    });
    loadActiveChat('user1');
  }, []);

  const loadActiveChat = (userId) => {
    const key = `supportChat_${userId}`;
    const stored = JSON.parse(localStorage.getItem(key) || '[]');
    setActiveChat(stored);
  };

  useEffect(() => {
    if (!isAdmin) return;
    const interval = setInterval(() => {
      loadActiveChat(activeUserId);
    }, 1000);
    return () => clearInterval(interval);
  }, [isAdmin, activeUserId]);

  const onAdminCalled = () => {
    localStorage.setItem('adminRequested', 'true');
  };

  const handleSelectUser = (userId) => {
    setActiveUserId(userId);
    loadActiveChat(userId);
  };

  const sendAdminReply = () => {
    if (!adminReply.trim()) return;
    const key = `supportChat_${activeUserId}`;
    const stored = JSON.parse(localStorage.getItem(key) || '[]');
    const newMsg = { text: adminReply.trim(), sender: 'admin', timestamp: Date.now() };
    const updated = [...stored, newMsg];
    localStorage.setItem(key, JSON.stringify(updated));
    setActiveChat(updated);
    setAdminReply('');
  };

  const handleAdminReply = (e) => {
    if (e.key === 'Enter' && adminReply.trim()) sendAdminReply();
  };

  const handleResolveChat = () => {
    if (window.confirm('Проблема решена? Чат будет удалён, обращение закроется.')) {
      const key = `supportChat_${activeUserId}`;
      localStorage.removeItem(key);
      setActiveChat([]);
      setResolvedChats((prev) => ({ ...prev, [activeUserId]: true }));
      const user = TEST_USERS.find((u) => u.id === activeUserId);
      if (user) user.status = 'resolved';
    }
  };

  const calculateBanUntil = (duration) => {
    const now = new Date();
    const match = duration.match(/^(\d+)([hdmw])$/);
    if (!match) return null;
    const value = parseInt(match[1]);
    const unit = match[2];
    const multipliers = { h: 3600000, d: 86400000, w: 604800000 };
    return new Date(now.getTime() + value * (multipliers[unit] || 3600000)).toLocaleString('ru-RU');
  };

  const formatDuration = (dur) => {
    const labels = { '1h': '1 час', '3h': '3 часа', '1d': '1 день', '3d': '3 дня', '7d': '7 дней', '30d': '30 дней', forever: 'Навсегда' };
    return labels[dur] || dur;
  };

  const handleBlockUser = () => {
    setBanError('');

    if (!userToBlock.trim()) { setBanError('Введите ник пользователя'); return; }
    if (!banReason.trim()) { setBanError('Укажите причину блокировки'); return; }

    const userExists = TEST_USERS.some((u) => u.name.toLowerCase() === userToBlock.trim().toLowerCase());
    if (!userExists) {
      setBanError('Пользователь не найден');
      return;
    }

    const alreadyBlocked = blockedUsers.some((u) => u.username.toLowerCase() === userToBlock.trim().toLowerCase());
    if (alreadyBlocked) {
      setBanError('Этот пользователь уже заблокирован');
      return;
    }

    const isPermanent = banDuration === 'forever';
    const newBlock = {
      username: userToBlock.trim(),
      type: isPermanent ? 'permanent' : 'temp',
      duration: formatDuration(banDuration),
      banUntil: isPermanent ? 'Навсегда' : calculateBanUntil(banDuration),
      reason: banReason.trim(),
      date: new Date().toLocaleString('ru-RU')
    };

    const updated = [...blockedUsers, newBlock];
    setBlockedUsers(updated);
    localStorage.setItem('blockedUsers', JSON.stringify(updated));

    setBanSuccess(`Пользователь «${userToBlock}» заблокирован на ${formatDuration(banDuration)}`);
    setUserToBlock('');
    setBanReason('');
    setBanDuration('1h');
    setShowBanForm(false);
    setTimeout(() => setBanSuccess(''), 4000);
  };

  const handleUnblockUser = (index) => {
    if (window.confirm(`Разблокировать «${blockedUsers[index].username}»?`)) {
      const updated = blockedUsers.filter((_, i) => i !== index);
      setBlockedUsers(updated);
      localStorage.setItem('blockedUsers', JSON.stringify(updated));
    }
  };

  const handleGoToProfile = (username) => {
    navigate(`/profile?user=${encodeURIComponent(username)}`);
  };

  const getStatusBadge = (status, isResolved) => {
    if (isResolved || status === 'resolved') return { text: 'Решён', cls: 'status-resolved' };
    if (status === 'urgent') return { text: 'Срочно', cls: 'status-urgent' };
    return { text: 'Ожидает', cls: 'status-waiting' };
  };

  const sortedUsers = [...TEST_USERS].sort((a, b) => {
    const aR = resolvedChats[a.id] || a.status === 'resolved';
    const bR = resolvedChats[b.id] || b.status === 'resolved';
    if (aR && !bR) return 1;
    if (!aR && bR) return -1;
    return 0;
  });

  const formatTime = (ts) => new Date(ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

  if (!isAdmin) {
    return (
      <div className="support-page">
        <h2 className="section-title">Поддержка</h2>
        <SupportChat onAdminCalled={onAdminCalled} />
      </div>
    );
  }

  const activeUser = TEST_USERS.find((u) => u.id === activeUserId);
  const isChatResolved = resolvedChats[activeUserId];

  return (
    <div className="support-admin-page">
      <div className="admin-header">
        <h2 className="section-title">Панель поддержки</h2>
        <span className="admin-badge">🛡️ Режим администратора</span>
      </div>

      {banSuccess && <div className="ban-success-msg">{banSuccess}</div>}

      <div className="admin-dashboard">
        <section className="admin-card admin-chat-section">
          <div className="admin-card-header">
            <h3>💬 Чат с {activeUser?.name}</h3>
            <div className="chat-header-actions">
              <span className={`chat-status ${getStatusBadge(activeUser?.status, isChatResolved).cls}`}>
                {getStatusBadge(activeUser?.status, isChatResolved).text}
              </span>
              {activeChat.length > 0 && (
                <button className="btn-primary btn-sm" onClick={handleResolveChat}>✓ Решить</button>
              )}
            </div>
          </div>

          <div className="admin-chat-view">
            {activeChat.length === 0 ? (
              <p className="storage-info">{isChatResolved ? 'Обращение закрыто. Чат удалён.' : 'Нет сообщений.'}</p>
            ) : (
              activeChat.map((m, i) => {
                const prevMsg = activeChat[i - 1];
                const showAvatar = !prevMsg || prevMsg.sender !== m.sender;
                const avatarUrl = AVATARS[activeUserId];
                return (
                  <div key={i} className={`tg-msg ${m.sender} ${showAvatar ? 'with-avatar' : 'no-avatar'}`}>
                    {showAvatar && (
                      <div className="tg-avatar">
                        {m.sender === 'bot' ? (
                          <span className="tg-avatar-icon">🤖</span>
                        ) : m.sender === 'admin' ? (
                          <span className="tg-avatar-icon">🛡️</span>
                        ) : (
                          <img src={avatarUrl} alt="" className="tg-avatar-img" />
                        )}
                      </div>
                    )}
                    <div className="tg-content">
                      {showAvatar && (
                        <div className="tg-nickname">
                          {m.sender === 'bot' ? 'Бот поддержки' : m.sender === 'admin' ? 'Поддержка' : activeUser?.name}
                        </div>
                      )}
                      <div className="tg-bubble">
                        <span className="tg-text">{m.text}</span>
                        <span className="tg-time">{formatTime(m.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {activeChat.length > 0 && (
            <div className="chat-input-area">
              <input
                type="text"
                value={adminReply}
                onChange={(e) => setAdminReply(e.target.value)}
                onKeyDown={handleAdminReply}
                placeholder={`Ответить ${activeUser?.name} (Enter)...`}
              />
              <button className="btn-primary" onClick={sendAdminReply}>Ответить</button>
            </div>
          )}
        </section>

        <aside className="admin-sidebar">
          <h3 className="sidebar-title">Обращения ({TEST_USERS.length})</h3>
          {sortedUsers.map((u) => {
            const badge = getStatusBadge(u.status, resolvedChats[u.id]);
            const isResolved = resolvedChats[u.id] || u.status === 'resolved';
            return (
              <div
                key={u.id}
                className={`user-ticket ${activeUserId === u.id ? 'active' : ''} ${isResolved ? 'resolved' : ''}`}
                onClick={() => handleSelectUser(u.id)}
              >
                <div className="ticket-top">
                  <span className="ticket-name">{u.name}</span>
                  <span className={`ticket-status ${badge.cls}`}>{badge.text}</span>
                </div>
                <div className="ticket-problem">{u.problem}</div>
                <div className="ticket-actions">
                  <button className="link-btn" onClick={(e) => { e.stopPropagation(); handleGoToProfile(u.name); }}>
                    Профиль →
                  </button>
                  <button
                    className="link-btn link-btn-danger"
                    onClick={(e) => { e.stopPropagation(); setUserToBlock(u.name); setShowBanForm(true); setBanError(''); }}
                  >
                    Заблокировать
                  </button>
                </div>
              </div>
            );
          })}
        </aside>
      </div>

      <section className="admin-card">
        <div className="admin-card-header">
          <h3>🔒 Управление пользователями</h3>
          <button className="btn-primary btn-sm" onClick={() => { setShowBanForm(!showBanForm); setBanError(''); }}>
            {showBanForm ? 'Скрыть форму' : 'Заблокировать'}
          </button>
        </div>

        {showBanForm && (
          <div className="ban-form">
            {banError && <div className="ban-error-msg">{banError}</div>}
            <div className="ban-form-row">
              <label className="ban-label">Ник пользователя</label>
              <input type="text" placeholder="Например: Invoker" value={userToBlock} onChange={(e) => setUserToBlock(e.target.value)} className="ban-input" />
            </div>
            <div className="ban-form-row">
              <label className="ban-label">Срок блокировки</label>
              <div className="ban-duration-grid">
                {[
                  { value: '1h', label: '1 час' }, { value: '3h', label: '3 часа' },
                  { value: '1d', label: '1 день' }, { value: '3d', label: '3 дня' },
                  { value: '7d', label: '7 дней' }, { value: '30d', label: '30 дней' },
                  { value: 'forever', label: 'Навсегда' }
                ].map((opt) => (
                  <button
                    key={opt.value}
                    className={`ban-duration-btn ${banDuration === opt.value ? 'active' : ''} ${opt.value === 'forever' ? 'danger' : ''}`}
                    onClick={() => setBanDuration(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="ban-form-row">
              <label className="ban-label">Причина блокировки</label>
              <textarea placeholder="Например: мошенничество, спам, нарушение правил..." value={banReason} onChange={(e) => setBanReason(e.target.value)} className="ban-input ban-textarea" rows={3} />
            </div>
            <div className="ban-form-actions">
              <button className={`btn-block-confirm ${banDuration === 'forever' ? 'permanent' : ''}`} onClick={handleBlockUser}>
                {banDuration === 'forever' ? 'Заблокировать навсегда' : `Заблокировать на ${formatDuration(banDuration)}`}
              </button>
              <button className="btn-secondary" onClick={() => { setShowBanForm(false); setUserToBlock(''); setBanReason(''); setBanError(''); }}>
                Отмена
              </button>
            </div>
          </div>
        )}

        {blockedUsers.length > 0 && (
          <div className="blocked-list">
            <h4 className="blocked-list-title">Заблокированные ({blockedUsers.length})</h4>
            {blockedUsers.map((u, i) => (
              <div key={i} className="blocked-user-card">
                <div className="blocked-user-main">
                  <span className="blocked-user-name">{u.username}</span>
                  <span className={`blocked-type-badge ${u.type === 'permanent' ? 'perm' : 'temp'}`}>
                    {u.type === 'permanent' ? 'Навсегда' : `До ${u.banUntil}`}
                  </span>
                </div>
                <div className="blocked-user-details">
                  <span className="blocked-detail">Срок: <strong>{u.duration}</strong></span>
                  <span className="blocked-detail">Причина: <strong>{u.reason}</strong></span>
                  <span className="blocked-detail storage-info">Заблокирован: {u.date}</span>
                </div>
                <div className="blocked-user-actions">
                  <button className="link-btn" onClick={() => handleGoToProfile(u.username)}>Профиль →</button>
                  <button className="link-btn link-btn-danger" onClick={() => handleUnblockUser(i)}>Разблокировать</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {blockedUsers.length === 0 && !showBanForm && <p className="storage-info">Список заблокированных пуст.</p>}
      </section>
    </div>
  );
};

export default SupportPage;
