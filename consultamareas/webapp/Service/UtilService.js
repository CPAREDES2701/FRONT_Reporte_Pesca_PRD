sap.ui.define([
    "./UtilService",
    "../model/utilities"
], function (
	UtilService,
	utilities
) {
    "use strict";

    return {

        getHostService: function () {
            return "https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com"; //utilities.getHostService();
        },

        getBodyDetalleMarea: function () {
            var sBody = {
                fieldEvento: [
                ],
                fieldFLBSP: [
                ],
                fieldMarea: [
                ],
                fieldPSCINC: [
                ],
                p_embarcacion: "",
                p_flag: "",
                p_marea: "",
                user: ""
            };
            return sBody;
        },

        getBodyDominio: function () {
            var sBody = {
                dominios: [
                    {
                        domname: "",
                        status: "A"
                    }
                ]
            };
            return sBody;
        },

        getBodyReadTable: function () {
            var sBody = {
                delimitador: "",
                fields: [],
                no_data: "",
                option: [
                    {
                        wa: ""
                    }
                ],
                options: [
                    {
                        cantidad: "",
                        control: "",
                        key: "",
                        valueHigh: "",
                        valueLow: ""
                    }
                ],
                order: "",
                p_user: "",
                rowcount: 0,
                rowskips: 0,
                tabla: ""
            };
            return sBody;
        },

        getBodyValidaCert: function () {
            var sBody = {
                codEmba: "",
                codPlanta: ""
            };
            return sBody;
        },

        getValidaMarea: function () {
            var sBody = {
                p_codemb: "",
                p_codpta: ""
            };
            return sBody;
        },

        getBodyConHorom: function () {
            var sBody = {
                ip_cdemb: "",
                ip_nrmar: ""
            };
            return sBody;
        },

        getHorometro: function () {
            var sBody = {
                centro: "",
                evento: "",
                marea: "",
                nroEvento: ""
            };
            return sBody;
        },

        getElimPescaDesc: function () {
            var sBody = {
                i_table: "",
                p_user: "",
                t_data: ""
            };
            return sBody;
        },
        getActuaPescaDesc: function () {
            var sBody = {
                p_user: "",
                str_set: []
            };
            return sBody;
        },
        getAnularDescRFC: function () {
            var sBody = {
                p_nrdes: ""
            };
            return sBody;
        },

        getBodyConHorom: function () {
            var sBody = {
                ip_cdemb: "",
                ip_nrmar: ""
            };
            return sBody;
        },

        getConsultaGeneral: function () {
            var sBody = {
                nombreConsulta: "",
                p_user: "",
                parametro1: "",
                parametro2: "",
                parametro3: "",
                parametro4: "",
                parametro5: ""
            };
            return sBody;
        },

        getConsultaMareaBio: function () {
            var sBody = {
                "fieldEvento": [

                ],
                "fieldFLBSP": [

                ],
                "fieldMarea": [

                ],
                "fieldPSCINC": [

                ],
                p_flag: "",
                user: "",
                p_marea: "",
                p_embarcacion: ""
            };
            return sBody;
        },

        getBodyAyudaBusq: function () {
            var sBody = {
                "nombreAyuda": "",
                "p_user": ""
            };
            return sBody;
        },

        getBodyBuscarEmba: function () {
            var sBody = {
                option: [{
                    wa: ""
                }],
                options: [
                    {
                        cantidad: "",
                        control: "",
                        key: "",
                        valueHigh: "",
                        valueLow: ""
                    }
                ],
                p_user: "",
                rowcount: ""
            };
            return sBody;
        },

        getBodyEmba: function () {
            var sBody = {
                "option": [
                ],
                "option2": [
                ],
                "options": [],
                "options2": [],
                "p_user": "",
                //"p_pag": "1" //por defecto la primera parte
            };
            return sBody;
        },

        getConsultaReserva: function () {
            var sBody = {
                flagDetalle: "",
                marea: 0,
                reserva: "",
                usuario: ""
            };
            return sBody;
        },

        getBodySuministro: function () {
            var sBody = {
                "material": "",
                "usuario": ""
            };
            return sBody;
        },

        getBodyConfigRes: function () {
            var sBody = {
                "usuario": ""
            };
            return sBody;
        },

        getBodyEmbaComb: function () {
            var sBody = {
                "embarcacion": "",
                "usuario": ""
            };
            return sBody;
        }

    }

});