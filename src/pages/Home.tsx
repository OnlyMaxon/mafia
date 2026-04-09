import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home">
      <div className="container">
        <header className="header">
          <h1>👑 VISTULA FAMILY</h1>
          <p className="subtitle">Мафия по ночам • Покер до утра • Афтерпати без правил</p>
        </header>

        <section className="about">
          <h2>О нас</h2>
          <p className="about-text">
            Мафия по ночам • Покер до утра • Афтерпати без правил
          </p>
        </section>

        <section className="socials">
          <h3>🌐 Наши социальные сети</h3>
          <div className="social-links">
            <a href="https://www.instagram.com/vistula.family/" target="_blank" rel="noopener noreferrer" className="social-btn instagram">
              📷 Instagram: @vistula.family
            </a>
            <a href="https://www.instagram.com/0nlymaxon/" target="_blank" rel="noopener noreferrer" className="social-btn instagram">
              👑 Дон (Don): @0nlymaxon
            </a>
            <a href="https://t.me/+1NnQFAm-xDRmYmM6" target="_blank" rel="noopener noreferrer" className="social-btn telegram">
              ✈️ Telegram группа
            </a>
          </div>
        </section>

        <div className="actions">
          <button
            className="btn btn-primary"
            onClick={() => navigate('/host-auth')}
          >
            👑 Ведущий
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/player-join')}
          >
            🎮 Играть
          </button>
        </div>

        <footer className="footer">
          <p>📱 Присоединитесь к Vistula Family • Играйте с друзьями</p>
        </footer>
      </div>
    </div>
  );
};
