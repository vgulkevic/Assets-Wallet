import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
    },
    build: {
        // deploy.sh uploads frontend/build
        outDir: "build",
        sourcemap: false,
    },
});
