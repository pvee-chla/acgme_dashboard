import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import { ClassFilterProvider } from './context/ClassFilter'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClassFilterProvider>
      <App />
    </ClassFilterProvider>
  </React.StrictMode>
)