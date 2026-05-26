import React, { useContext, useState, useEffect, useRef } from "react";
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
    const { num1, num2, operador, nuevaOperacion, comprobarResultado, cargarOperacionSegura } = useMathsEngine();
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
    // Guarda los datos más recientes del usuario sin provocar recargas y así no aparece todo el rato que el user se modifica el aviso de sincronización...
    const userRef = useRef(user);
    useEffect(() => {
        userRef.current = user;
    }, [user]);

    // --- Sincronización en segundo plano ---
    useEffect(() => {
        const sincronizarDatos = async () => {
            // Usamos userRef.current en lugar de user
            if (!userRef.current?._id || !token) return;
            
            setSincronizando(true);
            
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${userRef.current._id}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}` 
                    },
                    cache: 'no-store' 
                });

                if (response.ok) {
                    const datosFrescos = await response.json();
                    
                    const fotoNube = JSON.stringify(datosFrescos);
                    const fotoLocal = JSON.stringify(userRef.current);

                    if (fotoNube !== fotoLocal) {
                        loginAuth(datosFrescos, token); 
                    }
                }
            } catch (error) {
                console.log("Error sincronizando", error);
            } finally {
                setSincronizando(false);
            }
        };

        sincronizarDatos();

        const manejarCambioDePantalla = () => {
            if (document.visibilityState === 'visible') {
                sincronizarDatos();
            }
        };

        document.addEventListener('visibilitychange', manejarCambioDePantalla);

        return () => document.removeEventListener('visibilitychange', manejarCambioDePantalla);

    // LOS CORCHETES VACÍOS: El secreto para que NO salte al escribir o hacer sumas
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Calculamos el nivel máximo para mostrarlo en pantalla
    const nivelMaximo = mascotaGlobal === 'rex' ? 200 : 100;
    const esNivelMaximo = nivel >= nivelMaximo; // para decirnos que ya no puede subir más
    // Busca en toda la cuenta del usuario si AL MENOS una mascota es nivel 50 o más
    // 🌟 NUEVO: Lo calculamos aquí arriba para que TODAS las funciones puedan verlo
    const infoMascota = DINODEX[mascotaGlobal]?.[0];
    const esMascotaEpica = infoMascota?.esEpico || false;

// --- Generar o cargar operación de forma segura (Anti-Trampas) ---
    useEffect(() => {
        cargarOperacionSegura(esMascotaEpica, nivel);
    }, [cargarOperacionSegura, esMascotaEpica, nivel]);

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
            // Le pasamos el interruptor épico para que sepa qué generar
            nuevaOperacion(esMascotaEpica, nivelNuevo);
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
   // SISTEMA DE TOKENS (Billetes Dorados) para seguir el flujo de que aparezca el boton de adoptar huevo cuando el usuario tenga un dino con nivel 50 y pierda ese token hasta que consiga otro dino a nivel 50
    const petsUsuario = user?.pets || [];
    const nombresMascotas = petsUsuario.map(pet => pet.nombre);

    // 1. Contamos cuántos dinosaurios NORMALES han llegado a 50 (Cada uno da 1 Token)
    const tokensGanados = petsUsuario.filter(pet => {
        const esMitico = DINODEX[pet.nombre]?.[0]?.esEpico;
        return !esMitico && pet.nivel >= 50;
    }).length;

    // 2. Contamos cuántos dinosaurios MÍTICOS ya tiene el niño (Cada uno consume 1 Token)
    const miticosAdoptados = petsUsuario.filter(pet => {
        return DINODEX[pet.nombre]?.[0]?.esEpico;
    }).length;

    // 3. ¿Tiene algún Token sin gastar?
    const paseVIPMitico = tokensGanados > miticosAdoptados;

    // 4. El Escáner: ¿Quedan huevos en el juego que pueda adoptar AHORA MISMO?
    const hayHuevosDisponibles = Object.keys(DINODEX).some((nombreDino) => {
        if (nombresMascotas.includes(nombreDino)) return false; // Ya lo tiene
        
        const esMitico = DINODEX[nombreDino][0]?.esEpico;
        // Si el huevo de la tienda es mítico, pero no le quedan tokens, no lo contamos
        if (esMitico && !paseVIPMitico) return false; 
        
        return true; 
    });

    return (
       // Si es nivel máximo, añadimos la clase 'dashboard-maximo'
        <div className={`dashboard ${esNivelMaximo ? 'dashboard-maximo' : ''} ${esMascotaEpica ? 'dashboard-mitico' : ''}`}>
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
                    <p>Nivel: {nivel} / {nivelMaximo} | XP: {xp}/100</p>
                    
                    {/* Condicional para esconder el formulario si llegó al máximo */}
                    {esNivelMaximo ? (
                        <div className="entrenamiento-maximo" >
                            <h3>👑 ¡Fuerza Máxima! 👑</h3>
                            <p>Tu {datosMascota?.nombre} es una leyenda y ya no necesita entrenar.</p>
                            <p><strong>Ve a la Colección para equipar y entrenar a otro dinosaurio.</strong></p>
                        </div>
                    ) : (
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
                    )}
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
                
              {/* 🌟 MODIFICADO: El botón solo aparece si el escáner confirma que hay algo en la tienda */}
                {hayHuevosDisponibles && (
                    <Link to="/choose">
                        <button>Adoptar Nuevo Huevo 🥚</button>
                    </Link>
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