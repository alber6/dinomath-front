import { useContext } from 'react';
import { GameContext } from '../context/GameContext';
import { AuthContext } from '../context/AuthContext';
import { POKEDEX } from '../utils/pokedex.js'
// ESTOY CON EL CAMBIO DE POKEDEX PARA QUE FUNCIONE
const Header = () => {
    const { mascotaGlobal, xp, nivel } = useContext(GameContext);
    const { user } = useContext(AuthContext); //Sacamos al usuario logueado

    // añadimos estas lineas de código para añadir el nombre del pokemon en el header
    let nombreMascota = "";
    console.log("Valor de mascotaGlobal:", mascotaGlobal);
if (mascotaGlobal) {
    // 1. Buscamos la línea en la nueva POKEDEX (ej: POKEDEX["bulbasaur"])
    const lineaEvolutiva = POKEDEX[mascotaGlobal];

    // 2. ¡EL ESCUDO! Solo entramos si lineaEvolutiva no es undefined
    if (lineaEvolutiva && Array.isArray(lineaEvolutiva)) {
        // Buscamos la fase actual basándonos en el nivel
        const faseActual = lineaEvolutiva
            .slice()
            .reverse()
            .find(poke => nivel >= poke.nivelReq);

        // Si encontramos la fase, extraemos el nombre
        if (faseActual) {
            nombreMascota = faseActual.nombre;
        }
    } else {
        // Si no existe en la Pokedex, mostramos un aviso amigable
        nombreMascota = "Desconocido";
        console.warn(`La mascota "${mascotaGlobal}" no está en la POKEDEX`);
    }
}
    return (
        <header>
            <h1>MathsPets 🐾</h1>
            
            {/* Si user existe, mostramos los stats. Si no, no mostramos nada. */}
            {user && (
                <div className="stats-jugador">
                    <p>Jugador: {user.username}</p>
                    <p>Mascota: {nombreMascota}</p>
                    <p>Nivel: {nivel} | XP: {xp}</p>
                </div>
            )}
        </header>
    );
};

export default Header;