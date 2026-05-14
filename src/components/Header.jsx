import { useContext } from 'react';
import { GameContext } from '../context/GameContext';
import { AuthContext } from '../context/AuthContext';
import { DINODEX } from '../utils/dinodex.js'

const Header = () => {
    const { mascotaGlobal, xp, nivel } = useContext(GameContext);
    const { user } = useContext(AuthContext); //Sacamos al usuario logueado

    // añadimos estas lineas de código para añadir el nombre del dinosaurio en el header
    let nombreMascota = "";
    
if (mascotaGlobal) {
    // Buscamos la línea en la nueva DINODEX (ej: DINODEX["bulbasaur"])
    const lineaEvolutiva = DINODEX[mascotaGlobal];

    //  Solo entramos si lineaEvolutiva no es undefined
    if (lineaEvolutiva && Array.isArray(lineaEvolutiva)) {
        // Buscamos la fase actual basándonos en el nivel
        const faseActual = lineaEvolutiva
            .slice()
            .reverse()
            .find(dino => nivel >= dino.nivelReq);

        // Si encontramos la fase, extraemos el nombre
        if (faseActual) {
            nombreMascota = faseActual.nombre;
        }
    } else {
        // Si no existe en la DINODEX, mostramos un aviso amigable
        nombreMascota = "Desconocido";
        console.warn(`La mascota "${mascotaGlobal}" no está en la DINODEX`);
    }
}

    return (
        <header>
            <h1>DinoMath</h1>
            
            {/* Si user existe, mostramos los stats. Si no, no mostramos nada. */}
            {user && (
                <div className="stats-jugador">
                    <p>Jugador: {user.username}</p>
                    <p>Mascota: {user?.mascotaActiva?.nombre || "Huevo misterioso"}</p>
                    <p>Nivel: {user?.mascotaActiva?.nivel || 0} | XP: {user?.mascotaActiva?.xp || 0}</p>
                </div>
            )}
        </header>
    );
};

export default Header;