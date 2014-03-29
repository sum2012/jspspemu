define(["require", "exports", '../utils'], function(require, exports, utils) {
    var createNativeFunction = utils.createNativeFunction;

    var sceUmdUser = (function () {
        function sceUmdUser(context) {
            this.context = context;
            this.sceUmdRegisterUMDCallBack = createNativeFunction(0xAEE7404D, 150, 'uint', 'int', this, function (callbackId) {
                console.warn('Not implemented sceUmdRegisterUMDCallBack');
                return 0;
            });
            this.sceUmdCheckMedium = createNativeFunction(0x46EBB729, 150, 'uint', '', this, function () {
                console.warn('Not implemented sceUmdCheckMedium');
                return 0;
            });
            this.sceUmdWaitDriveStat = createNativeFunction(0x8EF08FCE, 150, 'uint', 'uint', this, function (pspUmdState) {
                console.warn('Not implemented sceUmdWaitDriveStat');
                return 0;
            });
            this.sceUmdWaitDriveStatCB = createNativeFunction(0x4A9E5E29, 150, 'uint', 'uint', this, function (pspUmdState, timeout) {
                console.warn('Not implemented sceUmdWaitDriveStatCB');
                return 0;
            });
            this.sceUmdActivate = createNativeFunction(0xC6183D47, 150, 'uint', 'int/string', this, function (mode, drive) {
                console.warn('Not implemented sceUmdActivate');
                return 0;
            });
            this.sceUmdGetDriveStat = createNativeFunction(0x6B4A146C, 150, 'uint', '', this, function () {
                return 2 /* PSP_UMD_PRESENT */ | 16 /* PSP_UMD_READY */ | 32 /* PSP_UMD_READABLE */;
            });
            this.sceUmdWaitDriveStatWithTimer = createNativeFunction(0x56202973, 150, 'uint', 'uint/uint', this, function (state, timeout) {
                return Promise.resolve(0);
            });
        }
        return sceUmdUser;
    })();
    exports.sceUmdUser = sceUmdUser;

    var PspUmdState;
    (function (PspUmdState) {
        PspUmdState[PspUmdState["PSP_UMD_INIT"] = 0x00] = "PSP_UMD_INIT";
        PspUmdState[PspUmdState["PSP_UMD_NOT_PRESENT"] = 0x01] = "PSP_UMD_NOT_PRESENT";
        PspUmdState[PspUmdState["PSP_UMD_PRESENT"] = 0x02] = "PSP_UMD_PRESENT";
        PspUmdState[PspUmdState["PSP_UMD_CHANGED"] = 0x04] = "PSP_UMD_CHANGED";
        PspUmdState[PspUmdState["PSP_UMD_NOT_READY"] = 0x08] = "PSP_UMD_NOT_READY";
        PspUmdState[PspUmdState["PSP_UMD_READY"] = 0x10] = "PSP_UMD_READY";
        PspUmdState[PspUmdState["PSP_UMD_READABLE"] = 0x20] = "PSP_UMD_READABLE";
    })(PspUmdState || (PspUmdState = {}));
});
//# sourceMappingURL=sceUmdUser.js.map
