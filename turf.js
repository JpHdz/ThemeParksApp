// // Módulo de Análisis Espacial con Turf.js
// // Para Parques Temáticos Mundial

// // Variables globales para el módulo de análisis
// let marcadoresAnalisis = [];
// let lineasAnalisis = [];
// let bufferActivo = null;
// let puntosSeleccionados = [];
// let analisisLayer = L.layerGroup();
// let clusterGroup = null;
// let radioBuffer = 2; // Radio predeterminado en km
// let resultadoAnalisisLayer = L.layerGroup();

// // Inicializar el módulo de análisis
// function inicializarModuloAnalisis() {
//   // Agregar capas al mapa
//   analisisLayer.addTo(map);
//   resultadoAnalisisLayer.addTo(map);

//   // Crear nueva pestaña para análisis
//   crearPestanaAnalisis();

//   // Inicializar eventos
//   setupEventosAnalisis();
// }

// // Crear pestaña de análisis en la interfaz
// function crearPestanaAnalisis() {
//   // Agregar la pestaña al menú de navegación
//   const navTabs = document.querySelector(".nav-tabs");
//   const analisisTab = document.createElement("div");
//   analisisTab.className = "nav-tab";
//   analisisTab.setAttribute("data-tab", "analisis");
//   analisisTab.textContent = "ANÁLISIS";
//   navTabs.appendChild(analisisTab);

//   // Crear el contenido de la pestaña
//   const sidebar = document.getElementById("sidebar");
//   const analisisContent = document.createElement("div");
//   analisisContent.className = "sidebar-content";
//   analisisContent.id = "analisisContent";
//   analisisContent.style.display = "none";

//   analisisContent.innerHTML = `
//     <div class="sidebar-title">Análisis Espacial</div>

//     <div class="sidebar-control-group">
//       <div class="control-content">
//         <div class="control-label flex-group">
//           <p>Buffer desde puntos</p>
//           <div class="control-icon"><i class="fas fa-circle-notch"></i></div>
//         </div>
//         <div class="control-input">
//           <label>Radio (km):</label>
//           <input id="bufferRadius" type="number" value="2" min="0.1" max="100" step="0.1" />
//         </div>
//         <button class="operation-btn" id="btnCrearBuffer">Crear Buffer</button>
//         <button class="operation-btn" id="btnLimpiarBuffer">Limpiar Buffer</button>
//       </div>
//     </div>

//     <div class="sidebar-control-group">
//       <div class="control-content">
//         <div class="control-label flex-group">
//           <p>Medición de distancias</p>
//           <div class="control-icon"><i class="fas fa-ruler"></i></div>
//         </div>
//         <div id="distanceResult" class="result-box">
//           Selecciona dos puntos en el mapa
//         </div>
//         <button class="operation-btn" id="btnMedirDistancia">Iniciar Medición</button>
//         <button class="operation-btn" id="btnLimpiarMedicion">Limpiar Medición</button>
//       </div>
//     </div>

//     <div class="sidebar-control-group">
//       <div class="control-content">
//         <div class="control-label flex-group">
//           <p>Agrupación (Clustering)</p>
//           <div class="control-icon"><i class="fas fa-object-group"></i></div>
//         </div>
//         <div class="control-input">
//           <label>Distancia máxima (km):</label>
//           <input id="clusterDistance" type="number" value="5" min="0.1" max="100" step="0.1" />
//         </div>
//         <button class="operation-btn" id="btnCrearClusters">Crear Clusters</button>
//         <button class="operation-btn" id="btnLimpiarClusters">Limpiar Clusters</button>
//       </div>
//     </div>

//     <div class="sidebar-control-group">
//       <div class="control-content">
//         <div class="control-label flex-group">
//           <p>Conteo en zonas</p>
//           <div class="control-icon"><i class="fas fa-calculator"></i></div>
//         </div>
//         <div id="countResult" class="result-box">
//           Selecciona un polígono para contar entidades
//         </div>
//         <button class="operation-btn" id="btnContarEntidades">Contar Entidades</button>
//       </div>
//     </div>

//     <div class="sidebar-control-group">
//       <div class="control-content">
//         <div class="control-label flex-group">
//           <p>Cálculo de centroides</p>
//           <div class="control-icon"><i class="fas fa-crosshairs"></i></div>
//         </div>
//         <button class="operation-btn" id="btnCalcularCentroides">Calcular Centroides</button>
//         <button class="operation-btn" id="btnLimpiarCentroides">Limpiar Centroides</button>
//       </div>
//     </div>

