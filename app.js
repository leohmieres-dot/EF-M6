const express = require('express');
const hbs = require('hbs');
const fs = require('fs');
const path = require('path');

const app = express();

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

hbs.registerHelper('eq', function (a, b) {
    return a === b;
});

app.get('/', (req, res) => res.render('home'));
app.get('/login', (req, res) => res.render('login'));
app.get('/register', (req, res) => res.render('register'));

app.get('/dashboard', (req, res) => {
    try {
        const rawData = fs.readFileSync('./data.json', 'utf-8');
        const data = JSON.parse(rawData);
        res.render('dashboard', data);
    } catch (error) {
        res.send("Error: Asegúrate de que data.json exista.");
    }
});


app.post('/nueva-tarjeta', (req, res) => {
    const data = JSON.parse(fs.readFileSync('./data.json', 'utf-8'));
    data.tareas.push({ titulo: req.body.tituloTarea, estado: "Pendiente" });
    fs.writeFileSync('./data.json', JSON.stringify(data, null, 2));
    res.redirect('/dashboard');
});

app.post('/mover-tarea', (req, res) => {
    const { titulo, nuevoEstado } = req.body;
    const data = JSON.parse(fs.readFileSync('./data.json', 'utf-8'));

    const tarea = data.tareas.find(t => t.titulo === titulo);
    if (tarea) {
        tarea.estado = nuevoEstado;
    }

    fs.writeFileSync('./data.json', JSON.stringify(data, null, 2));
    res.redirect('/dashboard');
});

app.post('/register', (req, res) => {
    try {
        const { username, email, password } = req.body;
        const usuarios = JSON.parse(fs.readFileSync('./usuarios.json', 'utf-8'));
        usuarios.push({ username, email, password });
        fs.writeFileSync('./usuarios.json', JSON.stringify(usuarios, null, 2));
        res.redirect('/login');
    } catch (e) { res.send("Error al registrar."); }
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const usuarios = JSON.parse(fs.readFileSync('./usuarios.json', 'utf-8'));
    const encontrado = usuarios.find(u => u.username === username && u.password === password);
    
    if (encontrado) res.redirect('/dashboard');
    else res.send("<h1>Error: Datos incorrectos</h1><a href='/login'>Volver</a>");
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 KanbanPro corriendo en: http://localhost:${PORT}`);
});