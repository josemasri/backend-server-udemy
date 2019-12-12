var express = require("express");

var Hospital = require("../models/hospital");
var Medico = require("../models/medico");
var Usuario = require("../models/usuario");

var mdAutenticacion = require("../middlewares/autenticacion");

//Inicializar variables
var app = express();

// ======================================================
// Busquedas por tablas
// ======================================================
app.get("/coleccion/:tabla/:busqueda", (req, res, next) => {
    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, "i");

    var promesa;

    switch (tabla) {
        case "hospitales":
            promesa = buscarHospitales(regex);
            break;

        case "medicos":
            promesa = buscarMedicos(regex);
            break;

        case "usuarios":
            promesa = buscarUsuarios(regex);
            break;

        default:
            return res.status(401).json({
                ok: false,
                mensaje: "Los tipos de busqueda sólo son: usuarios, médicos y hospitales",
                errors: { mensaje: "Tipo de tabla/colección no válido" }
            });
    }
    promesa.then(data => {
            return res.status(200).json({
                ok: true,
                [tabla]: data
            });
        })
        .catch(err => {
            return res.status(500).json({
                ok: false,
                mensaje: "Error en la busqueda de " + tabla,
                errors: err
            });
        });
});

// ======================================================
// Busqueda global
// ======================================================
app.get("/todo/:busqueda", (req, res, next) => {
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, "i");

    // Buscando hospital
    Promise.all([
            buscarHospitales(regex),
            buscarMedicos(regex),
            buscarUsuarios(regex)
        ])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        })
        .catch(err => {
            return res.status(500).json({
                ok: false,
                mensaje: "Error en la busqueda",
                errors: err
            });
        });
});

function buscarHospitales(regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate("usuario", "nombre email role")
            .exec((err, hospitales) => {
                if (err) {
                    reject("Error buscando hospitales", err);
                }
                resolve(hospitales);
            });
    });
}

function buscarMedicos(regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate("hospital")
            .populate("usuario", "nombre email role")
            .exec((err, medicos) => {
                if (err) {
                    reject("Error buscando medicos", err);
                }
                resolve(medicos);
            });
    });
}

function buscarUsuarios(regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, "nombre email role")
            .or([{ nombre: regex }, { email: regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject("Error buscando usuarios", err);
                }
                resolve(usuarios);
            });
    });
}

module.exports = app;