//     <div class="sidebar-control-group">
//       <div class="control-content">
//         <div class="control-label flex-group">
//           <p>Vecinos cercanos</p>
//           <div class="control-icon"><i class="fas fa-street-view"></i></div>
//         </div>
//         <div class="control-input">
//           <label>Radio de búsqueda (km):</label>
//           <input id="vecinosRadius" type="number" value="10" min="0.1" max="100" step="0.1" />
//         </div>
//         <button class="operation-btn" id="btnBuscarVecinos">Buscar Vecinos</button>
//         <button class="operation-btn" id="btnLimpiarVecinos">Limpiar Resultados</button>
//       </div>
//     </div>

//     <div class="sidebar-control-group">
//       <div class="control-content">
//         <button class="operation-btn wide-btn" id="btnLimpiarTodoAnalisis">Limpiar Todos los Análisis</button>
//       </div>
//     </div>
//   `;

//   sidebar.appendChild(analisisContent);

//   // Agregar la pestaña al sistema de navegación existente
//   document.querySelectorAll(".nav-tab").forEach((tab) => {
//     tab.addEventListener("click", function () {
//       // Desactivar todos los tabs
//       document
//         .querySelectorAll(".nav-tab")
//         .forEach((t) => t.classList.remove("active"));
//       // Ocultar todos los contenidos
//       document.querySelectorAll(".sidebar-content").forEach((content) => {
//         content.style.display = "none";
//       });

//       // Activar el tab seleccionado
//       this.classList.add("active");

//       // Mostrar el contenido correspondiente
//       const contentId = this.getAttribute("data-tab");
//       if (contentId === "analisis") {
//         document.getElementById("analisisContent").style.display = "block";
//       } else if (contentId === "parques") {
//         document.getElementById("parquesContent").style.display = "block";
//       } else if (contentId === "operaciones") {
//         document.getElementById("operacionesContent").style.display = "block";
//       } else if (contentId === "zonas") {
//         document.getElementById("zonesContent").style.display = "block";
//       }
//     });
//   });
// }

// // Configurar los eventos para los botones de análisis
// function setupEventosAnalisis() {
//   // Evento para crear buffer
//   document.getElementById("btnCrearBuffer").addEventListener("click", () => {
//     habilitarSeleccionPuntosBuffer();
//   });

//   // Evento para limpiar buffer
//   document.getElementById("btnLimpiarBuffer").addEventListener("click", () => {
//     limpiarBuffers();
//   });

//   // Evento para medir distancia
//   document.getElementById("btnMedirDistancia").addEventListener("click", () => {
//     habilitarMedicionDistancia();
//   });

//   // Evento para limpiar mediciones
//   document
//     .getElementById("btnLimpiarMedicion")
//     .addEventListener("click", () => {
//       limpiarMediciones();
//     });

//   // Evento para crear clusters
//   document.getElementById("btnCrearClusters").addEventListener("click", () => {
//     crearClusters();
//   });

//   // Evento para limpiar clusters
//   document
//     .getElementById("btnLimpiarClusters")
//     .addEventListener("click", () => {
//       limpiarClusters();
//     });

//   // Evento para contar entidades
//   document
//     .getElementById("btnContarEntidades")
//     .addEventListener("click", () => {
//       habilitarSeleccionPoligonoConteo();
//     });

//   // Evento para calcular centroides
//   document
//     .getElementById("btnCalcularCentroides")
//     .addEventListener("click", () => {
//       calcularCentroides();
//     });

//   // Evento para limpiar centroides
//   document
//     .getElementById("btnLimpiarCentroides")
//     .addEventListener("click", () => {
//       limpiarCentroides();
//     });

//   // Evento para buscar vecinos
//   document.getElementById("btnBuscarVecinos").addEventListener("click", () => {
//     habilitarSeleccionPuntoVecinos();
//   });

//   // Evento para limpiar vecinos
//   document.getElementById("btnLimpiarVecinos").addEventListener("click", () => {
//     limpiarVecinos();
//   });

//   // Evento para limpiar todos los análisis
//   document
//     .getElementById("btnLimpiarTodoAnalisis")
//     .addEventListener("click", () => {
//       limpiarTodosAnalisis();
//     });
// }

// // Cambiar el estilo de los botones para mostrar el modo activo
// function activarModoAnalisis(idBoton) {
//   // Primero, resetear todos los botones
//   document.querySelectorAll(".operation-btn").forEach((btn) => {
//     btn.classList.remove("active-mode");
//   });

