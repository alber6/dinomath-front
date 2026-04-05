import React, { useCallback, useState} from "react";

export const useMathsEngine = () => {
    //añadimos dos numeros que serán los que se sumen
    const [ num1, setNum1 ] = useState(0);
    const [ num2, setNum2 ] = useState(0);

    //funcion para inventar sumas con num1 y num2
    //habría que añadir useCallback, sino peta el navegador porque crea copias nuevas cada vez que se repinta la pantalla, y eso no es necesario.
    //como esta función nuevasSumas siempre hace lo mismo, con useCallback hacemos que la memorice
    // resumen, useCallback ayuda a que useEffect(nuevasSumas) no se vuelva loco y se repita todo el rato
    // cuando la función cambie
    const nuevasSumas = useCallback(() => {
        setNum1(Math.floor(Math.random() * 20) + 1)
        setNum2(Math.floor(Math.random() * 20) + 1)
    }, []);

    //comprobar lo que escribe el usuario
    const comprobarResultado = (respuestaUsuario) => {
        const sumaCorrecta = num1 + num2;
        console.log(sumaCorrecta)
        // no era === sino que funciona con ==
        return respuestaUsuario == sumaCorrecta;
    };

    return {num1, num2, nuevasSumas, comprobarResultado}

}