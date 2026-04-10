import React, { useContext, useState, useEffect } from "react";
import { useForm } from "react-hook-form";

import { GameContext } from "../context/GameContext";
import { AuthContext } from "../context/AuthContext";
import { useMathsEngine } from "../hooks/useMathsEngine";
import { useMascotas } from "../hooks/useMascotas";

import "./Dashboard.css"
import { Link, useNavigate } from "react-router-dom";
import { POKEDEX } from "/src/utils/pokedex.js"

// todo el juego ocurre aquí, aparece la mascota, el nivel, las operaciones y el form
const Dashboard = () => {
    const { mascotaGlobal, xp, nivel, ganarExperiencia, puedeAdoptar } = useContext(GameContext);
    const { num1, num2, operador, nuevaOperacion, comprobarResultado } = useMathsEngine();
    const { juegoCompletado } = useMascotas();
    const navigate = useNavigate()

    //el formulario
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    // estados para guardar los datos que vamos a recoger de la api
    const [ datosMascota, setDatosMascota ] = useState(null);
    // usar state cuando el pokemon del usuario llegue al nivel máximo que aparezca una ventana emergente como que tiene disponible la opción de abrir otro huevo
    const [ mostrarModal, setMostrarModal] = useState(false);
    const [mensajeFeedback, setMensajeFeedback] = useState('');

    //necesitamos el usuario para sobrescribir los datos de la sesión vieja que habiamos dejado
    const { user, token, loginAuth } = useContext(AuthContext);

    // Sincronización con el objetivo de que al continuar con la partida en otro dispositivo, se sincronice los datos pidiendolo al backend y este a mongo para recoger los datos actuales de la partida y no quedarse con la sesión vieja
    useEffect(() => {
        const sincronizarDatos = async () => {
            try {
                const response = await fetch(`https://backend-mathpets.onrender.com/api/v1/users/${user._id}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}` // Tu token de seguridad
                    }
                });

                if (response.ok) {
                    const datosFrescos = await response.json();
                    // Sobreescribimos la sesión local con los datos traídos de Mongo
                    // Al pasarle el mismo token, no cerramos sesión, solo refrescamos la info
                    loginAuth(datosFrescos, token); 
                }
            } catch (error) {
                console.log("Error sincronizando en segundo plano", error);
            }
        };

        // Solo sincronizamos si hay un usuario logueado
        if (user && token) {
            sincronizarDatos();
        }
    }, []); //para que solo se ejecute la primera vez
    
    //como useEffec hace que se ejecute nuevasSumas cada vez que esta función cambia, necesitamos que la función nuevasSumas tenga un useCallback para memorizar la función y no se ejecute todo el rato.
    useEffect(() => {
        nuevaOperacion()
    }, [nuevaOperacion])

    useEffect(() => {
        if (!mascotaGlobal) return;

        const lineaEvolutiva = POKEDEX[mascotaGlobal];
        const faseActual = lineaEvolutiva.slice().reverse().find(poke => nivel >= poke.nivelReq);

        fetch(`https://pokeapi.co/api/v2/pokemon/${faseActual.id}`)
            .then(respuesta => respuesta.json())
            .then(datosAPI => {
            setDatosMascota({
                nombre: faseActual.nombre,
                imagen: datosAPI.sprites.other['official-artwork'].front_default
            });
            });
    }, [nivel, mascotaGlobal]);

    //para que aparezca la ventana emergente de aviso de abrir un nuevo huevo
    // Dentro de tu componente Dashboard
    // Definimos la lógica de evolución
    const revisarEvolucion = (nivelAntiguo, nivelNuevo) => {
    const linea = POKEDEX[mascotaGlobal];
    const nivelMax = linea[linea.length - 1].nivelReq;

    if (nivelAntiguo < nivelNuevo && nivelNuevo === nivelMax) {
        setMostrarModal(true);
    }
}

