"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
// Services
var config_service_1 = require("../config.service");
var davis_service_1 = require("../../davis.service");
var ConfigAlexaComponent = (function () {
    function ConfigAlexaComponent(davisService, iConfig) {
        this.davisService = davisService;
        this.iConfig = iConfig;
        this.submitted = false;
        this.buttonText = "Skip";
    }
    ConfigAlexaComponent.prototype.validate = function () {
        if (this.davisService.values.alexa_ids) {
            this.buttonText = "Continue";
        }
        else {
            this.buttonText = "Skip";
        }
    };
    ConfigAlexaComponent.prototype.doSubmit = function () {
        var _this = this;
        if (this.davisService.values.alexa_ids) {
            this.davisService.connectAlexa()
                .then(function (result) {
                _this.davisService.config["alexa"].success = true;
                _this.iConfig.SelectView("slack");
            }, function (error) {
                console.log(error);
                _this.davisService.config["alexa"].success = false;
            });
        }
        else {
            this.iConfig.SelectView("slack");
        }
        this.submitted = true;
    };
    ConfigAlexaComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: "config-alexa",
            templateUrl: "./config-alexa.component.html",
        }), 
        __metadata('design:paramtypes', [davis_service_1.DavisService, config_service_1.ConfigService])
    ], ConfigAlexaComponent);
    return ConfigAlexaComponent;
}());
exports.ConfigAlexaComponent = ConfigAlexaComponent;
//# sourceMappingURL=config-alexa.component.js.map