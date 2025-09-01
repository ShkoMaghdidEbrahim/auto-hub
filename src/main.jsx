import ReactDOM from 'react-dom/client';
import './locales/i18n.js';
import { I18nextProvider } from 'react-i18next';
import i18n from './locales/i18n.js';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <I18nextProvider i18n={i18n}>
    <App />
  </I18nextProvider>
);
