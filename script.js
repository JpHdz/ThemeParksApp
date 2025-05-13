// Código para manejar correctamente el sidebar
document.addEventListener("DOMContentLoaded", function () {
  // Manejo de pestañas y cambio de contenido en el sidebar
  const navTabs = document.querySelectorAll(".nav-tab");
  const sidebarContents = document.querySelectorAll(".sidebar-content");

  navTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      // Actualizar pestaña activa
      navTabs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");

      // Mostrar el contenido correspondiente
      const tabName = this.getAttribute("data-tab");

      // Ocultar todos los contenidos primero
      sidebarContents.forEach((content) => {
        content.style.display = "none";
      });
      console.log(tabName, "2122");

      // Mostrar el contenido correspondiente según el tab seleccionado
      if (tabName === "atracciones") {
        document.getElementById("atraccionesContent").style.display = "block";
      } else if (tabName === "parques") {
        document.getElementById("parquesContent").style.display = "block";
        console.log(document.getElementById("parquesContent").style.display);
      } else if (tabName === "analisis") {
        document.getElementById("analisisContent").style.display = "block";
      }
    });
  });

  // Manejo de botones de zoom
  const zoomInBtn = document.getElementById("zoomIn");
  const zoomOutBtn = document.getElementById("zoomOut");

  if (zoomInBtn) {
    zoomInBtn.addEventListener("click", function () {
      if (map) map.zoomIn();
    });
  }

  if (zoomOutBtn) {
    zoomOutBtn.addEventListener("click", function () {
      if (map) map.zoomOut();
    });
  }
});

let parquesLayer = L.layerGroup();
let atraccionesLayer = L.layerGroup();

// Inicializar el mapa (asumiendo que esto ya lo tienes implementado)
let map = L.map("map").setView([40.416775, -3.70379], 6); // Vista inicial en España

// Agregar capa base de OpenStreetMap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

function cargarParques() {
  fetch("http://localhost:3000/parques")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Datos de parques recibidos:", data);
      // Limpiar capa existente
      parquesLayer.clearLayers();

      // Crear lista para el sidebar
      const polygonList = document.getElementById("polygonList");
      polygonList.innerHTML = ""; // Limpiar lista existente

      // Agregar cada parque al mapa
      data.features.forEach((feature) => {
        const parque = feature.properties;
        const geom = feature.geometry;

        // Crear polígono y agregarlo al mapa
        const polygon = L.geoJSON(geom, {
          style: {
            fillColor: "#f59e0b",
            weight: 2,
            opacity: 0.7,
            color: "#f97d16",
            fillOpacity: 0.4,
          },
        }).addTo(parquesLayer);

        // Agregar popup con información
        polygon.bindPopup(`
          <div class="popup-content">
            <h3>${parque.nombre}</h3>
            <p><strong>Operado por:</strong> ${parque.empresa_operadora}</p>
            <p><strong>Inauguración:</strong> ${parque.fecha_inauguracion}</p>
            <p><strong>Superficie:</strong> ${parque.superficie_hectareas} hectáreas</p>
            <p><strong>Capacidad:</strong> ${parque.capacidad_maxima} personas</p>
            <p><strong>Horario:</strong> ${parque.horario_apertura} - ${parque.horario_cierre}</p>
            <p><strong>Ubicación:</strong> ${parque.ciudad}, ${parque.pais}</p>
          </div>
        `);

        // Agregar elemento a la lista del sidebar
        const listItem = document.createElement("li");
        listItem.className = "polygon-item";
        listItem.innerHTML = `
          <div class="country-code">${parque.pais
            .substring(0, 2)
            .toUpperCase()}</div>
          <div class="polygon-item-content">
            <div class="polygon-name">${parque.nombre}</div>
            <div class="polygon-date">${parque.fecha_inauguracion}</div>
          </div>
          <div class="remove-btn">×</div>
        `;
        polygonList.appendChild(listItem);

        // Añadir polígono a la lista de polígonos
        listaPoligonos.push(polygon);
        listItem.dataset.polygonIndex = listaPoligonos.length - 1;

        // Manejar evento de clic en botón de eliminar
        const removeBtn = listItem.querySelector(".remove-btn");
        removeBtn.addEventListener("click", function (e) {
          e.stopPropagation(); // Evitar que el evento se propague al elemento padre
          map.removeLayer(polygon);
          polygonList.removeChild(listItem);

          // Eliminar de la lista de polígonos
          const index = listaPoligonos.indexOf(polygon);
          if (index > -1) {
            listaPoligonos.splice(index, 1);
          }

          // Eliminar de los seleccionados si está seleccionado
          if (poligonosSeleccionados.has(polygon)) {
            poligonosSeleccionados.delete(polygon);
          }
        });

        // Manejar evento de clic en el elemento de lista
        listItem.addEventListener("click", function () {
          // Deseleccionar elementos previos en la UI
          document
            .querySelectorAll(".polygon-item")
            .forEach((i) => i.classList.remove("selected"));
          this.classList.add("selected");

          // Actualizar el conjunto poligonosSeleccionados
          poligonosSeleccionados.forEach((p) =>
            p.setStyle(colorNoSeleccionado)
          );
          poligonosSeleccionados.clear();
          poligonosSeleccionados.add(polygon);
          polygon.setStyle(colorSeleccionado);

          // Centrar el mapa en este polígono
          map.fitBounds(polygon.getBounds());
        });
      });

      // Agregar capa al mapa
      parquesLayer.addTo(map);

      // Ajustar la vista del mapa para mostrar todos los parques
      if (data.features.length > 0) {
        const bounds = parquesLayer.getBounds();
        map.fitBounds(bounds);
      }
    })
    .catch((error) => {
      console.error("Error al cargar los parques:", error);
      alert(
        "Error al cargar los datos de parques temáticos. Por favor, verifica la conexión con el servidor."
      );
    });
}

// Cargar las atracciones desde el API
function cargarAtracciones() {
  fetch("http://localhost:3000/atracciones")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Datos de atracciones recibidos:", data);
      // Limpiar capa existente
      atraccionesLayer.clearLayers();

      // Crear lista para el sidebar
      const pointsList = document.getElementById("pointsList");
      pointsList.innerHTML = ""; // Limpiar lista existente

      // Iconos por tipo de atracción
      const iconos = {
        "Montaña rusa": "fa-rocket",
        Acuática: "fa-water",
        Familiar: "fa-users",
        Espectáculo: "fa-theater-masks",
        Extrema: "fa-bolt",
        default: "fa-star",
      };

      // Colores por intensidad
      const colores = {
        Baja: "#4ade80", // verde
        Media: "#fbbf24", // amarillo
        Alta: "#ef4444", // rojo
        default: "#8b5cf6", // morado
      };

      // Agregar cada atracción al mapa
      data.features.forEach((feature) => {
        const atraccion = feature.properties;
        const geom = feature.geometry;

        // Determinar icono y color
        const iconClass = iconos[atraccion.tipo] || iconos["default"];
        const color = colores[atraccion.intensidad] || colores["default"];

        // Crear marcador personalizado
        const iconHtml = `<i class="fas ${iconClass}" style="color: ${color};"></i>`;
        const customIcon = L.divIcon({
          html: iconHtml,
          className: "custom-div-icon",
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        // Crear marcador y agregarlo al mapa
        const marker = L.marker([geom.coordinates[1], geom.coordinates[0]], {
          icon: customIcon,
        }).addTo(atraccionesLayer);

        // Agregar popup con información
        marker.bindPopup(`
          <div class="popup-content">
            <h3>${atraccion.nombre}</h3>
            <p><strong>Tipo:</strong> ${atraccion.tipo}</p>
            <p><strong>Intensidad:</strong> ${atraccion.intensidad}</p>
            <p><strong>Altura mínima:</strong> ${atraccion.altura_minima} cm</p>
            <p><strong>Capacidad:</strong> ${atraccion.capacidad_personas} personas</p>
            <p><strong>Duración:</strong> ${atraccion.duracion_minutos} minutos</p>
            <p><strong>Fabricante:</strong> ${atraccion.fabricante}</p>
            <p><strong>Estado:</strong> ${atraccion.estado}</p>
            <p><strong>Parque:</strong> ${atraccion.nombre_parque}</p>
          </div>
        `);

        // Agregar elemento a la lista del sidebar
        const listItem = document.createElement("li");
        listItem.className = "point-item";
        listItem.innerHTML = `
          <div class="point-icon"><i class="fas ${iconClass}" style="color: ${color};"></i></div>
          <div class="point-item-content">
            <div class="point-name">${atraccion.nombre}</div>
            <div class="point-type">${atraccion.tipo} - ${atraccion.intensidad}</div>
          </div>
          <div class="remove-btn">×</div>
        `;
        pointsList.appendChild(listItem);

        // Manejar evento de clic en botón de eliminar
        const removeBtn = listItem.querySelector(".remove-btn");
        removeBtn.addEventListener("click", function () {
          map.removeLayer(marker);
          pointsList.removeChild(listItem);
        });

        // Manejar evento de clic en el elemento de lista
        listItem.addEventListener("click", function () {
          // Deseleccionar elementos previos en la UI
          document
            .querySelectorAll(".point-item")
            .forEach((i) => i.classList.remove("selected"));
          this.classList.add("selected");

          // Centrar el mapa en esta atracción
          map.setView([geom.coordinates[1], geom.coordinates[0]], 18);
          marker.openPopup();
        });
      });

      // Agregar capa al mapa
      atraccionesLayer.addTo(map);
    })
    .catch((error) => {
      console.error("Error al cargar las atracciones:", error);
      alert(
        "Error al cargar los datos de atracciones. Por favor, verifica la conexión con el servidor."
      );
    });
}

