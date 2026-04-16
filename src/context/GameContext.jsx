import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import { DINODEX } from "../utils/dinodex";
import { useNavigate } from "react-router-dom";

export const GameContext = createContext();

const GameProvider = ({ children }) => {
    const navigate = useNavigate();
    const { user, token, setUser } = useContext(AuthContext);

    // Usamos localStorage por si se recarga la página a mitad de una partida
    const [mascotaGlobal, setMascotaGlobal] = useState(() => {
        return localStorage.getItem('mascotaElegida') || null;
    });

    const [xp, setXp] = useState(() => {
        const xpGuardada = localStorage.getItem('mascotaXp');
        return xpGuardada ? parseInt(xpGuardada) : 0;
    });

    const [nivel, setNivel] = useState(() => {
        const nivelGuardado = localStorage.getItem('mascotaNivel');
        return nivelGuardado ? parseInt(nivelGuardado) : 1;
    });
    
// --- SINCRONIZACIÓN LOCAL (EL WATCHER A PRUEBA DE BALAS) ---
    useEffect(() => {
        // Si no hay usuario o aún no han cargado las mascotas de la BD, cortamos aquí.
        if (!user || !user.pets || user.pets.length === 0) return;

        // 1. ¿Qué mascota debemos mostrar?
        // - Si ya tienes una elegida en esta pantalla (mascotaGlobal), usamos esa.
        // - Si acabas de entrar en un PC/Móvil nuevo, mascotaGlobal será 'null', así que 
        //   miramos a ver qué mascota estabas usando en tu última partida, o cogemos la primera.
        const nombreMascota = mascotaGlobal || user.mascotaActiva?.nombre || user.pets[0]?.nombre;

        if (nombreMascota) {
            // Si estábamos en un dispositivo nuevo y la pantalla estaba vacía, la configuramos
            if (!mascotaGlobal) {
                setMascotaGlobal(nombreMascota);
            }

            // 2. LA ÚNICA FUENTE DE VERDAD (El arreglo definitivo)
            // Vamos directamente al array de mascotas, buscamos la nuestra y leemos sus datos.
            // Así nos da igual lo que diga el localStorage, siempre veremos los datos 100% reales.
            const datosReales = user.pets.find(p => p.nombre === nombreMascota);

            if (datosReales) {
                setXp(datosReales.xp);
                setNivel(datosReales.nivel);
            }
        }
    }, [user, mascotaGlobal]);

    // Cada vez que ganemos XP o subamos de nivel, actualizamos la "memoria a corto plazo" (localStorage)
    useEffect(() => {
        if (mascotaGlobal) {
            localStorage.setItem('mascotaElegida', mascotaGlobal);
        }
        //como tienen valores por defecto si que existen entonces no hay condiciones sino que actualizamos directamente
        localStorage.setItem('mascotaXp', xp);
        localStorage.setItem('mascotaNivel', nivel);
    }, [mascotaGlobal, xp, nivel]);

    // CONEXIÓN CON LA NUBE - Esta función coge la partida actual y la manda a Render para guardarla en MongoDB.
    const guardarEnBackend = async (nombre, nuevaXp, nuevoNivel, petsActualizadas = null) => {
        if (!user || !token) return;

        try {
            // Si no nos pasan pets, usamos las que ya tiene el usuario
            const listaPets = petsActualizadas || user.pets;
            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${user._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    mascotaActiva: {
                        nombre: nombre,
                        xp: nuevaXp,
                        nivel: nuevoNivel
                    },
                    pets: listaPets // Enviamos la colección actualizada
                })
            });

            if (response.ok) {
                const userActualizado = await response.json();
                setUser(userActualizado);
                localStorage.setItem('user', JSON.stringify(userActualizado));
            }
        } catch (error) {
            console.log("Error guardando en la nube:", error);
        }
    };

