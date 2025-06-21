import express from 'express';
import routes from './routes/index.js';

const app = express();

app.use('/', routes);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 
