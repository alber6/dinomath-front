import React, { useContext, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { GameContext } from "../context/GameContext";
import { AuthContext } from "../context/AuthContext";
import { useMathsEngine } from "../hooks/useMathsEngine";
import { useMascotas } from "../hooks/useMascotas";
import { DINODEX } from "../utils/dinodex.js";

import "./Dashboard.css";

const Dashboard = () => {
    const { mascotaGlobal, xp, nivel, ganarExperiencia, puedeAdoptar, guardarEnBackend } = useContext(GameContext);
    const { num1, num2, operador, nuevaOperacion, comprobarResultado } = useMathsEngine();
    const { juegoCompletado } = useMascotas();
    const navigate = useNavigate();

    // El formulario
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    // Estados locales para UI
    const [mostrarModal, setMostrarModal] = useState(false);
    const [mensajeFeedback, setMensajeFeedback] = useState('');
    const [sincronizando, setSincronizando] = useState(false);

    // Contexto de usuario
    const { user, token, loginAuth } = useContext(AuthContext);

    // --- Sincronización en segundo plano de los dtos por si quieres seguir la partida en tu navegador que ya te ha reconocido o si vas a otro dispositvo que al entrar se haya sincronizdo los últimos datos de la partida ---
    useEffect(() => {
        const sincronizarDatos = async () => {
            if (!user?._id || !token) return;
            setSincronizando(true)
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${user._id}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}` 
                    },
                    cache: 'no-store' // Obliga a ir al servidor real siempre
                });

                if (response.ok) {
                    const datosFrescos = await response.json();
                    loginAuth(datosFrescos, token); 
                }
            } catch (error) {
                console.log("Error sincronizando", error);
            } finally {
                setSincronizando(false)
            }
        };

        sincronizarDatos();

        // visibilitychange detecta perfectamente cuando cambias de pestaña o minimizas
        const manejarCambioDePantalla = () => {
            if (document.visibilityState === 'visible') {
                sincronizarDatos();
            }
        };

        document.addEventListener('visibilitychange', manejarCambioDePantalla);

        return () => document.removeEventListener('visibilitychange', manejarCambioDePantalla);

    }, [user?._id, token, loginAuth]);

    // --- Generar primera operación ---
    useEffect(() => {
        nuevaOperacion();
    }, [nuevaOperacion]);

    // --- LÓGICA DE EVOLUCIÓN ---
    const revisarEvolucion = (nivelAntiguo, nivelNuevo) => {
        // Solo nos interesa el momento exacto en el que pasa de 9 a 10
        // (o si por algún motivo sube varios niveles de golpe y aterriza en 10 o más)
        if (nivelAntiguo < 10 && nivelNuevo >= 10) {
            setMostrarModal(true); 
        }
    };

// --- CÓMO FUNCIONA EL JUEGO ---
    const alEnviarRespuesta = async (datosDelFormulario) => {
        const esCorrecto = comprobarResultado(datosDelFormulario.respuesta);

        if (esCorrecto) {
            setMensajeFeedback('¡Correcto! 🎉 +25 XP');
            // Delegamos TODO el trabajo al GameProvider. 
            // Esto guarda en local, guarda en la nube y nos devuelve los niveles.
            const { nivelAntiguo, nivelNuevo } = ganarExperiencia(25); 
            // Comprobamos si hay que sacar el modal de aviso de huevo
            revisarEvolucion(nivelAntiguo, nivelNuevo);
            // Preparamos la siguiente ronda
            nuevaOperacion();  
            reset();           
        } else {
            setMensajeFeedback('Mmm... casi. ¡Vuelve a intentarlo! 💪');
            reset(); 
        }
        // Borramos el feedback a los 2 segundos
        setTimeout(() => setMensajeFeedback(''), 2000);
    };

    // LÓGICA DE ESTADO DERIVADO decide qué dinosaurio se ve en pantalla en cada segundo
    // Preparamos una variable vacía que llenaremos con la fase correcta
    let datosMascota = null;
    // Primero comprobamos que hay una mascota elegida para no romper el código
    if (mascotaGlobal && DINODEX[mascotaGlobal]) {
    // Traemos toda la "familia" de este dinosaurio (Huevo, Bebé, Joven, Adulto)
    const lineaEvolutiva = DINODEX[mascotaGlobal];

    // Copiamos la lista y le damos la vuelta para mirar de "mayor a menor".
    // Buscamos la primera fase que el nivel del usuario ya haya superado.
    const faseActual = lineaEvolutiva.slice().reverse().find(dino => nivel >= dino.nivelReq);
    
    // Si encontramos una fase que encaje con nuestro nivel...
    if (faseActual) {
        // ...extraemos el nombre y la foto para que el componente los dibuje.
        datosMascota = {
            nombre: faseActual.nombre,
            imagen: faseActual.imagen
        };
    }
}

    return (
        <div className="dashboard">
            {/* 🚀 CARTELITO DE SINCRONIZACIÓN FLOTANTE */}
            {sincronizando && (
                <div className="sincronizacion">
                    <span className="spinner-emoji" style={{ fontSize: '18px' }}>⏳</span> 
                    Sincronizando partida...
                </div>
        )}
            <h2>Centro de Entrenamiento</h2>
            
            <div id="container-dashboard">
                <div id="petImg">
                    <img 
                        className={nivel === 1 || nivel === 5 || nivel === 10 || nivel === 20 ? "evolucion-animacion" : ""}
                        key={datosMascota?.nombre}
                        src={datosMascota?.imagen} 
                        alt={datosMascota?.nombre} 
                    />
                </div>

                {/* Zona de juego -- Formulario */}
                <div id="petInfo">
                    <h3>{datosMascota?.nombre}</h3>
                    <p>Nivel: {nivel} | XP: {xp}/100</p>
                    
                    <form onSubmit={handleSubmit(alEnviarRespuesta)} id="form">
                        <div id="operation">
                            <p>{num1} {operador} {num2} = </p>
                            <input 
                                type="number"
                                placeholder="Num"
                                {...register("respuesta", { required: true })}
                            />
                        </div>
                        <button type="submit">Responder</button>
                    </form>
                </div>
            </div>

            {/* Mensajes visuales */}
            {errors.respuesta && <p>¡Debes escribir un número!</p>}
            {mensajeFeedback && <p className="feedback-msj">{mensajeFeedback}</p>}
        <div className="nav-buttons">
             {/* Botonera de Navegación */}
            <div className="botones-navegacion">
                <Link to="/">
                    <button id="goToHome">Ir a inicio</button>
                </Link>
                <Link to="/coleccion">
                    <button id="goToColeccion">Colección</button>
                </Link>
                
                {/* Lógica del botón de adoptar */}
                {juegoCompletado ? (
                    <button disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                        🏆 ¡Colección Completa! 🏆
                    </button>
                ) : puedeAdoptar ? (
                    <Link to="/choose">
                        <button>Adoptar Nuevo Huevo 🥚</button>
                    </Link>
                ) : (
                    <button disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                        🔒 Evoluciona al máximo a tu mascota actual
                    </button>
                )}
            </div>

            {/* Mensaje de felicitación final */}
            {juegoCompletado && (
                <div className="juego-completado">
                    <h3>🌟 ¡Felicidades, Maestro Dino! 🌟</h3>
                    <p>
                        Has desbloqueado todas los dinosaurios de esta versión. <br/>
                        ¡Sigue practicando mates para subir sus estadísticas al máximo nivel!
                    </p>
                </div>
            )}
        </div>    
           

            {/* Modal de evolución */}
            {mostrarModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>¡Felicidades!</h2>
                        <p>Tu dinosaurio ha evolucionado.</p>
                        <div className="modal-buttons">
                            <button onClick={() => setMostrarModal(false)}>Seguir entrenando</button>
                            <button onClick={() => {
                                setMostrarModal(false);
                                navigate("/choose");
                            }}>Adoptar nuevo huevo 🥚</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;