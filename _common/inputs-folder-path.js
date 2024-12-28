import { join } from "@std/path";

const {
	cwd
} = Deno;

const inputsFolderPath = join(cwd(), "inputs");

export default inputsFolderPath;