function setupTabs() {
  const tabs = document.querySelectorAll(".nav-tab");
  const contents = {
    // Mapear correctamente los valores de data-tab a los IDs de contenido
    parques: document.getElementById("parquesContent"),
    atracciones: document.getElementById("atraccionesContent"),
    analisis: document.getElementById("analisisContent"),
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Desactivar todos los tabs
      tabs.forEach((t) => t.classList.remove("active"));

      // Ocultar todos los contenidos
      Object.values(contents).forEach((content) => {
        if (content) {
          // Verificar que el elemento existe antes de manipularlo
          content.style.display = "none";
        }
      });

      // Activar el tab seleccionado
      tab.classList.add("active");

      // Mostrar el contenido correspondiente
      const contentId = tab.getAttribute("data-tab");
      if (contents[contentId]) {
        // Verificar que el elemento existe
        contents[contentId].style.display = "block";
        console.log(
          `Mostrando contenido para ${contentId}: ${contents[contentId].id}`
        );
      } else {
        console.error(`No se encontró contenido para el tab: ${contentId}`);
      }
    });
  });

  // Opcional: activar el primer tab por defecto
  if (tabs.length > 0) {
    const firstTab = tabs[0];
    firstTab.classList.add("active");
    const firstContentId = firstTab.getAttribute("data-tab");
    if (contents[firstContentId]) {
      contents[firstContentId].style.display = "block";
    }
  }
}

// Ejecutar diagnóstico al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  diagnosticarSidebar();
  setupTabs();
});

// Función para agregar controles de zoom
function setupMapControls() {
  document.getElementById("zoomIn").addEventListener("click", () => {
    map.zoomIn();
  });

  document.getElementById("zoomOut").addEventListener("click", () => {
    map.zoomOut();
  });

  // Botón para usar la posición actual
  document
    .querySelector(".use-position-button")
    .addEventListener("click", () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            map.setView([lat, lng], 13);
            // Opcional: mostrar un marcador en la posición actual
            L.marker([lat, lng])
              .addTo(map)
              .bindPopup("Tu ubicación actual")
              .openPopup();
          },
          (error) => {
            console.error("Error al obtener la ubicación:", error);
            alert("No se pudo obtener tu ubicación actual.");
          }
        );
      } else {
        alert("Tu navegador no soporta geolocalización.");
      }
    });
}

// Inicializar la aplicación cuando se carga la página
document.addEventListener("DOMContentLoaded", () => {
  // Configurar los tabs
  setupTabs();

  // Configurar controles del mapa
  setupMapControls();

  // Cargar datos
  cargarParques();
  cargarAtracciones();
});

var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

var drawControl = new L.Control.Draw({
  draw: {
    polygon: true,
    rectangle: true,
    circle: false,
    marker: false,
    polyline: false,
    circlemarker: false,
  },
  edit: {
    featureGroup: drawnItems,
  },
});
map.addControl(drawControl);

var listaPoligonos = [];
var poligonosSeleccionados = new Set();
var listaHTML = document.getElementById("polygonList");

// Colores para mostrar el estado de selección
const colorNoSeleccionado = { color: "#3388ff" };
const colorSeleccionado = { color: "#ff3333", weight: 3 };
const colorResultado = { color: "#33cc33", weight: 3, fillOpacity: 0.5 };

function actualizarLista() {
  listaHTML.innerHTML = "";
  listaPoligonos.forEach((item, i) => {
    const box = document.createElement("div"); // Create container box
    box.className = "polygon-item"; // Optional: add class for styling

    const li = document.createElement("li");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = poligonosSeleccionados.has(item);
    checkbox.onclick = (e) => {
      e.stopPropagation();
      toggleSeleccion(item);
    };

    const span = document.createElement("span");
    span.textContent = `Polígono ${i + 1}`;

    li.appendChild(checkbox);
    li.appendChild(span);
    li.className = poligonosSeleccionados.has(item) ? "selected " : "";

    li.onclick = () => {
      toggleSeleccion(item);
      checkbox.checked = poligonosSeleccionados.has(item);
    };

    box.appendChild(li); // Append <li> into box
    listaHTML.appendChild(box); // Append box into the list container
  });
}

function toggleSeleccion(poligono) {
  if (poligonosSeleccionados.has(poligono)) {
    poligonosSeleccionados.delete(poligono);
    poligono.setStyle(colorNoSeleccionado);
  } else {
    poligonosSeleccionados.add(poligono);
    poligono.setStyle(colorSeleccionado);
    poligono.openPopup();
  }
  actualizarLista();
}

map.on("draw:created", function (event) {
  var layer = event.layer;
  drawnItems.addLayer(layer);
  listaPoligonos.push(layer);
  poligonosSeleccionados.add(layer); // Seleccionamos automáticamente el nuevo polígono
  layer.setStyle(colorSeleccionado);
  mostrarArea(layer, event.layerType);
  actualizarLista();
});

map.on("click", function (e) {
  map.eachLayer(function (layer) {
    if (
      (layer instanceof L.Polygon || layer instanceof L.Rectangle) &&
      layer.getBounds().contains(e.latlng)
    ) {
      // Si se hace Ctrl+clic, agregar a la selección sin eliminar los anteriores
      if (!e.originalEvent.ctrlKey) {
        // Limpiar selecciones previas si no se presiona Ctrl
        poligonosSeleccionados.forEach((poligono) => {
          poligono.setStyle(colorNoSeleccionado);
        });
        poligonosSeleccionados.clear();
      }
      toggleSeleccion(layer);
    }
  });
});

function mostrarArea(layer, tipo) {
  var popupText = "";

  if (tipo === "polygon") {
    var latlngs = layer.getLatLngs()[0];
    var area = L.GeometryUtil.geodesicArea(latlngs) / 1e6;
    popupText = `Área: ${area.toFixed(2)} km²`;
  } else if (tipo === "rectangle") {
    var bounds = layer.getBounds();
    var sw = bounds.getSouthWest();
    var ne = bounds.getNorthEast();
    var width = Math.abs(sw.lng - ne.lng) * 111.32;
    var height = Math.abs(sw.lat - ne.lat) * 110.57;
    var area = width * height;
    popupText = `Área: ${area.toFixed(2)} km²`;
  }

  if (popupText) {
    layer.bindPopup(popupText).openPopup();
  }
}

// Variables globales para manejar buffers
let buffersLayer = L.layerGroup().addTo(map);
let puntosSeleccionados = new Set();
let bufferRadius = 2; // Radio predeterminado en kilómetros

// Función para actualizar el radio del buffer desde el input
document.getElementById("bufferRadius").addEventListener("input", function () {
  bufferRadius = parseFloat(this.value);
  // Si hay buffers activos, actualizarlos con el nuevo radio
  if (puntosSeleccionados.size > 0) {
    limpiarBuffers();
    crearBuffers();
  }
});

// Configurar los botones de buffer
document
  .getElementById("btnCrearBuffer")
  .addEventListener("click", function () {
    // Verificar si hay puntos seleccionados en la capa de atracciones
    if (atraccionesLayer.getLayers().length === 0) {
      alert("No hay atracciones cargadas para crear buffer.");
      return;
    }

    // Activar modo de selección de puntos para buffer
    activarSeleccionPuntos();
  });

document
  .getElementById("btnLimpiarBuffer")
  .addEventListener("click", function () {
    limpiarBuffers();
    desactivarSeleccionPuntos();
    puntosSeleccionados.clear();

    // Desmarcar puntos seleccionados en la UI
    document.querySelectorAll(".point-item").forEach((item) => {
      item.classList.remove("buffer-selected");
    });
  });

// Función para activar el modo de selección de puntos para buffer
function activarSeleccionPuntos() {
  // Cambiar el cursor para indicar modo de selección
  document.getElementById("map").style.cursor = "crosshair";

  // Agregar indicador visual de modo activo
  document.getElementById("btnCrearBuffer").classList.add("active-mode");

  // Mostrar mensaje al usuario
  alert(
    "Haz clic en las atracciones para crear buffers. Presiona ESC para finalizar."
  );

  // Agregar evento de clic a los marcadores de atracciones
  atraccionesLayer.eachLayer(function (layer) {
    layer.on("click", onMarkerClickForBuffer);
  });

  // Permitir hacer clic en los elementos de la lista también
  document.querySelectorAll(".point-item").forEach((item, index) => {
    item.addEventListener("click", function () {
      const layers = atraccionesLayer.getLayers();
      if (index < layers.length) {
        onMarkerClickForBuffer({ target: layers[index] });
        this.classList.toggle("buffer-selected");
      }
    });
  });

  // Agregar evento de escape para desactivar el modo
  document.addEventListener("keydown", function escKeyHandler(e) {
    if (e.key === "Escape") {
      desactivarSeleccionPuntos();
      document.removeEventListener("keydown", escKeyHandler);
    }
  });
}

// Función para desactivar el modo de selección de puntos
function desactivarSeleccionPuntos() {
  document.getElementById("map").style.cursor = "";
  document.getElementById("btnCrearBuffer").classList.remove("active-mode");

  // Remover eventos de clic de los marcadores
  atraccionesLayer.eachLayer(function (layer) {
    layer.off("click", onMarkerClickForBuffer);
  });
}

// Función que se ejecuta al hacer clic en un marcador para buffer
function onMarkerClickForBuffer(e) {
  const marker = e.target;

  // Toggle selección del punto
  if (puntosSeleccionados.has(marker)) {
    puntosSeleccionados.delete(marker);
    // Eliminar buffer de este punto
    limpiarBufferDePunto(marker);
  } else {
    puntosSeleccionados.add(marker);
    // Crear buffer para este punto
    crearBufferParaPunto(marker);
  }
}

