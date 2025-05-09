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