//   // Activar el botón seleccionado
//   if (idBoton) {
//     document.getElementById(idBoton).classList.add("active-mode");
//   }
// }

// // Variables para el estado de la aplicación en modo análisis
// let modoAnalisisActivo = null;

// // 1. FUNCIÓN PARA CREAR BUFFER DESDE UN PUNTO
// function habilitarSeleccionPuntosBuffer() {
//   limpiarModoActual();
//   modoAnalisisActivo = "buffer";
//   activarModoAnalisis("btnCrearBuffer");

//   // Actualizar radio del buffer
//   radioBuffer = parseFloat(document.getElementById("bufferRadius").value) || 2;

//   // Cambiar el cursor para indicar modo de selección
//   map._container.style.cursor = "crosshair";

//   // Mensaje de instrucción
//   mostrarMensaje("Haz clic en el mapa para crear un buffer");
// }

// // Función para crear un buffer
// function crearBuffer(latlng) {
//   // Convertir a punto GeoJSON
//   const point = turf.point([latlng.lng, latlng.lat]);

//   // Crear buffer con turf.js
//   const buffered = turf.buffer(point, radioBuffer, { units: "kilometers" });

//   // Crear capa de Leaflet con el buffer
//   if (bufferActivo) {
//     analisisLayer.removeLayer(bufferActivo);
//   }

//   // Crear marcador en el punto seleccionado
//   const marker = L.marker(latlng).addTo(analisisLayer);
//   marker.bindPopup(`Buffer de ${radioBuffer} km`).openPopup();
//   marcadoresAnalisis.push(marker);

//   // Convertir GeoJSON a capa de Leaflet
//   bufferActivo = L.geoJSON(buffered, {
//     style: {
//       fillColor: "#3388ff",
//       fillOpacity: 0.2,
//       weight: 2,
//       color: "#3388ff",
//     },
//   }).addTo(analisisLayer);

//   // Añadir información al buffer
//   const area = turf.area(buffered) / 1000000; // Convertir a km²
//   bufferActivo.bindPopup(`Área del buffer: ${area.toFixed(2)} km²`);

//   // Mostrar mensaje
//   mostrarMensaje(
//     `Buffer creado con radio ${radioBuffer} km (${area.toFixed(2)} km²)`
//   );

//   // Desactivar modo
//   finalizarModoAnalisis();
// }

// // Limpiar todos los buffers
// function limpiarBuffers() {
//   if (bufferActivo) {
//     analisisLayer.removeLayer(bufferActivo);
//     bufferActivo = null;
//   }

//   // Eliminar marcadores relacionados con buffers
//   marcadoresAnalisis.forEach((marker) => {
//     analisisLayer.removeLayer(marker);
//   });
//   marcadoresAnalisis = [];

//   mostrarMensaje("Buffers eliminados");
// }

// // 2. FUNCIÓN PARA MEDIR DISTANCIA ENTRE PUNTOS
// function habilitarMedicionDistancia() {
//   limpiarModoActual();
//   modoAnalisisActivo = "distancia";
//   activarModoAnalisis("btnMedirDistancia");

//   // Reiniciar puntos seleccionados
//   puntosSeleccionados = [];

//   // Cambiar el cursor
//   map._container.style.cursor = "crosshair";

//   // Actualizar mensaje
//   document.getElementById("distanceResult").textContent =
//     "Selecciona el primer punto";
//   mostrarMensaje("Haz clic para seleccionar el primer punto de medición");
// }

// // Función para seleccionar punto para medición
// function seleccionarPuntoMedicion(latlng) {
//   // Crear marcador
//   const marker = L.marker(latlng).addTo(analisisLayer);
//   marcadoresAnalisis.push(marker);

//   // Agregar punto a la lista de seleccionados
//   puntosSeleccionados.push(latlng);

//   // Si tenemos dos puntos, calcular distancia
//   if (puntosSeleccionados.length === 1) {
//     document.getElementById("distanceResult").textContent =
//       "Selecciona el segundo punto";
//     mostrarMensaje("Ahora selecciona el segundo punto");
//   } else if (puntosSeleccionados.length === 2) {
//     calcularDistancia();
//     finalizarModoAnalisis();
//   }
// }

// // Calcular distancia entre dos puntos
// function calcularDistancia() {
//   const from = turf.point([
//     puntosSeleccionados[0].lng,
//     puntosSeleccionados[0].lat,
//   ]);
//   const to = turf.point([
//     puntosSeleccionados[1].lng,
//     puntosSeleccionados[1].lat,
//   ]);