// Función para crear buffers para todos los puntos seleccionados
function crearBuffers() {
  puntosSeleccionados.forEach((marker) => {
    crearBufferParaPunto(marker);
  });
}

// Función para crear un buffer alrededor de un punto específico
function crearBufferParaPunto(marker) {
  const latlng = marker.getLatLng();
  const point = turf.point([latlng.lng, latlng.lat]);

  // Crear buffer usando turf.js (radio en kilómetros)
  const buffered = turf.buffer(point, bufferRadius, { units: "kilometers" });

  // Convertir el buffer a una capa de Leaflet y añadirlo al mapa
  const bufferLayer = L.geoJSON(buffered, {
    style: {
      color: "#ff7800",
      weight: 2,
      opacity: 0.65,
      fillColor: "#ff7800",
      fillOpacity: 0.4,
    },
  });

  // Guardar referencia al punto de origen en la capa de buffer
  bufferLayer.sourceMarker = marker;

  // Agregar popup con información del buffer
  bufferLayer.bindPopup(`
        <div class="popup-content">
            <h3>Buffer de ${bufferRadius} km</h3>
            <p>Alrededor de: ${
              marker
                .getPopup()
                .getContent()
                .match(/<h3>(.*?)<\/h3>/)[1]
            }</p>
            <p>Área aproximada: ${(turf.area(buffered) / 1000000).toFixed(
              2
            )} km²</p>
        </div>
    `);

  // Añadir el buffer al mapa
  bufferLayer.addTo(buffersLayer);
}

// Función para limpiar todos los buffers
function limpiarBuffers() {
  buffersLayer.clearLayers();
}

// Función para limpiar el buffer de un punto específico
function limpiarBufferDePunto(marker) {
  buffersLayer.eachLayer(function (layer) {
    if (layer.sourceMarker === marker) {
      buffersLayer.removeLayer(layer);
    }
  });
}

// Agregar los buffers a las capas que se limpian con "Limpiar Todos los Análisis"
document
  .getElementById("btnLimpiarTodoAnalisis")
  .addEventListener("click", function () {
    limpiarBuffers();
    puntosSeleccionados.clear();
    desactivarSeleccionPuntos();

    // Desmarcar puntos seleccionados en la UI
    document.querySelectorAll(".point-item").forEach((item) => {
      item.classList.remove("buffer-selected");
    });
  });

// Variables globales para la medición de distancias
let medicionDistanciaActiva = false;
let puntosDistancia = [];
let lineasDistancia = L.layerGroup().addTo(map);
let marcadoresMedicion = L.layerGroup().addTo(map);

// Configuración de los botones de medición de distancia
document
  .getElementById("btnMedirDistancia")
  .addEventListener("click", function () {
    activarMedicionDistancia();
  });

document
  .getElementById("btnLimpiarMedicion")
  .addEventListener("click", function () {
    limpiarMedicionDistancia();
  });

// Función para activar el modo de medición de distancia
function activarMedicionDistancia() {
  // Si ya está activo, desactivarlo
  if (medicionDistanciaActiva) {
    desactivarMedicionDistancia();
    return;
  }

  // Activar modo medición
  medicionDistanciaActiva = true;

  // Cambiar estilo del botón para indicar modo activo
  document.getElementById("btnMedirDistancia").classList.add("active-mode");
  document.getElementById("btnMedirDistancia").textContent =
    "Cancelar Medición";

  // Cambiar el cursor para indicar modo de selección
  document.getElementById("map").style.cursor = "crosshair";

  // Mostrar mensaje informativo
  document.getElementById("distanceResult").innerHTML =
    "Haz clic en dos puntos del mapa para medir la distancia entre ellos.";

  // Añadir event listener al mapa
  map.on("click", onMapClickForMeasurement);

  // Habilitar selección de puntos desde la lista de atracciones
  document
    .querySelectorAll("#pointsList .point-item")
    .forEach((item, index) => {
      item.classList.add("clickable-for-measure");

      // Añadir evento de clic temporal para medición
      item.addEventListener(
        "click",
        function measurePointClick(e) {
          e.stopPropagation(); // Evitar propagación a otros handlers

          const layers = atraccionesLayer.getLayers();
          if (index < layers.length) {
            const marker = layers[index];
            const latlng = marker.getLatLng();
            procesarPuntoMedicion(
              latlng,
              marker
                .getPopup()
                .getContent()
                .match(/<h3>(.*?)<\/h3>/)[1]
            );

            // Marcar visualmente el punto seleccionado
            this.classList.add("measure-selected");
          }

          // Si ya tenemos dos puntos, desactivar este listener
          if (puntosDistancia.length >= 2) {
            document
              .querySelectorAll("#pointsList .point-item")
              .forEach((el) => {
                el.classList.remove("clickable-for-measure");
                el.removeEventListener("click", measurePointClick);
              });
          }
        },
        { once: medicionDistanciaActiva }
      );
    });
}

// Función para procesar un punto seleccionado para medición
function procesarPuntoMedicion(latlng, nombrePunto = null) {
  // Si ya tenemos dos puntos, reiniciar
  if (puntosDistancia.length >= 2) {
    limpiarMedicionDistancia();
  }

  // Añadir el punto a la lista
  puntosDistancia.push({
    latlng: latlng,
    nombre: nombrePunto || `Punto ${puntosDistancia.length + 1}`,
  });

  // Crear un marcador para el punto
  const marcador = L.marker(latlng, {
    icon: L.divIcon({
      html: `<div class="measure-point-marker">${puntosDistancia.length}</div>`,
      className: "measure-marker-container",
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    }),
  }).addTo(marcadoresMedicion);

  // Si tenemos dos puntos, dibujar la línea y calcular la distancia
  if (puntosDistancia.length === 2) {
    dibujarLineaYCalcularDistancia();
    // Después de medir, desactivar el modo automáticamente
    desactivarMedicionDistancia(false); // false = no limpiar resultados
  }
}

// Function to draw line and calculate distance
function dibujarLineaYCalcularDistancia() {
  // Crear línea entre los dos puntos
  const linea = L.polyline(
    [puntosDistancia[0].latlng, puntosDistancia[1].latlng],
    {
      color: "#f97d16",
      weight: 3,
      opacity: 0.7,
      dashArray: "5, 10",
    }
  ).addTo(lineasDistancia);

  // Calcular distancia usando turf.js
  const desde = turf.point([
    puntosDistancia[0].latlng.lng,
    puntosDistancia[0].latlng.lat,
  ]);
  const hasta = turf.point([
    puntosDistancia[1].latlng.lng,
    puntosDistancia[1].latlng.lat,
  ]);
  const distancia = turf.distance(desde, hasta, { units: "kilometers" });

  // Mostrar punto medio con la distancia
  const puntoMedio = L.latLng(
    (puntosDistancia[0].latlng.lat + puntosDistancia[1].latlng.lat) / 2,
    (puntosDistancia[0].latlng.lng + puntosDistancia[1].latlng.lng) / 2
  );

  const marcadorDistancia = L.marker(puntoMedio, {
    icon: L.divIcon({
      html: `<div class="distance-label">${distancia.toFixed(2)} km</div>`,
      className: "distance-label-container",
      iconSize: [80, 30],
      iconAnchor: [40, 15],
    }),
  }).addTo(marcadoresMedicion);

  // Actualizar el resultado en el panel
  document.getElementById("distanceResult").innerHTML = `
        <strong>Distancia:</strong> ${distancia.toFixed(2)} km<br>
        <strong>Desde:</strong> ${puntosDistancia[0].nombre}<br>
        <strong>Hasta:</strong> ${puntosDistancia[1].nombre}
    `;

  // Ajustar la vista para mostrar la línea completa
  map.fitBounds(linea.getBounds(), { padding: [50, 50] });
}

// Función para desactivar el modo de medición
function desactivarMedicionDistancia(limpiarResultados = true) {
  medicionDistanciaActiva = false;

  // Restaurar estilo del botón
  document.getElementById("btnMedirDistancia").classList.remove("active-mode");
  document.getElementById("btnMedirDistancia").textContent = "Iniciar Medición";

  // Restaurar cursor
  document.getElementById("map").style.cursor = "";

  // Remover event listener del mapa
  map.off("click", onMapClickForMeasurement);

  // Remover clase de seleccionable para medición
  document.querySelectorAll("#pointsList .point-item").forEach((item) => {
    item.classList.remove("clickable-for-measure", "measure-selected");
  });

  // Si se solicita limpiar resultados, hacerlo
  if (limpiarResultados) {
    limpiarMedicionDistancia();
  }
}

// Función para manejar clics en el mapa para medición
function onMapClickForMeasurement(e) {
  procesarPuntoMedicion(e.latlng);
}

// Función para limpiar la medición de distancia
function limpiarMedicionDistancia() {
  // Limpiar variables
  puntosDistancia = [];

  // Limpiar capas
  lineasDistancia.clearLayers();
  marcadoresMedicion.clearLayers();

  // Resetear mensaje
  document.getElementById("distanceResult").innerHTML =
    "Selecciona dos puntos en el mapa";

  // Quitar clase de puntos seleccionados
  document.querySelectorAll("#pointsList .point-item").forEach((item) => {
    item.classList.remove("measure-selected");
  });
}

// Añadir la medición de distancia a la función de limpiar todos los análisis
document
  .getElementById("btnLimpiarTodoAnalisis")
  .addEventListener("click", function () {
    if (medicionDistanciaActiva) {
      desactivarMedicionDistancia();
    } else {
      limpiarMedicionDistancia();
    }
  });

