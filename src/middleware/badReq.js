export default (res) => {
  res.statusCode = 400;
  res.statusMessage = 'bad request';
  res.setHeader('Content-Type', 'application/json');
  res.end();
};