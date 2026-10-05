import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const SellPage = ({ userRole }) => {
  const [listedSkins, setListedSkins] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [tradeLink, setTradeLink] = useState('');
  const [tradeLinkSaved, setTradeLinkSaved] = useState(false);
  const [skinData, setSkinData] = useState({
    name: '',
    game: 'cs',
    price: '',
    rarity: 'normal'
  });
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('listedSkins') || '[]');
    setListedSkins(stored);

    const savedLink = localStorage.getItem('steamTradeLink') || '';
    setTradeLink(savedLink);
  }, []);

  // Сохранение трейд-ссылки
  const handleSaveTradeLink = () => {
    if (!tradeLink.trim()) {
      setFormError('Введите ссылку');
      return;
    }
    if (!tradeLink.includes('steamcommunity.com')) {
      setFormError('Ссылка должна начинаться с steamcommunity.com');
      return;
    }
    localStorage.setItem('steamTradeLink', tradeLink.trim());
    setTradeLinkSaved(true);
    setFormError('');
    setTimeout(() => setTradeLinkSaved(false), 3000);
  };

  // Выставление скина
  const handleListSkin = () => {
    setFormError('');

    if (!skinData.name.trim()) { setFormError('Введите название скина'); return; }
    if (!skinData.price.trim() || isNaN(Number(skinData.price)) || Number(skinData.price) <= 0) {
      setFormError('Введите корректную цену'); return;
    }

    const tradeLinkStored = localStorage.getItem('steamTradeLink') || '';
    if (!tradeLinkStored) {
      setFormError('Сначала укажите Steam-трейд ссылку ниже'); return;
    }

    const newSkin = {
      id: Date.now().toString(),
      name: skinData.name.trim(),
      game: skinData.game,
      price: Number(skinData.price),
      rarity: skinData.rarity,
      tradeLink: tradeLinkStored,
      status: 'active',
      date: new Date().toLocaleString('ru-RU')
    };

    const updated = [newSkin, ...listedSkins];
    setListedSkins(updated);
    localStorage.setItem('listedSkins', JSON.stringify(updated));

    setSuccessMsg(`Скин «${newSkin.name}» выставлен на продажу за ${newSkin.price.toLocaleString('ru-RU')}₽`);
    setShowForm(false);
    setSkinData({ name: '', game: 'cs', price: '', rarity: 'normal' });
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Снять с продажи
  const handleDelistSkin = (id) => {
    const skin = listedSkins.find((s) => s.id === id);
    if (window.confirm(`Снять «${skin.name}» с продажи?`)) {
      const updated = listedSkins.filter((s) => s.id !== id);
      setListedSkins(updated);
      localStorage.setItem('listedSkins', JSON.stringify(updated));
    }
  };

  // Пометить как проданный
  const handleMarkSold = (id) => {
    const updated = listedSkins.map((s) =>
      s.id === id ? { ...s, status: 'sold' } : s
    );
    setListedSkins(updated);
    localStorage.setItem('listedSkins', JSON.stringify(updated));
  };

  const getGameName = (game) => {
    switch (game) {
      case 'cs': return 'CS2';
      case 'dota': return 'Dota 2';
      case 'rust': return 'Rust';
      default: return game;
    }
  };

  const getRarityLabel = (r) => {
    if (r === 'legendary') return 'Легендарный';
    if (r === 'rare') return 'Редкий';
    return 'Обычный';
  };

  const getRarityColor = (r) => {
    if (r === 'legendary') return '#ff0055';
    if (r === 'rare') return '#5d40e1';
    return '#888';
  };

  return (
    <div className="sell-page">
      <h2 className="section-title">Продажа</h2>

      {successMsg && <div className="sell-success-msg">{successMsg}</div>}
      {tradeLinkSaved && <div className="sell-success-msg">Steam-трейд ссылка сохранена!</div>}

      {/* Кнопка выставить скин */}
      {listedSkins.length === 0 ? (
        // Нет скинов — кнопка по центру
        <div className="sell-empty-state">
          <div className="sell-empty-icon">📦</div>
          <h3>У вас нет выставленных скинов</h3>
          <p>Выставите свой первый скин на продажу</p>
          <button className="btn-sell-primary" onClick={() => setShowForm(true)}>
            Выставить скин
          </button>
        </div>
      ) : (
        // Есть скины — кнопка слева в углу
        <div className="sell-listed-layout">
          <div className="sell-listed-header">
            <button className="btn-sell-primary btn-sell-sm" onClick={() => setShowForm(true)}>
              + Выставить скин
            </button>
          </div>

          {/* Список выставленных скинов */}
          <div className="sell-skins-grid">
            {listedSkins.map((skin) => (
              <div key={skin.id} className={`sell-skin-card ${skin.status === 'sold' ? 'sold' : ''}`}>
                <div className="sell-skin-rarity-bar" style={{ backgroundColor: getRarityColor(skin.rarity) }}></div>
                <div className="sell-skin-body">
                  <div className="sell-skin-top">
                    <h4 className="sell-skin-name">{skin.name}</h4>
                    {skin.status === 'sold' && <span className="sell-sold-badge">Продано</span>}
                  </div>
                  <div className="sell-skin-meta">
                    <span className="sell-skin-game">{getGameName(skin.game)}</span>
                    <span className="sell-skin-rarity" style={{ color: getRarityColor(skin.rarity) }}>
                      {getRarityLabel(skin.rarity)}
                    </span>
                  </div>
                  <div className="sell-skin-price">
                    <span className="sell-price-value">{skin.price.toLocaleString('ru-RU')}</span>
                    <span className="sell-price-symbol">₽</span>
                  </div>
                  <div className="sell-skin-date">Выставлен: {skin.date}</div>

                  {skin.status === 'active' && (
                    <div className="sell-skin-actions">
                      <a href={skin.tradeLink} target="_blank" rel="noopener noreferrer" className="sell-trade-link-btn">
                        Steam-трейд ↗
                      </a>
                      <button className="sell-action-btn" onClick={() => handleMarkSold(skin.id)}>
                        Отметить проданным
                      </button>
                      <button className="sell-action-btn sell-action-danger" onClick={() => handleDelistSkin(skin.id)}>
                        Снять с продажи
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Форма выставления скина */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content sell-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setShowForm(false)}>&times;</button>
            <h3>Выставить скин на продажу</h3>

            {formError && <p className="error-message">{formError}</p>}

            <div className="sell-form-group">
              <label className="ban-label">Название скина</label>
              <input
                type="text"
                placeholder="Например: AK-47 | Asiimov"
                value={skinData.name}
                onChange={(e) => setSkinData({ ...skinData, name: e.target.value })}
                className="ban-input"
              />
            </div>

            <div className="sell-form-group">
              <label className="ban-label">Игра</label>
              <select
                value={skinData.game}
                onChange={(e) => setSkinData({ ...skinData, game: e.target.value })}
                className="ban-input"
              >
                <option value="cs">Counter-Strike 2</option>
                <option value="dota">Dota 2</option>
                <option value="rust">Rust</option>
              </select>
            </div>

            <div className="sell-form-group">
              <label className="ban-label">Редкость</label>
              <select
                value={skinData.rarity}
                onChange={(e) => setSkinData({ ...skinData, rarity: e.target.value })}
                className="ban-input"
              >
                <option value="normal">Обычный</option>
                <option value="rare">Редкий</option>
                <option value="legendary">Легендарный</option>
              </select>
            </div>

            <div className="sell-form-group">
              <label className="ban-label">Цена (₽)</label>
              <input
                type="number"
                placeholder="Например: 2500"
                value={skinData.price}
                onChange={(e) => setSkinData({ ...skinData, price: e.target.value })}
                className="ban-input"
              />
            </div>

            <div className="sell-trade-hint">
              <p>Трейд-ссылка будет автоматически подставлена из вашего профиля Steam.</p>
              <p className="sell-trade-status">
                {localStorage.getItem('steamTradeLink')
                  ? '✓ Трейд-ссылка привязана'
                  : '⚠ Трейд-ссылка не указана — укажите ниже'}
              </p>
            </div>

            <button onClick={handleListSkin} className="btn-block-confirm">
              Выставить на продажу
            </button>
          </div>
        </div>
      )}

      {/* Steam-трейд ссылка — всегда внизу */}
      <section className="sell-trade-section">
        <h3 className="sell-trade-title">Steam-трейд ссылка</h3>
        <p className="sell-trade-desc">
          Укажите вашу ссылку для обмена из Steam. Покупатель сможет перейти по ней, чтобы принять трейд.
        </p>
        {formError && !showForm && <p className="error-message">{formError}</p>}
        <div className="sell-trade-input-row">
          <input
            type="url"
            placeholder="https://steamcommunity.com/tradeoffer/new/?partner=..."
            value={tradeLink}
            onChange={(e) => setTradeLink(e.target.value)}
            className="ban-input"
          />
          <button className="btn-primary" onClick={handleSaveTradeLink}>
            Сохранить
          </button>
        </div>
        <p className="sell-trade-help">
          Где найти ссылку: Steam → Инвентарь → «Предложить обмен» → «Кто может отправлять мне обмены» → ссылка.
        </p>
      </section>
    </div>
  );
};

export default SellPage;