// FIXME: CLUSTERING//// Variables globales para el clustering
let clustersLayer = L.layerGroup().addTo(map);
let clusterDistance = 5; // Distancia predeterminada en kilómetros

// Actualizar la distancia de clustering desde el input
document
  .getElementById("clusterDistance")
  .addEventListener("input", function () {
    clusterDistance = parseFloat(this.value);
    // Si hay clusters activos, actualizarlos con la nueva distancia
    if (clustersLayer.getLayers().length > 0) {
      limpiarClusters();
      crearClusters();
    }
  });

// Configurar los botones de clustering
document
  .getElementById("btnCrearClusters")
  .addEventListener("click", function () {
    // Verificar si hay puntos en la capa de atracciones
    if (atraccionesLayer.getLayers().length === 0) {
      alert("No hay atracciones cargadas para crear clusters.");
      return;
    }

    crearClusters();
  });

document
  .getElementById("btnLimpiarClusters")
  .addEventListener("click", function () {
    limpiarClusters();
  });

// Función para crear clusters
function crearClusters() {
  // Limpiar clusters previos
  limpiarClusters();

  // Recopilar todos los puntos de la capa de atracciones
  let puntos = [];
  atraccionesLayer.eachLayer(function (layer) {
    const latlng = layer.getLatLng();

    // Crear un punto GeoJSON con propiedades del marcador
    puntos.push(
      turf.point([latlng.lng, latlng.lat], {
        name: layer
          .getPopup()
          .getContent()
          .match(/<h3>(.*?)<\/h3>/)[1],
      })
    );
  });

  // Crear una colección de puntos para turf
  const puntosCollection = turf.featureCollection(puntos);

  // Realizar clustering con turf
  const clusters = turf.clustersDbscan(puntosCollection, clusterDistance, {
    units: "kilometers",
    minPoints: 2, // Mínimo de puntos para formar un cluster
  });

  // Procesar los resultados del clustering
  const clusterGroups = {};

  // Agrupar los puntos por su cluster
  clusters.features.forEach(function (punto) {
    const clusterId = punto.properties.cluster;
    if (clusterId !== undefined && clusterId !== null) {
      if (!clusterGroups[clusterId]) {
        clusterGroups[clusterId] = [];
      }
      clusterGroups[clusterId].push(punto);
    }
  });

  // Crear polígonos para cada cluster
  for (const clusterId in clusterGroups) {
    const puntosCluster = clusterGroups[clusterId];
    if (puntosCluster.length < 2) continue; // Ignorar clusters de un solo punto

    // Crear un polígono que envuelva los puntos (convex hull)
    const puntosCoords = puntosCluster.map((p) => p.geometry.coordinates);
    const puntosTurf = turf.points(puntosCoords);
    const hull = turf.convex(puntosTurf);

    if (hull) {
      // Aplicar buffer al hull para hacerlo más visual
      const bufferedHull = turf.buffer(hull, 0.2, { units: "kilometers" });

      // Crear capa de Leaflet para el cluster
      const clusterLayer = L.geoJSON(bufferedHull, {
        style: {
          color: `hsl(${(parseInt(clusterId) * 137.5) % 360}, 70%, 50%)`, // Color único por cluster
          weight: 2,
          opacity: 0.7,
          fillOpacity: 0.4,
        },
      }).addTo(clustersLayer);

      // Crear lista de nombres de puntos en este cluster
      const puntosNombres = puntosCluster
        .map((p) => p.properties.name)
        .join(", ");

      // Añadir popup con información del cluster
      clusterLayer.bindPopup(`
        <div class="popup-content">
          <h3>Cluster #${clusterId}</h3>
          <p><strong>Puntos agrupados:</strong> ${puntosCluster.length}</p>
          <p><strong>Atracciones:</strong> ${puntosNombres}</p>
        </div>
      `);
    }
  }

  // Mostrar mensaje con resultados
  const numClusters = Object.keys(clusterGroups).length;
  alert(`Se han identificado ${numClusters} grupos de atracciones cercanas.`);
}

// Función para limpiar todos los clusters
function limpiarClusters() {
  clustersLayer.clearLayers();
}

// Añadir clustering a la función de limpiar todos los análisis
document
  .getElementById("btnLimpiarTodoAnalisis")
  .addEventListener("click", function () {
    limpiarClusters();
  });

// TODO: CONTEO
// Variables globales para el conteo en zonas
let conteoResultadosLayer = L.layerGroup().addTo(map);

// Configurar el botón de conteo de entidades
document
  .getElementById("btnContarEntidades")
  .addEventListener("click", function () {
    contarEntidadesEnZonas();
  });

// Función para contar entidades dentro de zonas seleccionadas
function contarEntidadesEnZonas() {
  // Verificar si hay polígonos seleccionados
  if (poligonosSeleccionados.size === 0) {
    alert(
      "Por favor, selecciona al menos un polígono (parque) para contar entidades."
    );
    return;
  }

  // Verificar si hay puntos en la capa de atracciones
  if (atraccionesLayer.getLayers().length === 0) {
    alert("No hay atracciones cargadas para contar.");
    return;
  }

  // Limpiar resultados anteriores
  conteoResultadosLayer.clearLayers();

  // Resultados para mostrar en el panel
  let resultadosHTML = '<div class="conteo-resultados">';
  let totalEntidades = 0;

  // Para cada polígono seleccionado
  poligonosSeleccionados.forEach((poligono) => {
    // Convertir el polígono de Leaflet a formato GeoJSON para usar con turf.js
    const poligonoGeoJSON = poligono.toGeoJSON();
    const poligonoFeature = poligonoGeoJSON.features
      ? poligonoGeoJSON.features[0]
      : poligonoGeoJSON;
    console.log(poligonoGeoJSON);
    // Obtener el nombre del parque desde el popup si está disponible
    let nombrePoligono = "Polígono seleccionado";
    try {
      // Intentar extraer el nombre del contenido del popup
      const popupContent = poligono.getPopup().getContent();
      const matchNombre = popupContent.match(/<h3>(.*?)<\/h3>/);
      if (matchNombre && matchNombre[1]) {
        nombrePoligono = matchNombre[1];
      }
    } catch (e) {
      // Si no hay popup o falla la extracción, usar nombre genérico
      nombrePoligono = `Parque ${
        [...poligonosSeleccionados].indexOf(poligono) + 1
      }`;
    }

    // Contar atracciones dentro del polígono
    let contadorEntidades = 0;
    let entidadesEnZona = [];

    atraccionesLayer.eachLayer(function (layer) {
      const punto = layer.getLatLng();
      const puntoGeoJSON = turf.point([punto.lng, punto.lat]);

      // Comprobar si el punto está dentro del polígono usando turf.js
      if (turf.booleanPointInPolygon(puntoGeoJSON, poligonoFeature)) {
        contadorEntidades++;

        // Obtener el nombre de la atracción
        try {
          const popupContent = layer.getPopup().getContent();
          const matchNombre = popupContent.match(/<h3>(.*?)<\/h3>/);
          if (matchNombre && matchNombre[1]) {
            entidadesEnZona.push(matchNombre[1]);
          }
        } catch (e) {
          entidadesEnZona.push(`Atracción ${contadorEntidades}`);
        }
      }
    });

    // Actualizar el total
    totalEntidades += contadorEntidades;

    // Cambiar el estilo del polígono para mostrar el resultado visualmente
    const densidad = calcularDensidadColor(contadorEntidades);

    poligono.setStyle({
      fillColor: densidad.color,
      fillOpacity: 0.6,
      color: "#000",
      weight: 2,
    });

    // Crear una etiqueta con el número de entidades
    const centro = poligono.getBounds().getCenter();
    const marcadorConteo = L.marker(centro, {
      icon: L.divIcon({
        html: `<div class="count-marker">${contadorEntidades}</div>`,
        className: "count-marker-container",
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      }),
    }).addTo(conteoResultadosLayer);

    // Crear popup con detalles de las entidades encontradas
    if (contadorEntidades > 0) {
      marcadorConteo.bindPopup(`
                <div class="popup-content">
                    <h3>Entidades en ${nombrePoligono}</h3>
                    <p><strong>Total:</strong> ${contadorEntidades} atracciones</p>
                    <p><strong>Listado:</strong></p>
                    <ul>${entidadesEnZona
                      .map((nombre) => `<li>${nombre}</li>`)
                      .join("")}</ul>
                </div>
            `);
    }

    // Añadir a los resultados HTML
    resultadosHTML += `
            <div class="conteo-item">
                <div class="conteo-zona" style="background-color: ${densidad.color}20;">
                    <span class="zona-nombre">${nombrePoligono}</span>
                    <span class="zona-contador">${contadorEntidades}</span>
                </div>
            </div>
        `;
  });

  // Cerrar y completar los resultados HTML
  resultadosHTML += `
        <div class="conteo-total">
            <span>Total global:</span>
            <span>${totalEntidades}</span>
        </div>
    </div>`;

  // Mostrar los resultados en el panel
  document.getElementById("countResult").innerHTML = resultadosHTML;

  // Ajustar la vista del mapa para mostrar todos los polígonos seleccionados
  const bounds = L.latLngBounds([]);
  poligonosSeleccionados.forEach((poligono) => {
    bounds.extend(poligono.getBounds());
  });
  map.fitBounds(bounds, { padding: [50, 50] });
}

// Función para calcular un color basado en la densidad de entidades
function calcularDensidadColor(contador) {
  // Escala de colores según densidad
  if (contador === 0) {
    return { color: "#f0f0f0", label: "Sin atracciones" }; // Gris claro
  } else if (contador <= 3) {
    return { color: "#4ade80", label: "Baja densidad" }; // Verde
  } else if (contador <= 7) {
    return { color: "#fbbf24", label: "Densidad media" }; // Amarillo
  } else {
    return { color: "#ef4444", label: "Alta densidad" }; // Rojo
  }
}

