import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Pages
import { Home } from './pages/Home';
import { HostAuth } from './pages/HostAuth';
import { HostChoice } from './pages/HostChoice';
import { HostEditor } from './pages/HostEditor';
import { HostWaiting } from './pages/HostWaiting';
import { HostGame } from './pages/HostGame';
import { PlayerJoin } from './pages/PlayerJoin';
import { PlayerWaiting } from './pages/PlayerWaiting';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/host-auth" element={<HostAuth />} />
        <Route path="/host-choice" element={<HostChoice />} />
        <Route path="/host-editor" element={<HostEditor />} />
        <Route path="/host-waiting/:gameCode" element={<HostWaiting />} />
        <Route path="/host-game/:gameCode" element={<HostGame />} />
        <Route path="/player-join" element={<PlayerJoin />} />
        <Route path="/player-waiting/:gameCode" element={<PlayerWaiting />} />
      </Routes>
    </Router>
  );
}

export default App;
