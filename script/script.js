document.addEventListener("DOMContentLoaded", function () {
    const contenedores = document.querySelectorAll("#inventario_contenedor > div");
    let visibles = 4; // cantidad inicial de divs visibles

    // Ocultar todos excepto los primeros
    contenedores.forEach((div, index) => {
        if (index >= visibles) {
            div.style.display = "none";
        }
    });

    function mostrarMas() {
        for (let i = visibles; i < visibles + 4 && i < contenedores.length; i++) {
            contenedores[i].style.display = "flex"; // antes era "block"
        }
        visibles += 4;
    }

    // Detectar scroll cerca del final
    window.addEventListener("scroll", () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 10) {
            mostrarMas();
        }
    });
});

//Carrito
document.addEventListener("DOMContentLoaded", () => {
    const carritoLista = document.getElementById("lista-carrito");
    const botonWhatsapp = document.getElementById("whatsapp-btn");

    function actualizarCarrito() {
        carritoLista.innerHTML = "";
        let mensaje = "Hola cocó clothing! quiero hacer este pedido:%0A";

        document.querySelectorAll("#inventario_contenedor > div").forEach((producto) => {
            const nombre = producto.querySelector("label").textContent.trim();
            const checkbox = producto.querySelector("input[type='checkbox']");

            if (checkbox.checked) {
                const item = document.createElement("div");
                item.classList.add("item-carrito");
                item.textContent = nombre;
                carritoLista.appendChild(item);

                mensaje += `• ${nombre}%0A`;
            }
        });

        botonWhatsapp.href = `https://wa.me/3516829976?text=${mensaje}`;
    }

    // Llamar a actualizarCarrito cada vez que cambie un checkbox
    document.querySelectorAll("#inventario_contenedor input[type='checkbox']").forEach((cb) => {
        cb.addEventListener("change", actualizarCarrito);
    });
});

//texto en imágenes
const labels = document.querySelectorAll('#inventario_contenedor .etiqueta');

const textos = [
    'Buzo canguro\n Talle M\n Color beige',
    'Buzo corto\n Talle único\n Color negro',
    'Buzo estampado\n Talle M\n Color negro',
    'gorrito de hilo\n Talle único\n Color gris',
    'Buzo canguro\n Talle M\n Color beige',
    'Camisa disponible\n Talle único\n Color negro',
    'Pantalón disponible\n Talle M\n Color negro',
    'gorrito de hilo\n Talle único\n Color gris'
];

labels.forEach((label, index) => {
    label.innerHTML = textos[index].replace(/\n/g, '<br>');
});

