/* ----------------------------------------------------------
   MENÚ LATERAL
---------------------------------------------------------- */
function toggleMenu() {
    document.getElementById('sideMenu')?.classList.toggle('active');
}
/* ----------------------------------------------------------
   INICIO CUANDO EL DOM ESTÁ LISTO
---------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {

    /* ------------------------------------------------------
       AUDIO: PLAY / STOP (TOGGLE)
    ------------------------------------------------------ */
    const audio = document.getElementById('birds');
    const soundButton = document.getElementById('sound-btn') || document.querySelector('button[onclick*="birds"]');

    if (soundButton && audio) {
        soundButton.addEventListener('click', () => {
            if (audio.paused) {
                audio.play();
            } else {
                audio.pause();
                audio.currentTime = 0; // quitar si no querés reiniciar
            }
        });
    }

    /* ------------------------------------------------------
       TEXTOS FIJOS
    ------------------------------------------------------ */
    const setText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };

    setText('text1', "Creamos productos artesanales pensados para tu bienestar: jabones naturales, velas de cera de soja, almohadillas relajantes y humidificadores. Conéctate con la calma y armonía que mereces.");
    setText('titulo', "Bienvenidos a Aura Aromaterapias");
    setText('mision', "Nuestra misión");
    setText('parr1', "En Aura Aromaterapias creemos que el bienestar comienza en lo simple: un aroma, una luz cálida, un instante de pausa. Por eso ofrecemos cada producto con amor y dedicación, buscando que no solo embellezcan tu espacio, sino que también te acompañen en tu camino hacia la calma y el equilibrio.");
    setText('parr2', "Nuestras velas de soja son más que un detalle decorativo: son pequeños rituales de luz y aroma que invitan a reconectar con vos mismo. Con los humidificadores y las esencias, buscamos transformar la energía del hogar, llenándolo de frescura y vitalidad. Cada jabón artesanal y cada almohadilla aromática están pensados para regalarte un mimo, un momento de autocuidado que renueva cuerpo y alma.");
    setText('parr3', "También creemos en la fuerza de la naturaleza, por eso trabajamos con elementos como las lámparas de sal, que además de iluminar, purifican el ambiente y generan una atmósfera única de serenidad. Nuestra intención es que, cada vez que elijas Aura, sientas que llevás un pedacito de armonía a tu vida diaria.");

    /* ------------------------------------------------------
       INVENTARIO
    ------------------------------------------------------ */
    const container = document.getElementById('inventario_contenedor');
    if (!container) {
        console.warn('No existe #inventario_contenedor en el HTML');
        return;
    }

    const contenedores = Array.from(container.querySelectorAll('.inventario'));
    const CHUNK = 100;
    let visibles = 100;

    function inicializarInventario() {
        contenedores.forEach((div, index) => {
            div.style.display = index < visibles ? 'flex' : 'none';

            const input = div.querySelector("input[type='number']");
            if (input) {
                if (!input.value) input.value = '0';
                input.setAttribute('min', '0');
            }
        });
    }
    inicializarInventario();

    /* ------------------------------------------------------
       ETIQUETAS (innerHTML con saltos)
    ------------------------------------------------------ */
    const labels = container.querySelectorAll('.etiqueta');
    const textos = [
        // Kits
        'Kit 1 \nVela \nAlmohadilla \njabón \nSaumerio',

        // Velas
        'Peonia-Aroma frutos rojos \nColor rosa bebé \nVela de cera de soja',
        'Peonia-Aroma lavanda \nColor violeta \nVela de cera de soja',
        'Vela en cuenco pequeño - Aroma sandia \nColor rojo \nVela de cera de soja',
        'Vela en cuenco pequeño - Aroma vainilla \nColor blanco \nVela de cera de soja',
        'Vela de soja \nAroma fresias \nColor rosa \nVela de cera de soja',
        'Vela de molde \nAroma fresias \nColor rosa bebé \nVela de cera de soja',

        // Humidificadores
        'Humidificador \nMadera Clara \nApto automóvil',
        'Humidificador \nMadera Clara \nEsfera 300ml.',
        'Humidificador \nMadera Clara \nJarrón 300ml.',
        'Humidificador \nMadera Oscura \nJarrón 300ml.',
        'Humidificador \nMadera Oscura \nPico largo 300ml.',

        // Jabones
        'Jabón natural \nA base de coco \nAceite de almendras \npetalos de caléndula',
        'Jabón natural \nA base de coco \nAceite de almendras \npetalos de caléndula',

        // Almohadillas
        'Almohadilla terapeutica ocular \nAroma lavanda \nApto frío/calor',
        'Almohadilla terapeutica cervical \nAroma lavanda \nApto frío/calor',
    ];

    labels.forEach((label, index) => {
        if (textos[index]) {
            label.innerHTML = textos[index].replace(/\n/g, '<br>');
        }
    });

    /* ------------------------------------------------------
       CARRITO
    ------------------------------------------------------ */
    const carritoLista = document.getElementById('lista-carrito');
    const botonWhatsapp = document.getElementById('whatsapp-btn');

    function actualizarCarrito() {
        if (!carritoLista) {
            console.warn('No existe #lista-carrito en el HTML');
            return;
        }

        carritoLista.innerHTML = '';
        const items = [];

        contenedores.forEach(producto => {
            const etiqueta = producto.querySelector('label.etiqueta');
            let nombre = etiqueta ? etiqueta.textContent.trim() : 'Producto';
            nombre = nombre.split('\n')[0].trim();
            const number = producto.querySelector("input[type='number']");
            const cantidad = number ? (parseInt(number.value, 10) || 0) : 0;

            if (cantidad > 0) {
                items.push({ nombre, cantidad });
                const item = document.createElement('div');
                item.className = 'item-carrito';
                item.textContent = `${nombre} x${cantidad}`;
                carritoLista.appendChild(item);
            }
        });

        if (items.length === 0) {
            carritoLista.innerHTML = '<div class="item-carrito vacio">No hay productos seleccionados</div>';
            if (botonWhatsapp) {
                botonWhatsapp.href = '#';
                botonWhatsapp.setAttribute('aria-disabled', 'true');
                botonWhatsapp.classList.add('disabled');
            }
            return;
        }

        let mensaje = "Hola Aura aromaterapias! quiero hacer este pedido:\n";
        items.forEach(it => mensaje += `• ${it.nombre} x${it.cantidad}\n`);

        if (botonWhatsapp) {
            botonWhatsapp.href = `https://wa.me/3516829976?text=${encodeURIComponent(mensaje)}`;
            botonWhatsapp.removeAttribute('aria-disabled');
            botonWhatsapp.classList.remove('disabled');
        }
    }

    function attachInputListeners() {
        const inputs = container.querySelectorAll("input[type='number']");
        inputs.forEach(inp => {
            inp.addEventListener('input', actualizarCarrito);
            inp.addEventListener('change', actualizarCarrito);
        });
    }

    attachInputListeners();
    actualizarCarrito();

    /* ------------------------------------------------------
       BOTONES DE CATEGORÍAS
    ------------------------------------------------------ */
    function toggleBoton(id, activo) {
        const b = document.getElementById(id);
        if (!b) return;

        b.classList.toggle("boton-activo", activo);
        b.classList.toggle("boton-inactivo", !activo);
    }

    function configurarBotonCategoria(idBoton, selectorCategoria) {
        document.getElementById(idBoton).addEventListener("click", () => {
            const items = document.querySelectorAll(selectorCategoria);
            let visible = false;

            items.forEach(div => {
                const esconder = (div.style.display === "" || div.style.display === "none");
                div.style.display = esconder ? "flex" : "none";
                visible = esconder;
            });

            toggleBoton(idBoton, visible);
        });
    }

    configurarBotonCategoria("boton1", "#kits");
    configurarBotonCategoria("boton2", "#velas");
    configurarBotonCategoria("boton3", "#humidificadores");
    configurarBotonCategoria("boton4", "#jabones");
    configurarBotonCategoria("boton5", "#almohadillas");

});
