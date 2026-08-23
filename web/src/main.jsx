import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import VitrineApp from './vitrine/VitrineApp.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <VitrineApp />
  </StrictMode>,
);
