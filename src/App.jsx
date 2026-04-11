import { Outlet } from 'react-router-dom'
import Footer from './components/Footer'
import Header from './components/Header'

function App() {

  return (
      <div className='App'>
        <Header />
        <main>
          <Outlet />
          {/* 
            Aquí es donde React inyectará
            las diferentes pantallas (Home, Login, Dashboard...)
            dependiendo de la URL en la que estemos, sin recargar la página.
          */}
        </main>
        <Footer />
      </div>
  )
}

export default App
