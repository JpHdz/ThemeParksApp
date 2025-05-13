// Código para manejar eventos de UI
document.addEventListener("DOMContentLoaded", function () {
  // Manejo de selección de elementos de la lista
  const polygonItems = document.querySelectorAll("#polygonList li");
  polygonItems.forEach((item) => {
    item.addEventListener("click", function () {
      polygonItems.forEach((i) => i.classList.remove("selected"));
      this.classList.add("selected");
    });
  });

  // Manejo de botones de zoom
  const zoomInBtn = document.getElementById("zoomIn");
  const zoomOutBtn = document.getElementById("zoomOut");

  if (zoomInBtn) {
    zoomInBtn.addEventListener("click", function () {
      // Aquí iría la lógica para hacer zoom in en el mapa
      console.log("Zoom in");
    });
  }

  if (zoomOutBtn) {
    zoomOutBtn.addEventListener("click", function () {
      // Aquí iría la lógica para hacer zoom out en el mapa
      console.log("Zoom out");
    });
  }

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
      sidebarContents.forEach((content) => {
        content.style.display = "none";
      });

      if (tabName === "parques") {
        document.getElementById("parquesContent").style.display = "block";
      } else if (tabName === "operaciones") {
        document.getElementById("operacionesContent").style.display = "block";
      } else if (tabName === "zonas") {
        document.getElementById("zonesContent").style.display = "block";
        console.log(tabName);
      } else if (tabName === "analisis") {
        document.getElementById("analisisContent").style.display = "block";
      }
    });
  });
});

// var map = L.map("map").setView([23.6345, -102.5528], 5);

// L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//   attribution: "&copy; OpenStreetMap contributors",
// }).addTo(map);

// Variables para almacenar capas de datos
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
          <input type="checkbox"  />
          <div class="country-code">${parque.pais
            .substring(0, 2)
            .toUpperCase()}</div>
          <div class="point-item-content">
            <div class="point-name">${parque.nombre}</div>
            <div class="point-date">${parque.fecha_inauguracion}</div>
          </div>
          <div class="remove-btn">×</div>
        `;
        polygonList.appendChild(listItem);

        // Añadir polígono a la lista de polígonos
        listaPoligonos.push(polygon);
        listItem.dataset.polygonIndex = listaPoligonos.length - 1;

        // Manejar evento de clic en checkbox
        const checkbox = listItem.querySelector('input[type="checkbox"]');
        checkbox.addEventListener("change", function () {
          if (this.checked) {
            map.addLayer(polygon);
          } else {
            map.removeLayer(polygon);
          }
        });

        // Manejar evento de clic en botón de eliminar
        const removeBtn = listItem.querySelector(".remove-btn");
        removeBtn.addEventListener("click", function () {
          map.removeLayer(polygon);
          polygonList.removeChild(listItem);
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
          <input type="checkbox"  />
        
          <div class="point-item-content">
            <div class="point-name">${atraccion.nombre}</div>
            <div class="point-type">${atraccion.tipo} - ${atraccion.intensidad}</div>
          </div>
          <div class="remove-btn">×</div>
        `;
        pointsList.appendChild(listItem);

        // Manejar evento de clic en checkbox
        const checkbox = listItem.querySelector('input[type="checkbox"]');
        checkbox.addEventListener("change", function () {
          if (this.checked) {
            map.addLayer(marker);
          } else {
            map.removeLayer(marker);
          }
        });

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
// Funcionalidad para los tabs del sidebar
function setupTabs() {
  const tabs = document.querySelectorAll(".nav-tab");
  const contents = {
    parques: document.getElementById("parquesContent"),
    zonas: document.getElementById("zonesContent"),
    operaciones: document.getElementById("operacionesContent"),
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Desactivar todos los tabs
      tabs.forEach((t) => t.classList.remove("active"));
      // Ocultar todos los contenidos
      Object.values(contents).forEach((content) => {
        content.style.display = "none";
      });

      // Activar el tab seleccionado
      tab.classList.add("active");
      // Mostrar el contenido correspondiente
      const contentId = tab.getAttribute("data-tab");
      contents[contentId].style.display = "block";
    });
  });
}

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

