var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

//Inicializar variables
var app = express();

// Schema de usuarios
var Medico = require('../models/medico');

// ====================================
// Obtener todos los medicos
// ====================================

app.get('/', (req, res, next) => {
    // Ejecutando query de mongo
    // Se excluye la contraseña

    // Recibiendo el parametro desde
    // Si no se envia empezará desde el 0
    var desde = req.query.desde || 0;
    desde = Number(desde);


    Medico.find({})
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .skip(desde)
        .limit(5)
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando medicos',
                    errors: err
                });
            }
            Medico.countDocuments({}, (err, conteo) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error contando medicos',
                        errors: err
                    });
                }
                res.status(200).json({
                    ok: true,
                    medicos,
                    total: conteo
                });
            });
        });
});




// ====================================
// Actualizar medico
// ====================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error buscando medico',
                errors: err
            });
        }
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + 'no existe',
                errors: { message: 'No existe un medico con ese id' }
            });
        }
        medico.nombre = body.nombre;

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                medico: medicoGuardado,
                usuariotoken: req.usuario
            });
        });

    });

});


// ====================================
// Crear un nuevo medico
// ====================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: body.usuario,
        hospital: body.hospital
    });


    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
            usuariotoken: req.usuario
        });
    });
});

// =======================================
// Borrar un medico por el id
// =======================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }
        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese id',
                errors: { message: 'No existe un medico con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado,
            usuariotoken: req.usuario
        });
    });
});


module.exports = app;