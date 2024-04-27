// api/directions.js
const express = require('express');
const router = express.Router();
const fetchLib = require('node-fetch');

router.get('/', async (req:any, res:any) => {
  const { start, destination } = req.query;

  try {
    const response = await fetchLib(`https://maps.googleapis.com/maps/api/directions/json?destination=${destination}&origin=${start}&key=AIzaSyByiga6RzCCO6wipnXVN_3LJCFmUaxVoPw`);
    if (!response.ok) {
      throw new Error(`Directions API request failed with status ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching directions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
