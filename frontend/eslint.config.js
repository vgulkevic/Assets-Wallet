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
            "no-useless-assignment": "warn",
            // React Compiler rules flag patterns that predate the upgrade; revisit them when refreshing the UI
            "react-hooks/set-state-in-effect": "warn",
            "react-hooks/immutability": "warn",
            "react-hooks/refs": "warn",
        },
    },
];
