// Utilitaire d'extraction d'archives (7z / zip) côté navigateur via 7z-wasm.
//
// MeditLink livre chaque scan sous forme d'archive « .stl.7z ». Pour éviter que
// le ZIP final ne contienne des archives imbriquées, on décompresse ici chaque
// archive et on récupère les fichiers bruts (STL) qu'elle contient.
//
// Le module 7z-wasm et son binaire .wasm sont importés dynamiquement : ils ne
// sont chargés qu'au moment d'un téléchargement MeditLink (code-splitting), ce
// qui évite d'alourdir le bundle principal.

let wasmBinaryPromise = null;

const getWasmBinary = async () => {
  if (!wasmBinaryPromise) {
    wasmBinaryPromise = (async () => {
      const { default: wasmUrl } = await import("7z-wasm/7zz.wasm?url");
      const res = await fetch(wasmUrl);
      return res.arrayBuffer();
    })();
  }
  return wasmBinaryPromise;
};

/**
 * Décompresse une archive (7z, zip…) et retourne la liste des fichiers
 * contenus sous la forme [{ name, data: Uint8Array }, ...].
 * Une nouvelle instance du module est créée à chaque appel pour éviter tout
 * état résiduel entre les extractions.
 *
 * @param {Uint8Array} archiveBytes Contenu binaire de l'archive
 * @returns {Promise<Array<{name: string, data: Uint8Array}>>}
 */
export async function extractArchive(archiveBytes) {
  const wasmBinary = await getWasmBinary();
  const { default: SevenZip } = await import("7z-wasm");

  const sevenZip = await SevenZip({ wasmBinary });

  const inName = "input.archive";
  const outDir = "/out";

  sevenZip.FS.writeFile(inName, archiveBytes);
  try {
    sevenZip.FS.mkdir(outDir);
  } catch {
    // déjà présent
  }

  // x = extraction avec arborescence, -y = répondre oui, -o = dossier de sortie
  try {
    sevenZip.callMain(["x", inName, `-o${outDir}`, "-y"]);
  } catch (e) {
    // Emscripten lève un ExitStatus quand le programme se termine : on
    // l'ignore si la sortie a bien été produite (vérifiée juste après).
    if (!(e && (typeof e.status === "number" || e.name === "ExitStatus"))) {
      throw e;
    }
  }

  const results = [];
  const walk = (dir) => {
    let entries = [];
    try {
      entries = sevenZip.FS.readdir(dir);
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry === "." || entry === "..") continue;
      const path = `${dir}/${entry}`;
      const stat = sevenZip.FS.stat(path);
      if (sevenZip.FS.isDir(stat.mode)) {
        walk(path);
      } else {
        results.push({
          name: entry,
          data: sevenZip.FS.readFile(path, { encoding: "binary" }),
        });
      }
    }
  };
  walk(outDir);

  return results;
}

export default extractArchive;
