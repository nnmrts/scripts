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

const neededFileParts = new Set([
	"CreativeCore_FABRIC",
	"ForgeConfigAPIPort",
	"Iceberg",
	"Jade",
	"Kiwi",
	"MRU",
	"PuzzlesLib-v2",
	"Searchables-fabric",
	"YetAnotherConfigLib",
	"YungsApi",
	"architectury",
	"azurelibarmor-fabric",
	"balm-fabric",
	"bookshelf-fabric",
	"cloth-config",
	"collective",
	"common-networking-fabric",
	"cristellib-fabric",
	"entity_model_features_fabric",
	"entity_texture_features_fabric",
	"fabric-api",
	"fabric-language-kotlin",
	"fabricskyboxes",
	"fastconfigapi",
	"formations",
	"fsb-interop",
	"fusion",
	"geckolib-fabric",
	"jamlib-fabric",
	"knowlogy-fabric",
	"lavender",
	"libIPN-fabric",
	"lithostitched-fabric",
	"midnightlib-fabric",
	"modmenu",
	"moonlight",
	"owo-lib",
	"player-animation-lib-fabric",
	"prickle-fabric",
	"ranged_weapon_api",
	"resourcefulconfig-fabric",
	"resourcefullib-fabric",
	"silk-all",
	"sodium-fabric",
	"spell_engine",
	"spell_power",
	"structure_pool_api",
	"supermartijn642configlib",
	"supermartijn642corelib",
	"surveyor",
	"tcdcommons",
	"trinkets",
	"u_framework",
	"void_lib",
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
		.filter((filePath) => (
			[...neededFileParts]
				.some((neededFileName) => basename(filePath).includes(neededFileName))
		));

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
