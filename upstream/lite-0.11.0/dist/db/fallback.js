try {
   /**
    * Adding this to avoid warnings from node:sqlite being experimental
    */
   const { emitWarning } = process;
   process.emitWarning = (warning, ...args) => {
      if (warning.includes("SQLite is an experimental feature")) return;
      return emitWarning(warning, ...args);
   };
} catch {}

async function o(n){throw new Error("Unknown runtime")}export{o as createConnection};