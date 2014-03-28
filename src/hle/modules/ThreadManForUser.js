﻿define(["require", "exports", '../utils', '../../util/struct'], function(require, exports, utils, struct) {
    var createNativeFunction = utils.createNativeFunction;

    var ThreadManForUser = (function () {
        function ThreadManForUser(context) {
            var _this = this;
            this.context = context;
            this.threadUids = new UidCollection(1);
            this.sceKernelCreateThread = createNativeFunction(0x446D8DE6, 150, 'uint', 'string/uint/int/int/int/int', this, function (name, entryPoint, initPriority, stackSize, attribute, optionPtr) {
                var stackPartition = _this.context.memoryManager.stackPartition;
                var newThread = _this.context.threadManager.create(name, entryPoint, initPriority, stackSize);
                newThread.id = _this.threadUids.allocate(newThread);
                return newThread.id;
            });
            this.sceKernelDelayThread = createNativeFunction(0xCEADEB47, 150, 'uint', 'uint', this, function (delayInMicroseconds) {
                return PromiseUtils.delayAsync(delayInMicroseconds / 1000);
            });
            this.sceKernelDelayThreadCB = createNativeFunction(0x68DA9E36, 150, 'uint', 'uint', this, function (delayInMicroseconds) {
                return PromiseUtils.delayAsync(delayInMicroseconds / 1000);
            });
            this.sceKernelGetThreadCurrentPriority = createNativeFunction(0x94AA61EE, 150, 'int', 'HleThread', this, function (currentThread) {
                return currentThread.priority;
            });
            this.sceKernelStartThread = createNativeFunction(0xF475845D, 150, 'uint', 'HleThread/int/int/int', this, function (currentThread, threadId, userDataLength, userDataPointer) {
                var newThread = _this.threadUids.get(threadId);

                console.info(sprintf('sceKernelStartThread: %d:"%s"', threadId, newThread.name));

                var newState = newThread.state;
                newState.GP = currentThread.state.GP;
                newState.RA = CpuSpecialAddresses.EXIT_THREAD;
                if (userDataPointer != null) {
                    newState.SP -= userDataLength;
                    newState.memory.copy(userDataPointer, newState.SP, userDataLength);
                    newState.gpr[4] = userDataLength;
                    newState.gpr[5] = newState.SP;
                }
                newThread.start();
                return Promise.resolve(0);
            });
            this.sceKernelDeleteThread = createNativeFunction(0x9FA03CD3, 150, 'int', 'int', this, function (threadId) {
                var newThread = _this.threadUids.get(threadId);
                _this.threadUids.remove(threadId);
                return 0;
            });
            this.sceKernelExitThread = createNativeFunction(0xAA73C935, 150, 'int', 'HleThread/int', this, function (currentThread, exitStatus) {
                console.info(sprintf('sceKernelExitThread: %d', exitStatus));

                currentThread.exitStatus = exitStatus;
                currentThread.stop();
                throw (new CpuBreakException());
            });
            this.sceKernelTerminateThread = createNativeFunction(0x616403BA, 150, 'int', 'int', this, function (threadId) {
                console.info(sprintf('sceKernelTerminateThread: %d', threadId));

                var newThread = _this.threadUids.get(threadId);
                newThread.stop();
                newThread.exitStatus = 0x800201ac;
                return 0;
            });
            this.sceKernelExitDeleteThread = createNativeFunction(0x809CE29B, 150, 'uint', 'HleThread/int', this, function (currentThread, exitStatus) {
                currentThread.exitStatus = exitStatus;
                currentThread.stop();
                throw (new CpuBreakException());
            });
            this.sceKernelCreateCallback = createNativeFunction(0xE81CAF8F, 150, 'uint', 'string/int/uint', this, function (name, functionCallbackAddr, argument) {
                console.warn('Not implemented ThreadManForUser.sceKernelCreateCallback');
                return 0;
            });
            this.sceKernelSleepThreadCB = createNativeFunction(0x82826F70, 150, 'uint', 'HleThread', this, function (currentThread) {
                currentThread.suspend();
                return Promise.resolve(0);
            });
            this.sceKernelSleepThread = createNativeFunction(0x9ACE131E, 150, 'uint', 'HleThread', this, function (currentThread) {
                currentThread.suspend();
                return Promise.resolve(0);
            });
            this.eventFlagUids = new UidCollection(1);
            this.sceKernelCreateEventFlag = createNativeFunction(0x55C20A00, 150, 'uint', 'string/int/int/void*', this, function (name, attributes, bitPattern, optionsPtr) {
                console.warn(sprintf('Not implemented ThreadManForUser.sceKernelCreateEventFlag("%s", %d, %08X)', name, attributes, bitPattern));
                var eventFlag = new EventFlag();
                eventFlag.name = name;
                eventFlag.attributes = attributes;
                eventFlag.bitPattern = bitPattern;
                return _this.eventFlagUids.allocate(eventFlag);
            });
            this.sceKernelSetEventFlag = createNativeFunction(0x1FB15A32, 150, 'uint', 'int/uint', this, function (id, bitPattern) {
                console.warn(sprintf('Not implemented ThreadManForUser.sceKernelSetEventFlag(%d, %08X)', id, bitPattern));
                return 0;
            });
            this.sceKernelWaitEventFlag = createNativeFunction(0x402FCF22, 150, 'uint', 'int/uint/int/void*/void*', this, function (id, bits, waitType, outBits, timeout) {
                console.warn(sprintf('Not implemented ThreadManForUser.sceKernelWaitEventFlag(%d, %08X, %d)', id, bits, waitType));
                return 0;
            });
            //[HlePspFunction(NID = 0x402FCF22, FirmwareVersion = 150)]
            //public int sceKernelWaitEventFlag(HleEventFlag EventFlag, uint Bits, EventFlagWaitTypeSet WaitType, uint * OutBits, uint * Timeout)
            //{
            this.sceKernelGetSystemTimeLow = createNativeFunction(0x369ED59D, 150, 'uint', '', this, function () {
                //console.warn('Not implemented ThreadManForUser.sceKernelGetSystemTimeLow');
                return new Date().getTime() * 1000;
            });
            this.sceKernelGetSystemTimeWide = createNativeFunction(0x82BC5777, 150, 'long', '', this, function () {
                //console.warn('Not implemented ThreadManForUser.sceKernelGetSystemTimeLow');
                return new Date().getTime() * 1000;
            });
            this.sceKernelGetThreadId = createNativeFunction(0x293B45B8, 150, 'int', 'HleThread', this, function (currentThread) {
                return currentThread.id;
            });
            this.sceKernelReferThreadStatus = createNativeFunction(0x17C1684E, 150, 'int', 'int/void*', this, function (threadId, sceKernelThreadInfoPtr) {
                var thread = _this.threadUids.get(threadId);
                var sceKernelThreadInfo = new SceKernelThreadInfo();
                sceKernelThreadInfo.size = SceKernelThreadInfo.struct.length;
                sceKernelThreadInfo.name = thread.name;

                //console.log(thread.state.GP);
                sceKernelThreadInfo.GP = thread.state.GP;
                sceKernelThreadInfo.priorityInit = thread.initialPriority;
                sceKernelThreadInfo.priority = thread.priority;
                SceKernelThreadInfo.struct.write(sceKernelThreadInfoPtr, sceKernelThreadInfo);
                return 0;
            });
            this.semaporesUid = new UidCollection(1);
            this.sceKernelCreateSema = createNativeFunction(0xD6DA4BA1, 150, 'int', 'string/int/int/int/void*', this, function (name, attribute, initialCount, maxCount, options) {
                console.warn(sprintf('Not implemented ThreadManForUser.sceKernelCreateSema("%s", %d, count=%d, maxCount=%d)', name, attribute, initialCount, maxCount));
                return _this.semaporesUid.allocate(new Semaphore(name, attribute, initialCount, maxCount));
            });
            this.sceKernelDeleteSema = createNativeFunction(0x28B6489C, 150, 'int', 'int', this, function (id) {
                var semaphore = _this.semaporesUid.get(id);
                semaphore.delete();
                _this.semaporesUid.remove(id);
                return 0;
            });
            this.sceKernelCancelSema = createNativeFunction(0x8FFDF9A2, 150, 'uint', 'uint/uint/void*', this, function (id, count, numWaitingThreadsPtr) {
                var semaphore = _this.semaporesUid.get(id);
                if (numWaitingThreadsPtr)
                    numWaitingThreadsPtr.writeInt32(semaphore.numberOfWaitingThreads);
                semaphore.cancel();
                return 0;
            });
            this.sceKernelWaitSema = createNativeFunction(0x4E3A1105, 150, 'int', 'int/int/void*', this, function (id, signal, timeout) {
                console.warn(sprintf('Not implemented ThreadManForUser.sceKernelWaitSema(%d, %d)', id, signal));
                return _this.semaporesUid.get(id).waitAsync(signal);
            });
            this.sceKernelReferSemaStatus = createNativeFunction(0xBC6FEBC5, 150, 'int', 'int/void*', this, function (id, infoStream) {
                var semaphore = _this.semaporesUid.get(id);
                var semaphoreInfo = new SceKernelSemaInfo();
                semaphoreInfo.size = SceKernelSemaInfo.struct.length;
                semaphoreInfo.attributes = semaphore.attributes;
                semaphoreInfo.currentCount = semaphore.currentCount;
                semaphoreInfo.initialCount = semaphore.initialCount;
                semaphoreInfo.maximumCount = semaphore.maximumCount;
                semaphoreInfo.name = semaphore.name;
                semaphoreInfo.numberOfWaitingThreads = semaphore.numberOfWaitingThreads;
                SceKernelSemaInfo.struct.write(infoStream, semaphoreInfo);
            });
            this.sceKernelSignalSema = createNativeFunction(0x3F53E640, 150, 'int', 'int/int', this, function (id, signal) {
                console.warn(sprintf('Not implemented ThreadManForUser.sceKernelSignalSema(%d, %d)', id, signal));
                _this.semaporesUid.get(id).incrementCount(signal);
                return 0;
            });
        }
        return ThreadManForUser;
    })();
    exports.ThreadManForUser = ThreadManForUser;

    var WaitingSemaphoreThread = (function () {
        function WaitingSemaphoreThread(expectedCount, wakeUp) {
            this.expectedCount = expectedCount;
            this.wakeUp = wakeUp;
        }
        return WaitingSemaphoreThread;
    })();

    var Semaphore = (function () {
        function Semaphore(name, attributes, initialCount, maximumCount) {
            this.name = name;
            this.attributes = attributes;
            this.initialCount = initialCount;
            this.maximumCount = maximumCount;
            this.waitingSemaphoreThreadList = new SortedSet();
            this.currentCount = initialCount;
        }
        Object.defineProperty(Semaphore.prototype, "numberOfWaitingThreads", {
            get: function () {
                return this.waitingSemaphoreThreadList.length;
            },
            enumerable: true,
            configurable: true
        });

        Semaphore.prototype.incrementCount = function (count) {
            this.currentCount = Math.min(this.currentCount + count, this.maximumCount);
            this.updatedCount();
        };

        Semaphore.prototype.cancel = function () {
            this.waitingSemaphoreThreadList.forEach(function (item) {
                item.wakeUp();
            });
        };

        Semaphore.prototype.updatedCount = function () {
            var _this = this;
            this.waitingSemaphoreThreadList.forEach(function (item) {
                if (_this.currentCount >= item.expectedCount) {
                    _this.currentCount -= item.expectedCount;
                    item.wakeUp();
                }
            });
        };

        Semaphore.prototype.waitAsync = function (expectedCount) {
            var _this = this;
            var promise = new Promise(function (resolve, reject) {
                var waitingSemaphoreThread = new WaitingSemaphoreThread(expectedCount, function () {
                    _this.waitingSemaphoreThreadList.delete(waitingSemaphoreThread);
                    resolve();
                });
                _this.waitingSemaphoreThreadList.add(waitingSemaphoreThread);
            });
            this.updatedCount();
            return promise;
        };

        Semaphore.prototype.delete = function () {
        };
        return Semaphore;
    })();

    var SemaphoreAttribute;
    (function (SemaphoreAttribute) {
        SemaphoreAttribute[SemaphoreAttribute["FirstInFirstOut"] = 0x000] = "FirstInFirstOut";
        SemaphoreAttribute[SemaphoreAttribute["Priority"] = 0x100] = "Priority";
    })(SemaphoreAttribute || (SemaphoreAttribute = {}));

    var EventFlag = (function () {
        function EventFlag() {
        }
        return EventFlag;
    })();

    var SceKernelSemaInfo = (function () {
        function SceKernelSemaInfo() {
        }
        SceKernelSemaInfo.struct = struct.StructClass.create(SceKernelSemaInfo, [
            { type: struct.Int32, name: 'size' },
            { type: struct.Stringz(32), name: 'name' },
            { type: struct.Int32, name: 'attributes' },
            { type: struct.Int32, name: 'initialCount' },
            { type: struct.Int32, name: 'currentCount' },
            { type: struct.Int32, name: 'maximumCount' },
            { type: struct.Int32, name: 'numberOfWaitingThreads' }
        ]);
        return SceKernelSemaInfo;
    })();

    var SceKernelThreadInfo = (function () {
        function SceKernelThreadInfo() {
        }
        SceKernelThreadInfo.struct = struct.StructClass.create(SceKernelThreadInfo, [
            { type: struct.Int32, name: 'size' },
            { type: struct.Stringz(32), name: 'name' },
            { type: struct.UInt32, name: 'attributes' },
            { type: struct.UInt32, name: 'status' },
            { type: struct.UInt32, name: 'entryPoint' },
            { type: struct.UInt32, name: 'stackPointer' },
            { type: struct.Int32, name: 'stackSize' },
            { type: struct.UInt32, name: 'GP' },
            { type: struct.Int32, name: 'priorityInit' },
            { type: struct.Int32, name: 'priority' },
            { type: struct.UInt32, name: 'waitType' },
            { type: struct.Int32, name: 'waitId' },
            { type: struct.Int32, name: 'wakeupCount' },
            { type: struct.Int32, name: 'exitStatus' },
            { type: struct.Int32, name: 'runClocksLow' },
            { type: struct.Int32, name: 'runClocksHigh' },
            { type: struct.Int32, name: 'interruptPreemptionCount' },
            { type: struct.Int32, name: 'threadPreemptionCount' },
            { type: struct.Int32, name: 'releaseCount' }
        ]);
        return SceKernelThreadInfo;
    })();
});
//# sourceMappingURL=ThreadManForUser.js.map
