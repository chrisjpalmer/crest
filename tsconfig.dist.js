//Allows the module resolution to work in prod mode - because crest takes advantage of imports like
//import {...} from 'core'; -> core is not a node_modules module, it lives inside the src directory.
//This bit of code just configure tsconfig-paths so that it picks that up
const tsConfigPaths = require("tsconfig-paths");
 
const baseUrl = "./dist";
tsConfigPaths.register({
    baseUrl,
    paths: {
        
    }
});