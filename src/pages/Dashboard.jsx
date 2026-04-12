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

    // --- Sincronización en segundo plano de los dtos por si quieres seguir la partida en tu navegador que ya te ha reconocido o si vas a otro dispositvo que al entrar se haya sincronizdo los últimos datos de la partida ---
    useEffect(() => {
        const sincronizarDatos = async () => {
            // Si por algún motivo no hay ID o token, cortamos la función aquí
            if (!user?._id || !token) return;

            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${user._id}`, {
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
    }, [user?._id, token, loginAuth]);

    // --- Generar primera operación ---
    useEffect(() => {
        nuevaOperacion();
    }, [nuevaOperacion]);

    // --- LÓGICA DE EVOLUCIÓN ---
    const revisarEvolucion = (nivelAntiguo, nivelNuevo) => {
        // Seguro de vida por si aún no ha cargado la mascota global
        if (!mascotaGlobal || !DINODEX[mascotaGlobal]) return;

        // linea es un array de las 4 fases de por ejemplo rex
        const linea = DINODEX[mascotaGlobal];
        //esto lo que hace es sacar el nivel máximo de la última evolucion del rex
        const nivelMax = linea[linea.length - 1].nivelReq;

        //doble verificacion para que si un dino es nivel 20 y al volver a entrar en la app sigue siendo nivel 20 no vuelva a aparecer el modal
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

    // --- LÓGICA DE ESTADO DERIVADO decide qué dinosaurio se ve en pantalla en cada segundo.---
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