// Agregar el conteo de zonas a la función de limpiar todos los análisis
document
  .getElementById("btnLimpiarTodoAnalisis")
  .addEventListener("click", function () {
    // Limpiar la capa de resultados de conteo
    conteoResultadosLayer.clearLayers();

    // Restaurar estilos originales de los polígonos
    poligonosSeleccionados.forEach((poligono) => {
      poligono.setStyle(colorSeleccionado);
    });

    // Restablecer el panel de resultados
    document.getElementById("countResult").innerHTML =
      "Selecciona un polígono para contar entidades";
  });

// TODO: CENTROIDES
// Variables globales para manejar centroides
let centroidesLayer = L.layerGroup().addTo(map);

// Configuración de los botones para el cálculo de centroides
document
  .getElementById("btnCalcularCentroides")
  .addEventListener("click", function () {
    calcularCentroides();
  });

document
  .getElementById("btnLimpiarCentroides")
  .addEventListener("click", function () {
    limpiarCentroides();
  });

// Función para calcular los centroides de polígonos seleccionados
function calcularCentroides() {
  // Verificar si hay polígonos seleccionados
  if (poligonosSeleccionados.size === 0) {
    // Si no hay ninguno seleccionado, intentar usar todos los polígonos disponibles
    if (listaPoligonos.length === 0) {
      alert(
        "No hay polígonos para calcular centroides. Por favor, dibuja o selecciona al menos un polígono."
      );
      return;
    }

    // Usar todos los polígonos disponibles
    listaPoligonos.forEach((poligono) => {
      calcularYMostrarCentroide(poligono);
    });

    alert(
      `Se han calculado los centroides de todos los polígonos (${listaPoligonos.length}).`
    );
  } else {
    // Calcular centroides solo para los polígonos seleccionados
    poligonosSeleccionados.forEach((poligono) => {
      calcularYMostrarCentroide(poligono);
    });

    alert(
      `Se han calculado los centroides de los polígonos seleccionados (${poligonosSeleccionados.size}).`
    );
  }
}

// Función para calcular y mostrar el centroide de un polígono
function calcularYMostrarCentroide(poligono) {
  let coords;

  // Si es una capa GeoJSON contenedora, obtener el primer sub-layer
  if (poligono instanceof L.GeoJSON) {
    const layers = poligono.getLayers();
    if (layers.length > 0) {
      poligono = layers[0]; // Usamos el primer sub-layer real
    } else {
      console.warn("GeoJSON sin capas internas");
      return;
    }
  }

  if (poligono instanceof L.Rectangle) {
    const bounds = poligono.getBounds();
    const corners = [
      bounds.getNorthWest(),
      bounds.getNorthEast(),
      bounds.getSouthEast(),
      bounds.getSouthWest(),
    ];

    coords = poligono.getLatLngs()[0].map((latlng) => [latlng.lng, latlng.lat]);

    // Asegurar que el anillo esté cerrado
    if (
      coords.length > 0 &&
      (coords[0][0] !== coords[coords.length - 1][0] ||
        coords[0][1] !== coords[coords.length - 1][1])
    ) {
      coords.push(coords[0]);
    }
  } else if (poligono.getLatLngs) {
    coords = poligono.getLatLngs()[0].map((latlng) => [latlng.lng, latlng.lat]);

    // Asegurar que el anillo esté cerrado para todos los polígonos
    if (
      coords.length > 0 &&
      (coords[0][0] !== coords[coords.length - 1][0] ||
        coords[0][1] !== coords[coords.length - 1][1])
    ) {
      coords.push(coords[0]);
    }
  } else {
    console.warn("El objeto no es un polígono válido:", poligono);
    return;
  }

  // Crear un objeto GeoJSON para usar con turf.js
  const poly = turf.polygon([coords]);

  // Calcular el centroide usando turf.js
  const centroid = turf.centroid(poly);

  // Extraer las coordenadas del centroide
  const centroidCoords = centroid.geometry.coordinates;

  // Crear un marcador para el centroide
  const centroidMarker = L.marker([centroidCoords[1], centroidCoords[0]], {
    icon: L.divIcon({
      html: '<i class="fas fa-crosshairs" style="color: #f97d16;"></i>',
      className: "centroid-marker",
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    }),
  }).addTo(centroidesLayer);

  // Añadir información sobre el centroide en un popup
  let popupContent = "<div class='popup-content'><h3>Centroide</h3>";

  let nombrePoligono = "Polígono";
  if (poligono._popup) {
    const popupText = poligono.getPopup().getContent();
    const nombreMatch = popupText.match(/<h3>(.*?)<\/h3>/);
    if (nombreMatch && nombreMatch[1]) {
      nombrePoligono = nombreMatch[1];
    }
  }

  const area = turf.area(poly) / 1000000; // Convertir a km²

  popupContent += `
        <p><strong>De:</strong> ${nombrePoligono}</p>
        <p><strong>Coordenadas:</strong><br>
        Latitud: ${centroidCoords[1].toFixed(6)}<br>
        Longitud: ${centroidCoords[0].toFixed(6)}</p>
        <p><strong>Área del polígono:</strong> ${area.toFixed(2)} km²</p>
    `;

  let puntoMasCercano = encontrarPuntoMasCercano(centroidCoords);
  if (puntoMasCercano) {
    popupContent += `
            <p><strong>Atracción más cercana:</strong><br>
            ${puntoMasCercano.nombre}<br>
            Distancia: ${puntoMasCercano.distancia.toFixed(2)} km</p>
        `;
  }

  popupContent += "</div>";
  centroidMarker.bindPopup(popupContent);

  // Conectar el centroide con el polígono mediante una línea punteada
  if (poligono instanceof L.Rectangle) {
    const center = poligono.getBounds().getCenter();
    L.polyline(
      [
        [centroidCoords[1], centroidCoords[0]],
        [center.lat, center.lng],
      ],
      {
        color: "#f97d16",
        weight: 1.5,
        opacity: 0.7,
        dashArray: "3, 5",
      }
    ).addTo(centroidesLayer);
  } else if (poligono instanceof L.Polygon) {
    const firstPoint = poligono.getLatLngs()[0][0];
    L.polyline(
      [
        [centroidCoords[1], centroidCoords[0]],
        [firstPoint.lat, firstPoint.lng],
      ],
      {
        color: "#f97d16",
        weight: 1.5,
        opacity: 0.7,
        dashArray: "3, 5",
      }
    ).addTo(centroidesLayer);
  }

  return centroidMarker;
}

// Función para encontrar el punto (atracción) más cercano al centroide
function encontrarPuntoMasCercano(centroidCoords) {
  let puntoMasCercano = null;
  let distanciaMinima = Infinity;

  // Verificar que la capa de atracciones existe y tiene elementos
  if (atraccionesLayer && atraccionesLayer.getLayers().length > 0) {
    // Convertir el centroide a un punto turf para cálculos de distancia
    const centroidPoint = turf.point(centroidCoords);

    // Iterar sobre todas las atracciones
    atraccionesLayer.eachLayer(function (layer) {
      if (layer.getLatLng) {
        const latlng = layer.getLatLng();
        const punto = turf.point([latlng.lng, latlng.lat]);
        const distancia = turf.distance(centroidPoint, punto, {
          units: "kilometers",
        });

        // Actualizar si encontramos un punto más cercano
        if (distancia < distanciaMinima) {
          distanciaMinima = distancia;

          // Intentar obtener el nombre de la atracción
          let nombre = "Atracción";
          if (layer.getPopup) {
            const popupContent = layer.getPopup().getContent();
            const match = popupContent.match(/<h3>(.*?)<\/h3>/);
            if (match && match[1]) {
              nombre = match[1];
            }
          }

          puntoMasCercano = {
            layer: layer,
            nombre: nombre,
            distancia: distancia,
          };
        }
      }
    });
  }

  return puntoMasCercano;
}

// Función para limpiar todos los centroides
function limpiarCentroides() {
  centroidesLayer.clearLayers();
}

// Añadir los centroides a las capas que se limpian con "Limpiar Todos los Análisis"
document
  .getElementById("btnLimpiarTodoAnalisis")
  .addEventListener("click", function () {
    limpiarCentroides();
  });

// Añadir estilos CSS para los centroides
const style = document.createElement("style");
style.textContent = `
.centroid-marker {
    background: transparent;
    border: none;
}

.centroid-marker i {
    font-size: 18px;
    text-shadow: 0 0 3px white, 0 0 5px white;
}

.centroid-marker:hover {
    transform: scale(1.2);
    transition: transform 0.2s;
}
`;
document.head.appendChild(style);

// TODO: VECINOS DENTRO DE UN RADIO
// Variables globales para la funcionalidad de vecinos cercanos
let vecinosCercanosActivo = false;
let puntoOrigenVecinos = null;
let capaVecinos = L.layerGroup().addTo(map);
let lineasVecinos = L.layerGroup().addTo(map);
let marcadorOrigenVecinos = null;

// Configurar los botones de vecinos cercanos
document
  .getElementById("btnBuscarVecinos")
  .addEventListener("click", function () {
    activarBusquedaVecinos();
  });

document
  .getElementById("btnLimpiarVecinos")
  .addEventListener("click", function () {
    limpiarVecinos();
  });

