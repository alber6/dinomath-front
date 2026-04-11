import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; 
import { DINODEX } from '../utils/dinodex.js'; 

export const useMascotas = () => {
    // Cogemos al usuario
    const { user } = useContext(AuthContext);

    // Calculamos las conseguidas
    const mascotasConseguidas = user?.pets?.map(mascota => mascota.nombre) || [];

    // Calculamos las disponibles
    const mascotasDisponibles = Object.keys(DINODEX).filter(
        (nombreDinosaurio) => !mascotasConseguidas.includes(nombreDinosaurio)
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

