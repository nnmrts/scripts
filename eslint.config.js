import pumpnEslintConfig from "@pumpn/eslint-config";

const eslintConfig = [
	...pumpnEslintConfig,
	{
		languageOptions: {
			globals: {
				Temporal: "readonly"
			}
		},
		rules: {
			"security/detect-possible-timing-attacks": "off",
			"unicorn/prevent-abbreviations": [
				"error",
				{
					ignore: [/mod/iu]
				}
			]
		}
	},
	{
		ignores: [
			"**/*.md/*.js",
			"**/*.jsdoc-defaults",
			"**/*.jsdoc-params",
			"**/*.jsdoc-properties"
		]
	}
];

export default eslintConfig;
