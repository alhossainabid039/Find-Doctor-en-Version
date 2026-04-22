/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Doctors } from './pages/Doctors';
import { DoctorDetail } from './pages/DoctorDetail';
import { Dashboard } from './pages/Dashboard';
import { ChatWidget } from './components/ChatWidget';

import { ThemeProvider } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';
import { NotificationProvider } from './context/NotificationContext';

export default function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <NotificationProvider>
          <Router>
          <div className="min-h-screen bg-mesh font-sans text-slate-800 dark:text-slate-100 overflow-x-hidden transition-colors duration-300">
            <Navbar />
            <main className="pt-20 pb-24">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/doctors" element={<Doctors />} />
                <Route path="/doctors/:id" element={<DoctorDetail />} />
                <Route path="/dashboard" element={<Dashboard />} />
              </Routes>
            </main>
            <ChatWidget />
          </div>
        </Router>
        </NotificationProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
