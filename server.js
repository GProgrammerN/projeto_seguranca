const express = require('express');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const db = require('./database');
const security = require('./security');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
    name: 'session',
    keys: ['chave-super-secreta-sessao-v2'],
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: false 
}));

const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    next();
};

const requireRole = (role) => {
    return (req, res, next) => {
        if (req.session.role !== role) {
            return res.status(403).send("Acesso Negado.");
        }
        next();
    };
};

app.get('/', (req, res) => res.redirect('/busca'));

app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (err || !user) {
            return res.render('login', { error: 'Credenciais inválidas' });
        }

        if (security.verifyPassword(password, user.hash, user.salt)) {
            req.session.userId = user.id;
            req.session.role = user.role;
            
            if (user.role === 'student') return res.redirect('/alunos');
            if (user.role === 'teacher') return res.redirect('/professores');
        } else {
            res.render('login', { error: 'Credenciais inválidas' });
        }
    });
});

app.get('/logout', (req, res) => {
    req.session = null;
    res.redirect('/login');
});

app.get('/alunos', requireAuth, requireRole('student'), (req, res) => {
    res.render('alunos');
});

app.get('/professores', requireAuth, requireRole('teacher'), (req, res) => {
    res.render('professores');
});

app.get('/busca', (req, res) => {
    const searchTerm = req.query.search || '';
    
    db.all("SELECT * FROM courses", [], (err, rows) => {
        if (err) return res.send("Erro interno");

    //console.log("O que veio do banco (Criptografado):", rows);

        const courses = rows.map(row => {
            return {
                ...row,
                name: security.decryptData(row.name_encrypted)
            };
        });

        const filteredCourses = courses.filter(c => 
            c.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        res.render('busca', { 
            courses: filteredCourses, 
            searchTerm: searchTerm 
        });
    });
});

app.listen(3005, () => {
    console.log('Servidor rodando em http://localhost:3005');
});