const express = require('express');
const hbs = require('hbs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');

const sequelize = require('./db'); 
const { User, Board, List, Card } = require('./models'); 
const verificarToken = require('./middlewares/auth');

const app = express();
const SECRET_KEY = process.env.JWT_SECRET || 'JWT_SECRET';

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static('public'));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// HELPER CRÍTICO: Para comparar el nombre de la lista y mostrar botones
hbs.registerHelper('eq', function (a, b) {
    return a === b;
});

// --- RUTAS PÚBLICAS ---
app.get('/', (req, res) => res.render('home'));
app.get('/login', (req, res) => res.render('login'));
app.get('/register', (req, res) => res.render('register'));

// --- AUTH ---
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        await User.create({ username, email, password });
        res.redirect('/login');
    } catch (error) {
        res.status(400).send("Error: " + error.message);
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
            res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });
            return res.redirect('/dashboard');
        }
        res.status(401).send("Credenciales inválidas.");
    } catch (error) {
        res.status(500).send("Error en el servidor");
    }
});

// --- DASHBOARD ---
app.get('/dashboard', verificarToken, async (req, res) => {
    try {
        const tableros = await Board.findAll({
            where: { userId: req.user.id }, 
            include: [{ 
                model: List, 
                include: [{ model: Card }] 
            }],
            order: [['id', 'ASC'], [List, 'id', 'ASC']]
        });
        const tablerosData = tableros.map(t => t.get({ plain: true }));
        res.render('dashboard', { tableros: tablerosData, usuario: req.user });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error en dashboard.");
    }
});

// --- LÓGICA KANBAN ---
app.post('/api/tableros', verificarToken, async (req, res) => {
    try {
        const nuevoTablero = await Board.create({ title: req.body.title, userId: req.user.id });
        // Nombres exactos: 'Pendiente', 'En Progreso', 'Finalizado'
       await List.bulkCreate([
    { name: 'Pendiente', boardId: nuevoTablero.id },
    { name: 'En Progreso', boardId: nuevoTablero.id },
    { name: 'Finalizado', boardId: nuevoTablero.id }
        ]);
        res.redirect('/dashboard');
    } catch (error) {
        res.status(500).send("Error al crear tablero.");
    }
});

app.post('/nueva-tarjeta', verificarToken, async (req, res) => {
    await Card.create({ titulo: req.body.tituloTarea, listId: req.body.listaId });
    res.redirect('/dashboard');
});

app.post('/eliminar-tarea', verificarToken, async (req, res) => {
    await Card.destroy({ where: { id: req.body.cardId } });
    res.redirect('/dashboard');
});

app.post('/eliminar-tablero', verificarToken, async (req, res) => {
    await Board.destroy({ where: { id: req.body.boardId, userId: req.user.id } });
    res.redirect('/dashboard');
});

// RUTA DE MOVIMIENTO CORREGIDA
app.post('/mover-tarea', verificarToken, async (req, res) => {
    try {
        const { cardId, nuevoEstado } = req.body;
        const tarjeta = await Card.findByPk(cardId, { include: List });

        if (tarjeta && tarjeta.List) {
            const listaDestino = await List.findOne({ 
                where: { name: nuevoEstado, boardId: tarjeta.List.boardId } 
            });

            if (listaDestino) {
                await tarjeta.update({ listId: listaDestino.id });
            }
        }
        res.redirect('/dashboard');
    } catch (error) {
        res.status(500).send("Error al mover.");
    }
});

app.get('/logout', (req, res) => {
    res.clearCookie('token'); 
    res.redirect('/login');  
});

const PORT = 3000;
sequelize.sync({ force: false }).then(() => { 
    app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));
});