//   // Calcular distancia con turf.js
//   const distancia = turf.distance(from, to, { units: "kilometers" });

//   // Crear línea entre los puntos
//   const lineString = L.polyline(
//     [puntosSeleccionados[0], puntosSeleccionados[1]],
//     {
//       color: "#ff4500",
//       weight: 3,
//       dashArray: "5, 10",
//     }
//   ).addTo(analisisLayer);

//   // Guardar la línea para poder eliminarla después
//   lineasAnalisis.push(lineString);

//   // Agregar popup con la distancia
//   lineString.bindPopup(`Distancia: ${distancia.toFixed(2)} km`).openPopup();

//   // Mostrar resultado en el panel
//   document.getElementById("distanceResult").innerHTML = `
//     <strong>Distancia:</strong> ${distancia.toFixed(2)} km<br>
//     <strong>Puntos:</strong><br>
//     1: ${puntosSeleccionados[0].lat.toFixed(
//       5
//     )}, ${puntosSeleccionados[0].lng.toFixed(5)}<br>
//     2: ${puntosSeleccionados[1].lat.toFixed(
//       5
//     )}, ${puntosSeleccionados[1].lng.toFixed(5)}
//   `;

//   mostrarMensaje(`Distancia calculada: ${distancia.toFixed(2)} km`);
// }

// // Limpiar mediciones de distancia
// function limpiarMediciones() {
//   // Eliminar marcadores
//   marcadoresAnalisis.forEach((marker) => {
//     analisisLayer.removeLayer(marker);
//   });
//   marcadoresAnalisis = [];

//   // Eliminar líneas
//   lineasAnalisis.forEach((line) => {
//     analisisLayer.removeLayer(line);
//   });
//   lineasAnalisis = [];

//   // Reiniciar puntos seleccionados
//   puntosSeleccionados = [];

//   // Reiniciar resultado
//   document.getElementById("distanceResult").textContent =
//     "Selecciona dos puntos en el mapa";

//   mostrarMensaje("Mediciones eliminadas");
// }

// // 3. FUNCIÓN PARA AGRUPACIÓN (CLUSTERING)
// function crearClusters() {
//   // Limpiar clusters anteriores
//   limpiarClusters();

//   // Obtener la distancia máxima para clustering
//   const distanciaCluster =
//     parseFloat(document.getElementById("clusterDistance").value) || 5;

//   // Recopilar todos los puntos de atracciones
//   const puntos = [];
//   let features = [];

//   // Recorrer todas las capas del mapa buscando marcadores
//   map.eachLayer((layer) => {
//     // Si es un marcador, añadirlo a la lista
//     if (layer instanceof L.Marker) {
//       const latlng = layer.getLatLng();
//       puntos.push(latlng);

//       // Crear un feature GeoJSON para este punto
//       features.push(
//         turf.point([latlng.lng, latlng.lat], {
//           nombre: layer.getPopup
//             ? (layer.getPopup()._content || "").substring(0, 30)
//             : "Sin nombre",
//         })
//       );
//     }
//   });

//   if (features.length === 0) {
//     mostrarMensaje("No se encontraron puntos para agrupar");
//     return;
//   }

//   // Crear una colección de características con todos los puntos
//   const puntosCercanos = turf.featureCollection(features);

//   // Realizar clustering con turf.js
//   const clustered = turf.clustersDbscan(puntosCercanos, distanciaCluster, {
//     units: "kilometers",
//   });

//   // Encontrar cuántos clusters distintos hay
//   const clusters = new Set();
//   clustered.features.forEach((f) => {
//     if (f.properties.cluster !== undefined) {
//       clusters.add(f.properties.cluster);
//     }
//   });

//   // Crear una capa para cada cluster
//   const colores = [
//     "#ff4500",
//     "#3388ff",
//     "#33cc33",
//     "#9933cc",
//     "#ff9900",
//     "#00ccff",
//     "#ff3399",
//   ];

//   // Crear un objeto para agrupar los puntos por cluster
//   const puntosAgrupados = {};

//   clustered.features.forEach((f) => {
//     const cluster = f.properties.cluster;

//     // Si no está asignado a un cluster, ignorarlo
//     if (cluster === undefined) return;

//     // Inicializar el array para este cluster si no existe
//     if (!puntosAgrupados[cluster]) {
//       puntosAgrupados[cluster] = [];
//     }

