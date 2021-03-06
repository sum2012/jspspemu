﻿module hle.modules {
	export class IoFileMgrForUser {
		constructor(private context: EmulatorContext) { }

		sceIoDevctl = createNativeFunction(0x54F5FB11, 150, 'uint', 'string/uint/uint/int/uint/int', this, (deviceName: string, command: number, inputPointer: number, inputLength: number, outputPointer: number, outputLength: number) => {
			var input = this.context.memory.getPointerStream(inputPointer, inputLength);
			var output = this.context.memory.getPointerStream(outputPointer, outputLength);
			/*
			public enum EmulatorDevclEnum : int
			{
				GetHasDisplay = 0x00000001,
				SendOutput = 0x00000002,
				IsEmulator = 0x00000003,
				SendCtrlData = 0x00000010,
				EmitScreenshot = 0x00000020,
			}
			*/


			switch (deviceName) {
				case 'emulator:': case 'kemulator:':
					switch (command) {
						case 1:
							output.writeInt32(1);
							return 0;
							break;
						case 2:
							$('#output').append(input.readString(input.length));
							//console.info();
							return 0;
							break;
					}
					break;
			}

			console.warn(sprintf('Not implemented IoFileMgrForUser.sceIoDevctl("%s", %d, %08X, %d, %08X, %d)', deviceName, command, inputPointer, inputLength, outputPointer, outputLength));
			return 0;
		});


		sceIoDopen = createNativeFunction(0xB29DDF9C, 150, 'uint', 'string', this, (directoryPath: string) => {
			console.warn('Not implemented IoFileMgrForUser.sceIoDopen("' + directoryPath + '")');
			return 0;
		});

		sceIoDclose = createNativeFunction(0xEB092469, 150, 'uint', 'int', this, (fileId: number) => {
			console.warn('Not implemented IoFileMgrForUser.sceIoDclose');
			return 0;
		});

		fileUids = new UidCollection<hle.HleFile>(1);

		sceIoOpen = createNativeFunction(0x109F50BC, 150, 'int', 'string/int/int', this, (filename: string, flags: hle.vfs.FileOpenFlags, mode: hle.vfs.FileMode) => {
			console.info(sprintf('IoFileMgrForUser.sceIoOpen("%s", %d, 0%o)', filename, flags, mode));
			return this.context.fileManager.openAsync(filename, flags, mode).then(file => this.fileUids.allocate(file));
		});

		sceIoClose = createNativeFunction(0x810C4BC3, 150, 'int', 'int', this, (fileId: number) => {
			var file = this.fileUids.get(fileId);
			file.close();

			this.fileUids.remove(fileId);

			return 0;
		});

		sceIoWrite = createNativeFunction(0x42EC03AC, 150, 'int', 'int/uint/int', this, (fileId: number, inputPointer: number, inputLength: number) => {
			var input = this.context.memory.getPointerStream(inputPointer, inputLength);
			//console.warn(sprintf('Not implemented IoFileMgrForUser.sceIoWrite("%s")', input.readString(input.length)));
			//console.warn(sprintf('Not implemented IoFileMgrForUser.sceIoWrite(%d, 0x%08X, %d)', fileId, inputPointer, inputLength));
			return inputLength;
		});

		sceIoRead = createNativeFunction(0x6A638D83, 150, 'int', 'int/uint/int', this, (fileId: number, outputPointer: number, outputLength: number) => {
			var file = this.fileUids.get(fileId);
			
			return file.entry.readChunkAsync(file.cursor, outputLength).then((readedData) => {
				file.cursor += readedData.byteLength;
				this.context.memory.writeBytes(outputPointer, readedData);
				return readedData.byteLength;
			});
		});

		sceIoGetstat = createNativeFunction(0xACE946E8, 150, 'int', 'string/void*', this, (fileName: string, sceIoStatPointer: Stream) => {
			SceIoStat.struct.write(sceIoStatPointer, new SceIoStat());
			return SceKernelErrors.ERROR_ERRNO_FILE_NOT_FOUND;
		});

		sceIoChdir = createNativeFunction(0x55F4717D, 150, 'int', 'string', this, (path: string) => {
			console.info(sprintf('IoFileMgrForUser.sceIoChdir("%s")', path));
			this.context.fileManager.chdir(path);
			return 0;
		});

		sceIoLseek = createNativeFunction(0x27EB27B8, 150, 'long', 'int/long/int', this, (fileId: number, offset: number, whence: number) => {
			console.info(sprintf('IoFileMgrForUser.sceIoLseek(%d, %d, %d)', fileId, offset, whence));
			return this._seek(fileId, offset, whence);
		});

		sceIoLseek32 = createNativeFunction(0x68963324, 150, 'int', 'int/int/int', this, (fileId: number, offset: number, whence: number) => {
			console.info(sprintf('IoFileMgrForUser.sceIoLseek32(%d, %d, %d)', fileId, offset, whence));
			return this._seek(fileId, offset, whence);
		});

		_seek(fileId: number, offset: number, whence: number) {
			var file = this.fileUids.get(fileId);
			switch (whence) {
				case SeekAnchor.Set:
					file.cursor = 0 + offset;
					break;
				case SeekAnchor.Cursor:
					file.cursor = file.cursor + offset;
					break;
				case SeekAnchor.End:
					file.cursor = file.entry.size + offset;
					break;
			}
			return file.cursor;
		}
	}

	enum SeekAnchor {
		Set = 0,
		Cursor = 1,
		End = 2,
	}

	enum SceMode {
	}

	enum IOFileModes {
		FormatMask = 0x0038,
		SymbolicLink = 0x0008,
		Directory = 0x0010,
		File = 0x0020,
		CanRead = 0x0004,
		CanWrite = 0x0002,
		CanExecute = 0x0001,
	}

	class ScePspDateTime {
		year: number = 0;
		month: number = 0;
		day: number = 0;
		hour: number = 0;
		minute: number = 0;
		second: number = 0;
		microsecond: number = 0;

		static struct = StructClass.create<ScePspDateTime>(ScePspDateTime, [
			{ type: Int16, name: 'year' },
			{ type: Int16, name: 'month' },
			{ type: Int16, name: 'day' },
			{ type: Int16, name: 'hour' },
			{ type: Int16, name: 'minute' },
			{ type: Int16, name: 'second' },
			{ type: Int32, name: 'microsecond' },
		]);
	}

	class SceIoStat
	{
		mode: SceMode = 0;
		attributes: IOFileModes = 0;
		size: number = 0;
		timeCreation: ScePspDateTime = new ScePspDateTime();
		timeLastAccess: ScePspDateTime = new ScePspDateTime();
		timeLastModification: ScePspDateTime = new ScePspDateTime();
		deviceDependentData: number[] = [0, 0, 0, 0, 0, 0];

		static struct = StructClass.create<SceIoStat>(SceIoStat, <StructEntry[]>[
			{ type: Int32, name: 'mode' },
			{ type: Int32, name: 'attributes' },
			{ type: Int64, name: 'size' },
			{ type: ScePspDateTime.struct, name: 'timeCreation' },
			{ type: ScePspDateTime.struct, name: 'timeLastAccess' },
			{ type: ScePspDateTime.struct, name: 'timeLastModification' },
			{ type: StructArray.create(Int32, 6), name: 'deviceDependentData' },
		]);
	}
}
