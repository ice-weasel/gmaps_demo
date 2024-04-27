// api/distance-matrix.js
const expressMat = require('express');
const routerMat = express.Router();
const fetchMat = require('node-fetch');

router.get('/', async (req:any, res:any) => {
  const { starting, destination } = req.query;

  try {
    const response = await fetchLib(`https://maps.googleapis.com/maps/api/distancematrix/json?destinations=${destination}&origins=${starting}&units=imperial&key=AIzaSyByiga6RzCCO6wipnXVN_3LJCFmUaxVoPw`);
    if (!response.ok) {
      throw new Error(`Distance Matrix API request failed with status ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching distance matrix:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
