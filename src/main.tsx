import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { EventProvider } from './contexts/EventContext'
import ErrorBoundary from './components/ErrorBoundary'

console.log('main.tsx is being executed');

const rootElement = document.getElementById('root');
if (rootElement) {
  console.log('Root element found, rendering App');
  ReactDOM.createRoot(rootElement).render(
    <ErrorBoundary>
      <EventProvider>
        <App />
      </EventProvider>
    </ErrorBoundary>
  )
} else {
  console.error('Root element not found');
}