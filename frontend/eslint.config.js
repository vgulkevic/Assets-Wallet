import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";

export default [
    {ignores: ["build"]},
    js.configs.recommended,
    reactHooks.configs.flat["recommended-latest"] ?? reactHooks.configs.flat.recommended,
    {
        files: ["**/*.{js,jsx}"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: globals.browser,
            parserOptions: {ecmaFeatures: {jsx: true}},
        },
        rules: {
            "no-unused-vars": ["warn", {varsIgnorePattern: "^React$"}],
        },
    },
];
