import { basename, join } from "@std/path";

import { shuffle, unique } from "@radashi-org/radashi";

const {
	args: [successNumberString, resetNumberString],
	cwd,
	env,
	readDir,
	readTextFile,
	rename,
	writeTextFile
} = Deno;

const success = Boolean(Number(successNumberString));

const reset = Boolean(Number(resetNumberString));

const modrinthFolderPath = env.get("MODRINTH_FOLDER_PATH");

if (modrinthFolderPath === undefined) {
	throw new Error("MODRINTH_FOLDER_PATH is not defined");
}

const dataFolderPath = join(cwd(), "data");

const lockedFileNamesFilePath = join(dataFolderPath, "locked-file-names.json");

const lockedFileNamesContent = await readTextFile(lockedFileNamesFilePath);

const lockedFileNames = JSON.parse(lockedFileNamesContent);

const neededFileNames = new Set([
	"CreativeCore_FABRIC_v2.12.23_mc1.21.1.jar",
	"ForgeConfigAPIPort-v21.1.3-1.21.1-Fabric.jar",
	"Iceberg-1.21-fabric-1.2.7.jar",
	"Jade-1.21.1-Fabric-15.9.2.jar",
	"Kiwi-1.21-Fabric-15.1.3.jar",
	"MRU-1.0.7+1.21+fabric.jar",
	"PuzzlesLib-v21.1.24-1.21.1-Fabric.jar",
	"Searchables-fabric-1.21.1-1.0.2.jar",
	"YetAnotherConfigLib-3.6.1+1.21-fabric.jar",
	"YungsApi-1.21.1-Fabric-5.1.3.jar",
	"architectury-13.0.8-fabric.jar",
	"azurelibarmor-fabric-1.21.1-2.3.15.jar",
	"balm-fabric-1.21.1-21.0.20.jar",
	"bookshelf-fabric-1.21.1-21.1.26.jar",
	"cloth-config-15.0.140-fabric.jar",
	"collective-1.21.1-7.87.jar",
	"common-networking-fabric-1.0.17-beta.2-1.21.1.jar",
	"cristellib-fabric-1.2.8.jar",
	"entity_model_features_fabric_1.21-2.2.6.jar",
	"entity_texture_features_fabric_1.21.1-6.2.8.jar",
	"fabric-api-0.109.0+1.21.1.jar",
	"fabric-language-kotlin-1.12.3+kotlin.2.0.21.jar",
	"fabricskyboxes-0.7.4+mc1.21.jar",
	"fastconfigapi-2.1.0.jar",
	"formations-1.0.2-fabric-mc1.21.jar",
	"fsb-interop-1.4.0+mc1.21-build.54.jar",
	"fusion-1.1.1-fabric-mc1.21.jar",
	"geckolib-fabric-1.21.1-4.7.jar",
	"jamlib-fabric-1.2.2-build.2+1.21.1.jar",
	"knowlogy-fabric-0.5.0-1.21.1.jar",
	"lavender-0.1.14+1.21.jar",
	"libIPN-fabric-1.21-6.2.0.jar",
	"lithostitched-fabric-1.21.1-1.3.10.jar",
	"midnightlib-fabric-1.6.3.jar",
	"modmenu-11.0.3.jar",
	"moonlight-1.21-2.17.12-fabric.jar",
	"owo-lib-0.12.15+1.21.jar",
	"player-animation-lib-fabric-2.0.0+1.21.1.jar",
	"prickle-fabric-1.21.1-21.1.6.jar",
	"ranged_weapon_api-2.0.4+1.21.1.jar",
	"resourcefulconfig-fabric-1.21-3.0.7.jar",
	"resourcefullib-fabric-1.21-3.0.11.jar",
	"silk-all-1.10.7.jar",
	"sodium-fabric-0.6.0+mc1.21.1.jar",
	"spell_engine-1.2.0+1.21.1.jar",
	"spell_power-1.0.7+1.21.1.jar",
	"structure_pool_api-1.1.3+1.21.1.jar",
	"supermartijn642configlib-1.1.8-fabric-mc1.21.jar",
	"supermartijn642corelib-1.1.17c-fabric-mc1.21.jar",
	"surveyor-0.6.24+1.21.jar",
	"tcdcommons-3.12.5+fabric-1.21.jar",
	"trinkets-3.10.0.jar",
	"u_framework-1.0.2+mc1.21.jar",
	"void_lib-1.1.6.jar",
	...lockedFileNames
]);

const bannedFileNames = new Set([]);

const enabledFileExtension = ".jar";

const disabledFileExtension = `${enabledFileExtension}.disabled`;

/**
 *
 * @param filePath
 * @example
 */
const enableFilePath = async (filePath) => {
	await rename(filePath, filePath.replace(/\.disabled$/u, ""));
};

/**
 *
 * @param filePath
 * @example
 */
const disableFilePath = async (filePath) => {
	await rename(filePath, filePath.replace(/\.jar$/u, disabledFileExtension));
};

const modrinthFolderEntries = await Array.fromAsync(readDir(modrinthFolderPath));

const filePaths = shuffle(
	modrinthFolderEntries
		.filter(({ isFile, name }) => (
			isFile &&
			(name.endsWith(enabledFileExtension) || name.endsWith(disabledFileExtension))
		))
		.map(({ name }) => join(modrinthFolderPath, name))
);

const disabledFilePaths = filePaths.filter((filePath) => filePath.endsWith(disabledFileExtension));
const enabledFilePaths = filePaths.filter((filePath) => !filePath.endsWith(disabledFileExtension));

let disabledFilePathsCount = disabledFilePaths.length;
let enabledFilePathsCount = enabledFilePaths.length;

if (reset) {
	await Promise.all(
		disabledFilePaths
			.map(enableFilePath)
	);

	disabledFilePathsCount = 0;
	enabledFilePathsCount = filePaths.length;

	await writeTextFile(lockedFileNamesFilePath, JSON.stringify([]));
}
else if (success) {
	const enableableFilePaths = disabledFilePaths
		.filter((filePath) => !bannedFileNames.has(basename(filePath).replace(/\.disabled$/u, "")));

	const pathsToEnable = enableableFilePaths
		.slice(0, Math.ceil(enableableFilePaths.length / 2));

	await Promise.all(
		pathsToEnable
			.map(enableFilePath)
	);

	disabledFilePathsCount -= pathsToEnable.length;
	enabledFilePathsCount += pathsToEnable.length;

	await writeTextFile(
		lockedFileNamesFilePath,
		JSON.stringify(unique(enabledFilePaths.map((filePath) => basename(filePath))))
	);

	console.log(
		pathsToEnable
			.map((filePath) => basename(filePath).replace(/\.disabled$/u, ""))
			.toSorted((a, b) => a.localeCompare(b))
	);
}
else {
	const disableableFilePaths = enabledFilePaths
		.filter((filePath) => !neededFileNames.has(basename(filePath)));

	const pathsToDisable = disableableFilePaths
		.slice(0, Math.ceil(disableableFilePaths.length / 2));

	await Promise.all(
		pathsToDisable
			.map(disableFilePath)
	);

	enabledFilePathsCount -= pathsToDisable.length;
	disabledFilePathsCount += pathsToDisable.length;

	console.log(
		disableableFilePaths
			.filter((filePath) => !pathsToDisable.includes(filePath))
			.map((filePath) => basename(filePath))
			.toSorted((a, b) => a.localeCompare(b))
	);
}

console.log([
	enabledFilePathsCount,
	disabledFilePathsCount,
	enabledFilePathsCount + disabledFilePathsCount
]);
