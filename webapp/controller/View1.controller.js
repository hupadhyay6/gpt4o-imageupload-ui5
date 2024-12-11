sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/core/Fragment',
    'sap/m/MessageToast',
    "sap/m/MessageBox",
    "sap/ui/core/library",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/library",
    "sap/m/Text",
    "sap/m/MenuItem"
],
    function (Controller, Fragment, MessageToast, MessageBox, coreLibrary, Dialog, Button, mobileLibrary, Text, MenuItem) {
        "use strict";
        // shortcut for sap.m.ButtonType
        var ButtonType = mobileLibrary.ButtonType;

        // shortcut for sap.m.DialogType
        var DialogType = mobileLibrary.DialogType;

        // shortcut for sap.ui.core.ValueState
        var ValueState = coreLibrary.ValueState;
        return Controller.extend("project2.controller.View1", {

            onInit: function () {
                this.base64ConsultantLogo = '';
                var oPrompt =  "Please collect the information in the content of the JSON response in a clear and concise manner, highlighting the key points and relevant details in 200 words or less. Ensure the summary is easy to understand and captures the information in the contents of the JSON Format also make sure that JSON word in not used in the summary. JSON is[{\"Description\":\"Crude oil prices & gas price charts. Oil price charts for Brent Crude, WTI & oil futures. Energy news covering oil, petroleum, natural gas and investment ...\",\"Title\":[\"Crude oil prices\",\"price\",\"price\",\"petroleum\"]},{\"Description\":\"WTI crude oil futures advanced 2.1% to close at $72.1 per barrel on Tuesday, rising for a second straight session, as traders discounted the likelihood of a ...\",\"Title\":[\"WTI crude oil futures advanced 2.1% to close at $72.1 per barrel\"]},{\"Description\":\"Oil Price: Get all information on the Price of Oil including News, Charts and Realtime Quotes.\",\"Title\":[\"Get all information on the Price of Oil\"]},{\"Description\":\"Crude Oil & Natural Gas ; USD/bbl. 72.09, +1.53, +2.17% ; USD/bbl. 75.85, -0.19, -0.25% ...\",\"Title\":[\"USD/bbl. 72.09\"]},{\"Description\":\"Crude Oil WTI (NYM $/bbl) Front Month ; Open $70.49 ; Day Range 69.94 - 72.66 ; 52 Week Range 65.27 - 87.67 ; Open Interest 22,842 ; 5 Day. 2.16%.\",\"Title\":[\"Crude Oil WTI (NYM $/bbl) Front Month\"]}]"
                var oModel = this.getOwnerComponent().getModel();
                var sUrl = oModel.sServiceUrl + "getCallChatGPT4-32k";
                var payload = {
                    "contentAIData": {
                        "content": oPrompt,
                        "max_tokens": 4000,
                        "temperature": 0,
                        "frequency_penalty": 0,
                        "presence_penalty": 0
                    }
                };
                jQuery.ajax({
                    url: sUrl,
                    type: "POST",
                    async: true,
                    data: JSON.stringify(payload),
                    contentType: "application/json",
                    success: function (oData) {
                        console.log(oData);
                    },
                    error: function (oError) {
                        var error = oError;
                        debugger;
                    }
                });
            },
            onPress1: function () {
                var oView = this.getView(),
                    oButton = oView.byId("button");

                if (!this._oMenuFragment) {
                    this._oMenuFragment = Fragment.load({
                        name: "project2.view.fragment.Menu",
                        controller: this
                    }).then(function (oMenu) {
                        oMenu.openBy(oButton);
                        this._oMenuFragment = oMenu;
                        return this._oMenuFragment;
                    }.bind(this));
                } else {
                    this._oMenuFragment.openBy(oButton);
                }
            },
            onMenuAction: function (oEvent) {
                debugger
                var oItem = oEvent.getParameter("item");
                this.sItemPath = "";

                while (oItem instanceof MenuItem) {
                    this.sItemPath = oItem.getText() + " > " + this.sItemPath;
                    oItem = oItem.getParent();
                }

                this.sItemPath = this.sItemPath.substr(0, this.sItemPath.lastIndexOf(" > "));
                this.currentSItemPath = this.sItemPath
                this.lastChar = this.sItemPath.replace(/\s/g, "").replace(/-/g, "")
                this.getView().byId("scenario").setValue(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(this.lastChar));
                this.getView().byId("generate_output").setValue("")
                this.getView().byId("prompt_text").setValue("")
                this.getView().byId("evaluate_output").setValue("")

                // MessageToast.show("Action triggered on item: " + sItemPath);
            },
            onMessageInformationDialogPress: function () {
                if (!this.oInfoMessageDialog) {
                    this.oInfoMessageDialog = new Dialog({
                        type: DialogType.Message,
                        title: "Evaluation Criteria",
                        state: ValueState.Information,
                        content: new Text({ text: "\n1. Clarity: This criterion assesses the level of understandability and lack of ambiguity in the prompt. It gauges how easily the prompt can be comprehended.\n\n2. Relevance: This criterion determines the alignment of the prompt with the desired output or task. It measures how closely the prompt relates to the task at hand.\n\n3. Creativity: This criterion gauges the degree of originality or innovative thinking encouraged by the prompt. It evaluates how much the prompt stimulates creative thinking.\n\n4. Coherence: This criterion assesses the logical flow and consistency of ideas within the prompt. It evaluates whether the ideas in the prompt are logically connected and consistent.\n\n5. Completeness: This criterion evaluates whether the prompt covers all necessary aspects and information required for the task. It assesses the comprehensiveness of the prompt." }),
                        beginButton: new Button({
                            type: ButtonType.Emphasized,
                            text: "OK",
                            press: function () {
                                this.oInfoMessageDialog.close();
                            }.bind(this)
                        })
                    });
                }

                this.oInfoMessageDialog.open();
            },
            onSamplePromptDialogPress: function () {
                debugger
                if (this.currentSItemPath) {
                    // if (!this.oInfoMessageDialog) {
                    this.oInfoMessageDialog1 = new Dialog({
                        type: DialogType.Message,
                        title: "Example Prompt",
                        state: ValueState.Information,
                        content: new Text({ text: this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(this.lastChar + "p") }),
                        beginButton: new Button({
                            type: ButtonType.Emphasized,
                            text: "OK",
                            press: function () {
                                this.oInfoMessageDialog1.close();
                            }.bind(this)
                        })
                    });
                    // }

                    this.oInfoMessageDialog1.open();
                }
                else {
                    MessageBox.error("Please select the sceneraio for example prompt.");
                }
            },
            onEvaluate: function (oEvent) {
                debugger
                if (this.getView().byId("prompt_text").mProperties.value != '') {
                    var oGlobalBusyDialog = new sap.m.BusyDialog();
                    oGlobalBusyDialog.open();
                    var that = this
                    // var oUserPrompt = "This is the business scenario for prompt engineering" + that.getView().byId("scenario").getValue() + " business scenario ends here. User Prompt start from here - " + that.getView().byId("prompt_text").mProperties.value
                    //     + "Now you task is the evaluate the user prompt based on the business scenario give on basis of Clarity, Relevance, Completeness, Creativity, Coherence. Your response strictly should in this format what it is mentioned below, don't add any other description - " +
                    //     "'Clarity - score/10 /nRelevance - score/10 /nCompleteness - score/10 /nCreativity - score/10 /nCoherence - score/10 /nTotal Score - avg_of_all/10";
                    var oUserPrompt = "Evaluate the below prompt for the given scenario on parameters Clarity, Relevance, Completeness, Creativity, Coherence on a scale of 1 to 5 and calculate Total as average. Do not show calculation steps, instead directly give scores out of 5 for each parameter and total score out of 5 in JSON Format where parameter will key and score will be the value. Scenario - " + that.getView().byId("scenario").getValue() + " .Prompt - " + that.getView().byId("prompt_text").mProperties.value;
                    var oModel = this.getOwnerComponent().getModel();
                    var sUrl = oModel.sServiceUrl + "getCallChatGPT4_32k";
                    var payload = {
                        "contentAIData": {
                            "content": oUserPrompt,
                            "max_tokens": 4000,
                            "temperature": 0,
                            "frequency_penalty": 0,
                            "presence_penalty": 0
                        }
                    };
                    jQuery.ajax({
                        url: sUrl,
                        type: "POST",
                        async: true,
                        data: JSON.stringify(payload),
                        contentType: "application/json",
                        success: function (oData) {
                            debugger
                            oGlobalBusyDialog.close();
                            console.log(oData);
                            // that.getView().byId("evaluate_output_label").setVisible()
                            // that.getView().byId("evaluate_output").setVisible()
                            that.getView().byId("evaluate_output_btn").setVisible()
                            that.getView().byId("RI_clarity").setVisible()
                            that.getView().byId("RI_relevance").setVisible()
                            that.getView().byId("RI_completeness").setVisible()
                            that.getView().byId("RI_creativity").setVisible()
                            that.getView().byId("RI_coherence").setVisible()
                            that.getView().byId("RI_total").setVisible()
                            that.getView().byId("RI_clarity_label").setVisible()
                            that.getView().byId("RI_relevance_label").setVisible()
                            that.getView().byId("RI_completeness_label").setVisible()
                            that.getView().byId("RI_creativity_label").setVisible()
                            that.getView().byId("RI_coherence_label").setVisible()
                            that.getView().byId("RI_total_label").setVisible()
                            that.json_val = JSON.parse(oData.value.choices[0].message.content)
                            that.getView().byId("RI_clarity").setValue(that.json_val.Clarity);
                            that.getView().byId("RI_relevance").setValue(that.json_val.Relevance);
                            that.getView().byId("RI_completeness").setValue(that.json_val.Completeness);
                            that.getView().byId("RI_creativity").setValue(that.json_val.Creativity);
                            that.getView().byId("RI_coherence").setValue(that.json_val.Coherence);
                            that.getView().byId("RI_total").setValue(that.json_val.Total);
                        },
                        error: function (oError) {
                            var error = oError;
                            debugger;
                        }
                    });
                }
                else {
                    MessageBox.error("Your prompt cannot be empty for evaluation.");
                }



            },
            onPress: function (oEvent) {
                debugger
                if (this.getView().byId("prompt_text").mProperties.value != '') {
                    var oGlobalBusyDialog = new sap.m.BusyDialog();
                    oGlobalBusyDialog.open();
                    var that = this
                    var oUserPrompt = this.getView().byId("prompt_text").mProperties.value;
                    var oModel = this.getOwnerComponent().getModel();
                    var sUrl = oModel.sServiceUrl + "getCallChatGPT4_32k";
                    var payload = {
                        "contentAIData": {
                            "content": oUserPrompt,
                            "max_tokens": 4000,
                            "temperature": 0,
                            "frequency_penalty": 0,
                            "presence_penalty": 0
                        }
                    };
                    jQuery.ajax({
                        url: sUrl,
                        type: "POST",
                        async: true,
                        data: JSON.stringify(payload),
                        contentType: "application/json",
                        success: function (oData) {
                            debugger
                            oGlobalBusyDialog.close();
                            console.log(oData);
                            that.getView().byId("generate_output_label").setVisible()
                            that.getView().byId("generate_output").setVisible()
                            that.getView().byId("generate_output").setValue(oData.value.choices[0].message.content);
                        },
                        error: function (oError) {
                            var error = oError;
                            debugger;
                        }
                    });
                }
                else {
                    MessageBox.error("Prompt cannot be empty. Please write the prompt to get output from LLM.");
                }

            },
            //added by hemant for consultant logo 
            onBrowseConsultantImage: function (oEvent) {
                var logoSrc = ''
                this.base64ConsultantLogo = ''
                var that = this;

                var oFileUploader = that.byId("fileUploader");
                that.uploadData(oFileUploader.FUEl.files[0]);
                oFileUploader.checkFileReadable().then(function () {
                    oFileUploader.upload();
                }, function (error) {
                    MessageToast.show("The file cannot be read. It may have changed.");
                }).then(function () {
                    var oModel = that.getOwnerComponent().getModel();
                    var sUrl = oModel.sServiceUrl + "getCallChatGPT4o";
                    var payload = {
                        "contentAIData": {
                            "content": "Please find the product name, just simply give the name of product nothing else.",
                            "max_tokens": 2000,
                            "temperature": 0,
                            "frequency_penalty": 0,
                            "presence_penalty": 0,
                            "url": that.base64ConsultantLogo
                        }
                    };
                    jQuery.ajax({
                        url: sUrl,
                        type: "POST",
                        async: true,
                        data: JSON.stringify(payload),
                        contentType: "application/json",
                        success: function (oData) {
                            debugger
                            console.log(oData.value.choices[0].message.content);
                            that.getView().byId("responseLabel").setVisible()
                            that.getView().byId("gpt4oResponseTextArea").setVisible()
                            that.getView().byId("gpt4oResponseTextArea").setValue(oData.value.choices[0].message.content)
                        },
                        error: function (oError) {
                            var error = oError;
                            debugger;
                        }
                    });
                    oFileUploader.clear();
                });
                console.log('Image uploaded successfully');
                console.log(that.base64ConsultantLogo)
            },
            // onUploadConsultantImage: function(){
            // 	debugger
            // 	var that = this;
            // 	var ppa_header_id = '';
            // 	var aUrl = this.getOwnerComponent().getModel().sServiceUrl +"PPA_headerData?$filter=projectId eq '" + that.projectID +"' and childContractNumber eq '" + that.childContract + "'";
            // 	jQuery.ajax({
            // 		url: aUrl,
            // 		method: "GET",
            // 		async: false,
            // 		contentType: "application/json",
            // 		success: function (oData) {
            // 			console.log(oData);	
            // 			ppa_header_id = oData.value[0].ID;	

            // 		},
            // 		error: function (jqXHR) {
            // 			sap.m.MessageBox.error(jqXHR.responseText);
            // 		}
            // 	});

            // 	jQuery.ajax({
            // 		url: that.getOwnerComponent().getModel().sServiceUrl + "PPA_headerData(" + ppa_header_id + ")",
            // 		// url: that.getOwnerComponent().getModel().sServiceUrl +"PPA_headerData?$filter=projectId eq '" + that.projectID +"',childContractNumber='" + that.childContract + "'",
            // 		type: "PATCH",
            // 		async: false,
            // 		contentType: "application/json",
            // 		data: JSON.stringify({
            // 			logo: that.base64ConsultantLogo
            // 		}),
            // 		success: function (odata11) {
            // 			console.log(odata11);
            // 			// that.getView().updateBindings(true);
            // 			// that.byId("idApproval").getBinding("items").refresh();
            // 		},
            // 		error: function (oError) {
            // 			sap.m.MessageBox.error("Error");
            // 		}
            // 	});
            // },
            uploadData: function (excelData) {
                debugger
                this.base64ConsultantLogo = ''
                var that = this;
                var reader = new FileReader();
                var logoSrc = ''
                reader.readAsDataURL(excelData);
                reader.onload = function () {
                    that.base64ConsultantLogo = reader.result;
                    logoSrc = reader.result;
                    console.log(that.base64ConsultantLogo);
                }
                this.base64ConsultantLogo = that.base64ConsultantLogo;

            }

        });
    });

