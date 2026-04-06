import React, { useCallback, useState} from "react";

export const useMathsEngine = () => {
    //añadimos dos numeros que serán los que se sumen
    const [ num1, setNum1 ] = useState(0);
    const [ num2, setNum2 ] = useState(0);
    const [operador, setOperador] = useState("+")

    //funcion para inventar operaciones con num1 y num2
    //habría que añadir useCallback, sino peta el navegador porque crea copias nuevas cada vez que se repinta la pantalla, y eso no es necesario.
    //como esta función nuevaOperacion siempre hace lo mismo, con useCallback hacemos que la memorice
    // resumen, useCallback ayuda a que useEffect(nuevaOperacion) no se vuelva loco y se repita todo el rato
    // cuando la función cambie
    const nuevaOperacion = useCallback(() => {
        // Decidir al azar si toca suma o resta (50% de probabilidad) si sale mayor de 50, esResta es true entonces toca restar
        const esResta = Math.random() > 0.5;
        
        //generar numeros entre 20 y 150
        // Math.random() * 131 genera de 0 a 130. Al sumarle 20, va de 20 a 150.
        let n1 = Math.floor(Math.random() * 131) + 20;
        let n2 = Math.floor(Math.random() * 131) + 20;

        // 3. Lógica para la resta: El número mayor siempre debe ir primero para no dar negativos
        if (esResta) {
            if (n2 > n1) {
                //si n2 es mayor que n1, hay que darle la vuelta y poner a n1 mayor que n2 paea eso usamos una variable intermedia llamada temp
                const temp = n1;
                n1 = n2;
                n2 = temp;
            }
            setOperador('-');
        } else {
            setOperador('+');
        }

        setNum1(n1);
        setNum2(n2);
    }, []);

// Comprobar lo que escribe el usuario
    const comprobarResultado = (respuestaUsuario) => {
        // Calculamos cuál es la respuesta correcta dependiendo del signo
        let resultadoCorrecto;
        if (operador === '+') {
            resultadoCorrecto = num1 + num2;
        } else {
            resultadoCorrecto = num1 - num2;
        }
        // convertimos lo que escribe el usuario a Número y usamos '===' (estrictamente igual).
        return Number(respuestaUsuario) === resultadoCorrecto;
    };

    return { num1, num2, operador, nuevaOperacion, comprobarResultado };

}