// Función para activar la búsqueda de vecinos cercanos
function activarBusquedaVecinos() {
  // Si ya está activo, desactivarlo
  if (vecinosCercanosActivo) {
    desactivarBusquedaVecinos();
    return;
  }

  // Verificar si hay atracciones cargadas
  if (atraccionesLayer.getLayers().length === 0) {
    alert("No hay atracciones cargadas para buscar vecinos.");
    return;
  }

  // Activar modo búsqueda
  vecinosCercanosActivo = true;

  // Cambiar estilo del botón para indicar modo activo
  document.getElementById("btnBuscarVecinos").classList.add("active-mode");
  document.getElementById("btnBuscarVecinos").textContent = "Cancelar Búsqueda";

  // Cambiar el cursor para indicar modo de selección
  document.getElementById("map").style.cursor = "crosshair";

  // Mostrar mensaje al usuario
  alert(
    "Haz clic en una atracción para buscar vecinos cercanos dentro del radio especificado."
  );

  // Añadir event listener a los marcadores de atracciones
  atraccionesLayer.eachLayer(function (layer) {
    layer.on("click", onMarkerClickForVecinos);
  });

  // Habilitar selección desde la lista de atracciones
  document
    .querySelectorAll("#pointsList .point-item")
    .forEach((item, index) => {
      item.classList.add("clickable-for-vecinos");

      // Añadir evento de clic temporal
      item.addEventListener(
        "click",
        function vecinosPointClick(e) {
          e.stopPropagation(); // Evitar propagación a otros handlers

          const layers = atraccionesLayer.getLayers();
          if (index < layers.length) {
            const marker = layers[index];
            onMarkerClickForVecinos({ target: marker });

            // Marcar visualmente el punto seleccionado
            document
              .querySelectorAll("#pointsList .point-item")
              .forEach((el) => {
                el.classList.remove("vecinos-origin");
              });
            this.classList.add("vecinos-origin");
          }

          // Después de seleccionar un punto, desactivar esto para evitar múltiples selecciones
          desactivarBusquedaVecinos(false); // false = no limpiar resultados
        },
        { once: true }
      );
    });
}

// Función para manejar clics en marcadores para buscar vecinos
function onMarkerClickForVecinos(e) {
  const marker = e.target;
  const radio = parseFloat(document.getElementById("vecinosRadius").value);

  // Limpiar resultados anteriores
  capaVecinos.clearLayers();
  lineasVecinos.clearLayers();

  if (marcadorOrigenVecinos) {
    map.removeLayer(marcadorOrigenVecinos);
  }

  // Guardar punto de origen
  const latlng = marker.getLatLng();
  puntoOrigenVecinos = {
    latlng: latlng,
    nombre: marker
      .getPopup()
      .getContent()
      .match(/<h3>(.*?)<\/h3>/)[1],
  };

  // Crear marcador especial para el punto de origen
  marcadorOrigenVecinos = L.marker(latlng, {
    icon: L.divIcon({
      html: `<div class="origin-marker"><i class="fas fa-search"></i></div>`,
      className: "origin-marker-container",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    }),
  }).addTo(capaVecinos);

  marcadorOrigenVecinos
    .bindPopup(
      `
        <div class="popup-content">
            <h3>Punto de origen</h3>
            <p>${puntoOrigenVecinos.nombre}</p>
            <p>Buscando vecinos en un radio de ${radio} km</p>
        </div>
    `
    )
    .openPopup();

  // Buscar vecinos
  buscarVecinosCercanos(latlng, radio);
}

// Función para buscar atracciones cercanas dentro de un radio
function buscarVecinosCercanos(latlng, radioKm) {
  const puntoOrigen = turf.point([latlng.lng, latlng.lat]);
  const vecinos = [];

  // Crear círculo visual para el radio de búsqueda
  const circuloRadio = L.circle(latlng, {
    radius: radioKm * 1000, // convertir km a metros
    color: "#3388ff",
    weight: 1,
    opacity: 0.6,
    fillColor: "#3388ff",
    fillOpacity: 0.1,
  }).addTo(capaVecinos);

  // Buscar atracciones dentro del radio
  atraccionesLayer.eachLayer(function (layer) {
    // Evitar el punto de origen
    if (layer.getLatLng().equals(latlng)) {
      return;
    }

    const puntoDestino = turf.point([
      layer.getLatLng().lng,
      layer.getLatLng().lat,
    ]);
    const distancia = turf.distance(puntoOrigen, puntoDestino, {
      units: "kilometers",
    });

    // Si está dentro del radio, añadirlo a los resultados
    if (distancia <= radioKm) {
      const nombreAtraccion = layer
        .getPopup()
        .getContent()
        .match(/<h3>(.*?)<\/h3>/)[1];

      vecinos.push({
        marker: layer,
        nombre: nombreAtraccion,
        distancia: distancia,
      });

      // Dibujar línea al vecino
      const linea = L.polyline([latlng, layer.getLatLng()], {
        color: "#33cc33",
        weight: 2,
        opacity: 0.7,
        dashArray: "4, 8",
      }).addTo(lineasVecinos);

      // Añadir etiqueta de distancia
      const puntoMedio = L.latLng(
        (latlng.lat + layer.getLatLng().lat) / 2,
        (latlng.lng + layer.getLatLng().lng) / 2
      );

      const etiquetaDistancia = L.marker(puntoMedio, {
        icon: L.divIcon({
          html: `<div class="distance-label-small">${distancia.toFixed(
            2
          )} km</div>`,
          className: "distance-label-container-small",
          iconSize: [60, 20],
          iconAnchor: [30, 10],
        }),
      }).addTo(capaVecinos);

      // Resaltar el marcador vecino
      const iconoOriginal = layer.getIcon();
      layer.setIcon(
        L.divIcon({
          html: `<div class="vecino-marker"><i class="fas fa-star"></i></div>`,
          className: "vecino-marker-container",
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        })
      );

      // Guardar el ícono original para restaurarlo después
      layer._iconoOriginal = iconoOriginal;
    }
  });

  // Mostrar resultados en el panel
  mostrarResultadosVecinos(vecinos);

  // Ajustar vista para mostrar todos los vecinos
  if (vecinos.length > 0) {
    const grupo = L.featureGroup([
      ...vecinos.map((v) => v.marker),
      marcadorOrigenVecinos,
    ]);
    map.fitBounds(grupo.getBounds(), { padding: [50, 50] });
  }

  return vecinos;
}

// Función para mostrar los resultados de los vecinos en el panel
function mostrarResultadosVecinos(vecinos) {
  // Ordenar por distancia
  vecinos.sort((a, b) => a.distancia - b.distancia);

  // Crear HTML para mostrar resultados
  let resultadosHTML = "";

  if (vecinos.length === 0) {
    resultadosHTML = `<p>No se encontraron atracciones dentro del radio de ${
      document.getElementById("vecinosRadius").value
    } km.</p>`;
  } else {
    resultadosHTML = `
            <p>Se encontraron <strong>${
              vecinos.length
            }</strong> atracciones dentro del radio de ${
      document.getElementById("vecinosRadius").value
    } km desde <strong>${puntoOrigenVecinos.nombre}</strong>:</p>
            <div class="vecinos-list">
        `;

    vecinos.forEach((vecino, index) => {
      resultadosHTML += `
                <div class="vecino-item">
                    <div class="vecino-number">${index + 1}</div>
                    <div class="vecino-details">
                        <div class="vecino-name">${vecino.nombre}</div>
                        <div class="vecino-distance">${vecino.distancia.toFixed(
                          2
                        )} km</div>
                    </div>
                </div>
            `;
    });

    resultadosHTML += "</div>";
  }

  // Mostrar en un elemento flotante en el mapa
  const resultadosContainer = L.control({ position: "bottomright" });

  resultadosContainer.onAdd = function () {
    const div = L.DomUtil.create("div", "vecinos-results-container");
    div.innerHTML = `
            <div class="vecinos-results-header">
                <h3>Vecinos Cercanos</h3>
                <span class="close-btn">×</span>
            </div>
            <div class="vecinos-results-content">
                ${resultadosHTML}
            </div>
        `;

    // Manejar cierre del panel
    div.querySelector(".close-btn").addEventListener("click", function () {
      map.removeControl(resultadosContainer);
    });

    return div;
  };

  resultadosContainer.addTo(map);

  // También mostrar en el panel lateral si existe
  const resultadoPanel = document.querySelector("#vecinosResult");
  if (resultadoPanel) {
    resultadoPanel.innerHTML = resultadosHTML;
  }
}

// Función para desactivar la búsqueda de vecinos
function desactivarBusquedaVecinos(limpiarResultados = true) {
  vecinosCercanosActivo = false;

  // Restaurar estilo del botón
  document.getElementById("btnBuscarVecinos").classList.remove("active-mode");
  document.getElementById("btnBuscarVecinos").textContent = "Buscar Vecinos";

  // Restaurar cursor
  document.getElementById("map").style.cursor = "";

  // Remover event listeners de los marcadores
  atraccionesLayer.eachLayer(function (layer) {
    layer.off("click", onMarkerClickForVecinos);
  });

  // Remover clase de seleccionable para vecinos
  document.querySelectorAll("#pointsList .point-item").forEach((item) => {
    item.classList.remove("clickable-for-vecinos");
  });

  // Si se solicita limpiar resultados, hacerlo
  if (limpiarResultados) {
    limpiarVecinos();
  }
}

// Función para limpiar todos los resultados de vecinos
function limpiarVecinos() {
  // Limpiar capas
  capaVecinos.clearLayers();
  lineasVecinos.clearLayers();

  // Restaurar íconos originales de los marcadores
  atraccionesLayer.eachLayer(function (layer) {
    if (layer._iconoOriginal) {
      layer.setIcon(layer._iconoOriginal);
      delete layer._iconoOriginal;
    }
  });

  // Limpiar variables
  puntoOrigenVecinos = null;
  marcadorOrigenVecinos = null;

  // Remover marcadores visuales de puntos seleccionados
  document.querySelectorAll("#pointsList .point-item").forEach((item) => {
    item.classList.remove("vecinos-origin");
  });

  // Remover panel de resultados si existe
  const resultadosPanel = document.querySelector(".vecinos-results-container");
  if (resultadosPanel && resultadosPanel.parentNode) {
    resultadosPanel.parentNode.removeChild(resultadosPanel);
  }
}

