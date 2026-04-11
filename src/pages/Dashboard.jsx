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
    const { mascotaGlobal, xp, nivel, ganarExperiencia, puedeAdoptar } = useContext(GameContext);
    const { num1, num2, operador, nuevaOperacion, comprobarResultado } = useMathsEngine();
    const { juegoCompletado } = useMascotas();
    const navigate = useNavigate();

    // El formulario
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    // Estados locales para UI
    const [mostrarModal, setMostrarModal] = useState(false);
    const [mensajeFeedback, setMensajeFeedback] = useState('');

    // Contexto de usuario
    const { user, token, loginAuth } = useContext(AuthContext);

    // --- EFECTO 1: Sincronización en segundo plano ---
    useEffect(() => {
        const sincronizarDatos = async () => {
            // Si por algún motivo no hay ID o token, cortamos la función aquí
            if (!user?._id || !token) return;

            try {
                const response = await fetch(`https://backend-mathpets.onrender.com/api/v1/users/${user._id}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}` 
                    }
                });

                if (response.ok) {
                    const datosFrescos = await response.json();
                    loginAuth(datosFrescos, token); 
                }
            } catch (error) {
                console.log("Error sincronizando en segundo plano", error);
            }
        };

        sincronizarDatos();
    }, [user?._id, token, loginAuth]); // <-- Dependencias añadidas para evitar warnings de ESLint

    // --- EFECTO 2: Generar primera operación ---
    useEffect(() => {
        nuevaOperacion();
    }, [nuevaOperacion]);

    // --- LÓGICA DE EVOLUCIÓN ---
    const revisarEvolucion = (nivelAntiguo, nivelNuevo) => {
        // Seguro de vida por si aún no ha cargado la mascota global
        if (!mascotaGlobal || !DINODEX[mascotaGlobal]) return;

        const linea = DINODEX[mascotaGlobal];
        const nivelMax = linea[linea.length - 1].nivelReq;

        if (nivelAntiguo < nivelNuevo && nivelNuevo === nivelMax) {
            setMostrarModal(true);
        }
    };

    // --- CÓMO FUNCIONA EL JUEGO ---
    const alEnviarRespuesta = (datosDelFormulario) => {
        const esCorrecto = comprobarResultado(datosDelFormulario.respuesta);

        if (esCorrecto) {
            setMensajeFeedback('¡Correcto! 🎉 +25 XP');
            ganarExperiencia(25); 

            // Calculamos manualmente el nivel futuro
            let nivelFuturo = nivel;
            if (xp + 25 >= 100) {
                nivelFuturo = nivel + 1;
            }
            
            revisarEvolucion(nivel, nivelFuturo);
            nuevaOperacion();  
            reset();           
        } else {
            setMensajeFeedback('Mmm... casi. ¡Vuelve a intentarlo! 💪');
            reset(); 
        }

        // Borramos el feedback a los 2 segundos
        setTimeout(() => setMensajeFeedback(''), 2000);
    };

    // --- LÓGICA DE ESTADO DERIVADO ---
    let datosMascota = null;

    if (mascotaGlobal && DINODEX[mascotaGlobal]) {
        const lineaEvolutiva = DINODEX[mascotaGlobal];
        const faseActual = lineaEvolutiva.slice().reverse().find(dino => nivel >= dino.nivelReq);
        
        if (faseActual) {
            datosMascota = {
                nombre: faseActual.nombre,
                imagen: faseActual.imagen
            };
        }
    }

    // --- RENDERIZADO VISUAL ---
    return (
        <div className="dashboard">
            <h2>Centro de Entrenamiento</h2>
            
            <div id="container-dashboard">
                <div id="petImg">
                    <img 
                        className={nivel === 2 || nivel === 3 ? "evolucion-animacion" : ""}
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
                    <h3>🌟 ¡Felicidades, Maestro Pet! 🌟</h3>
                    <p>
                        Has desbloqueado todas las mascotas de esta versión. <br/>
                        ¡Sigue practicando mates para subir sus estadísticas al máximo nivel!
                    </p>
                </div>
            )}

            {/* Modal de evolución máxima */}
            {mostrarModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>¡Felicidades!</h2>
                        <p>Tu mascota ha alcanzado su máximo potencial.</p>
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