const sqlite3 = require('sqlite3').verbose();
const security = require('./security');

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run(`CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        hash TEXT,
        salt TEXT,
        role TEXT
    )`);

    db.run(`CREATE TABLE courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name_encrypted TEXT, 
        level TEXT,
        duration TEXT,
        period TEXT
    )`);

    const passAluno = security.hashPassword('Aluno2025@');
    db.run("INSERT INTO users (username, hash, salt, role) VALUES (?, ?, ?, ?)", 
        ['aluno', passAluno.hash, passAluno.salt, 'student']);

    const passProf = security.hashPassword('Professor2025@');
    db.run("INSERT INTO users (username, hash, salt, role) VALUES (?, ?, ?, ?)", 
        ['professor', passProf.hash, passProf.salt, 'teacher']);

    const cursos = [
        { nome: 'Engenharia de Software', nivel: 'Bacharelado', duracao: '5 anos', periodo: 'Integral' },
        { nome: 'Direito Civil', nivel: 'Bacharelado', duracao: '5 anos', periodo: 'Noturno' },
        { nome: 'Gastronomia', nivel: 'Tecnólogo', duracao: '2 anos', periodo: 'Manhã' }
    ];

    const stmt = db.prepare("INSERT INTO courses (name_encrypted, level, duration, period) VALUES (?, ?, ?, ?)");
    cursos.forEach(c => {
        stmt.run(security.encryptData(c.nome), c.nivel, c.duracao, c.periodo);
    });
    stmt.finalize();
});

module.exports = db;