function reemplazarFigura(original, geojson) {
  drawnItems.removeLayer(original);
  const coords = geojson.geometry.coordinates[0].map((c) => [c[1], c[0]]);
  const nuevaCapa = L.polygon(coords).addTo(drawnItems);

  // Reemplazar en la lista de polígonos
  const index = listaPoligonos.indexOf(original);
  if (index !== -1) {
    listaPoligonos[index] = nuevaCapa;
  }

  // Si estaba seleccionado, mantener la selección
  if (poligonosSeleccionados.has(original)) {
    poligonosSeleccionados.delete(original);
    poligonosSeleccionados.add(nuevaCapa);
    nuevaCapa.setStyle(colorSeleccionado);
  }

  const newArea = turf.area(geojson) / 1e6;
  nuevaCapa.bindPopup(`Área modificada: ${newArea.toFixed(2)} km²`).openPopup();

  return nuevaCapa;
}

function agregarResultado(geojson, titulo) {
  // Verificar si el resultado es nulo o vacío
  if (!geojson || geojson.geometry.coordinates.length === 0) {
    alert(
      "No hay resultado para mostrar. Los polígonos posiblemente no se intersectan."
    );
    return null;
  }

  // Convertir las coordenadas al formato que espera Leaflet
  let coords;

  // Manejar diferentes tipos de geometrías (MultiPolygon vs Polygon)
  if (geojson.geometry.type === "MultiPolygon") {
    coords = geojson.geometry.coordinates.map((polygon) =>
      polygon[0].map((c) => [c[1], c[0]])
    );
    // Crear una capa para cada polígono en el MultiPolygon
    const capas = coords.map((c) => L.polygon(c).addTo(drawnItems));
    capas.forEach((layer) => {
      layer.setStyle(colorResultado);
      listaPoligonos.push(layer);
      const area = turf.area(geojson) / 1e6;
      layer.bindPopup(`${titulo}: ${area.toFixed(2)} km²`).openPopup();
    });
    return capas[0]; // Devolvemos el primer polígono como representativo
  } else {
    // Es un polígono normal
    coords = geojson.geometry.coordinates[0].map((c) => [c[1], c[0]]);
    const nuevaCapa = L.polygon(coords).addTo(drawnItems);
    nuevaCapa.setStyle(colorResultado);
    listaPoligonos.push(nuevaCapa);

    const area = turf.area(geojson) / 1e6;
    nuevaCapa.bindPopup(`${titulo}: ${area.toFixed(2)} km²`).openPopup();
    return nuevaCapa;
  }
}

function RotarPoligono() {
  if (poligonosSeleccionados.size === 0) {
    alert("Selecciona al menos un polígono primero.");
    return;
  }

  const angle = parseFloat(document.getElementById("rotateAngle").value);
  if (isNaN(angle)) {
    alert("Por favor, ingresa un ángulo válido.");
    return;
  }

  const useCustomPivot = document.getElementById("useCustomPivot").checked;
  let pivot;

  if (useCustomPivot) {
    const lat = parseFloat(document.getElementById("pivotLat").value);
    const lng = parseFloat(document.getElementById("pivotLng").value);
    if (isNaN(lat) || isNaN(lng)) {
      alert("Ingresa una latitud y longitud válidas.");
      return;
    }
    pivot = [lng, lat];
  }

  // Crear una copia porque vamos a modificar el conjunto durante la iteración
  const poligonosATransformar = Array.from(poligonosSeleccionados);

  poligonosATransformar.forEach((poligono) => {
    let pivotFinal = pivot;

    if (!useCustomPivot) {
      // Si no se especifica un punto personalizado, usar el centroide de cada polígono
      const centroid = turf.centroid(poligono.toGeoJSON());
      pivotFinal = centroid.geometry.coordinates;
    }

    const geojson = poligono.toGeoJSON();
    const rotated = turf.transformRotate(geojson, angle, {
      pivot: pivotFinal,
    });
    reemplazarFigura(poligono, rotated);
  });

  actualizarLista();
}

