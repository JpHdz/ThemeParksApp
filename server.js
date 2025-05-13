const express = require("express");
const cors = require("cors");
const pool = require("./connection");
const app = express();
app.use(cors());

app.listen(3000, () => {
  console.log(`Served Started in port 3000`);
});
// Endpoint para obtener los parques temáticos (polígonos)
app.get("/parques", async (req, res) => {
  try {
    const result = await pool.query(`
        SELECT 
          id_parque, 
          nombre, 
          empresa_operadora, 
          TO_CHAR(fecha_inauguracion, 'YYYY-MM-DD') AS fecha_inauguracion,
          superficie_hectareas, 
          capacidad_maxima, 
          TO_CHAR(horario_apertura, 'HH24:MI') AS horario_apertura,
          TO_CHAR(horario_cierre, 'HH24:MI') AS horario_cierre,
          precio_entrada_adulto, 
          precio_entrada_nino, 
          sitio_web, 
          telefono, 
          pais, 
          ciudad, 
          codigo_postal, 
          descripcion, 
          ST_AsGeoJSON(geom) AS geom 
        FROM parque_tematico;
      `);

    // Formatear datos para GeoJSON
    const features = result.rows.map((parque) => {
      const geom = JSON.parse(parque.geom);
      return {
        type: "Feature",
        geometry: geom,
        properties: {
          id_parque: parque.id_parque,
          nombre: parque.nombre,
          empresa_operadora: parque.empresa_operadora,
          fecha_inauguracion: parque.fecha_inauguracion,
          superficie_hectareas: parque.superficie_hectareas,
          capacidad_maxima: parque.capacidad_maxima,
          horario_apertura: parque.horario_apertura,
          horario_cierre: parque.horario_cierre,
          precio_entrada_adulto: parque.precio_entrada_adulto,
          precio_entrada_nino: parque.precio_entrada_nino,
          sitio_web: parque.sitio_web,
          telefono: parque.telefono,
          pais: parque.pais,
          ciudad: parque.ciudad,
          codigo_postal: parque.codigo_postal,
          descripcion: parque.descripcion,
        },
      };
    });

    const geoJson = {
      type: "FeatureCollection",
      features: features,
    };

    res.json(geoJson);
  } catch (error) {
    console.error("Error al obtener parques:", error);
    res
      .status(500)
      .json({ error: "Error al obtener datos de parques temáticos" });
  }
});

// Endpoint para obtener las atracciones (puntos)
app.get("/atracciones", async (req, res) => {
  try {
    const result = await pool.query(`
        SELECT 
          a.id_atraccion, 
          a.nombre, 
          a.tipo, 
          a.altura_minima, 
          a.intensidad, 
          a.capacidad_personas, 
          a.duracion_minutos, 
          a.ano_construccion, 
          a.fabricante, 
          a.estado, 
          a.descripcion,
          a.id_parque, 
          p.nombre AS nombre_parque,
          ST_AsGeoJSON(a.geom) AS geom 
        FROM atraccion a
        JOIN parque_tematico p ON a.id_parque = p.id_parque;
      `);

    // Formatear datos para GeoJSON
    const features = result.rows.map((atraccion) => {
      const geom = JSON.parse(atraccion.geom);
      return {
        type: "Feature",
        geometry: geom,
        properties: {
          id_atraccion: atraccion.id_atraccion,
          nombre: atraccion.nombre,
          tipo: atraccion.tipo,
          altura_minima: atraccion.altura_minima,
          intensidad: atraccion.intensidad,
          capacidad_personas: atraccion.capacidad_personas,
          duracion_minutos: atraccion.duracion_minutos,
          ano_construccion: atraccion.ano_construccion,
          fabricante: atraccion.fabricante,
          estado: atraccion.estado,
          descripcion: atraccion.descripcion,
          id_parque: atraccion.id_parque,
          nombre_parque: atraccion.nombre_parque,
        },
      };
    });

    const geoJson = {
      type: "FeatureCollection",
      features: features,
    };

    res.json(geoJson);
  } catch (error) {
    console.error("Error al obtener atracciones:", error);
    res.status(500).json({ error: "Error al obtener datos de atracciones" });
  }
});
