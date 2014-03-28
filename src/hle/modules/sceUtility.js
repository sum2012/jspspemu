define(["require", "exports", '../utils'], function(require, exports, utils) {
    var createNativeFunction = utils.createNativeFunction;

    var sceUtility = (function () {
        function sceUtility(context) {
            var _this = this;
            this.context = context;
            this.currentStep = 0 /* NONE */;
            this.sceUtilitySavedataInitStart = createNativeFunction(0x50C4CD57, 150, 'uint', 'void*', this, function (paramsPtr) {
                _this.currentStep = 3 /* SUCCESS */;
                return 0;
            });
            this.sceUtilitySavedataShutdownStart = createNativeFunction(0x9790B33C, 150, 'uint', '', this, function () {
                _this.currentStep = 4 /* SHUTDOWN */;
                return 0;
            });
            this.sceUtilitySavedataGetStatus = createNativeFunction(0x8874DBE0, 150, 'uint', '', this, function () {
                try  {
                    return _this.currentStep;
                } finally {
                    if (_this.currentStep == 4 /* SHUTDOWN */)
                        _this.currentStep = 0 /* NONE */;
                }
            });
        }
        return sceUtility;
    })();
    exports.sceUtility = sceUtility;

    var DialogStepEnum;
    (function (DialogStepEnum) {
        DialogStepEnum[DialogStepEnum["NONE"] = 0] = "NONE";
        DialogStepEnum[DialogStepEnum["INIT"] = 1] = "INIT";
        DialogStepEnum[DialogStepEnum["PROCESSING"] = 2] = "PROCESSING";
        DialogStepEnum[DialogStepEnum["SUCCESS"] = 3] = "SUCCESS";
        DialogStepEnum[DialogStepEnum["SHUTDOWN"] = 4] = "SHUTDOWN";
    })(DialogStepEnum || (DialogStepEnum = {}));
});
//# sourceMappingURL=sceUtility.js.map
