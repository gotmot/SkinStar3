import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const Profile = ({ setIsLoggedIn }) => {
  const [searchParams] = useSearchParams();
  const viewedUser = searchParams.get('user');

  const [user, setUser] = useState({
    username: viewedUser || 'PlayerOne',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80&fit=crop&auto=format',
    bgImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80&fit=crop&auto=format',
    description: 'Люблю скины и коллекционировать редкие предметы.',
    isPremium: false
  });

  const [banInfo, setBanInfo] = useState(null);

  // Проверяем блокировку каждый раз при открытии профиля
  useEffect(() => {
    const checkBan = () => {
      const blocked = JSON.parse(localStorage.getItem('blockedUsers') || '[]');
      const nameToCheck = viewedUser || user.username;
      const found = blocked.find(
        (u) => u.username.toLowerCase() === nameToCheck.toLowerCase()
      );
      setBanInfo(found || null);
    };

    if (viewedUser) {
      setUser((prev) => ({ ...prev, username: viewedUser }));
    }
    checkBan();
  }, [viewedUser]);

  const [isEditing, setIsEditing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [bgFile, setBgFile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const [formData, setFormData] = useState({
    username: user.username,
    description: user.description,
    bgImage: user.bgImage,
    avatar: user.avatar
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      username: user.username,
      description: user.description,
      bgImage: user.bgImage,
      avatar: user.avatar
    }));
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (img) => {
      if (field === 'bgImage') setBgFile(img.target.result);
      if (field === 'avatar') setAvatarFile(img.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => setIsConfirming(true);

  const handleSave = () => {
    setUser((prev) => ({
      ...prev,
      username: formData.username,
      description: formData.description,
      bgImage: formData.bgImage,
      avatar: formData.avatar
    }));
    setIsEditing(false);
    setIsConfirming(false);
    alert('Профиль успешно обновлён!');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsConfirming(false);
    setFormData({
      username: user.username,
      description: user.description,
      bgImage: user.bgImage,
      avatar: user.avatar
    });
    setBgFile(null);
    setAvatarFile(null);
  };

  const handleBuyPremium = () => {
    setUser((prev) => ({ ...prev, isPremium: true }));
    alert('Премиум куплен! Доступны анимированные эффекты.');
  };

  const currentBg = bgFile || user.bgImage;
  const currentAvatar = avatarFile || user.avatar;

  return (
    <div className="profile-page">
      {viewedUser && (
        <div className="viewed-user-banner">
          <span>Просмотр профиля пользователя: <strong>{viewedUser}</strong></span>
        </div>
      )}

      {/* Баннер блокировки — показывается всегда, если пользователь заблокирован */}
      {banInfo && (
        <div className={`ban-banner ${banInfo.type === 'permanent' ? 'ban-perm' : 'ban-temp'}`}>
          <div className="ban-banner-icon">🔒</div>
          <div className="ban-banner-content">
            <h3 className="ban-banner-title">
              {banInfo.type === 'permanent'
                ? 'Аккаунт заблокирован навсегда'
                : `Аккаунт заблокирован до ${banInfo.banUntil}`}
            </h3>
            <p className="ban-banner-reason">Причина: {banInfo.reason}</p>
            <p className="ban-banner-date">Дата блокировки: {banInfo.date}</p>
          </div>
        </div>
      )}

      <div
        className={`profile-background ${user.isPremium ? 'profile-background--premium' : ''}`}
        style={{ backgroundImage: `url(${currentBg})` }}
      ></div>

      <div className="profile-container">
        <button className="back-btn" onClick={() => window.history.back()}>← Назад</button>

        <div className="profile-card">
          <div className="profile-header">
            <div className="avatar-wrapper">
              <img
                src={currentAvatar}
                alt="Avatar"
                className={`avatar ${user.isPremium ? 'avatar--premium' : ''}`}
              />
              {user.isPremium && <div className="star-badge"></div>}
              {isEditing && (
                <label className="upload-label">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'avatar')}
                    style={{ display: 'none' }}
                    id="avatarInput"
                  />
                  <span>Сменить</span>
                </label>
              )}
            </div>

            <div className="profile-info">
              <h1 className="profile-username">{user.username}</h1>

              {!isEditing ? (
                <p className="profile-description">{user.description}</p>
              ) : (
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  className="profile-input description-input"
                  placeholder="Описание профиля"
                />
              )}

              <div className="status-badge">
                <span className={`status-dot ${user.isPremium ? 'premium' : 'basic'}`}></span>
                <span className="status-text">
                  {user.isPremium ? 'Premium аккаунт' : 'Базовый аккаунт'}
                </span>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            {!isEditing ? (
              <button className="btn-edit" onClick={() => setIsEditing(true)}>
                Редактировать профиль
              </button>
            ) : (
              <div className="edit-controls">
                <button className="btn-cancel" onClick={handleCancel}>Отмена</button>
                <button className="btn-confirm" onClick={handleConfirm}>Подтвердить изменения</button>
              </div>
            )}
            {!user.isPremium && (
              <button className="btn-premium" onClick={handleBuyPremium}>Купить Premium</button>
            )}
          </div>

          {isConfirming && (
            <div className="confirm-modal">
              <p>Вы уверены, что хотите сохранить изменения?</p>
              <div className="confirm-buttons">
                <button className="btn-cancel" onClick={handleCancel}>Отмена</button>
                <button className="btn-save" onClick={handleSave}>Сохранить</button>
              </div>
            </div>
          )}

          {isEditing && !isConfirming && (
            <div className="profile-form">
              <div className="field-group">
                <label>Никнейм</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="profile-input"
                />
              </div>
              <div className="field-group">
                <label>Фон профиля (URL или файл)</label>
                <input
                  type="url"
                  name="bgImage"
                  placeholder="https://..."
                  value={formData.bgImage}
                  onChange={handleChange}
                  className="profile-input"
                />
                <label className="upload-label small">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'bgImage')}
                    style={{ display: 'none' }}
                    id="bgInput"
                  />
                  <span>Или загрузить файл</span>
                </label>
              </div>
            </div>
          )}

          <div className="premium-features">
            <h3>Премиум-возможности</h3>
            <ul>
              <li>Анимированный фон профиля</li>
              <li>Анимированная рамка аватара</li>
              <li>Создание анимированных карточек товаров</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
