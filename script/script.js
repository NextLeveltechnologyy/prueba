document.addEventListener('DOMContentLoaded', () => {
    /* MENÚ LATERAL */
    const btnMenu = document.querySelector(".menu-btn");
    const sideMenu = document.getElementById("sideMenu");

    btnMenu.addEventListener("click", () => {
        sideMenu.classList.toggle("active");
    });

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
            contenedores[i].style.display = "flex"; // antes era "block"
        }
        visibles += 6;
    }

    // Detectar scroll cerca del final
    window.addEventListener("scroll", () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 10) {
            mostrarMas();
        }
    });
});

let productos = [];
const carrito = [];

/* ================== CARGAR STOCK DESDE CSV ================== */
async function cargarStock() {
    const res = await fetch("data/stock.csv");
    const texto = await res.text();
    const filas = texto.split("\n").slice(1);

    const data = {};

    filas.forEach(fila => {
        if (!fila.trim()) return;

        const [producto, color, talle, stock, precio, imagen] = fila.split(";");

        if (!data[producto]) {
            data[producto] = {
                nombre: producto,
                precio: Number(precio),
                img: `img/${imagen}`,
                variantes: {}
            };
        }

        if (!data[producto].variantes[color]) {
            data[producto].variantes[color] = {};
        }

        data[producto].variantes[color][talle] = Number(stock);
    });

    return Object.values(data);
}

/* ================== DOM READY ================== */
document.addEventListener("DOMContentLoaded", async () => {

    const inventario = document.getElementById("inventario_contenedor");
    const carritoDiv = document.getElementById("carrito-flotante");
    const abrir = document.getElementById("abrirCarrito");
    const cerrar = document.getElementById("cerrarCarrito");
    const listaCarrito = document.getElementById("lista-carrito");
    const totalCarrito = document.getElementById("total-carrito");
    const whatsappBtn = document.getElementById("whatsapp-btn");

    productos = await cargarStock();
    renderInventario();

    /* ================== INVENTARIO ================== */
    function renderInventario() {
        inventario.innerHTML = "";

        productos.forEach(prod => {
            inventario.innerHTML += `
            <div class="inventario" data-nombre="${prod.nombre}">
                <img src="${prod.img}" alt="${prod.nombre}">
                <h4>${prod.nombre}</h4>
                <p>$${prod.precio}</p>

                <select class="color">
                    <option value="">Color</option>
                    ${Object.keys(prod.variantes).map(c =>
                `<option value="${c}">${c}</option>`
            ).join("")}
                </select>

                <select class="talle" disabled>
                    <option value="">Talle</option>
                </select>

                <p class="stock-info"></p>
                <button class="agregar">Agregar</button>
            </div>
            `;
        });
    }

    /* ================== COLOR → TALLES ================== */
    document.addEventListener("change", e => {

        if (e.target.classList.contains("color")) {
            const box = e.target.closest(".inventario");
            const talleSel = box.querySelector(".talle");
            const stockInfo = box.querySelector(".stock-info");

            const prod = productos.find(p => p.nombre === box.dataset.nombre);
            const color = e.target.value;

            talleSel.innerHTML = `<option value="">Talle</option>`;
            talleSel.disabled = true;
            stockInfo.textContent = "";

            if (!color) return;

            Object.entries(prod.variantes[color]).forEach(([talle, stock]) => {
                talleSel.innerHTML += `
                    <option value="${talle}" ${stock === 0 ? "disabled" : ""}>
                        ${talle} (${stock})
                    </option>
                `;
            });

            talleSel.disabled = false;
        }

        if (e.target.classList.contains("talle")) {
            const box = e.target.closest(".inventario");
            const prod = productos.find(p => p.nombre === box.dataset.nombre);
            const color = box.querySelector(".color").value;
            const talle = e.target.value;

            box.querySelector(".stock-info").textContent =
                `Stock disponible: ${prod.variantes[color][talle]}`;
        }
    });

    /* ================== AGREGAR AL CARRITO ================== */
    document.addEventListener("click", e => {
        if (!e.target.classList.contains("agregar")) return;

        const box = e.target.closest(".inventario");
        const prod = productos.find(p => p.nombre === box.dataset.nombre);
        const color = box.querySelector(".color").value;
        const talle = box.querySelector(".talle").value;

        if (!color || !talle) {
            alert("Seleccioná color y talle");
            return;
        }

        if (prod.variantes[color][talle] <= 0) {
            alert("Sin stock");
            return;
        }

        prod.variantes[color][talle]--;

        const item = carrito.find(
            p => p.nombre === prod.nombre && p.color === color && p.talle === talle
        );

        if (item) {
            item.cantidad++;
        } else {
            carrito.push({
                nombre: prod.nombre,
                color,
                talle,
                precio: prod.precio,
                cantidad: 1
            });
        }

        renderCarrito();
        renderInventario();
    });

    /* ================== CARRITO ================== */
    function renderCarrito() {
        listaCarrito.innerHTML = "";
        let total = 0;
        let mensaje = "Hola Cocó Clothing! Quiero este pedido:%0A";

        carrito.forEach((item, i) => {
            const subtotal = item.precio * item.cantidad;
            total += subtotal;

            const div = document.createElement("div");
            div.className = "item-carrito";
            div.innerHTML = `
                <button class="menos">➖</button>
                ${item.nombre} ${item.color} ${item.talle} x${item.cantidad}
                <button class="mas">➕</button>
                $${subtotal}
                <button class="borrar-item">🗑️</button>
            `;

            div.querySelector(".mas").onclick = () => modificarCantidad(item, 1);
            div.querySelector(".menos").onclick = () => modificarCantidad(item, -1);
            div.querySelector(".borrar-item").onclick = () => eliminarItem(i);

            listaCarrito.appendChild(div);
            mensaje += `• ${item.nombre} ${item.color} ${item.talle} x${item.cantidad} = $${subtotal}%0A`;
        });

        totalCarrito.textContent = `Total: $${total}`;
        mensaje += `%0ATotal: $${total}`;

        whatsappBtn.href = `https://wa.me/3516829976?text=${mensaje}`;
    }

    function modificarCantidad(item, cambio) {
        const prod = productos.find(p => p.nombre === item.nombre);

        if (cambio === 1 && prod.variantes[item.color][item.talle] <= 0) return;

        item.cantidad += cambio;
        prod.variantes[item.color][item.talle] -= cambio;

        if (item.cantidad === 0) {
            carrito.splice(carrito.indexOf(item), 1);
        }

        renderCarrito();
        renderInventario();
    }

    function eliminarItem(i) {
        const item = carrito[i];
        const prod = productos.find(p => p.nombre === item.nombre);

        prod.variantes[item.color][item.talle] += item.cantidad;
        carrito.splice(i, 1);

        renderCarrito();
        renderInventario();
    }

    abrir.onclick = () => carritoDiv.style.display = "block";
    cerrar.onclick = () => carritoDiv.style.display = "none";
});