listItem.addEventListener("click", function () {
  // Obtener el índice del polígono correspondiente a este elemento
  const index = listaPoligonos.indexOf(polygon);

  // Si no está seleccionado, seleccionarlo
  if (!poligonosSeleccionados.has(listaPoligonos[index])) {
    // Opcional: deseleccionar otros primero si no quieres selección múltiple
    poligonosSeleccionados.forEach((p) => {
      p.setStyle(colorNoSeleccionado);
    });
    poligonosSeleccionados.clear();

    // Seleccionar este polígono
    poligonosSeleccionados.add(listaPoligonos[index]);
    listaPoligonos[index].setStyle(colorSeleccionado);
  }

  // Actualizar la apariencia en el sidebar
  document
    .querySelectorAll(".point-item")
    .forEach((el) => el.classList.remove("selected"));
  this.classList.add("selected");
});

function TrasladarPoligono() {
  if (poligonosSeleccionados.size === 0) {
    alert("Selecciona al menos un polígono primero.");
    return;
  }

  const distance = parseFloat(
    document.getElementById("translateDistance").value
  );
  const direction = parseFloat(
    document.getElementById("translateDirection").value
  );
  if (isNaN(distance) || isNaN(direction)) {
    alert("Ingresa una distancia y dirección válidas.");
    return;
  }

  // Crear una copia porque vamos a modificar el conjunto durante la iteración
  const poligonosATransformar = Array.from(poligonosSeleccionados);

  poligonosATransformar.forEach((poligono) => {
    const geojson = poligono.toGeoJSON();
    const moved = turf.transformTranslate(geojson, distance, direction, {
      units: "kilometers",
    });
    reemplazarFigura(poligono, moved);
  });

  actualizarLista();
}

function EscalarPoligono() {
  if (poligonosSeleccionados.size === 0) {
    alert("Selecciona al menos un polígono primero.");
    return;
  }

  const factor = parseFloat(document.getElementById("scaleFactor").value);
  if (isNaN(factor)) {
    alert("Ingresa un factor de escala válido.");
    return;
  }

  // Crear una copia porque vamos a modificar el conjunto durante la iteración
  const poligonosATransformar = Array.from(poligonosSeleccionados);

  poligonosATransformar.forEach((poligono) => {
    const geojson = poligono.toGeoJSON();
    const scaled = turf.transformScale(geojson, factor, {
      origin: "centroid",
    });
    reemplazarFigura(poligono, scaled);
  });

  actualizarLista();
}

// Nuevas funciones para operaciones de polígonos

function calcularInterseccion() {
  if (poligonosSeleccionados.size !== 2) {
    alert(
      "Debes seleccionar exactamente 2 polígonos para calcular la intersección."
    );
    return;
  }

  const poligonos = Array.from(poligonosSeleccionados);
  const poly1 = poligonos[0].toGeoJSON();
  const poly2 = poligonos[1].toGeoJSON();

  try {
    const intersection = turf.intersect(poly1, poly2);
    if (intersection) {
      const resultado = agregarResultado(intersection, "Intersección");
      if (resultado) {
        // Limpiar selecciones previas
        poligonosSeleccionados.forEach((poligono) => {
          poligono.setStyle(colorNoSeleccionado);
        });
        poligonosSeleccionados.clear();

        // Seleccionar el nuevo polígono resultado
        poligonosSeleccionados.add(resultado);
        actualizarLista();
      }
    } else {
      alert("No hay intersección entre los polígonos seleccionados.");
    }
  } catch (error) {
    console.error("Error al calcular intersección:", error);
    alert(
      "Error al calcular la intersección. Verifica que los polígonos sean válidos."
    );
  }
}

