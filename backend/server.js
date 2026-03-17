const express =  require('express');
const app=express();

app.get('/', (req, res) => {
    res.send('hello pillalu ela unnaru');
});

app.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
})