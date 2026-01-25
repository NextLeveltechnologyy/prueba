function formatearPrecio(precio) {
    return precio.toLocaleString("es-AR");
}

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

        const [tipo, genero, nombre, color, talle, stock, precio, imagen] = fila.split(";");

        if (!data[nombre]) {
            data[nombre] = {
                tipo,
                genero,
                nombre,
                precio: Number(precio),
                img: `img/${imagen}`,
                variantes: {}
            };
        }

        if (!data[nombre].variantes[color]) {
            data[nombre].variantes[color] = {};
        }

        data[nombre].variantes[color][talle] = Number(stock);
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

    const filtroTipo = document.getElementById("filtro-tipo");
    const filtroGenero = document.getElementById("filtro-genero");
    const filtroColor = document.getElementById("filtro-color");
    const filtroTalle = document.getElementById("filtro-talle");

    productos = await cargarStock();
    cargarFiltros();
    renderInventario();

    /* ================== FILTROS ================== */
    function cargarFiltros() {
        const tipos = new Set();
        const colores = new Set();
        const talles = new Set();

        productos.forEach(p => {
            tipos.add(p.tipo);
            Object.entries(p.variantes).forEach(([color, ts]) => {
                colores.add(color);
                Object.keys(ts).forEach(t => talles.add(t));
            });
        });

        tipos.forEach(t => filtroTipo.innerHTML += `<option value="${t}">${t}</option>`);
        colores.forEach(c => filtroColor.innerHTML += `<option value="${c}">${c}</option>`);
        talles.forEach(t => filtroTalle.innerHTML += `<option value="${t}">${t}</option>`);
    }

    /* ================== INVENTARIO ================== */
    function renderInventario() {
        inventario.innerHTML = "";

        const tipoF = filtroTipo.value;
        const generoF = filtroGenero.value;
        const colorF = filtroColor.value;
        const talleF = filtroTalle.value;

        productos.forEach(prod => {

            if (tipoF && prod.tipo !== tipoF) return;
            if (generoF && prod.genero !== generoF) return;

            let visible = false;

            Object.entries(prod.variantes).forEach(([color, ts]) => {
                if (colorF && color !== colorF) return;
                Object.keys(ts).forEach(talle => {
                    if (talleF && talle !== talleF) return;
                    visible = true;
                });
            });

            if (!visible) return;

            inventario.innerHTML += `
            <div class="inventario" data-nombre="${prod.nombre}">
                <img src="${prod.img}">
                <h4>${prod.nombre}</h4>
                <p>${prod.genero.toLowerCase()}</p>
                <p class="producto-precio">$${formatearPrecio(prod.precio)}</p>


                <select class="color">
                    <option value="">Color</option>
                    ${Object.keys(prod.variantes).map(c => `<option value="${c}">${c}</option>`).join("")}
                </select>

                <select class="talle" disabled>
                    <option value="">Talle</option>
                </select>

                <p class="stock-info"></p>

                <input type="number" class="cantidad" min="1" value="1" disabled>

                <button class="agregar">Agregar</button>
            </div>
            `;
        });
    }

    [filtroTipo, filtroGenero, filtroColor, filtroTalle]
        .forEach(f => f.addEventListener("change", renderInventario));

    /* ================== COLOR → TALLES ================== */
    document.addEventListener("change", e => {

        if (e.target.classList.contains("color")) {
            const box = e.target.closest(".inventario");
            const prod = productos.find(p => p.nombre === box.dataset.nombre);
            const color = e.target.value;

            const talleSel = box.querySelector(".talle");
            const cantidad = box.querySelector(".cantidad");
            const stockInfo = box.querySelector(".stock-info");

            talleSel.innerHTML = `<option value="">Talle</option>`;
            cantidad.disabled = true;
            stockInfo.textContent = "";

            if (!color) return;

            Object.entries(prod.variantes[color]).forEach(([t, s]) => {
                talleSel.innerHTML += `
                    <option value="${t}" ${s === 0 ? "disabled" : ""}>
                        ${t} (${s})
                    </option>`;
            });

            talleSel.disabled = false;
        }

        if (e.target.classList.contains("talle")) {
            const box = e.target.closest(".inventario");
            const prod = productos.find(p => p.nombre === box.dataset.nombre);
            const color = box.querySelector(".color").value;
            const talle = e.target.value;

            const stock = prod.variantes[color][talle];
            const cantidad = box.querySelector(".cantidad");

            box.querySelector(".stock-info").textContent = `Stock disponible: ${stock}`;
            cantidad.max = stock;
            cantidad.value = stock > 0 ? 1 : 0;
            cantidad.disabled = stock === 0;
        }
    });

    /* ================== AGREGAR AL CARRITO ================== */
    document.addEventListener("click", e => {
        if (!e.target.classList.contains("agregar")) return;

        const box = e.target.closest(".inventario");
        const prod = productos.find(p => p.nombre === box.dataset.nombre);
        const color = box.querySelector(".color").value;
        const talle = box.querySelector(".talle").value;
        const cant = Number(box.querySelector(".cantidad").value);

        if (!color || !talle || cant <= 0) return;

        if (prod.variantes[color][talle] < cant) {
            alert("No hay stock suficiente");
            return;
        }

        prod.variantes[color][talle] -= cant;

        const item = carrito.find(i =>
            i.nombre === prod.nombre && i.color === color && i.talle === talle
        );

        item ? item.cantidad += cant :
            carrito.push({ nombre: prod.nombre, color, talle, precio: prod.precio, cantidad: cant });

        renderCarrito();
        renderInventario();
    });

    /* ================== CARRITO ================== */
    function renderCarrito() {
        listaCarrito.innerHTML = "";
        let total = 0;
        let mensaje = "Hola cocó clothing! Quiero hacer este pedido:%0A";

        carrito.forEach((item, i) => {
            const subtotal = item.precio * item.cantidad;
            total += subtotal;

            const div = document.createElement("div");
            div.className = "item-carrito";
            div.innerHTML = `
                <button class="menos">➖</button>
                ${item.nombre} ${item.color} ${item.talle} x${item.cantidad}
                <button class="mas">➕</button>
                $${formatearPrecio(subtotal)}
                <button class="borrar">🗑️</button>
            `;

            div.querySelector(".mas").onclick = () => modificarCantidad(item, 1);
            div.querySelector(".menos").onclick = () => modificarCantidad(item, -1);
            div.querySelector(".borrar").onclick = () => eliminarItem(i);

            listaCarrito.appendChild(div);

            mensaje += `• ${item.nombre} ${item.color} ${item.talle} x${item.cantidad} = $${formatearPrecio(subtotal)}%0A`;
        });

        totalCarrito.textContent = `Total: $${formatearPrecio(total)}`;
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

    function eliminarItem(index) {
        const item = carrito[index];
        const prod = productos.find(p => p.nombre === item.nombre);

        prod.variantes[item.color][item.talle] += item.cantidad;
        carrito.splice(index, 1);

        renderCarrito();
        renderInventario();
    }

    /* ================== ABRIR / CERRAR ================== */
    abrir.onclick = () => carritoDiv.style.display = "block";
    cerrar.onclick = () => carritoDiv.style.display = "none";
});
