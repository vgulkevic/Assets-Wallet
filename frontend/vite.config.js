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
                        // the shared vendor groups claim their modules first (higher priority)...
                        {name: "amplify", test: /node_modules[\\/](aws-amplify|@aws-amplify|@aws-crypto|@aws-sdk|@smithy)/, priority: 3},
                        {name: "react", test: /node_modules[\\/](react|react-dom|scheduler|react-redux|@reduxjs|redux|immer|reselect|notistack|use-sync-external-store)[\\/]/, priority: 3},
                        {name: "mui", test: /node_modules[\\/](@mui[\\/](material|system|styled-engine|utils|private-theming|core-downloads-tracker|icons-material)|@emotion|@popperjs|react-transition-group|stylis)/, priority: 2},
                        // ...so charts and drag-and-drop, used only on the dashboard, stay out of the login page
                        {name: "charts", test: /node_modules[\\/](@mui[\\/]x-|d3-|@dnd-kit)/, priority: 1}
                    ]
                }
            }
        },
    },
});
