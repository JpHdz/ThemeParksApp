const express = require("express");
const cors = require("cors");
const pool = require("./connection");
const app = express();
app.use(cors());

app.listen(3000, () => {
  console.log(`Served Started in port 3000`);
});

app.get("/puntos", async (req, res) => {
  const result = await pool.query(`
    SELECT id, nombre, ST_AsGeoJSON(ubicacion) AS geom FROM zonas;`);

  const geojson = {
    type: "FeatureCollection",
    features: result.rows.map((row) => ({
      type: "Feature",
      geometry: JSON.parse(row.geom),
      properties: { id: row.id, nombre: row.nombre },
    })),
  };
  res.json(geojson);
});


/* const express = require("express");
const cors = require("cors");
const pool = require("./connection");
const app = express();

// Aplicar middleware CORS antes de definir rutas
app.use(cors());
app.use(express.json());

// Iniciar el servidor
app.listen(3000, () => {
  console.log(`Servidor iniciado en puerto 3000`);
});

// Ruta para obtener todos los puntos
app.get("/puntos", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, nombre, ST_AsGeoJSON(ubicacion) AS geom FROM zonas;`);

    const geojson = {
      type: "FeatureCollection",
      features: result.rows.map((row) => ({
        type: "Feature",
        geometry: JSON.parse(row.geom),
        properties: { id: row.id, nombre: row.nombre },
      })),
    };
    
    console.log("Enviando GeoJSON:", geojson);
    res.json(geojson);
  } catch (error) {
    console.error("Error al consultar puntos:", error);
    res.status(500).json({ error: "Error al consultar la base de datos" });
  }
});

// Puedes añadir más rutas aquí
app.get("/parques", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, nombre, ST_AsGeoJSON(ubicacion) AS geom, costo_entrada, propietario, calificacion 
      FROM lugares;`);

    const geojson = {
      type: "FeatureCollection",
      features: result.rows.map((row) => ({
        type: "Feature",
        geometry: JSON.parse(row.geom),
        properties: { 
          id: row.id, 
          nombre: row.nombre,
          costo_entrada: row.costo_entrada,
          propietario: row.propietario,
          calificacion: row.calificacion
        },
      })),
    };
    
    res.json(geojson);
  } catch (error) {
    console.error("Error al consultar parques:", error);
    res.status(500).json({ error: "Error al consultar la base de datos" });
  }
});
 */


/* // server.js
const express = require("express");
const cors = require("cors");
const pool = require("./connection");
const app = express();

app.use(cors());

// Ruta para obtener puntos en formato GeoJSON
app.get("/puntos", async (req, res) => {
  const result = await pool.query(`
    SELECT id, nombre, ST_AsGeoJSON(ubicacion) AS geom FROM zonas;
  `);

  const geojson = {
    type: "FeatureCollection",
    features: result.rows.map((row) => ({
      type: "Feature",
      geometry: JSON.parse(row.geom),
      properties: { id: row.id, nombre: row.nombre },
    })),
  };

  res.json(geojson);
});

// Inicia servidor en puerto 3000
app.listen(3000, () => {
  console.log("Servidor iniciado en http://localhost:3000");
}); */