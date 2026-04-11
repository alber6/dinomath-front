import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Home from './pages/Home.jsx'
import ChoosePet from './pages/ChoosePet.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Coleccion from './pages/Coleccion.jsx'
// gamecontext envuelve las routes y route para que en todas las partes de la página tengan los datos de la mascota
import GameContext from './context/GameContext.jsx'
import AuthContext from './context/AuthContext.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
     {/* habilita el sistema de navegación por las urls */}
    <BrowserRouter basename='/'>
      {/* AuthContext envuelve todo para saber si hay un usuario y quién es */}
      <AuthContext>
        {/* gameContext maneja la partida del usuario, envuelve todas las rutas para que cualquier pantalla pueda acceder a los datos del usuario */}
        <GameContext>
        <Routes>
        <Route path='/' element={<App />}>
          <Route index element={<Home />} />
          <Route path='/register' element={<Register />} />
          <Route path='/login' element={<Login />} />
          <Route path='/choose' element={<ChoosePet />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/coleccion' element={<Coleccion />} />
        </Route>
        </Routes>
      </GameContext>
      </AuthContext>
    </BrowserRouter>
  </StrictMode>
)
// El usuario navega.
//Auth verifica si tiene llave para entrar.
//Game carga sus datos si la llave es correcta
//El <Outlet /> pinta la pantalla.