//     // Agregar el punto a su cluster
//     puntosAgrupados[cluster].push([
//       f.geometry.coordinates[1],
//       f.geometry.coordinates[0],
//     ]);
//   });

//   // Crear polígonos convexos para cada cluster
//   Object.keys(puntosAgrupados).forEach((cluster, index) => {
//     const puntosCluster = puntosAgrupados[cluster];

//     // Necesitamos al menos 3 puntos para crear un polígono convexo
//     if (puntosCluster.length < 3) return;

//     // Convertir los puntos al formato que espera turf
//     const puntosGeoJSON = puntosCluster.map((p) => [p[1], p[0]]);

//     // Crear el polígono convexo con turf
//     try {
//       // Crear una colección de puntos
//       const puntosCollection = turf.featureCollection(
//         puntosGeoJSON.map((coord) => turf.point(coord))
//       );

//       // Generar el casco convexo
//       const hull = turf.convex(puntosCollection);

//       // Si hay resultados, crear el polígono
//       if (hull) {
//         const color = colores[index % colores.length];

//         // Crear el polígono en el mapa
//         const polygon = L.geoJSON(hull, {
//           style: {
//             fillColor: color,
//             color: color,
//             weight: 2,
//             fillOpacity: 0.2,
//           },
//         }).addTo(resultadoAnalisisLayer);

//         // Añadir información sobre el cluster
//         polygon.bindPopup(`
//           <b>Cluster ${cluster}</b><br>
//           Puntos: ${puntosCluster.length}<br>
//           Área: ${(turf.area(hull) / 1000000).toFixed(2)} km²
//         `);
//       }
//     } catch (error) {
//       console.error("Error al crear casco convexo:", error);
//     }
//   });

//   // Crear marcadores con colores según el cluster
//   clustered.features.forEach((f) => {
//     const cluster = f.properties.cluster;
//     const color =
//       cluster !== undefined ? colores[cluster % colores.length] : "#999999"; // Color gris para puntos no agrupados

//     const icon = L.divIcon({
//       html: `<div style="
//         background-color: ${color};
//         width: 10px;
//         height: 10px;
//         border-radius: 50%;
//         border: 2px solid white;
//       "></div>`,
//       className: "cluster-icon",
//       iconSize: [14, 14],
//     });

//     const marker = L.marker(
//       [f.geometry.coordinates[1], f.geometry.coordinates[0]],
//       {
//         icon: icon,
//       }
//     ).addTo(resultadoAnalisisLayer);

//     // Agregar popup con información
//     marker.bindPopup(`
//       <b>${f.properties.nombre || "Punto"}</b><br>
//       ${cluster !== undefined ? `Cluster: ${cluster}` : "No agrupado"}
//     `);
//   });

//   mostrarMensaje(
//     `Se crearon ${clusters.size} clusters con ${distanciaCluster} km de radio`
//   );
// }

// // Limpiar resultados de clustering
// function limpiarClusters() {
//   resultadoAnalisisLayer.clearLayers();
//   mostrarMensaje("Resultados de clustering eliminados");
// }

// // 4. FUNCIÓN PARA CONTAR ENTIDADES EN ZONAS
// function habilitarSeleccionPoligonoConteo() {
//   limpiarModoActual();
//   modoAnalisisActivo = "conteo";
//   activarModoAnalisis("btnContarEntidades");

//   // Cambiar cursor
//   map._container.style.cursor = "crosshair";

//   // Actualizar mensaje
//   document.getElementById("countResult").textContent =
//     "Selecciona un polígono para contar entidades";
//   mostrarMensaje("Haz clic en un polígono para contar entidades dentro");
// }

// // Función para contar entidades en un polígono
// function contarEntidadesEnPoligono(polygon) {
//   // Convertir el polígono a GeoJSON
//   const poligonoGeoJSON = polygon.toGeoJSON();

//   // Contar cuántos marcadores están dentro del polígono
//   let contador = 0;
//   let contadorParques = 0;
//   let contadorAtracciones = 0;

//   // Recorrer todas las capas del mapa buscando marcadores
//   map.eachLayer((layer) => {
//     // Si es un marcador, comprobar si está dentro del polígono
//     if (layer instanceof L.Marker) {
//       const latlng = layer.getLatLng();
//       const punto = turf.point([latlng.lng, latlng.lat]);

//       // Comprobar si el punto está dentro del polígono
//       if (turf.booleanPointInPolygon(punto, poligonoGeoJSON)) {
//         contador++;

