import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"
import { GameContext } from "../context/GameContext.jsx";
import { useMascotas } from "../hooks/useMascotas";
import { POKEDEX } from "../utils/pokedex.js"
import "./Coleccion.css"


const Coleccion = () => {
    //sacamos al usuario logueado para leer su informacion 
    const { user } = useContext(AuthContext);
    const { equiparMascota, puedeAdoptar } = useContext(GameContext)
    const navigate = useNavigate()
    const { juegoCompletado } = useMascotas()

    //proteccion mientras se carga la mochila de pets
    if (!user) return <p>Cargando Pokedex...</p>
    //funcion al hacer click para equipar mascota
    const handleEquiparMascota = (nombreFamilia, nivelActual, xpActual) => {
        //se pasaria el objeto entero de la mascota
        equiparMascota({nombre: nombreFamilia, nivel: nivelActual, xp: xpActual})
        navigate("/dashboard")
    }

    return (
        <div className="coleccion">
            <h2>Pokédex y Álbum 📖</h2>
            
            <div className="pokedex-grid">
              <Link to="/dashboard">
                <button className="btn-volver">Volver al Centro</button>
            </Link>
                {/* 1. Recorremos TODA la Pokedex usando entries para sacar nombreFamilia (ej. 'squirtle') y sus fases */}
                {Object.entries(POKEDEX).map(([nombreFamilia, lineaEvolutiva]) => {
                    
                    // Buscamos si el usuario tiene esta familia en su mochila
                    const mascotaUsuario = user.pets?.find(p => p.nombre === nombreFamilia);
                    // Si no la tiene, su nivel es 0
                    const nivelUsuario = mascotaUsuario ? mascotaUsuario.nivel : 0;
                    const xpUsuario = mascotaUsuario ? mascotaUsuario.xp : 0;

                    // Calculamos cuál es la fase más alta que tiene desbloqueada de esta familia
                    const faseActual = lineaEvolutiva.slice().reverse().find(poke => nivelUsuario >= poke.nivelReq);

                    return (
                        <div className="familia-row" key={nombreFamilia}>
                            
                            {/* 2. Dibujamos las 3 fases (tarjetas) de esta familia */}
                            {lineaEvolutiva.map((fase) => {
                                
                                // Evaluamos el estado de esta tarjeta en concreto
                                const estaDesbloqueado = nivelUsuario >= fase.nivelReq;
                                const esEquipable = estaDesbloqueado && fase.id === faseActual.id;
                                const estaEntrenando = esEquipable && user.mascotaActiva?.nombre === nombreFamilia;

                                return (
                                    // Le ponemos una clase u otra según si lo ha desbloqueado
                                    <div className={`pokedex-card ${estaDesbloqueado ? 'desbloqueado' : 'bloqueado'}`} key={fase.id}>
                                        
                                        <h3>{estaDesbloqueado ? fase.nombre : "???"}</h3>
                                        <div className="pokedex-img-container">
                                        <img 
                                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${fase.id}.png`} 
                                            alt={fase.nombre}
                                            className="pokedex-img"
                                        />
                                        </div>

                                        {estaDesbloqueado ? (
                                            <p>Desbloqueado en Nvl {fase.nivelReq}</p>
                                        ) : (
                                            <p>Secreto 🔒</p>
                                        )}

                                        {/* 3. La zona de botones. Solo se muestra en la fase correcta */}
                                        <div className="estado-mascota">
                                            {estaEntrenando ? (
                                                <span className="etiqueta-activa">Entrenando</span>
                                            ) : esEquipable ? (
                                                <button 
                                                    className="btn-equipar" 
                                                    id="btn-cards"
                                                    onClick={() => handleEquiparMascota(nombreFamilia, nivelUsuario, xpUsuario)}
                                                >
                                                    Equipar
                                                </button>
                                            ) : null}
                                        </div>
                                        
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
                <Link to="/dashboard">
                <button>Volver al Centro</button>
                </Link>
                {/* si el juego está completado o si puede adoptar o un consejo de seguir jugando */}
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
    );
};

export default Coleccion;