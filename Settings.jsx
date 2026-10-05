import React, { useState, useEffect } from 'react';
import './App.css';

const Settings = ({ setIsLoggedIn }) => {
  const [language, setLanguage] = useState('ru');
  const [region, setRegion] = useState('RU');
  const [notifications, setNotifications] = useState(true);
  const [autoClearCache, setAutoClearCache] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  // Конфиденциальность
  const [blockedUsers, setBlockedUsers] = useState([]); // было undefined — теперь пустой массив
  const [messageRetention, setMessageRetention] = useState('never');
  const [lastSeen, setLastSeen] = useState('Сейчас');

  useEffect(() => {
    try {
      const storedBlocked = JSON.parse(localStorage.getItem('supportBlockedUsers') || '[]');
      setBlockedUsers(storedBlocked);

      const storedRetention = localStorage.getItem('messageRetention') || 'never';
      setMessageRetention(storedRetention);

      const storedLastSeen = localStorage.getItem('lastSeen');
      if (storedLastSeen) {
        const dateStr = new Date(parseInt(storedLastSeen)).toLocaleString('ru-RU');
        setLastSeen(dateStr);
      }
    } catch (e) {
      console.error('Ошибка чтения настроек:', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('supportBlockedUsers', JSON.stringify(blockedUsers));
    } catch (e) {
      console.error('Ошибка сохранения blockedUsers:', e);
    }
  }, [blockedUsers]);

  useEffect(() => {
    try {
      localStorage.setItem('messageRetention', messageRetention);
    } catch (e) {
      console.error('Ошибка сохранения messageRetention:', e);
    }
  }, [messageRetention]);

  const handleLogout = () => {
    if (window.confirm('Вы уверены, что хотите выйти из аккаунта?')) {
      setIsLoggedIn(false);
    }
  };

  const handleAddBlock = () => {
    const id = prompt('Введите ID или никнейм пользователя для блокировки:');
    if (!id || id.trim() === '') return;
    const cleanId = id.trim();
    if (!blockedUsers.includes(cleanId)) {
      setBlockedUsers((prev) => [...prev, cleanId]);
    } else {
      alert('Этот пользователь уже в чёрном списке.');
    }
  };

  const handleRemoveBlock = (id) => {
    setBlockedUsers((prev) => prev.filter((u) => u !== id));
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        <button className="back-btn" onClick={() => window.history.back()}>
          ← Назад
        </button>

        <h2 className="section-title">Настройки</h2>

        {/* Конфиденциальность */}
        <section className="settings-section">
          <h3>Конфиденциальность</h3>
          <div className="setting-row">
            <label className="setting-label">Время последнего захода</label>
            <span className="setting-value">{lastSeen}</span>
          </div>

          <div className="setting-row">
            <label className="setting-label">Автоудаление сообщений</label>
            <select
              className="setting-select"
              value={messageRetention}
              onChange={(e) => setMessageRetention(e.target.value)}
            >
              <option value="never">Никогда</option>
              <option value="24h">Через 24 часа</option>
              <option value="7d">Через 7 дней</option>
            </select>
            <small className="setting-hint">Сообщения старше указанного срока будут скрыты из чата.</small>
          </div>

          <div className="setting-row">
            <label className="setting-label">Чёрный список</label>
            <div className="blocked-list-container">
              {blockedUsers.length > 0 ? (
                <ul className="blocked-list">
                  {blockedUsers.map((user) => (
                    <li key={user} className="blocked-item">
                      <span>{user}</span>
                      <button
                        className="btn-remove-block"
                        onClick={() => handleRemoveBlock(user)}
                        aria-label="Разблокировать"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="no-blocked">Список пуст</span>
              )}
              <button className="btn-add-block" onClick={handleAddBlock}>
                + Добавить в чёрный список
              </button>
            </div>
          </div>
        </section>

        {/* Язык и регион */}
        <section className="settings-section">
          <h3>Язык и регион</h3>
          <div className="setting-row">
            <label className="setting-label">Язык интерфейса</label>
            <select
              className="setting-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="ru">Русский</option>
              <option value="en">English</option>
            </select>
          </div>
          <div className="setting-row">
            <label className="setting-label">Регион</label>
            <select
              className="setting-select"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              <option value="RU">Россия</option>
              <option value="EU">Европа</option>
              <option value="US">США</option>
            </select>
          </div>
        </section>

        {/* Уведомления */}
        <section className="settings-section">
          <h3>Уведомления</h3>
          <div className="setting-row">
            <label className="setting-label">Включить уведомления</label>
            <label className="toggle-wrapper">
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="toggle-input"
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="setting-row">
            <label className="setting-label">Типы уведомлений</label>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input type="checkbox" checked className="checkbox-input" />
                Новые скины в каталоге
              </label>
              <label className="checkbox-label">
                <input type="checkbox" checked className="checkbox-input" />
                Статус сделки
              </label>
              <label className="checkbox-label">
                <input type="checkbox" className="checkbox-input" />
                Акции и скидки
              </label>
            </div>
          </div>
        </section>

        {/* Кошелёк */}
        <section className="settings-section">
          <h3>Кошелёк</h3>
          <div className="wallet-preview">
            <span className="wallet-label">Баланс</span>
            <span className="wallet-value">
              {showBalance ? '12 450 ₽' : '● ● ● ●'}
            </span>
          </div>
          <div className="setting-row">
            <label className="setting-label">Показывать баланс публично</label>
            <label className="toggle-wrapper">
              <input
                type="checkbox"
                checked={showBalance}
                onChange={(e) => setShowBalance(e.target.checked)}
                className="toggle-input"
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <button className="btn-secondary">Пополнить баланс</button>
        </section>

        {/* Память и кэш */}
        <section className="settings-section">
          <h3>Память</h3>
          <div className="storage-bar">
            <div className="storage-fill" style={{ width: '38%' }}></div>
          </div>
          <p className="storage-info">
            Занято 38% (1,9 ГБ из 5 ГБ)
          </p>
          <div className="setting-row">
            <label className="setting-label">Автоочистка кэша при нехватке места</label>
            <label className="toggle-wrapper">
              <input
                type="checkbox"
                checked={autoClearCache}
                onChange={(e) => setAutoClearCache(e.target.checked)}
                className="toggle-input"
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <button className="btn-danger">Очистить кэш вручную</button>
        </section>

        {/* Политика */}
        <section className="settings-section policy-section">
          <h3>Политика конфиденциальности</h3>
          <p className="policy-text">
            Ознакомьтесь с нашей политикой конфиденциальности, чтобы понимать, как мы обрабатываем ваши данные.
          </p>
          <a href="#" className="policy-link">
            Политика конфиденциальности и Пользовательское соглашение
          </a>
        </section>

        <div className="settings-footer">
          <button className="btn-danger" onClick={handleLogout}>
            Выйти из аккаунта
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
