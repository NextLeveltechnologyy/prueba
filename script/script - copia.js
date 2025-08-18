document.addEventListener("DOMContentLoaded", function () {
    const contenedores = document.querySelectorAll("#inventario_contenedor > div");
    let visibles = 6; // cantidad inicial de divs visibles

    // Ocultar todos excepto los primeros
    contenedores.forEach((div, index) => {
        if (index >= visibles) {
            div.style.display = "none";
        }
    });

    function mostrarMas() {
        for (let i = visibles; i < visibles + 6 && i < contenedores.length; i++) {
            contenedores[i].style.display = "block";
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
document.addEventListener("DOMContentLoaded", () => {
    const carritoLista = document.getElementById("lista-carrito");
    const botonWhatsapp = document.getElementById("whatsapp-btn");

    function actualizarCarrito() {
        carritoLista.innerHTML = "";
        let mensaje = "Hola cocó clothing! quiero hacer este pedido:%0A";

        // Selecciona todos los bloques de productos
        document.querySelectorAll("#inventario_contenedor > div").forEach((producto, index) => {
            const cantidad = producto.querySelector('input[type="number"]').value;
            const color = producto.querySelector('select[name="color"]').value;
            const talle = producto.querySelector('select[name="talle"]').value;
            const nombre = producto.querySelector("img").alt;

            if (cantidad > 0 && color && talle) {
                const item = document.createElement("div");
                item.classList.add("item-carrito");
                item.innerHTML = `${nombre} - ${cantidad} un. - Color: ${color} - Talle: ${talle}`;
                carritoLista.appendChild(item);

                mensaje += `• ${nombre} (${cantidad} un., Color: ${color}, Talle: ${talle})%0A`;
            }
        });

        // Actualiza el enlace de WhatsApp
        botonWhatsapp.href = `https://wa.me/5491123456789?text=${mensaje}`;
    }

    // Escuchar cambios en todos los inputs y selects
    document.querySelectorAll("#inventario_contenedor input, #inventario_contenedor select").forEach(el => {
        el.addEventListener("change", actualizarCarrito);
    });
});