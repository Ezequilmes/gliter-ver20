import React from 'react'
import './styles/App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Grinder App</h1>
        <p>Aplicación de citas moderna y segura</p>
      </header>
      <main className="app-main">
        <div className="welcome-message">
          <h2>¡Bienvenido!</h2>
          <p>Tu nueva aplicación está lista para comenzar el desarrollo.</p>
        </div>
      </main>
    </div>
  )
}

export default App