// Añadir la funcionalidad de vecinos cercanos a la función de limpiar todos los análisis
document
  .getElementById("btnLimpiarTodoAnalisis")
  .addEventListener("click", function () {
    if (vecinosCercanosActivo) {
      desactivarBusquedaVecinos();
    } else {
      limpiarVecinos();
    }
  });

// Estilos CSS adicionales para la funcionalidad de vecinos cercanos
const estiloVecinos = document.createElement("style");
estiloVecinos.textContent = `
    .clickable-for-vecinos {
        cursor: pointer;
        transition: background-color 0.3s;
    }
    
    .clickable-for-vecinos:hover {
        background-color: rgba(51, 204, 51, 0.2);
    }
    
    .vecinos-origin {
        background-color: rgba(51, 204, 51, 0.3);
        font-weight: bold;
    }
    
    .origin-marker {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background-color: #f97d16;
        border-radius: 50%;
        color: white;
        font-size: 16px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    }
    
    .vecino-marker {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        background-color: #33cc33;
        border-radius: 50%;
        color: white;
        font-size: 14px;
        box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
    }
    
    .distance-label-small {
        background-color: white;
        padding: 2px 5px;
        border: 1px solid #33cc33;
        border-radius: 10px;
        font-size: 10px;
        color: #33cc33;
        text-align: center;
        white-space: nowrap;
    }
    
    .vecinos-results-container {
        background-color: white;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
        max-width: 300px;
        max-height: 400px;
        overflow-y: auto;
    }
    
    .vecinos-results-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        background-color: #f97d16;
        color: white;
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
    }
    
    .vecinos-results-header h3 {
        margin: 0;
        font-size: 16px;
    }
    
    .vecinos-results-header .close-btn {
        cursor: pointer;
        font-size: 18px;
        font-weight: bold;
    }
    
    .vecinos-results-content {
        padding: 10px;
    }
    
    .vecinos-list {
        margin-top: 10px;
    }
    
    .vecino-item {
        display: flex;
        align-items: center;
        margin-bottom: 5px;
        padding: 5px;
        border-bottom: 1px solid #eee;
    }
    
    .vecino-number {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background-color: #33cc33;
        color: white;
        font-weight: bold;
        margin-right: 10px;
    }
    
    .vecino-details {
        flex: 1;
    }
    
    .vecino-name {
        font-weight: bold;
    }
    
    .vecino-distance {
        font-size: 12px;
        color: #666;
    }
`;

document.head.appendChild(estiloVecinos);

// TODO: Interseccion
// Variables globales para manejar la intersección de polígonos
let interseccionLayer = L.layerGroup().addTo(map);
let interseccionResultado = null;

// Configuración de los botones para la intersección de polígonos
document
  .getElementById("btnCalcularInterseccion")
  .addEventListener("click", function () {
    calcularInterseccion();
  });

document
  .getElementById("btnLimpiarInterseccion")
  .addEventListener("click", function () {
    limpiarInterseccion();
  });

// Función para calcular la intersección entre los polígonos seleccionados
function calcularInterseccion() {
  // Verificar si hay al menos dos polígonos seleccionados
  if (poligonosSeleccionados.size < 2) {
    alert("Selecciona al menos dos polígonos para calcular la intersección.");
    document.getElementById("intersectionResult").innerHTML =
      "Debes seleccionar al menos dos polígonos.";
    return;
  }

  // Limpiar resultados anteriores
  limpiarInterseccion();

  // Convertir todos los polígonos seleccionados a formato GeoJSON para turf.js
  const poligonosGeoJSON = [];
  poligonosSeleccionados.forEach((poligono) => {
    // Obtener las coordenadas del polígono de Leaflet
    let coordenadas;

    // Si es una capa GeoJSON contenedora, obtener el primer sub-layer
    if (poligono instanceof L.GeoJSON) {
      const layers = poligono.getLayers();
      if (layers.length > 0) {
        poligono = layers[0]; // usamos la geometría real
      } else {
        console.warn("GeoJSON sin capas internas");
        return;
      }
    }

    // Ahora sí, extraer coordenadas si es un polígono válido
    if (poligono.getLatLngs) {
      coordenadas = poligono
        .getLatLngs()[0]
        .map((latlng) => [latlng.lng, latlng.lat]);

      // Asegurarse de cerrar el anillo
      if (
        coordenadas[0][0] !== coordenadas[coordenadas.length - 1][0] ||
        coordenadas[0][1] !== coordenadas[coordenadas.length - 1][1]
      ) {
        coordenadas.push(coordenadas[0]);
      }

      // Crear objeto GeoJSON para turf.js
      const turfPolygon = turf.polygon([coordenadas]);
      poligonosGeoJSON.push(turfPolygon);
    } else {
      console.warn("El objeto no es un polígono válido:", poligono);
    }

    // Asegurarse que el polígono está cerrado (el último punto igual al primero)
    if (
      coordenadas[0][0] !== coordenadas[coordenadas.length - 1][0] ||
      coordenadas[0][1] !== coordenadas[coordenadas.length - 1][1]
    ) {
      coordenadas.push([coordenadas[0][0], coordenadas[0][1]]);
    }

    // Crear objeto GeoJSON para turf.js
    const turfPolygon = turf.polygon([coordenadas]);
    poligonosGeoJSON.push(turfPolygon);
  });

  // Comenzar con el primer polígono como base
  let intersection = poligonosGeoJSON[0];
  let hayInterseccion = true;

  // Calcular la intersección secuencialmente con cada polígono
  for (let i = 1; i < poligonosGeoJSON.length; i++) {
    try {
      const tempIntersection = turf.intersect(
        intersection,
        poligonosGeoJSON[i]
      );
      if (tempIntersection === null) {
        hayInterseccion = false;
        break;
      }
      intersection = tempIntersection;
    } catch (error) {
      console.error("Error al calcular intersección:", error);
      hayInterseccion = false;
      break;
    }
  }

  // Mostrar resultado
  if (!hayInterseccion || intersection === null) {
    document.getElementById("intersectionResult").innerHTML =
      "No hay intersección entre los polígonos seleccionados.";
    return;
  }

  // Guardar resultado para uso posterior
  interseccionResultado = intersection;

  // Mostrar la intersección en el mapa
  const intersectionLayer = L.geoJSON(intersection, {
    style: {
      color: "#ff00ff", // Color magenta para destacar la intersección
      weight: 3,
      opacity: 0.9,
      fillColor: "#ff00ff",
      fillOpacity: 0.4,
    },
  }).addTo(interseccionLayer);

  // Calcular el área de la intersección
  const area = turf.area(intersection) / 1000000; // Convertir de m² a km²

  // Actualizar el resultado en el panel
  document.getElementById("intersectionResult").innerHTML = `
        <strong>Intersección encontrada</strong><br>
        <strong>Área:</strong> ${area.toFixed(2)} km²<br>
        <strong>Polígonos:</strong> ${poligonosSeleccionados.size}
    `;

  // Añadir popup al polígono de intersección
  intersectionLayer
    .bindPopup(
      `
        <div class="popup-content">
            <h3>Intersección de Polígonos</h3>
            <p><strong>Área:</strong> ${area.toFixed(2)} km²</p>
            <p><strong>Polígonos involucrados:</strong> ${
              poligonosSeleccionados.size
            }</p>
        </div>
    `
    )
    .openPopup();

  // Centrar el mapa en la intersección
  map.fitBounds(intersectionLayer.getBounds());
}

// Función para limpiar los resultados de intersección
function limpiarInterseccion() {
  interseccionLayer.clearLayers();
  interseccionResultado = null;
  document.getElementById("intersectionResult").innerHTML =
    "Selecciona dos o más polígonos para encontrar su intersección";
}

// Añadir la función de intersección al botón "Limpiar Todos los Análisis"
document
  .getElementById("btnLimpiarTodoAnalisis")
  .addEventListener("click", function () {
    limpiarInterseccion();
    // Las demás funciones de limpieza ya están implementadas en el código original
  });

// Mejorar la función existente de toggleSeleccion para actualizar el mensaje de intersección
const originalToggleSeleccion = toggleSeleccion;
toggleSeleccion = function (poligono) {
  originalToggleSeleccion(poligono);

  // Actualizar el mensaje según el número de polígonos seleccionados
  const conteo = poligonosSeleccionados.size;
  if (conteo === 0) {
    document.getElementById("intersectionResult").innerHTML =
      "Selecciona dos o más polígonos para encontrar su intersección";
  } else if (conteo === 1) {
    document.getElementById("intersectionResult").innerHTML =
      "Selecciona al menos un polígono más para calcular la intersección";
  } else {
    document.getElementById(
      "intersectionResult"
    ).innerHTML = `${conteo} polígonos seleccionados. Presiona "Calcular Intersección"`;
  }
};

// Variables globales para filtrado
let todasLasAtracciones = []; // Almacena todas las atracciones sin filtrar
let filtrosActivos = {
  tipo: "",
  intensidad: "",
  capacidadMin: 0,
  alturaMinima: 0,
  estados: ["Operativa", "Mantenimiento", "Cerrada temporalmente"],
  parque: "",
};