const ganarExperiencia = (puntosGanados) => {
        const nuevaXp = xp + puntosGanados;
        let nuevoNivel = nivel;
        let xpFinal = nuevaXp;

        if (nuevaXp >= 100) {
            nuevoNivel = nivel + 1;
            xpFinal = nuevaXp - 100;
        }

        // Actualizamos la pantalla (estado local)
        setNivel(nuevoNivel);
        setXp(xpFinal);
        // Buscamos a esta mascota en la Colección
        const petsActualizadas = user.pets.map(p => 
            p.nombre === mascotaGlobal 
            ? { ...p, nivel: nuevoNivel, xp: xpFinal } 
            : p
        );

        // Mandamos los datos a la nube (LA ÚNICA VEZ QUE SE LLAMA)
        guardarEnBackend(mascotaGlobal, xpFinal, nuevoNivel, petsActualizadas);
        // 🚀 AÑADIMOS ESTO: Devolvemos los niveles para el modal
        return { nivelAntiguo: nivel, nivelNuevo: nuevoNivel };
    };
    
    const reinicioPartida = () => {
        setMascotaGlobal(null);
        setXp(0);
        setNivel(1);
        localStorage.removeItem('mascotaElegida');
        localStorage.removeItem('mascotaXp');
        localStorage.removeItem('mascotaNivel');
        
        if (user) {
            const usuarioVacio = { ...user, pets: [], mascotaActiva: null };
            setUser(usuarioVacio);
            localStorage.setItem('user', JSON.stringify(usuarioVacio)); 
        }
        
        // Enviamos pets vacías al backend
        guardarEnBackend(null, 0, 1, []);
        navigate('/choose');
    };
    // cuando eligen un huevo en choosepet
    const elegirMascota = (tipoMascota) => {
        setMascotaGlobal(tipoMascota);
        setXp(0);
        setNivel(1);

        // Añadimos la nueva mascota al array de la colección
        const nuevaMascota = { nombre: tipoMascota, nivel: 1, xp: 0 };
        
        // Evitamos duplicados por si acaso
        const yaExiste = user.pets.some(p => p.nombre === tipoMascota);
        const nuevasPets = yaExiste ? user.pets : [...user.pets, nuevaMascota];

        guardarEnBackend(tipoMascota, 0, 1, nuevasPets);
    };
    // cuando se equipa otra mascota en colección para jugar con ella
    const equiparMascota = (mascotaColeccion) => {
        setMascotaGlobal(mascotaColeccion.nombre);
        setXp(mascotaColeccion.xp);
        setNivel(mascotaColeccion.nivel);
        guardarEnBackend(mascotaColeccion.nombre, mascotaColeccion.xp, mascotaColeccion.nivel, user.pets);
    };

    // En lugar de tener un estado que diga 'puedeAdoptar = false' e intentar cambiarlo...
    // ...lo calculamos "al vuelo" leyendo la Dinodex. Así es imposible que se desincronice.
    // Obtenemos cuántas mascotas tiene el usuario actualmente
    const mascotasActuales = user?.pets?.length || 0;

    // Contamos cuántas han alcanzado el nivel 10 (esto SUSTITUYE a tu antiguo forEach)
    const familiasEnNivelProgreso = user?.pets?.filter(pet => pet.nivel >= 10).length || 0;

    // Calculamos el límite permitido: 1 inicial + los desbloqueos ganados.
    // Usamos Math.min(..., 5) para que el límite NUNCA supere las 5 familias existentes.
    const limiteMascotas = Math.min(1 + familiasEnNivelProgreso, 5);

    // Verificamos si puede adoptar:
    // Debe tener menos mascotas de las que su límite actual permite.
    // Y por seguridad, debe tener menos de 5 (el total de familias del juego).
    // modificar el 5 si se amplia la dinodex
    const puedeAdoptar = mascotasActuales < limiteMascotas && mascotasActuales < 5;

    return (
        <GameContext.Provider value={{ 
            mascotaGlobal, setMascotaGlobal, xp, nivel, 
            ganarExperiencia, reinicioPartida, elegirMascota, 
            equiparMascota, puedeAdoptar, guardarEnBackend
        }}>
            {children}
        </GameContext.Provider>
    );
};

export default GameProvider;