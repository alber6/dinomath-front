import React, { useContext } from "react";
import { Link, Navigate } from "react-router-dom";
import { GameContext } from "../context/GameContext";
import { AuthContext} from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import './Home.css';

const Home = () => {
    // Lógica del juego.
    const { mascotaGlobal, limpiarPartidaLocal, reinicioPartida } = useContext(GameContext);
    const { logoutAuth, user } = useContext(AuthContext) 
    const navigate = useNavigate()

    const handleLogout = () => {
        logoutAuth()
        limpiarPartidaLocal()
        navigate("/")
    }
    
    return (
        <div className="home">
            <h1>Bienvenido a MathPets</h1>
            <p>Interacciona y enseña a tu nueva mascota las matematicas para que aprenda un montón</p>
            {/* Si existe user*/}
            {user ? (
                <div className="zona-juego">
                    <h2>¡Hola, {user.username}! 🎮</h2>
                    {mascotaGlobal ? (
                        <div className="botones">
                            <Link to ="dashboard" >
                                <button>Seguir aventura</button>
                            </Link>
                            <hr></hr>
                            <button onClick={reinicioPartida}>
                                Borrar partida
                            </button>
                            <hr></hr>
                            <button onClick={handleLogout}>
                                Salir de la aventura
                            </button>
                        </div>
                    ) : (
                        <Link to ="choose" > 
                        {/* si no existe user */}
                            <button>Empezar aventura</button>
                        </Link>
                    )}
                </div>
            ) : (
                // Si no está logueda tiene que iniciar sesión
                <div className="zona-auth">
                    <p><strong>Para empezar a jugar y guardar a tu mascota en la nube, necesitas identificarte.</strong></p>
                    <div className="botones">
                        <Link to="/login">
                            <button>
                                Iniciar Sesión
                            </button>
                        </Link>
                        <Link to="/register">
                            <button>
                                Registrarse
                            </button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;