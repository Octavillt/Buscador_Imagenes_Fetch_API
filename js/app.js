// Seleccionamos los elementos del DOM que nos interesa y los almacenamos en constantes
const resultado = document.querySelector('#resultado');
const paginacionDiv = document.querySelector('#paginacion');

// Definimos las variables de paginación
let paginaActual = 1;  // página actual, se inicia en 1
let totalPaginas;      // total de páginas, aún no lo sabemos
let iteradorSiguiente; // Iterador para la siguiente página

// Función que se ejecutará cuando la página haya cargado por completo
window.onload = () => {
    // Seleccionamos el formulario y añadimos un evento de envío a la función "validarFormulario"
    const formulario = document.querySelector('#formulario');
    formulario.addEventListener('submit', validarFormulario);

    // Agregamos un evento de clic al div de paginación para controlar el cambio de páginas
    paginacionDiv.addEventListener('click', direccionPaginacion);
};

// Función que valida el formulario antes de realizar la búsqueda de imágenes
function validarFormulario(e) {
    e.preventDefault(); // Previene la acción por defecto del formulario (enviar/recargar la página)

    // Obtenemos el valor ingresado por el usuario para la búsqueda
    const terminoBusqueda = document.querySelector('#termino').value;

    // Si el término de búsqueda está vacío, mostramos un error
    if (terminoBusqueda === '') {
        // Llamamos a la función mostrarAlerta para mostrar el mensaje de error
        mostrarAlerta('Agrega un término de búsqueda');
        return; // Terminamos la función para no seguir con la búsqueda
    }

    // Si todo está correcto, procedemos a buscar las imágenes
    buscarImagenes();
}

// Función que muestra un mensaje de alerta en el formulario
function mostrarAlerta(mensaje) {
    // Verificamos si ya existe un mensaje de alerta en la página
    const alerta = document.querySelector('.bg-red-100');

    // Si no hay alerta, la creamos
    if (!alerta) {
        const alerta = document.createElement('p'); // Creamos un elemento <p>

        // Añadimos varias clases de estilos (probablemente de TailwindCSS) para darle formato a la alerta
        alerta.classList.add('bg-red-100', "border-red-400", "text-red-700", "px-4", "py-3", "rounded", "max-w-lg", "mx-auto", "mt-6", "text-center");

        // Establecemos el contenido HTML de la alerta con el mensaje proporcionado
        alerta.innerHTML = `
            <strong class="font-bold">Error!</strong>
            <span class="block sm:inline">${mensaje}</span>
        `;

        // Agregamos la alerta al formulario
        formulario.appendChild(alerta);

        // Establecemos un temporizador para eliminar la alerta después de 3 segundos
        setTimeout(() => {
            alerta.remove();
        }, 3000);
    }
}

// Esta función se encarga de buscar imágenes en una API (en este caso, Pixabay)
function buscarImagenes() {
    // Obtenemos el término de búsqueda ingresado por el usuario
    const terminoBusqueda = document.querySelector('#termino').value;

    // Clave de acceso para la API de Pixabay
    const key = '1732750-d45b5378879d1e877cd1d35a6';

    // Construimos la URL para la petición a la API. Utilizamos plantillas literales para incluir variables en la URL
    const url = `https://pixabay.com/api/?key=${key}&q=${terminoBusqueda}&per_page=30&page=${paginaActual}`;

    // Usamos fetch para hacer una petición a la URL y obtener las imágenes
    fetch(url)
        .then(respuesta => respuesta.json()) // Convertimos la respuesta en JSON
        .then(resultado => {
            // Calculamos el total de páginas basado en el total de resultados obtenidos
            totalPaginas = calcularPaginas(resultado.totalHits);

            // Mostramos las imágenes utilizando los resultados obtenidos
            mostrarImagenes(resultado.hits);
        });
}

// Esta función muestra las imágenes en el DOM
function mostrarImagenes(imagenes) {
    // Si hay resultados previos, los eliminamos antes de mostrar los nuevos resultados
    while (resultado.firstChild) {
        resultado.removeChild(resultado.firstChild);
    }

    // Iteramos a través de cada imagen y la añadimos al DOM
    imagenes.forEach(imagen => {
        // Desestructuramos la imagen para obtener sólo las propiedades que nos interesan
        const { likes, views, previewURL, largeImageURL } = imagen;

        // Usamos plantillas literales para construir la estructura HTML que queremos añadir al DOM
        resultado.innerHTML += `
            <div class="w-1/2 md:w-1/3 lg:w-1/4 mb-4 p-3">
                <div class="bg-white">
                    <img class="w-full" src=${previewURL} alt={tags} />
                    <div class="p-4">
                        <p class="card-text">${likes} Me Gusta</p>
                        <p class="card-text">${views} Vistas</p>
        
                        <a href=${largeImageURL} 
                        rel="noopener noreferrer" 
                        target="_blank" class="bg-blue-800 w-full p-1 block mt-5 rounded text-center font-bold uppercase hover:bg-blue-500 text-white">Ver Imagen</a>
                    </div>
                </div>
            </div>
        `;
    });

    // Si no hemos iniciado la paginación, la mostramos
    if (!iteradorSiguiente) {
        mostrarPaginacion();
    }
}

// Función que muestra los botones de paginación
function mostrarPaginacion() {
    // Inicializamos un iterador que nos ayudará a crear los botones de paginación
    iteradorSiguiente = crearPaginacion(totalPaginas);

    // Mientras el iterador tenga valores, continuaremos creando botones
    while (true) {
        const { value, done } = iteradorSiguiente.next();

        // Si el iterador no tiene más valores, terminamos el bucle
        if (done) return;

        // Crear un botón para cada página
        const botonSiguiente = document.createElement('a');
        botonSiguiente.href = "#";
        botonSiguiente.dataset.pagina = value; // Guardamos el número de la página en el dataset
        botonSiguiente.textContent = value;
        // Añadimos estilos al botón (probablemente usando TailwindCSS)
        botonSiguiente.classList.add('siguiente', 'bg-yellow-400', 'px-4', 'py-1', 'mr-2', 'mx-auto', 'mb-10', 'font-bold', 'uppercase', 'rounded');
        paginacionDiv.appendChild(botonSiguiente); // Añadimos el botón al div de paginación
    }
}

// Función para calcular cuántas páginas serán necesarias basándose en el total de resultados y mostrando 30 por página
function calcularPaginas(total) {
    return parseInt(Math.ceil(total / 30));
}

// Esta función es un generador que irá generando números del 1 hasta el total proporcionado
function* crearPaginacion(total) {
    for (let i = 1; i <= total; i++) {
        yield i;
    }
}

// Función para manejar el evento de click en los botones de paginación
function direccionPaginacion(e) {
    // Si el elemento que se clickeó tiene la clase 'siguiente'
    if (e.target.classList.contains('siguiente')) {

        // Actualizamos la página actual con el valor guardado en el dataset del botón
        paginaActual = Number(e.target.dataset.pagina);

        // Buscamos las imágenes para la página seleccionada
        buscarImagenes();

        // Nos desplazamos hacia el formulario para que el usuario vea los nuevos resultados desde el principio
        formulario.scrollIntoView();
    }
}