// --- COMO FUNCIONA EL JUEGO ---
    const alEnviarRespuesta = (datosDelFormulario) => {
    // Comprobamos si acertó
    const esCorrecto = comprobarResultado(datosDelFormulario.respuesta);
  

    if (esCorrecto) {
      setMensajeFeedback('¡Correcto! 🎉 +25 XP');
      ganarExperiencia(25); // Le damos 25 puntos
      // 2. Calculamos manualmente: ¿Qué nivel tendría si la XP llega a 100?
      // Si tu lógica es que cada 100 XP sube 1 nivel:
      let nivelFuturo = nivel;
      if (xp + 25 >= 100) {
        nivelFuturo = nivel + 1;
      }
      // 3. Pasamos ese dato a la función de revisión
      revisarEvolucion(nivel, nivelFuturo);
      nuevaOperacion();   // Inventamos otra suma
      reset();          // Borramos lo que escribió para que la casilla quede limpia
    } else {
      setMensajeFeedback('Mmm... casi. ¡Vuelve a intentarlo! 💪');
      reset(); // Borramos para que lo intente de nuevo
    }

    // Borramos el mensaje a los 2 segundos para que no se quede ahí para siempre
    setTimeout(() => setMensajeFeedback(''), 2000);
  };

    return (
        <div className="dashboard">
            <h2>Centro de Entrenamiento</h2>
        <div id="container-dashboard">
            <div id="petImg">
                <img className= { nivel === 2 || nivel === 3 ? "evolucion-animacion" : ""} 
                key={datosMascota?.nombre}
                // añadimos ? que significa que solo lea la imagen si datosmascota existe
                src={datosMascota?.imagen} 
                alt={datosMascota?.nombre} 
                />
        </div>

        {/* zona de juego -- form */}
        <div id="petInfo">
                <h3>{datosMascota?.nombre}</h3>
                <p>Nivel: {nivel} | XP: {xp}/100</p>
        {/* react-hook-form */}
                <form onSubmit={handleSubmit(alEnviarRespuesta)} id="form">
                    <div id="operation">
                         <p>{num1} {operador} {num2} = </p>
                        <input 
                        type="number"
                        placeholder=" Num"
                        {...register("respuesta", { required: true })}
                    />
                    </div>
                    <button type="submit">Responder</button>
                </form>
            </div>
        </div>
        {/* Mensajes de error si intenta enviar vacío */}
        {errors.respuesta && <p>¡Debes escribir un número!</p>}
        
        {/* Mensaje de ¡Correcto! o ¡Fallo! */}
        {mensajeFeedback && (
          <p>{mensajeFeedback}</p>
        )}
        <div>
            <Link to ="/" >
                <button id="goToHome">Ir a inicio</button>
            </Link>
              <Link to ="/coleccion" >
                <button id="goToColeccion">Coleccion</button>
            </Link>
            
            {/* --- LÓGICA DEL BOTÓN DE ADOPTAR --- */}
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

        {/* --- mensaje de felicitacion al pasarse el juego --- */}
        {juegoCompletado && (
        <div className="juego-completado">
                <h3>🌟 ¡Felicidades, Maestro Pet! 🌟</h3>
                <p>
                    Has desbloqueado todas las mascotas de esta versión. <br/>
                    ¡Sigue practicando mates para subir sus estadísticas al máximo nivel!
                </p>
        </div>
        )}
        {mostrarModal && (
        <div className="modal-overlay">
            <div className="modal-content">
            <h2>¡Felicidades!</h2>
            <p>Tu mascota ha alcanzado su máximo potencial.</p>
            <div className="modal-buttons">
                <button onClick={() => setMostrarModal(false)}>Seguir entrenando</button>
                <button onClick={() => navigate("/choose")}>Adoptar nuevo huevo 🥚</button>
            </div>
            </div>
        </div>
        )}
        </div>
    )
}


export default Dashboard;