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
      }
    });
  });
});

var map = L.map("map").setView([23.6345, -102.5528], 5);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

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
