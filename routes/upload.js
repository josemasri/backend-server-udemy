var express = require("express");

var fileUpload = require("express-fileupload");
var fs = require("fs");

//Inicializar variables
var app = express();

var Usuario = require("../models/usuario");
var Medico = require("../models/medico");
var Hospital = require("../models/hospital");

app.use(fileUpload());

app.put("/:tipo/:id", (req, res, next) => {
    var tipo = req.params.tipo;
    var id = req.params.id;

    // tipos de coleccion
    var tiposValidos = ["hospitales", "medicos", "usuarios"];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: "Tipo de coleccion no es válida",
            errors: { message: "Tipo de coleccion no es válida" }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: "No selecciono nada",
            errors: { message: "Debe de seleccionar una imagen" }
        });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split(".");
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Solo estas extensiones aceptamos
    var extensionesValidas = ["png", "jpg", "gif", "jpeg"];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: "Extension no valida",
            errors: {
                message: "Las extensiones validas son " + extensionesValidas.join(", ")
            }
        });
    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    // Mover el archivo del temporal a un path
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al mover archvivo",
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);
        // res.status(200).json({
        //     ok: true,
        //     mensaje: "Archivo subido correctamente",
        //     extensionArchivo
        // });
    });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {
    switch (tipo) {
        case "usuarios":
            Usuario.findById(id).exec((err, usuario) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: "Error buscando usuario",
                        errors: err
                    });
                }

                if (!usuario) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: "No existe un usuario con ese id",
                        errors: { message: "No existe un usuario con ese id" }
                    });
                }


                var pathAnterior = "./uploads/usuarios/" + usuario.img;
                // Si existe elimin ala imagen anterior
                if (fs.existsSync(pathAnterior)) {
                    fs.unlink(pathAnterior, err => {
                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                mensaje: "Error eliminando imagen anterior",
                                errors: err
                            });
                        }
                    });
                }
                usuario.img = nombreArchivo;

                usuario.save((err, usuarioActualizado) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: "Error guardando imagen",
                            errors: err
                        });
                    }
                    usuarioActualizado.password = undefined;
                    res.status(200).json({
                        ok: true,
                        mensaje: "Imagen de usuario actualizada",
                        usuario: usuarioActualizado
                    });
                });
            });
            break;
        case "medicos":
            Medico.findById(id).exec((err, medico) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: "Error buscando medico",
                        errors: err
                    });
                }
                if (!medico) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: "No existe un medico con ese id",
                        errors: { message: "No existe un medico con ese id" }
                    });
                }

                var pathAnterior = "./uploads/medicos/" + medico.img;
                // Si existe elimin ala imagen anterior
                if (fs.existsSync(pathAnterior)) {
                    fs.unlink(pathAnterior, err => {
                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                mensaje: "Error eliminando imagen anterior",
                                errors: err
                            });
                        }
                    });
                }
                medico.img = nombreArchivo;

                medico.save((err, medicoActualizado) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: "Error guardando imagen",
                            errors: err
                        });
                    }
                    res.status(200).json({
                        ok: true,
                        mensaje: "Imagen de medico actualizada",
                        medico: medicoActualizado
                    });
                });
            });
            break;
        case "hospitales":
            Hospital.findById(id).exec((err, hospital) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: "Error buscando hospital",
                        errors: err
                    });
                }
                if (!hospital) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: "No existe un hospital con ese id",
                        errors: { message: "No existe un hospital con ese id" }
                    });
                }

                var pathAnterior = "./uploads/hospitales/" + hospital.img;
                // Si existe elimin ala imagen anterior
                if (fs.existsSync(pathAnterior)) {
                    fs.unlink(pathAnterior, err => {
                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                mensaje: "Error eliminando imagen anterior",
                                errors: err
                            });
                        }
                    });
                }
                hospital.img = nombreArchivo;

                hospital.save((err, hospitalActualizado) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: "Error guardando imagen",
                            errors: err
                        });
                    }
                    res.status(200).json({
                        ok: true,
                        mensaje: "Imagen de hospital actualizada",
                        hospital: hospitalActualizado
                    });
                });
            });
            break;

        default:
            break;
    }
}

module.exports = app;