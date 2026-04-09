import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home">
      <div className="container">
        <header className="header">
          <h1>🎭 MAFIA GAME</h1>
          <p className="subtitle">Мафия по ночам • Покер до утра • Афтерпати без правил</p>
        </header>

        <section className="about">
          <h2>О нас</h2>
          <p className="about-text">
            Мафия по ночам • Покер до утра • Афтерпати без правил
          </p>
          <p className="contact">
            <strong>Дон:</strong> @0nlymaxon
          </p>
          <p className="instagram">
            <strong>Instagram:</strong> @vistula.family
          </p>
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
          <p>Все ссылки, группа и запись на игры — в био</p>
        </footer>
      </div>
    </div>
  );
};