function calcularUnion() {
  if (poligonosSeleccionados.size < 2) {
    alert("Debes seleccionar al menos 2 polígonos para calcular la unión.");
    return;
  }

  try {
    const poligonos = Array.from(poligonosSeleccionados);
    let unionResult = poligonos[0].toGeoJSON();

    // Unir todos los polígonos secuencialmente
    for (let i = 1; i < poligonos.length; i++) {
      const nextPoly = poligonos[i].toGeoJSON();
      unionResult = turf.union(unionResult, nextPoly);
    }

    const resultado = agregarResultado(unionResult, "Unión");
    if (resultado) {
      // Limpiar selecciones previas
      poligonosSeleccionados.forEach((poligono) => {
        poligono.setStyle(colorNoSeleccionado);
      });
      poligonosSeleccionados.clear();

      // Seleccionar el nuevo polígono resultado
      poligonosSeleccionados.add(resultado);
      actualizarLista();
    }
  } catch (error) {
    console.error("Error al calcular unión:", error);
    alert(
      "Error al calcular la unión. Verifica que los polígonos sean válidos."
    );
  }
}

function simplificarPoligono() {
  if (poligonosSeleccionados.size === 0) {
    alert("Selecciona al menos un polígono para simplificar.");
    return;
  }

  const tolerancia = parseFloat(
    document.getElementById("simplifyTolerance").value
  );
  if (isNaN(tolerancia) || tolerancia <= 0) {
    alert("Ingresa un valor de tolerancia válido mayor que cero.");
    return;
  }

  // Crear una copia porque vamos a modificar el conjunto durante la iteración
  const poligonosATransformar = Array.from(poligonosSeleccionados);

  poligonosATransformar.forEach((poligono) => {
    try {
      const geojson = poligono.toGeoJSON();
      const simplified = turf.simplify(geojson, {
        tolerance: tolerancia,
        highQuality: true,
      });

      // Calcular estadísticas para mostrar en popup
      const originalVertices = turf.coordAll(geojson).length;
      const simplifiedVertices = turf.coordAll(simplified).length;
      const porcentajeReduccion = (
        ((originalVertices - simplifiedVertices) / originalVertices) *
        100
      ).toFixed(1);

      const nuevaFigura = reemplazarFigura(poligono, simplified);
      nuevaFigura
        .bindPopup(
          `Polígono simplificado:<br>
              Vértices originales: ${originalVertices}<br>
              Vértices nuevos: ${simplifiedVertices}<br>
              Reducción: ${porcentajeReduccion}%`
        )
        .openPopup();
    } catch (error) {
      console.error("Error al simplificar:", error);
      alert("Error al simplificar el polígono. Verifica que sea válido.");
    }
  });

  actualizarLista();
}

// Código para manejar eventos de UI
document.addEventListener("DOMContentLoaded", function () {
  // Manejo de selección de elementos de la lista
  const polygonItems = document.querySelectorAll("#polygonList li");
  polygonItems.forEach((item) => {
    item.addEventListener("click", function () {
      polygonItems.forEach((i) => i.classList.remove("selected"));
      this.classList.add("selected");
    });
  });

  // Manejo de botones de zoom
  const zoomInBtn = document.getElementById("zoomIn");
  const zoomOutBtn = document.getElementById("zoomOut");

  if (zoomInBtn) {
    zoomInBtn.addEventListener("click", function () {
      // Aquí iría la lógica para hacer zoom in en el mapa
      console.log("Zoom in");
    });
  }

  if (zoomOutBtn) {
    zoomOutBtn.addEventListener("click", function () {
      // Aquí iría la lógica para hacer zoom out en el mapa
      console.log("Zoom out");
    });
  }

  // Manejo de botones de pestañas
  const navTabs = document.querySelectorAll(".nav-tab");
  navTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      navTabs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");
    });
  });
});
