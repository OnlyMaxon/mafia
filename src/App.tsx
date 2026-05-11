import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Mafia pages
import { Home } from './pages/Home';
import { HostAuth } from './pages/HostAuth';
import { HostChoice } from './pages/HostChoice';
import { HostEditor } from './pages/HostEditor';
import { HostWaiting } from './pages/HostWaiting';
import { HostGame } from './pages/HostGame';
import { PlayerJoin } from './pages/PlayerJoin';
import { PlayerWaiting } from './pages/PlayerWaiting';

// Russian Roulette pages
import { RouletteHome } from './pages/RouletteHome';
import { RouletteHostSetup } from './pages/RouletteHostSetup';
import { RouletteHostPlay } from './pages/RouletteHostPlay';
import { RouletteJoin } from './pages/RouletteJoin';
import { RoulettePlay } from './pages/RoulettePlay';

function App() {
  return (
    <Router>
      <Routes>
        {/* Mafia */}
        <Route path="/" element={<Home />} />
        <Route path="/host-auth" element={<HostAuth />} />
        <Route path="/host-choice" element={<HostChoice />} />
        <Route path="/host-editor" element={<HostEditor />} />
        <Route path="/host-waiting/:gameCode" element={<HostWaiting />} />
        <Route path="/host-game/:gameCode" element={<HostGame />} />
        <Route path="/player-join" element={<PlayerJoin />} />
        <Route path="/player-waiting/:gameCode" element={<PlayerWaiting />} />

        {/* Russian Roulette */}
        <Route path="/roulette" element={<RouletteHome />} />
        <Route path="/roulette/host-setup" element={<RouletteHostSetup />} />
        <Route path="/roulette/host-play/:gameCode" element={<RouletteHostPlay />} />
        <Route path="/roulette/join" element={<RouletteJoin />} />
        <Route path="/roulette/play/:gameCode" element={<RoulettePlay />} />
      </Routes>
    </Router>
  );
}

export default App;
