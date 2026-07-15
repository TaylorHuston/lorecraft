import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import { createTuyauAuthApi } from './auth/tuyauAuthApi'
import { createTuyauWorldApi } from './worlds/tuyauWorldApi'
import './styles/tokens.css'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Lorecraft could not find its application root.')
}

createRoot(root).render(
  <StrictMode>
    <App
      api={createTuyauAuthApi(window.location.origin)}
      worldApi={createTuyauWorldApi(window.location.origin)}
    />
  </StrictMode>
)
