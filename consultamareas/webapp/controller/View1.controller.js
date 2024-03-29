sap.ui.define([
	"./BaseController",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/ui/export/library',
	'sap/ui/export/Spreadsheet',
	"sap/ui/core/BusyIndicator",
	"sap/m/MessageBox"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (BaseController, Controller, JSONModel, formatter, Filter, FilterOperator, exportLibrary, Spreadsheet, BusyIndicator, MessageBox) {
		"use strict";
		var oGlobalBusyDialog = new sap.m.BusyDialog();

		var EdmType = exportLibrary.EdmType;

		const mainUrlServices = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/'; //utilities.getHostService();
		const HOST = "https://tasaqas.launchpad.cfapps.us10.hana.ondemand.com";
		return BaseController.extend("com.tasa.consultamareas.controller.View1", {
			formatter: formatter,
			dataTableKeys: [
				'NRMAR',
				'WERKS',
				'DESCR',
				'DSEMP',
				'NMEMB',
				'FICAL',
				'FFCAL',
				'DSSPE',
				'DESC_INPRP',
				'DESC_CDMMA',
				'INPRP',
				'CDMMA',
				'FEMAR',
				'FXMAR',
				'FHZAR',
				'FHLLE',
				'FCSAZ',
				'FCARP',
				'FIDES',
				'FFDES',
				'CNTDS',
				'CNPDC'
			],
			onInit: async function () {
				let oViewModel = new JSONModel({});
				this.currentInputEmba = "";
				this.setModel(oViewModel, "consultaMareas");
				this.loadData();
				this.primerOption = [];
				this.segundoOption = [];
				this.currentPage = "";
				this.lastPage = "";
				this.IsAdmin = false;
				await this.obtenerRoles();
				
				
			},

			obtenerRoles : async function () {
				let obterRoles = TasaBackendService.obtenerRolesUsuarios((await this.getCurrentUser()));
                let that = this;
                let lstRoles =[];
                await Promise.resolve(obterRoles).then(values => {
                    lstRoles =  values;
                }).catch(reason => {
                    console.log(reason);
                });
				this.IsAdmin = lstRoles.NOROLFLOTA ? lstRoles.NOROLFLOTA : false
			},

			onAfterRendering: async function(){
				this.userOperation =await this.getCurrentUser();
				console.log(this.userOperation);
	
				this.objetoHelp =  this._getHelpSearch();
				this.parameter= this.objetoHelp[0].parameter;
				this.url= this.objetoHelp[0].url;
				console.log(this.parameter)
				console.log(this.url)
				console.log(this.userOperation);
				this.callConstantes();
			},
	
			callConstantes: function(){
				oGlobalBusyDialog.open();
				var body={
					"nombreConsulta": "CONSGENCONST",
					"p_user": this.userOperation,
					"parametro1": this.parameter,
					"parametro2": "",
					"parametro3": "",
					"parametro4": "",
					"parametro5": ""
				}
				fetch(`${this.onLocation()}General/ConsultaGeneral/`,
					  {
						  method: 'POST',
						  body: JSON.stringify(body)
					  })
					  .then(resp => resp.json()).then(data => {
						
						console.log(data.data);
						this.HOST_HELP=this.url+data.data[0].LOW;
						console.log(this.HOST_HELP);
							oGlobalBusyDialog.close();
					  }).catch(error => console.log(error)
				);
			},

			handleSelectionChange: function (event) {
				console.log(event.getParameter("changedItem"));
			},
			handleSelectionFinish: function (event) {
				let selectedItems = event.getParameter("selectedItems");
				console.log(selectedItems);

			},
			loadData: function () {
				BusyIndicator.show(0);
				let zinprpDom = [];
				let zcdmmaDom = [];
				let plantas = [];
				let embarcaciones = [];

				const bodyDominios = {
					"dominios": [
						{
							"domname": "ZINPRP",
							"status": "A"
						},
						{
							"domname": "ZCDMMA",
							"status": "A"
						}
					]
				};

				fetch(`${this.onLocation()}dominios/Listar`,
					{
						method: 'POST',
						body: JSON.stringify(bodyDominios)
					})
					.then(resp => resp.json()).then(data => {
						console.log(data);
						zinprpDom = data.data.find(d => d.dominio == "ZINPRP").data;
						zcdmmaDom = data.data.find(d => d.dominio == "ZCDMMA").data;
						this.getModel("consultaMareas").setProperty("/zinprpDom", zinprpDom);
						this.getModel("consultaMareas").setProperty("/zcdmmaDom", zcdmmaDom);
					}).catch(error => console.log(error));


				const bodyAyudaPlantas = {
					"nombreAyuda": "BSQPLANTAS",
					"p_user": this.userOperation
				};

				fetch(`${this.onLocation()}General/AyudasBusqueda/`,
					{
						method: 'POST',
						body: JSON.stringify(bodyAyudaPlantas)
					})
					.then(resp => resp.json()).then(data => {
						console.log("Busqueda: ", data);
						plantas = data.data;
						this.getModel("consultaMareas").setProperty("/plantas", plantas);
					}).catch(error => console.log(error));

				const objectRT = {
					"option": [
					],
					"option2": [
					],
					"options": [
					],
					"options2": [
						{
							"cantidad": "10",
							"control": "COMBOBOX",
							"key": "ESEMB",
							"valueHigh": "",
							"valueLow": "0"
						}

					],
					"p_user": "BUSQEMB"
				};

				fetch(`${this.onLocation()}embarcacion/ConsultarEmbarcacion/`,
					{
						method: 'POST',
						body: JSON.stringify(objectRT)
					})
					.then(resp => resp.json()).then(data => {
						console.log("Emba: ", data);
						embarcaciones = data.data;

						this.getModel("consultaMareas").setProperty("/embarcaciones", embarcaciones);
						this.getModel("consultaMareas").refresh();
						BusyIndicator.hide();
					}).catch(error => console.log(error));

			},
			searchData: function (event) {
				console.log("ENTRE");
				BusyIndicator.show(0);
				let options = [];
				let commands = [];
				let mareaLow = parseInt(this.byId("mareaLow").getValue());
				let mareaHigh = parseInt(this.byId("mareaHigh").getValue());
				let plantaLow = this.byId("plantaLow").getValue();
				let plantaHigh = this.byId("plantaHigh").getValue();
				let embarcacionLow = this.byId("inputId0_R").getValue();
				let embarcacionHigh = this.byId("inputId1_R").getValue();
				console.log("Emba Low: ", embarcacionLow);
				console.log("Emba high: ", embarcacionHigh);
				let propiedad = this.byId("propiedad").getSelectedKey();
				let motivos = this.byId("motivos").getSelectedKeys();
				/*let fechaInicio = this.byId("fechaInicio").getValue();
				let fechaFin = this.byId("fechaFin").getValue();*/
				let numRegistros = this.byId("numRegistros").getValue();

				let fechaInicio = null;
				let fechaFin = null;
				//var valueDateRange = this.byId("idDateRangeSelec").getValue();
				var valDtrIni=this.byId("fechaProdIni").getValue();
				var valDtrFin=this.byId("fechaProdFin").getValue();

				if(!this.existeFecha(valDtrIni) && valDtrIni){

					MessageBox.error("Ingrese un formato de fecha correcto");
	  
					this.getView().byId("fechaProdIni").setValueState("Error");
	  
					BusyIndicator.hide();
	  
					return false;
	  
				  }
				  this.getView().byId("fechaProdIni").setValueState("None");
				  if(!this.existeFecha(valDtrFin) && valDtrFin){

					MessageBox.error("Ingrese un formato de fecha correcto");
	  
					this.getView().byId("fechaProdFin").setValueState("Error");
	  
					BusyIndicator.hide();
	  
					return false;
	  
				  }
				  this.getView().byId("fechaProdFin").setValueState("None");


				var marea1=this.byId("mareaLow").getValue();
				var marea2=this.byId("mareaHigh").getValue();
				if(!valDtrIni && !valDtrFin && !marea1 && !marea2 && !propiedad && motivos.length==0 && !embarcacionLow && !embarcacionHigh && !plantaLow && !plantaHigh){

					var msj="Por favor ingrese un dato de selección";
				
					MessageBox.error(msj);
					BusyIndicator.hide();
					return false;
				}
				/*
				if(valueDateRange){
					 valDtrIni = valueDateRange.split("-")[0].trim();
					 valDtrFin = valueDateRange.split("-")[1].trim();
				}*/
					
					
					if (valDtrIni) {							
						fechaInicio = valDtrIni.split("/")[2].concat(valDtrIni.split("/")[1], valDtrIni.split("/")[0]);
					}
					if (valDtrFin) {
						fechaFin = valDtrFin.split("/")[2].concat(valDtrFin.split("/")[1], valDtrFin.split("/")[0]);
					}
					if(valDtrIni && !valDtrFin){
						fechaFin=fechaInicio;
					}
					if(valDtrFin && !valDtrIni){
						fechaInicio=fechaFin;
					}
	

					const input = 'INPUT';
					const multiinput = 'MULTIINPUT';
					const comboBox = "COMBOBOX";
					const multiComboBox = "MULTICOMBOBOX";



					if (mareaLow || mareaHigh) {
						const isMulti = mareaLow && mareaHigh;
						const marea = !isMulti ? mareaLow ? mareaLow : mareaHigh : null;
						options.push({
							cantidad: "10",
							control: multiinput,
							key: "NRMAR",
							valueHigh: isMulti ? mareaHigh : "",
							valueLow: isMulti ? mareaLow : marea
						});
					}

					if (plantaLow || plantaHigh) {
						const isMulti = plantaHigh && plantaLow;
						const planta = !isMulti ? plantaLow ? plantaLow : plantaHigh : null;

						options.push({
							cantidad: "10",
							control: multiinput,
							key: "CDPTA",
							valueHigh: isMulti ? plantaHigh : "",
							valueLow: isMulti ? plantaLow : planta
						});
					}


					if (embarcacionLow || embarcacionHigh) {
						const isMulti = embarcacionHigh && embarcacionLow;
						const embarcacion = !isMulti ? embarcacionLow ? embarcacionLow : embarcacionHigh : null;

						options.push({
							cantidad: "10",
							control: multiinput,
							key: "CDEMB",
							valueHigh: isMulti ? embarcacionHigh : "",
							valueLow: isMulti ? embarcacionLow : embarcacion
						});
					}

					if (propiedad) {
						options.push({
							cantidad: "10",
							control: comboBox,
							key: "INPRP",
							valueHigh: "",
							valueLow: propiedad
						});
					}

					motivos.forEach(motivo => {
						options.push({
							cantidad: "10",
							control: comboBox,
							key: "CDMMA",
							valueHigh: "",
							valueLow: motivo
						});
					});

					if (fechaInicio || fechaFin) {
						const isRange = fechaInicio && fechaFin;
						const fecha = !isRange ? fechaInicio ? fechaInicio : fechaFin : null;

						options.push({
							cantidad: "10",
							control: multiinput,
							key: "FIMAR",
							valueHigh: isRange ? fechaFin : "",
							valueLow: isRange ? fechaInicio : fecha
						});
					}

					let body = {
						option: [],
						options: options,
						p_user: this.userOperation,
						rowcount: numRegistros
					};
					console.log(body);
					fetch(`${this.onLocation()}reportepesca/ConsultarMareas`, {
						method: 'POST',
						body: JSON.stringify(body)
					})
						.then(resp => resp.json())
						.then(data => {
							var title="Lista de registros: "+data.s_marea.length;
							this.byId("title").setText(title);
							//this.getModel("consultaMareas").setProperty("/titulo", mssg);
							this.getModel("consultaMareas").setProperty("/items", data.s_marea);
							this.getModel("consultaMareas").refresh();
							//this.getModel("consultaMareas").setProperty("/numCalas", data.s_marea.length);
							BusyIndicator.hide();

							for(var i=0; i< data.s_marea.length;i++){
								data.s_marea[i].NRMAR=String(data.s_marea[i].NRMAR);
							}
							
							console.log(data);
						})
						.catch(error => console.error(error));


				
			},
			detalleMarea: async function (event) {
				//BusyIndicator.show(0); @pprincipe comment
				var obj = event.getSource().getParent().getBindingContext("consultaMareas").getObject();
				if (obj) {
					var cargarMarea = await this.cargarDatosMarea(obj);
					if (cargarMarea) {

						let oCrossAppNavigator = await sap.ushell.Container.getServiceAsync("CrossApplicationNavigation"); 
						oCrossAppNavigator.isIntentSupported(["detallemarea-display"])
						.done(function(aResponses) { 

						}) 
						.fail(function() { 
							new sap.m.MessageToast("Provide corresponding intent to navigate"); 
						}); 
						// generate the Hash to display a employee Id 
						var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({ 
							target: { 
								semanticObject: "detallemarea", 
								action: "display" 
							} ,
							params: {
								appName : "ConsultaMareas",
								marea: obj.NRMAR,
								isAdmin : this.IsAdmin
							}
						})) || "";
						//Generate a URL for the second application 
						var url = window.location.href.split('#')[0] + hash; 
						//Navigate to second app 
						sap.m.URLHelper.redirect(url, true);

						// var modelo = this.getOwnerComponent().getModel("DetalleMarea");
						// var modeloConsultaMarea = this.getModel("consultaMareas");
						// var dataModelo = modelo.getData();
						// var dataConsultaMarea = modeloConsultaMarea.getData();
						// //var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.Session); @pprincipe
                        // //@pprincipe Inicio add
                        // this.getOwnerComponent().setModel(modelo, "DataModelo");
                        // this.getOwnerComponent().setModel(modeloConsultaMarea, "ConsultaMarea");
                        // var objAppOrigin = {};
                        // objAppOrigin.AppOrigin = 'consultamareas';
                        // var modelAppOrigin = new JSONModel();
                        // modelAppOrigin.setData(objAppOrigin);
                        // this.getOwnerComponent().setModel(modelAppOrigin, "AppOrigin");

                        // //@pprincipe Fin add

                        //@pprincipe Inicio coment
						/*oStore.put("DataModelo", dataModelo);
						oStore.put("ConsultaMarea", dataConsultaMarea);
						oStore.put("AppOrigin", "consultamareas");
						BusyIndicator.hide();
						var oCrossAppNav = sap.ushell.Container.getService("CrossApplicationNavigation");
						oCrossAppNav.toExternal({
							target: {
								semanticObject: "mareaevento",
								action: "display"
							}
						});*/
                        //@pprincipe Fin coment
					}else{
						//BusyIndicator.hide();@pprincipe comment
					}
				}
                //pprincipe Inicio
            //     var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			
			// oRouter.navTo('RouteDetalle', {
			// 	aux: 'X'
			// });
                //pprincipe Fin
			},
			filterGlobally: function (oEvent) {
				let sQuery = oEvent.getSource().getValue();
				const table = this.byId('tableData');
				const tableItemsBinding = table.getBinding('rows');
				const dataTable = tableItemsBinding.oList;
				let filters = [];

				this.dataTableKeys.forEach(k => {
					const typeValue = typeof dataTable[0][k];
					let vOperator = null;

					switch (typeValue) {
						case 'string':
							vOperator = FilterOperator.Contains;
							break;
						case 'number':
							vOperator = FilterOperator.EQ;
							break;
					}

					const filter = new Filter(k, vOperator, sQuery);
					filters.push(filter);
				});

				const oFilters = new Filter({
					filters: filters
				});

				/**
				 * Actualizar tabla
				 */
				tableItemsBinding.filter(oFilters, "Application");
			},
			/*
			createColumnConfig: function () {
				var aCols = [];
				const title = [];
				const table = this.byId('tableData');
				let tableColumns = table.getColumns();
				const dataTable = table.getBinding('items').oList;

				
				for (let i = 0; i < tableColumns.length; i++) {
					let header = tableColumns[i].getAggregation('header');
					if (header) {
						let headerColId = tableColumns[i].getAggregation('header').getId();
						let headerCol = sap.ui.getCore().byId(headerColId);
						let headerColValue = headerCol.getText();

						title.push(headerColValue);
					}
				}

				title.pop();

				
				const properties = title.map((t, i) => {
					return {
						column: t,
						key: this.dataTableKeys[i]
					}
				})

				properties.forEach(p => {
					const typeValue = typeof dataTable[0][p.key];
					let propCol = {
						label: p.column,
						property: p.key
					};

					switch (typeValue) {
						case 'number':
							propCol.type = EdmType.Number;
							propCol.scale = 0;
							break;
						case 'string':
							propCol.type = EdmType.String;
							propCol.wrap = true;
							break;
					}

					aCols.push(propCol);
				});

				return aCols;
			},
			
			exportarExcel: function (event) {
				var aCols, oRowBinding, oSettings, oSheet, oTable;

				if (!this._oTable) {
					this._oTable = this.byId('tableData');
				}

				oTable = this._oTable;
				oRowBinding = oTable.getBinding('rows');
				aCols = this.getColumnsConfig();

				oSettings = {
					workbook: {
						columns: aCols,
						context: {
							sheetName: "CONSULTA DE MAREAS CERRADAS"
						}
					},
					dataSource: oRowBinding,
					fileName: 'Consulta de Mareas Cerradas.xlsx',
					worker: false // We need to disable worker because we are using a Mockserver as OData Service
				};

				oSheet = new Spreadsheet(oSettings);
				oSheet.build().finally(function () {
					oSheet.destroy();
				});
			},*/
			onExportExcel: function() {
				var d=Date();
				var date=this.castDate(d);
				var hour=this.castHour(d);
				console.log(hour);

				var aCols, aProducts, oSettings, oSheet;
	
				aCols = this.createColumnConsultaMareas();
				aProducts = this.getView().getModel("consultaMareas").getProperty('/items');
	
				oSettings = {
					
					workbook: { 
						columns: aCols,
						context: {
							application: 'Debug Test Application',
							version: '1.95.0',
							title: 'Some random title',
							modifiedBy: 'John Doe',
							metaSheetName: 'Custom metadata',
							sheetName: "CONSULTA DE MAREAS CERRADAS"
						}
						
					},
					dataSource: aProducts,
					fileName:'Consulta de Mareas Cerradas_'+date+'_'+hour+'.xlsx'
				};
	
				oSheet = new Spreadsheet(oSettings);
				oSheet.build()
					.then( function() {
						MessageToast.show('El Archivo ha sido exportado correctamente');
					})
					.finally(oSheet.destroy);
			},
			createColumnConsultaMareas: function() {
				return [
					
					{
						label: 'Num. Marea',
						property: 'NRMAR',
						type: EdmType.Number,
						scale:3,
						delimiter: true,
						width:16
					},
					{
						label: 'Planta',
						property: 'DESCR',
						type: EdmType.String,
						width:12
					},
					{
						label: 'Empresa',
						property: 'DSEMP',
						type: EdmType.String,
						width:35
					},
					{
						label: 'Nombre de Embarcacion',
						property: 'NMEMB',
						type: EdmType.String
					},
					{
						label: 'Sistema Pesca',
						property: 'DSSPE',
						type: EdmType.String,
						width:14
					},
					{
						label: 'Propiedad',
						property: 'DESC_INPRP',
						type: EdmType.String,
						width:12
					},
					{
						label: 'Motivo',
						property: 'DESC_CDMMA',
						type: EdmType.String,
						width:12
					},
					{
						label: 'Inicio Marea',
						property: ["FEMAR","HAMAR"],
						type: EdmType.String,
						template: "{0} {1}",
						width:16
					},
					{
						label: 'Cierre Marea',
						property: ["FXMAR","HXMAR"],
						type: EdmType.String,
						template: "{0} {1}",
						width:16
					},
					{
						label: 'Zarpe',
						property: ["FHZAR","HRZAR"],
						type: EdmType.String,
						template: "{0} {1}",
						width:16
					},
					{
						label: 'Lleg. zona',
						property: ["FHLLE","HRLLE"],
						type: EdmType.String,
						template: "{0} {1}",
						width:16
					},
					{
						label: 'Inicio Envase',
						property: ["FICAL","HICAL"],
						type: EdmType.String,
						template: "{0} {1}",
						width:16
					},
					{
						label: 'Fin Envase',
						property: ["FFCAL","HFCAL"],
						type: EdmType.String,
						template: "{0} {1}",
						width:16
					},
					{
						label: 'Salid. zona',
						property: ["FCSAZ","HRSAZ"],
						type: EdmType.String,
						template: "{0} {1}",
						width:16
					},
					{
						label: 'Arrib. Puerto',
						property: ["FCARP","HRARP"],
						type: EdmType.String,
						template: "{0} {1}",
						width:16
					},
					{
						label: 'Ini. Descarga',
						property: ["FIDES","HIDES"],
						type: EdmType.String,
						template: "{0} {1}",
						width:16
					},
					{
						label: 'Fin Descarga',
						property: ["FFDES","HFDES"],
						type: EdmType.String,
						template: "{0} {1}",
						width:16
					},
					{
						label: 'Descarg',
						property: 'CNTDS',
						type: EdmType.Number,
						scale:3,
						delimiter: true
					},
					{
						label: 'Declar.',
						property: 'CNPDC',
						type: EdmType.Number,
						scale:3,
						delimiter: true
					}
					];
			},
			castDate: function (date) {
				var d = new Date(date),
					month = '' + (d.getMonth() + 1),
					day = '' + d.getDate(),
					year = d.getFullYear();
	
				if (month.length < 2)
					month = '0' + month;
				if (day.length < 2)
					day = '0' + day;
	
				return day+""+month+""+year;
			},
			castHour: function(date){
				var d = new Date(date),

					 hora = d.getHours(),
					 minutos = d.getMinutes(),
					 segundos = d.getSeconds(),
					 strHor = "";
					if(hora > 0 && hora < 10){
						strHor = "0" + hora;
					}else{
						strHor = hora;
					}
					let strMin = "";
					if(minutos > 0 && minutos < 10){
						strMin = "0" + minutos;
					}else{
						strMin = minutos;
					}
					let strSec = "";
					if(segundos > 0 && segundos < 10){
						strSec = "0" + segundos;
					}else{
						strSec = segundos;
					}
					return strHor + "" + strMin + "" + strSec;
				
			},
			onSelectEmba: function (evt) {
				var objeto = evt.getParameter("rowContext").getObject();
				if (objeto) {
					var cdemb = objeto.CDEMB;
					if (this.currentInputEmba.includes("inputId0_R")) {
						this.byId("inputId0_R").setValue(cdemb);
					} else if (this.currentInputEmba.includes("inputId1_R")) {
						this.byId("inputId1_R").setValue(cdemb);
					}
					this.getDialog().close();
				}
			},

			onSearchEmbarcacion: function (evt) {
				BusyIndicator.show(0);
				var idEmbarcacion = sap.ui.getCore().byId("idEmba").getValue();
				var idEmbarcacionDesc = sap.ui.getCore().byId("idNombEmba").getValue();
				var idMatricula = sap.ui.getCore().byId("idMatricula").getValue();
				var idRuc = sap.ui.getCore().byId("idRucArmador").getValue();
				var idArmador = sap.ui.getCore().byId("idDescArmador").getValue();
				var idPropiedad = sap.ui.getCore().byId("indicadorPropiedad").getSelectedKey();
				var options = [];
				var options2 = [];
				let embarcaciones = [];
				options.push({
					"cantidad": "20",
					"control": "COMBOBOX",
					"key": "ESEMB",
					"valueHigh": "",
					"valueLow": "O"
				})
				if (idEmbarcacion) {
					options.push({
						"cantidad": "20",
						"control": "INPUT",
						"key": "CDEMB",
						"valueHigh": "",
						"valueLow": idEmbarcacion

					});
				}
				if (idEmbarcacionDesc) {
					options.push({
						"cantidad": "20",
						"control": "INPUT",
						"key": "NMEMB",
						"valueHigh": "",
						"valueLow": idEmbarcacionDesc.toUpperCase()

					});
				}
				if (idMatricula) {
					options.push({
						"cantidad": "20",
						"control": "INPUT",
						"key": "MREMB",
						"valueHigh": "",
						"valueLow": idMatricula
					});
				}
				if (idPropiedad) {
					options.push({
						"cantidad": "20",
						"control": "COMBOBOX",
						"key": "INPRP",
						"valueHigh": "",
						"valueLow": idPropiedad
					});
				}
				if (idRuc) {
					options2.push({
						"cantidad": "20",
						"control": "INPUT",
						"key": "STCD1",
						"valueHigh": "",
						"valueLow": idRuc
					});
				}
				if (idArmador) {
					options2.push({
						"cantidad": "20",
						"control": "INPUT",
						"key": "NAME1",
						"valueHigh": "",
						"valueLow": idArmador.toUpperCase()
					});
				}

				this.primerOption = options;
				this.segundoOption = options2;

				var body = {
					"option": [

					],
					"option2": [

					],
					"options": options,
					"options2": options2,
					"p_user": "BUSQEMB",
					//"p_pag": "1" //por defecto la primera parte
				};

				fetch(`${this.onLocation()}embarcacion/ConsultarEmbarcacion/`,
					{
						method: 'POST',
						body: JSON.stringify(body)
					})
					.then(resp => resp.json()).then(data => {
						console.log("Emba: ", data);
						embarcaciones = data.data;

						this.getModel("consultaMareas").setProperty("/embarcaciones", embarcaciones);
						this.getModel("consultaMareas").refresh();

						if (!isNaN(data.p_totalpag)) {
							if (Number(data.p_totalpag) > 0) {
								sap.ui.getCore().byId("goFirstPag").setEnabled(true);
								sap.ui.getCore().byId("goPreviousPag").setEnabled(true);
								sap.ui.getCore().byId("comboPaginacion").setEnabled(true);
								sap.ui.getCore().byId("goLastPag").setEnabled(true);
								sap.ui.getCore().byId("goNextPag").setEnabled(true);
								var tituloTablaEmba = "Página 1/" + Number(data.p_totalpag);
								this.getModel("consultaMareas").setProperty("/TituloEmba", tituloTablaEmba);
								var numPag = Number(data.p_totalpag) + 1;
								var paginas = [];
								for (let index = 1; index < numPag; index++) {
									paginas.push({
										numero: index
									});
								}
								this.getModel("consultaMareas").setProperty("/NumerosPaginacion", paginas);
								sap.ui.getCore().byId("comboPaginacion").setSelectedKey("1");
								this.currentPage = "1";
								this.lastPage = data.p_totalpag;
							} else {
								var tituloTablaEmba = "Página 1/1";
								this.getModel("consultaMareas").setProperty("/TituloEmba", tituloTablaEmba);
								this.getModel("consultaMareas").setProperty("/NumerosPaginacion", []);
								sap.ui.getCore().byId("goFirstPag").setEnabled(false);
								sap.ui.getCore().byId("goPreviousPag").setEnabled(false);
								sap.ui.getCore().byId("comboPaginacion").setEnabled(false);
								sap.ui.getCore().byId("goLastPag").setEnabled(false);
								sap.ui.getCore().byId("goNextPag").setEnabled(false);
								this.currentPage = "1";
								this.lastPage = data.p_totalpag;
							}
						}


						//sap.ui.getCore().byId("comboPaginacion").setVisible(true);

						BusyIndicator.hide();
					}).catch(error => console.log(error));
			},


			onChangePag: function (evt) {
				var id = evt.getSource().getId();
				var oControl = sap.ui.getCore().byId(id);
				var pagina = oControl.getSelectedKey();
				this.currentPage = pagina;
				this.onNavPage();
			},

			onSetCurrentPage: function (evt) {
				var id = evt.getSource().getId();
				if (id == "goFirstPag") {
					this.currentPage = "1";
				} else if (id == "goPreviousPag") {
					if (!isNaN(this.currentPage)) {
						if (this.currentPage != "1") {
							var previousPage = Number(this.currentPage) - 1;
							this.currentPage = previousPage.toString();
						}
					}
				} else if (id == "goNextPag") {
					if (!isNaN(this.currentPage)) {
						if (this.currentPage != this.lastPage) {
							var nextPage = Number(this.currentPage) + 1;
							this.currentPage = nextPage.toString();
						}
					}
				} else if (id == "goLastPag") {
					this.currentPage = this.lastPage;
				}
				this.onNavPage();
			},

			onNavPage: function () {
				BusyIndicator.show(0);
				let embarcaciones = [];
				var body = {
					"option": [

					],
					"option2": [

					],
					"options": this.primerOption,
					"options2": this.segundoOption,
					"p_user": "BUSQEMB",
					"p_pag": this.currentPage
				};

				fetch(`${this.onLocation()}embarcacion/ConsultarEmbarcacion/`,
					{
						method: 'POST',
						body: JSON.stringify(body)
					})
					.then(resp => resp.json()).then(data => {
						console.log("Emba: ", data);
						embarcaciones = data.data;

						this.getModel("consultaMareas").setProperty("/embarcaciones", embarcaciones);
						this.getModel("consultaMareas").refresh();
						var tituloTablaEmba = "Página " + this.currentPage + "/" + Number(data.p_totalpag);
						this.getModel("consultaMareas").setProperty("/TituloEmba", tituloTablaEmba);
						sap.ui.getCore().byId("comboPaginacion").setSelectedKey(this.currentPage);
						BusyIndicator.hide();
					}).catch(error => console.log(error));
			},
			getDialog: function () {
				if (!this.oDialog) {
					this.oDialog = sap.ui.xmlfragment("tasa.com.aprobacionprecios.view.Embarcacion", this);
					this.getView().addDependent(this.oDialog);
				}
				return this.oDialog;
			},
			onOpenEmba: function (evt) {
				this.currentInputEmba = evt.getSource().getId();
				this.getDialog().open();
			},

			onCerrarEmba: function () {
				this.clearFilterEmba();
				this.getDialog().close();
				this.getModel("consultaMareas").setProperty("/embarcaciones", "");
				this.getModel("consultaMareas").setProperty("/TituloEmba", "");
				sap.ui.getCore().byId("comboPaginacion").setEnabled(false);
				sap.ui.getCore().byId("goFirstPag").setEnabled(false);
				sap.ui.getCore().byId("goPreviousPag").setEnabled(false);
				sap.ui.getCore().byId("comboPaginacion").setEnabled(false);
				sap.ui.getCore().byId("goLastPag").setEnabled(false);
				sap.ui.getCore().byId("goNextPag").setEnabled(false);
				sap.ui.getCore().byId("comboPaginacion").setSelectedKey("1");
			},
			buscarEmbarca: function (evt) {
				console.log(evt);
				var indices = evt.mParameters.listItem.oBindingContexts.consultaMareas.sPath.split("/")[2];
				console.log(indices);

				var data = this.getView().getModel("consultaMareas").oData.embarcaciones[indices].CDEMB;
				if (this.currentInputEmba.includes("inputId0_R")) {
					this.byId("inputId0_R").setValue(data);
				} else if (this.currentInputEmba.includes("inputId1_R")) {
					this.byId("inputId1_R").setValue(data);
				}
				this.onCerrarEmba();

			},
			getColumnsConfig: function () {
				var aColumns = [
					{
						label: "Marea",
						property: "NRMAR",
						type: "number"
					},					
					{
						label: "Centro",
						property: "WERKS",
					},
					{
						label: "Planta",
						property: "DESCR",
					},
					{
						label: "Empresa",
						property: "DSEMP",
					},
					{
						label: "Nombre Embarcación",
						property: "NMEMB",
					},
					{
						label: "Sistema de Pesca",
						property: "DSSPE",
					},
					{
						label: "Propiedad",
						property: "DESC_INPRP",
					},
					{
						label: "Motivo",
						property: "DESC_CDMMA",
					},
					{
						label: "Fecha Inicio Marea",
						property: "FEMAR",
					},
					{
						label: "Hora Inicio Marea",
						property: "HAMAR",
					},
					{
						label: "Fecha Cierre Marea",
						property: "FXMAR",
					},
					{
						label: "Hora Cierre Marea",
						property: "HXMAR",
					},
					{
						label: "Fecha Zarpe",
						property: "FHZAR",
					},
					{
						label: "Hora Zarpe",
						property: "HRZAR",
					},
					{
						label: "Fecha Llegada Zona",
						property: "FHLLE",
					},
					{
						label: "Hora Llegada Zona",
						property: "HRLLE",
					},
					{
						label: "Fecha Inicio Envase",
						property: "FICAL",
					},
					{
						label: "Hora Inicio Envase",
						property: "HICAL",
					},
					{
						label: "Fecha Fin Envase",
						property: "FFCAL",
					},
					{
						label: "Hora Fin Envase",
						property: "HFCAL",
					},
					{
						label: "Fecha Salida Zona",
						property: "FCSAZ",
					},
					{
						label: "Hora Salida Zona",
						property: "HRSAZ",
					},
					{
						label: "Fecha Arribo",
						property: "FCARP",
					},
					{
						label: "Hora Arribo",
						property: "HOARR",
					},
					{
						label: "Fecha Ini Desc",
						property: "FIDES",
					},
					{
						label: "Hora Ini Desc",
						property: "HIDES",
					},
					{
						label: "Fecha Fin Desc",
						property: "FFDES",
					},
					{
						label: "Hora Fin Desc",
						property: "HFDES",
					},
					{
						label: "Descargada",
						property: "CNTDS",
						type: "number",
						scale: 3
					},
					{
						label: "Declarada",
						property: "CNPDC",
						type: "number",
						scale: 3
					}
				];
				return aColumns;
			},

			clearFields: function () {
				this.byId("mareaLow").setValue(null);
				this.byId("mareaHigh").setValue(null);
				this.byId("plantaLow").setValue(null);
				this.byId("plantaHigh").setValue(null);
				this.byId("inputId0_R").setValue(null);
				this.byId("inputId1_R").setValue(null);
				this.byId("propiedad").setSelectedKey(null);
				this.byId("motivos").setSelectedKeys(null);
				//this.byId("idDateRangeSelec").setValue(null);
				this.getModel("consultaMareas").setProperty("/items", []);
				this.byId("fechaProdIni").setValue(null);
				this.byId("fechaProdFin").setValue(null);
				var cantidadRegistros="Lista de registros: 0";
				this.byId("title").setText(cantidadRegistros);
			},

			clearFilterEmba: function () {
				sap.ui.getCore().byId("idEmba").setValue(null);
				sap.ui.getCore().byId("idNombEmba").setValue(null);
				sap.ui.getCore().byId("idRucArmador").setValue(null);
				sap.ui.getCore().byId("idMatricula").setValue(null);
				sap.ui.getCore().byId("indicadorPropiedad").setSelectedKey(null);
				sap.ui.getCore().byId("idDescArmador").setValue(null);
				//sap.ui.getCore().byId("comboPaginacion").setVisible(false);
				this.getModel("consultaMareas").setProperty("/embarcaciones", []);
				this.getModel("consultaMareas").setProperty("/NumerosPaginacion", []);
				this.getModel("consultaMareas").refresh();
			},

			getDialog: function () {
				if (!this.oDialog) {
					this.oDialog = sap.ui.xmlfragment("com.tasa.consultamareas.view.Embarcacion", this);
					this.getView().addDependent(this.oDialog);
				}
				return this.oDialog;
			},

			onSearchHelp:function(oEvent){
				let sIdInput = oEvent.getSource().getId(),
				oModel = this.getModel(),
				nameComponent="busqembarcaciones",
				idComponent="busqembarcaciones",
				urlComponent=this.HOST_HELP+".AyudasBusqueda.busqembarcaciones-1.0.0",
				oView = this.getView(),
		
					oInput = this.getView().byId(sIdInput);	
				
				
				oModel.setProperty("/input",oInput);
	
				if(!this.DialogComponent){
					this.DialogComponent = new sap.m.Dialog({
						title:"Búsqueda de embarcaciones",
						icon:"sap-icon://search",
						state:"Information",
						endButton:new sap.m.Button({
							icon:"sap-icon://decline",
							text:"Cerrar",
							type:"Reject",
							press:function(oEvent){
								this.onCloseDialog(oEvent);
							}.bind(this)
						})
					});
					oView.addDependent(this.DialogComponent);
					oModel.setProperty("/idDialogComp",this.DialogComponent.getId());
				}
	
				let comCreateOk = function(oEvent){
					BusyIndicator.hide();
				};
	
				
				if(this.DialogComponent.getContent().length===0){
					BusyIndicator.show(0);
					let oComponent = new sap.ui.core.ComponentContainer({
						id:idComponent,
						name:nameComponent,
						url:urlComponent,
						settings:{},
						componentData:{},
						propagateModel:true,
						componentCreated:comCreateOk,
						height:'100%',
						// manifest:true,
						async:false
					});
	
					this.DialogComponent.addContent(oComponent);
				}
				
				this.DialogComponent.open();
			},
			onCloseDialog:function(oEvent){
				oEvent.getSource().getParent().close();
			},
			existeFecha: function(fecha) {

				var fechaf = fecha.split("/");
	
				var d = fechaf[0];
	
				var m = fechaf[1];
	
				var y = fechaf[2];
	
				return m > 0 && m < 13 && y > 0 && y < 32768 && d > 0 && d <= (new Date(y, m, 0)).getDate();
	
			},
			

		});
	});