//         // Intentar determinar si es un parque o una atracción por su popup
//         if (layer.getPopup) {
//           const contenido = layer.getPopup()._content || "";
//           if (
//             contenido.includes("Tipo:") ||
//             contenido.includes("Intensidad:")
//           ) {
//             contadorAtracciones++;
//           } else if (
//             contenido.includes("Superficie:") ||
//             contenido.includes("Capacidad:")
//           ) {
//             contadorParques++;
//           }
//         }
//       }
//     }
//   });

//   // Calcular el área del polígono
//   const area = turf.area(poligonoGeoJSON) / 1000000; // km²

//   // Destacar el polígono seleccionado
//   const highlightedPolygon = L.geoJSON(poligonoGeoJSON, {
//     style: {
//       fillColor: "#ff9900",
//       color: "#ff6600",
//       weight: 3,
//       fillOpacity: 0.2,
//     },
//   }).addTo(resultadoAnalisisLayer);

//   // Mostrar resultados
//   document.getElementById("countResult").innerHTML = `
//     <strong>Entidades en el polígono:</strong> ${contador}<br>
//     <strong>Parques:</strong> ${contadorParques}<br>
//     <strong>Atracciones:</strong> ${contadorAtracciones}<br>
//     <strong>Área del polígono:</strong> ${area.toFixed(2)} km²<br>
//     <strong>Densidad:</strong> ${(contador / area).toFixed(2)} entidades/km²
//   `;

//   // Mostrar popup en el polígono
//   highlightedPolygon
//     .bindPopup(
//       `
//     <b>Total:</b> ${contador} entidades<br>
//     <b>Parques:</b> ${contadorParques}<br>
//     <b>Atracciones:</b> ${contadorAtracciones}<br>
//     <b>Área:</b> ${area.toFixed(2)} km²
//   `
//     )
//     .openPopup();

//   mostrarMensaje(
//     `Se encontraron ${contador} entidades en el polígono (${area.toFixed(
//       2
//     )} km²)`
//   );

//   // Desactivar modo
//   finalizarModoAnalisis();
// }

// // 5. FUNCIÓN PARA CALCULAR CENTROIDES
// function calcularCentroides() {
//   // Limpiar centroides anteriores
//   limpiarCentroides();

//   // Contador de centroides
//   let contador = 0;

//   // Recorrer todos los polígonos
//   map.eachLayer((layer) => {
//     // Si es un polígono, calcular su centroide
//     if (layer instanceof L.Polygon) {
//       try {
//         // Convertir a GeoJSON
//         const geojson = layer.toGeoJSON();

//         // Calcular centroide con turf.js
//         const centroid = turf.centroid(geojson);

//         // Calcular área
//         const area = turf.area(geojson) / 1000000; // km²

//         // Crear un marcador en el centroide
//         const centroidMarker = L.marker(
//           [centroid.geometry.coordinates[1], centroid.geometry.coordinates[0]],
//           {
//             icon: L.divIcon({
//               html: `<i class="fas fa-crosshairs" style="color:#ff4500;"></i>`,
//               className: "centroid-icon",
//               iconSize: [20, 20],
//               iconAnchor: [10, 10],
//             }),
//           }
//         ).addTo(resultadoAnalisisLayer);

//         // Añadir información
//         centroidMarker.bindPopup(`
//           <b>Centroide de polígono</b><br>
//           Coordenadas: ${centroid.geometry.coordinates[1].toFixed(
//             5
//           )}, ${centroid.geometry.coordinates[0].toFixed(5)}<br>
//           Área del polígono: ${area.toFixed(2)} km²
//         `);

//         contador++;
//       } catch (error) {
//         console.error("Error al calcular centroide:", error);
//       }
//     }
//   });

//   mostrarMensaje(`Se calcularon ${contador} centroides`);
// }

// // Limpiar centroides
// function limpiarCentroides() {
//   resultadoAnalisisLayer.clearLayers();
//   mostrarMensaje("Centroides eliminados");
// }

// // 6. FUNCIÓN PARA BUSCAR VECINOS CERCANOS
// function habilitarSeleccionPuntoVecinos() {
//   limpiarModoActual();
//   modoAnalisisActivo = "vecinos";
//   activarModoAnalisis("btnBuscarVecinos");

//   // Cambiar cursor
//   map._container.style.cursor = "crosshair";

//   mostrarMensaje("Haz clic en el mapa para encontrar vecinos cercanos");
// }
