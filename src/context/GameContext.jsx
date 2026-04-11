import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import { DINODEX } from "../utils/dinodex";
import { useNavigate } from "react-router-dom";

export const GameContext = createContext();

const GameProvider = ({ children }) => {
    const navigate = useNavigate();
    const { user, token, setUser } = useContext(AuthContext);

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

    useEffect(() => {
        if (user && user.mascotaActiva && user.mascotaActiva.nombre) {
            setMascotaGlobal(user.mascotaActiva.nombre);
            setXp(user.mascotaActiva.xp);
            setNivel(user.mascotaActiva.nivel);
        }
    }, [user]);

    useEffect(() => {
        if (mascotaGlobal) {
            localStorage.setItem('mascotaElegida', mascotaGlobal);
        }
        localStorage.setItem('mascotaXp', xp);
        localStorage.setItem('mascotaNivel', nivel);
    }, [mascotaGlobal, xp, nivel]);

    // --- MEJORA: guardarEnBackend ahora acepta el array de pets actualizado ---
    const guardarEnBackend = async (nombre, nuevaXp, nuevoNivel, petsActualizadas = null) => {
        if (!user || !token) return;

        try {
            // Si no nos pasan pets, usamos las que ya tiene el usuario
            const listaPets = petsActualizadas || user.pets;

            const response = await fetch(`https://backend-mathpets.onrender.com/api/v1/users/${user._id}`, {
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

        setNivel(nuevoNivel);
        setXp(xpFinal);

        // ACTUALIZACIÓN CRÍTICA: También actualizamos el nivel en la colección (pets)
        const petsActualizadas = user.pets.map(p => 
            p.nombre === mascotaGlobal 
            ? { ...p, nivel: nuevoNivel, xp: xpFinal } 
            : p
        );

        guardarEnBackend(mascotaGlobal, xpFinal, nuevoNivel, petsActualizadas);
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

    const elegirMascota = (tipoMascota) => {
        setMascotaGlobal(tipoMascota);
        setXp(0);
        setNivel(1);

        // ACTUALIZACIÓN CRÍTICA: Añadimos la nueva mascota al array de la colección
        const nuevaMascota = { nombre: tipoMascota, nivel: 1, xp: 0 };
        
        // Evitamos duplicados por si acaso
        const yaExiste = user.pets.some(p => p.nombre === tipoMascota);
        const nuevasPets = yaExiste ? user.pets : [...user.pets, nuevaMascota];

        guardarEnBackend(tipoMascota, 0, 1, nuevasPets);
    };

    const equiparMascota = (mascotaColeccion) => {
        setMascotaGlobal(mascotaColeccion.nombre);
        setXp(mascotaColeccion.xp);
        setNivel(mascotaColeccion.nivel);
        guardarEnBackend(mascotaColeccion.nombre, mascotaColeccion.xp, mascotaColeccion.nivel, user.pets);
    };

    // --- LÓGICA DE ADOPCIÓN (Ahora debería funcionar al actualizarse user.pets) ---
    let familiasCompletadas = 0;
    if (user && user.pets) {
        user.pets.forEach(pet => {
            const linea = DINODEX[pet.nombre]; 
            if (linea) {
                const nivelMaximoDeEstaFamilia = linea[linea.length - 1].nivelReq;
                if (pet.nivel >= nivelMaximoDeEstaFamilia) {
                    familiasCompletadas++;
                }
            }
        });
    }

    const limiteMascotas = 1 + familiasCompletadas;
    const mascotasActuales = user?.pets?.length || 0;
    const puedeAdoptar = mascotasActuales < limiteMascotas;

    return (
        <GameContext.Provider value={{ 
            mascotaGlobal, setMascotaGlobal, xp, nivel, 
            ganarExperiencia, reinicioPartida, elegirMascota, 
            equiparMascota, puedeAdoptar 
        }}>
            {children}
        </GameContext.Provider>
    );
};

export default GameProvider;