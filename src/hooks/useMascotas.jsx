import { useContext } from 'react';
// IMPORTANTE: Asegúrate de que las rutas a tu AuthContext y tu POKEDEX sean correctas
import { AuthContext } from '../context/AuthContext'; 
import { POKEDEX } from '../utils/pokedex.js'; 

export const useMascotas = () => {
    // Cogemos al usuario
    const { user } = useContext(AuthContext);

    // Calculamos las conseguidas
    const mascotasConseguidas = user?.pets?.map(mascota => mascota.nombre) || [];

    // Calculamos las disponibles
    const mascotasDisponibles = Object.keys(POKEDEX).filter(
        (nombrePokemon) => !mascotasConseguidas.includes(nombrePokemon)
    );

    // Creamos una variable extra súper cómoda (true o false)
    const juegoCompletado = mascotasDisponibles.length === 0;

    // Devolvemos todo empaquetado para quien lo necesite
    return {
        mascotasConseguidas,
        mascotasDisponibles,
        juegoCompletado
    };
};

