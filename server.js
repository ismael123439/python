const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();

// Asegúrate de usar el puerto que Vercel asigna
const port = process.env.PORT || 3000; 

// Conexión con MongoDB
const uri = "mongodb+srv://isma:isma@cluster0.tgxly.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let db, collection;

client.connect()
  .then(() => {
    db = client.db("ordenes_trabajo");
    collection = db.collection("ordenes");
    console.log("Conectado a la base de datos MongoDB.");
  })
  .catch(err => console.error(err));

app.use(express.json());
app.use(express.static('public')); // Sirve los archivos estáticos como el HTML

// Ruta para obtener todas las órdenes
app.get('/ordenes', async (req, res) => {
  try {
    const ordenes = await collection.find().toArray();
    res.json(ordenes);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener las órdenes' });
  }
});

// Ruta para crear una nueva orden
app.post('/orden', async (req, res) => {
  const nuevaOrden = req.body;
  await collection.insertOne(nuevaOrden);
  res.status(201).send('Orden creada');
});

// Ruta para editar una orden
app.put('/orden/:id', async (req, res) => {
  const { id } = req.params;
  const actualizacion = req.body;
  await collection.updateOne({ _id: new MongoClient.ObjectId(id) }, { $set: actualizacion });
  res.send('Orden actualizada');
});

// Ruta para borrar una orden
app.delete('/orden/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await collection.deleteOne({ _id: new MongoClient.ObjectId(id) });
    if (result.deletedCount === 1) {
      res.send('Orden eliminada');
    } else {
      res.status(404).send('Orden no encontrada');
    }
  } catch (err) {
    res.status(500).send('Error al eliminar la orden');
  }
});

// Configuración para Vercel
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
