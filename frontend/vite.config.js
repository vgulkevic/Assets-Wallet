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
        rolldownOptions: {
            output: {
                // vendor code changes rarely, so keep it in separate long-cached chunks
                codeSplitting: {
                    groups: [
                        {name: "amplify", test: /node_modules[\\/](aws-amplify|@aws-amplify|@aws-crypto|@aws-sdk|@smithy)/},
                        {name: "mui", test: /node_modules[\\/](@mui|@emotion|@popperjs|react-transition-group|stylis)/},
                        {name: "react", test: /node_modules[\\/](react|react-dom|scheduler|react-redux|@reduxjs|redux|immer|reselect|notistack)[\\/]/}
                    ]
                }
            }
        },
    },
});