// Función para inicializar los filtros
function inicializarFiltros() {
  // Evento para el slider de altura mínima
  const sliderAltura = document.getElementById("filtroAlturaSlider");
  const alturaValorDisplay = document.getElementById("alturaValor");

  if (sliderAltura && alturaValorDisplay) {
    sliderAltura.addEventListener("input", function () {
      alturaValorDisplay.textContent = `${this.value} cm`;
      filtrosActivos.alturaMinima = parseInt(this.value);
    });
  }

  // Manejar cambios en los filtros de tipo y intensidad
  document
    .getElementById("filtroTipo")
    ?.addEventListener("change", function () {
      filtrosActivos.tipo = this.value;
    });

  document
    .getElementById("filtroIntensidad")
    ?.addEventListener("change", function () {
      filtrosActivos.intensidad = this.value;
    });

  // Manejar cambios en capacidad mínima
  document
    .getElementById("filtroCapacidadMin")
    ?.addEventListener("input", function () {
      filtrosActivos.capacidadMin = this.value ? parseInt(this.value) : 0;
    });

  // Manejar cambios en los checkboxes de estado
  document.querySelectorAll(".filtroEstado").forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      actualizarFiltrosEstado();
    });
  });

  // Cambios en el filtro de parque
  document
    .getElementById("filtroParque")
    ?.addEventListener("change", function () {
      filtrosActivos.parque = this.value;
    });

  // Botón para aplicar filtros
  document
    .getElementById("btnAplicarFiltros")
    ?.addEventListener("click", aplicarFiltros);

  // Botón para limpiar filtros
  document
    .getElementById("btnLimpiarFiltros")
    ?.addEventListener("click", limpiarFiltros);
}

// Actualizar el array de estados seleccionados
function actualizarFiltrosEstado() {
  const estadosSeleccionados = [];
  document.querySelectorAll(".filtroEstado:checked").forEach((checkbox) => {
    estadosSeleccionados.push(checkbox.value);
  });
  filtrosActivos.estados = estadosSeleccionados;
}

// Función para poblar el selector de parques dinámicamente
function poblarSelectorParques() {
  const selectorParque = document.getElementById("filtroParque");
  if (!selectorParque) return;

  // Conjunto para almacenar nombres únicos de parques
  const nombresParques = new Set();

  // Obtener nombres de parques de las atracciones
  todasLasAtracciones.forEach((atraccion) => {
    if (atraccion.properties && atraccion.properties.nombre_parque) {
      nombresParques.add(atraccion.properties.nombre_parque);
    }
  });

  // Agregar opciones al selector
  nombresParques.forEach((nombre) => {
    const option = document.createElement("option");
    option.value = nombre;
    option.textContent = nombre;
    selectorParque.appendChild(option);
  });
}

// Función para aplicar filtros
function aplicarFiltros() {
  if (todasLasAtracciones.length === 0) {
    alert("No hay atracciones para filtrar.");
    return;
  }

  // Filtrar las atracciones
  const atraccionesFiltradas = todasLasAtracciones.filter((atraccion) => {
    const props = atraccion.properties;

    // Verificar todos los criterios de filtrado
    if (filtrosActivos.tipo && props.tipo !== filtrosActivos.tipo) return false;
    if (
      filtrosActivos.intensidad &&
      props.intensidad !== filtrosActivos.intensidad
    )
      return false;
    if (
      filtrosActivos.capacidadMin > 0 &&
      props.capacidad_personas < filtrosActivos.capacidadMin
    )
      return false;
    if (
      filtrosActivos.alturaMinima > 0 &&
      props.altura_minima < filtrosActivos.alturaMinima
    )
      return false;
    if (!filtrosActivos.estados.includes(props.estado)) return false;
    if (filtrosActivos.parque && props.nombre_parque !== filtrosActivos.parque)
      return false;

    return true;
  });

  // Actualizar visualización
  actualizarVisualizacionAtracciones(atraccionesFiltradas);

  // Actualizar contador de resultados
  // document.getElementById(
  //   "resultadosFiltro"
  // ).textContent = `${atraccionesFiltradas.length} de ${todasLasAtracciones.length} atracciones`;
}

// Función para limpiar todos los filtros
function limpiarFiltros() {
  // Restablecer valores de los controles de filtro
  document.getElementById("filtroTipo").value = "";
  document.getElementById("filtroIntensidad").value = "";
  document.getElementById("filtroCapacidadMin").value = "";
  document.getElementById("filtroAlturaSlider").value = 0;
  document.getElementById("alturaValor").textContent = "0 cm";
  document.getElementById("filtroParque").value = "";

  // Marcar todos los checkboxes de estado
  document.querySelectorAll(".filtroEstado").forEach((checkbox) => {
    checkbox.checked = true;
  });

  // Restablecer objeto de filtros
  filtrosActivos = {
    tipo: "",
    intensidad: "",
    capacidadMin: 0,
    alturaMinima: 0,
    estados: ["Operativa", "Mantenimiento", "Cerrada temporalmente"],
    parque: "",
  };

  // Mostrar todas las atracciones
  actualizarVisualizacionAtracciones(todasLasAtracciones);
  document.getElementById("resultadosFiltro").textContent =
    "Todas las atracciones";
}

// Función para actualizar la visualización de atracciones en el mapa y lista
function actualizarVisualizacionAtracciones(atracciones) {
  // Limpiar capas existentes
  atraccionesLayer.clearLayers();

  // Crear lista para el sidebar
  const pointsList = document.getElementById("pointsList");
  pointsList.innerHTML = ""; // Limpiar lista existente

  // Iconos por tipo de atracción
  const iconos = {
    "Montaña rusa": "fa-rocket",
    Acuática: "fa-water",
    Familiar: "fa-users",
    Espectáculo: "fa-theater-masks",
    Extrema: "fa-bolt",
    default: "fa-star",
  };

  // Colores por intensidad
  const colores = {
    Baja: "#4ade80", // verde
    Media: "#fbbf24", // amarillo
    Alta: "#ef4444", // rojo
    default: "#8b5cf6", // morado
  };

  // Agregar cada atracción filtrada al mapa
  atracciones.forEach((feature) => {
    const atraccion = feature.properties;
    const geom = feature.geometry;

    // Determinar icono y color
    const iconClass = iconos[atraccion.tipo] || iconos["default"];
    const color = colores[atraccion.intensidad] || colores["default"];

    // Crear marcador personalizado
    const iconHtml = `<i class="fas ${iconClass}" style="color: ${color};"></i>`;
    const customIcon = L.divIcon({
      html: iconHtml,
      className: "custom-div-icon",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });

    // Crear marcador y agregarlo al mapa
    const marker = L.marker([geom.coordinates[1], geom.coordinates[0]], {
      icon: customIcon,
    }).addTo(atraccionesLayer);

    // Agregar popup con información
    marker.bindPopup(`
            <div class="popup-content">
                <h3>${atraccion.nombre}</h3>
                <p><strong>Tipo:</strong> ${atraccion.tipo}</p>
                <p><strong>Intensidad:</strong> ${atraccion.intensidad}</p>
                <p><strong>Altura mínima:</strong> ${atraccion.altura_minima} cm</p>
                <p><strong>Capacidad:</strong> ${atraccion.capacidad_personas} personas</p>
                <p><strong>Duración:</strong> ${atraccion.duracion_minutos} minutos</p>
                <p><strong>Fabricante:</strong> ${atraccion.fabricante}</p>
                <p><strong>Estado:</strong> ${atraccion.estado}</p>
                <p><strong>Parque:</strong> ${atraccion.nombre_parque}</p>
            </div>
        `);

    // Agregar elemento a la lista del sidebar
    const listItem = document.createElement("li");
    listItem.className = "point-item";
    listItem.innerHTML = `
            <div class="point-icon"><i class="fas ${iconClass}" style="color: ${color};"></i></div>
            <div class="point-item-content">
                <div class="point-name">${atraccion.nombre}</div>
                <div class="point-type">${atraccion.tipo} - ${atraccion.intensidad}</div>
            </div>
            <div class="remove-btn">×</div>
        `;
    pointsList.appendChild(listItem);

    // Manejar evento de clic en botón de eliminar
    const removeBtn = listItem.querySelector(".remove-btn");
    removeBtn.addEventListener("click", function () {
      map.removeLayer(marker);
      pointsList.removeChild(listItem);
    });

    // Manejar evento de clic en el elemento de lista
    listItem.addEventListener("click", function () {
      // Deseleccionar elementos previos en la UI
      document
        .querySelectorAll(".point-item")
        .forEach((i) => i.classList.remove("selected"));
      this.classList.add("selected");

      // Centrar el mapa en esta atracción
      map.setView([geom.coordinates[1], geom.coordinates[0]], 18);
      marker.openPopup();
    });
  });

  // Asegurar que la capa esté en el mapa
  atraccionesLayer.addTo(map);

  // Si hay atracciones filtradas, ajustar vista para mostrarlas todas
  if (atracciones.length > 0) {
    const bounds = atraccionesLayer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds);
    }
  }
}

// Modificar la función cargarAtracciones para incluir el filtrado
function cargarAtracciones() {
  fetch("http://localhost:3000/atracciones")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Datos de atracciones recibidos:", data);

      // Guardar todas las atracciones para filtrado
      todasLasAtracciones = data.features;

      // Poblar el selector de parques
      poblarSelectorParques();

      // Mostrar todas las atracciones inicialmente
      actualizarVisualizacionAtracciones(todasLasAtracciones);
    })
    .catch((error) => {
      console.error("Error al cargar las atracciones:", error);
      alert(
        "Error al cargar los datos de atracciones. Por favor, verifica la conexión con el servidor."
      );
    });
}

// Inicializar filtros cuando se carga la página
document.addEventListener("DOMContentLoaded", () => {
  inicializarFiltros();
});
