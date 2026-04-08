import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import { POKEDEX } from "../utils/pokedex";
import { useNavigate } from "react-router-dom";

export const GameContext = createContext();
// crear el provider que en el prop tendrá n elementos 
const GameProvider = ({ children }) => {
    const navigate = useNavigate()
    const { user, token, setUser } = useContext(AuthContext);
    // Aquí creamos el estado real que guardará los datos
    // aquí añadiremos más datos sobre la mascota como por ejemplo la experiencia (xp)
    const [ mascotaGlobal, setMascotaGlobal ] = useState(() => {
        return localStorage.getItem('mascotaElegida') || null;
    });

    const [ xp, setXp] = useState(() => {
        const xpGuardada = localStorage.getItem('mascotaXp')
        return xpGuardada ? parseInt(xpGuardada) : 0
        // parseInt() para que sume numeros y no un string con un numero, ya que xpGuardada viene como un string
    });

    const [ nivel, setNivel ] = useState(() => {
        const nivelGuardado = localStorage.getItem('mascotaNivel')
        return nivelGuardado ? parseInt(nivelGuardado) : 1
    });

    // Cada vez que el 'user' cambie (por ejemplo, al hacer login)
    useEffect(() => {
        // Si hay un usuario, Y tiene una mascota activa guardada en la Base de Datos...
        if (user && user.mascotaActiva && user.mascotaActiva.nombre) {
            // ...¡Forzamos al juego a cargar la partida del backend!
            setMascotaGlobal(user.mascotaActiva.nombre);
            setXp(user.mascotaActiva.xp);
            setNivel(user.mascotaActiva.nivel);
        }
    }, [user]);

    // usamos un useEffect por si el usuario elige otra mascota para que se cambie y no mantenga la mascota que eligió anteriormente. Guardado automático
    useEffect(() => {
        if (mascotaGlobal) {
            localStorage.setItem('mascotaElegida', mascotaGlobal);
        }
        // lo añadimos fuera del if porque desde el principio tienen un valor y no son nulos como la mascota que al inicio es null porque no se ha elegido la mascota
        localStorage.setItem('mascotaXp', xp)
        localStorage.setItem('mascotaNivel', nivel)
    }, [mascotaGlobal, xp, nivel]);


    // función para avisar al backend
    const guardarEnBackend = async (nombre, nuevaXp, nuevoNivel, borrarColeccion = false) => {
        if (!user || !token) return;

        try {
            const response = await fetch(`https://backend-mathpets.onrender.com/api/v1/users/${user._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` // La llave
                },
                body: JSON.stringify({
                    mascotaActiva: {
                        nombre: nombre,
                        xp: nuevaXp,
                        nivel: nuevoNivel
                    },
                    // si borrarColeccion es true, enviamos array vacio para limpiar la base de datos
                    //usamos spread operator
                    ...(borrarColeccion && { pets: []})
                })
            });
            if (response.ok){
                const userActualizado = await response.json();
                //actualizar el user en el authcontext para que la app se entere que el usuario tiene mascota en la mochila y aparezca en la coleccion
                setUser(userActualizado);
                //mantener localstorage sincronizado con el backend
                localStorage.setItem('user', JSON.stringify(userActualizado));
            }
        } catch (error) {
            console.log("Error guardando en la nube:", error);
        }
    };

    // creamos una funcion para que se modifique el xp y el nivel para cuando el usuario acierte
    const ganarExperiencia = (puntosGanados) => {
        // NOTA DE ARQUITECTURA (React Strict Mode):
        // Nunca ejecutar un estado (setNivel) dentro de la función de otro estado (setXp(prev => ...)).
        // En desarrollo, React Strict Mode ejecuta esas funciones internas DOS VECES seguidas 
        // para detectar errores, lo que provocaba el bug de saltar del Nivel 1 al Nivel 3 (1+1+1).
        // SOLUCIÓN: Calculamos los valores primero y llamamos a los 'set' de forma independiente.
        const nuevaXp = xp + puntosGanados;

        // se añaden variables que van a cambiar debido al autoguardado
        let nuevoNivel = nivel;
        let xpFinal = nuevaXp;

        //si sube de nivel
        if(nuevaXp >= 100){
            nuevoNivel = nivel + 1
            xpFinal = nuevaXp - 100
        }
        // nunca meter un set dentro de otro set 
        setNivel(nuevoNivel);
        setXp(xpFinal);
        
        // ¡Autoguardado en la nube!
        guardarEnBackend(mascotaGlobal, xpFinal, nuevoNivel);
    }

    const limpiarPartidaLocal = () => {
        setMascotaGlobal(null);
        setXp(0);
        setNivel(1);
        // Borramos SOLO las cosas del juego, respetando la sesión del usuario
        localStorage.removeItem('mascotaElegida');
        localStorage.removeItem('mascotaXp');
        localStorage.removeItem('mascotaNivel');
    }

    const reinicioPartida = () => {
        // ponemos datos como al inicio y borramos datos en el local
        setMascotaGlobal(null);
        setXp(0);
        setNivel(1);
        localStorage.removeItem('mascotaElegida');
        localStorage.removeItem('mascotaXp');
        localStorage.removeItem('mascotaNivel');
        //usamos esto para que se borre los datos en react inmediatamente y al dar al boton de borrar partida ya se vea que el usuario ya no tiene pokemons y enviarle con el navigate a choose
        if (user) {
            const usuarioVacio = {
                ...user,
                pets: [],
                mascotaActiva: null
            };
            setUser(usuarioVacio);
            //realizamos esto porque sino al recargar la pagina, el juego vuelve al user con su coleccion que borró
            localStorage.setItem('user', JSON.stringify(usuarioVacio)); 
        }
        // Como es un reinicio, también se borra los datos de la base de datos
        //le pasamos true para que borre la coleccion en el backend
        //gracias al borrarColeccion, reinicioPartida envía un array vacio de pets al backend, y lo que se hizo en el controlador, mongo limpia todo 
        guardarEnBackend(null, 0, 1, true);
        navigate('/choose')
    }
    //esta función guarda los datos tanto en local como en el backend cuando el usuario elige
    const elegirMascota = (tipoMascota) => {
        setMascotaGlobal(tipoMascota);
        setXp(0);
        setNivel(1);

        // Guardamos el nuevo Pokémon en la base de datos
        guardarEnBackend(tipoMascota, 0, 1);
    }

    //funcion para equipar una mascota de la coleccion
    const equiparMascota = (mascotaColeccion) => {
        setMascotaGlobal(mascotaColeccion.nombre);
        setXp(mascotaColeccion.xp);
        setNivel(mascotaColeccion.nivel);

        //se guarda en el backend para que sepa cual es la mascota activa
        guardarEnBackend(mascotaColeccion.nombre, mascotaColeccion.xp, mascotaColeccion.nivel);
    }

    //añadimos una restriccion para que aparezca la opcion de adoptar un huevo solo cuando se llegue al nivel máximo o cuando el usuario no tenga mascota
        let familiasCompletadas = 0;
        // Contamos cuántos Pokémon del usuario han llegado a su nivel máximo
        if (user && user.pets) {
            user.pets.forEach(pet => {
                // Buscamos la línea evolutiva de cada mascota que tiene el usuario
                const linea = POKEDEX[pet.nombre]; 
                if (linea) {
                    const nivelMaximoDeEstaFamilia = linea[linea.length - 1].nivelReq;
                    // Si el nivel de esta mascota es mayor o igual al máximo, sumamos un punto
                    if (pet.nivel >= nivelMaximoDeEstaFamilia) {
                        familiasCompletadas++;
                    }
                }
            });
        }
        // Calculamos los espacios disponibles: 1 hueco inicial + 1 extra por cada familia completada
        const limiteMascotas = 1 + familiasCompletadas;
        const mascotasActuales = user?.pets?.length || 0;

        // Solo puede adoptar si tiene menos mascotas que su límite
        const puedeAdoptar = mascotasActuales < limiteMascotas;

    return (
    <GameContext.Provider value={{ mascotaGlobal, setMascotaGlobal, xp, nivel, ganarExperiencia, reinicioPartida, elegirMascota, limpiarPartidaLocal, equiparMascota, puedeAdoptar }}>
      {children}
    </GameContext.Provider>
  );
};

export default GameProvider;