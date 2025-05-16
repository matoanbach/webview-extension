import * as vscode from 'vscode'

const regex = /\b[A-Za-z_][A-Za-z0-9_]*\b/g;

// don’t even try to resolve these tokens
const skippable = new Set<string>([
  "if", "else", "for", "while", "return", "switch", "case",
  "void", "int", "uint8_t", "uint16_t", "uint32_t", "uint64_t",
  // Apple-SDK attributes and macros you don’t care about:
  "__dead2",
  "__cold",
  "__disable_tail_calls",
  "__pure2",
  "__unused",
  "__used",
  "true",
  "false",
  "bool"
  // …etc
]);

// only pick the symbol kinds that aren’t plain functions or compiler internals
const pickable = new Set<vscode.SymbolKind>([
  vscode.SymbolKind.Constructor,
  vscode.SymbolKind.Constant,
  vscode.SymbolKind.Struct,
  vscode.SymbolKind.Enum,
  vscode.SymbolKind.Class,
  vscode.SymbolKind.Interface,
]);


export class Symbol {
    name: string
    kind: number
    uri: string
    documentation?: string
    definition?: string
    implementation?: string
    range: vscode.Range
    selectionRange: vscode.Range
    dependencies?: {
        callTree: Symbol[]
    }

    constructor(
        name: string,
        kind: number,
        uri: vscode.Uri,
        documentation: string = '',
        definition: string = '',
        implementation: string = '',
        range: vscode.Range,
        selectionRange: vscode.Range,
        callTree: Symbol[] = []
    ) {
        this.name = name
        this.kind = kind
        this.uri = uri.toString()
        this.documentation = documentation
        this.definition = definition
        this.implementation = implementation
        this.range = range
        this.selectionRange = selectionRange
        this.dependencies = { callTree }
    }
}


/**
 * Read the raw text covered by a given range in a document.
 *
 * @param uri The URI of the document to read from.
 * @param range The range within the document to extract text from.
 * @returns A promise that resolves to the exact substring of the document
 *          defined by `range`.
 */
export async function getTextInRange(uri: vscode.Uri, range: vscode.Range): Promise<string> {
    const doc = vscode.workspace.openTextDocument(uri)
    return (await doc).getText(range);
}


/**
 * ---------------------------------------------------
 * 
 * 
 * 
 * 
 * BELOW methods will use Symbol that is out own class
 * 
 * 
 * 
 * 
 * ---------------------------------------------------
 */

/**
 * Retrieve all symbols (functions, classes, structs, etc.) in the given document with an URI.
 *
 * @param uri The URI of the document to analyze.
 * @returns A promise that resolves to an array of `Symbol` objects,
 *          or an empty array if none are found.
 */
export async function getDocumentSymbols(uri: vscode.Uri): Promise<Symbol[]> {
    const raw = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>('vscode.executeDocumentSymbolProvider', uri)
    if (!raw || raw.length === 0) return []

    const wrapped: Symbol[] = await Promise.all(
        raw.map(async ds => {
            const documentation = await getSymbolDocumentation(uri, ds)
            const implementation = await getSymbolImplementation(uri, ds)
            const definition = await getSymbolDefinition(uri, ds)
            return new Symbol(ds.name, ds.kind, uri, documentation, definition, implementation, ds.range, ds.selectionRange, [])
        })
    )
    return wrapped
}

/**
 * Retrieve a symbol range with an URI and the position from the place it is declared
 * 
 * @param uri The URI of the file that the symbol is declared
 * @param range The `vscode.Range`
 * @return vscode.Symbol
 *          undefined if none is found 
 */
export async function getADocumentSymbol(uri: vscode.Uri, range: vscode.Range): Promise<Symbol | undefined> {
    const symbols = await getDocumentSymbols(uri)

    for (const sym of symbols) {
        if (sym.range.contains(range) || range.contains(sym.range)) {
            return sym
        }
    }
    return
}


/**
 * Jump to definition(s) at the given position, but skip any targets
 * we've already visited in this traversal.
 *
 * @param uri     The URI of the document in which to look.
 * @param position The position at which you want to “Go To Definition”.
 * @param visited    A Set of “symbolName@uri” keys you’ve already returned.
 * @returns       An array of fresh `Symbol`s (or empty).
 */
export async function goToDefinition(uri: vscode.Uri, position: vscode.Position, visited: Set<string>): Promise<Symbol[]> {
    const locations = await vscode.commands.executeCommand<vscode.Location[]>('vscode.executeDefinitionProvider', uri, position)
    if (!locations) return []

    const results: Symbol[] = []
    for (const location of locations) {
        const symbol = await getADocumentSymbol(location.uri, location.range)
        if (symbol) {
            const key = `${symbol.name}@${location.uri}` 
            // const key = `${symbol.name}@${location.uri.toString()}:` + `${location.range.start.line}:${location.range.start.character}`
            if (visited.has(key)) continue
            visited.add(key)
            results.push(symbol)
        }
    }
    return results
}

/**
 * Retrieve many symbols used inside another function.
 * pickable@symbol.ts decide what symbol to pick
 * 
 * @param uri The `vscode.Uri` of the symbol to find 
 * @param range The `vscode.Range` of the symbol
 * @returns A Promise resolves a list of `Symbol`
 */
export async function getCalleSymbols(uri: vscode.Uri, range: vscode.Range): Promise<Symbol[]> {
    const doc = await vscode.workspace.openTextDocument(uri)
    const visited = new Set<string>()
    const visitedTokens = new Set<string>()

    const results: Symbol[] = []
    for (let line = range.start.line; line <= range.end.line; line++) {
        const text = doc.lineAt(line).text
        regex.lastIndex = 0

        let match: RegExpExecArray | null
        while ((match = regex.exec(text)) !== null) {
            const token = match[0]
            if (visitedTokens.has(token) || skippable.has(token)) {
                continue;
            }
            visitedTokens.add(token)

            const position = new vscode.Position(line, match.index)
            const symbols = await goToDefinition(uri, position, visited)
            for (const symbol of symbols) {
                if (pickable.has(symbol.kind)) results.push(symbol)
                // console.log(`${token} -> ${symbol.name}`)
            }

        }
    }
    return results
}

/**
 * ------------------------------------------------------------
 * 
 * 
 * 
 * 
 * BELOW use vscode.DocumentSymbol and vscode.HierarchyCallItem
 * 
 * 
 * 
 * 
 * ------------------------------------------------------------
 */


/**
 * Extract documentation of a symbol by going to the source file and extracting using a delimeter of '//' and '/**'.
 *
 * @param uri The URI of the document in which to look up the symbol.
 * @param position The position within the document where the symbol is located.
 * @returns A promise that resolves to a single string containing all hover text
 *          (Markdown or plain) concatenated, or an empty string if no docs are found.
 */
export async function getSymbolDocumentation(
  uri: vscode.Uri,
  documentItem: vscode.DocumentSymbol
): Promise<string> {
  const doc = await vscode.workspace.openTextDocument(uri);
  const commentLines: string[] = [];

  // start just above the symbol
  let line = documentItem.range.start.line - 1;
  if (line < 0) {
    return '';
  }

  // skip over blank lines and preprocessor directives
  while (line >= 0) {
    const txt = doc.lineAt(line).text.trim();
    if (txt === '' || txt.startsWith('#')) {
      line--;
      continue;
    }
    break;
  }

  if (line < 0) {
    return '';
  }

  const trimmed = doc.lineAt(line).text.trim();

  // 1) JSDoc‐style block?
  if (trimmed.endsWith('*/')) {
    // grab the closing */
    commentLines.unshift(doc.lineAt(line).text);
    line--;
    // walk until /** 
    while (line >= 0) {
      const text = doc.lineAt(line).text;
      commentLines.unshift(text);
      if (text.trim().startsWith('/**')) {
        break;
      }
      line--;
    }
    return commentLines.join('\n');
  }

  // 2) line‐comment style?
  while (line >= 0) {
    const text = doc.lineAt(line).text;
    const t = text.trim();
    if (t.startsWith('//')) {
      commentLines.unshift(text);
      line--;
      continue;
    }
    // stop on first non‐comment
    break;
  }

  return commentLines.join('\n');
}

/**
 * Extract just the signature (declaration line(s)) of a symbol including the parameters and the return type.
 *
 * @param uri The URI of the document containing the symbol.
 * @param documentItem The `Symbol` that has the `range`field covering the name/parameters and the implementation.
 * @returns A promise that resolves to the text of the function signature.
 */
export async function getSymbolDefinition(uri: vscode.Uri, documentItem: vscode.DocumentSymbol): Promise<string> {
    const fullImplementation = await getTextInRange(uri, documentItem.range)
    if (documentItem.kind === vscode.SymbolKind.Function) {

        let index = fullImplementation.indexOf('{')
        if (index !== -1) return fullImplementation.slice(0, index).trim()
    }
    return fullImplementation
}

/**
 * Extract the full implementation of a symbol including the signature and the body.
 *
 * @param uri The URI of the document containing the symbol.
 * @param fullRange The `vscode.Range` spanning the entire symbol (signature + body).
 * @returns A promise that resolves to the text of the symbol’s full implementation.
 */
export async function getSymbolImplementation(uri: vscode.Uri, documentItem: vscode.DocumentSymbol): Promise<string> {
    return await getTextInRange(uri, documentItem.range)
}


/**
 * Prepare the call-hierarchy roots for a symbol at a given position.
 *
 * @param uri The URI of the document in which to prepare the call hierarchy.
 * @param position The position of the symbol whose callers you want to find.
 * @returns A promise that resolves to an array of `vscode.CallHierarchyItem`
 *          objects representing the entry points, or an empty array if none.
 */
export async function prepareCallRoots(uri: vscode.Uri, position: vscode.Position): Promise<vscode.CallHierarchyItem[]> {
    const roots = await vscode.commands.executeCommand<vscode.CallHierarchyItem[]>('vscode.prepareCallHierarchy', uri, position)
    return roots
}


/**
 * Fetch the immediate outgoing calls from a call-hierarchy item.
 *
 * @param item A `vscode.CallHierarchyItem` whose outgoing calls you want.
 * @returns A promise that resolves to an array of
 *          `vscode.CallHierarchyOutgoingCall` objects (each with `.to`).
 */
export async function getOutgoingCalls(item: vscode.CallHierarchyItem): Promise<vscode.CallHierarchyOutgoingCall[]> {
    const outgoing = await vscode.commands.executeCommand<vscode.CallHierarchyOutgoingCall[]>('vscode.provideOutgoingCalls', item)
    return outgoing
}


/**
 * ---------------------------------------
 * 
 * 
 * 
 * 
 * BELOW is to build the `Symbol Call Tree`
 * 
 * 
 * 
 * 
 * ---------------------------------------
 */


/**
 * Recursively build a call‐tree (forest) for a given call‐hierarchy item.
 * Siblings won’t repeat the same callee twice, and true cycles are avoided,
 * but once you leave a branch you can revisit that function on another path.
 *
 * @param root    The vscode.CallHierarchyItem root of this subtree.
 * @param visited A Set of IDs that marks the *current path* to detect cycles.
 */
export async function buildCallTree(root: vscode.CallHierarchyItem, visited: Set<string>) {
    const id = `${root.name}@${root.uri.toString()}`;
    if (visited.has(id)) {
        return // new Symbol
    }
    visited.add(id)

    const newSymbol = await buildSymbol(root)
    if (!newSymbol) return

    const visitedCalles = new Set<string>();
    const outgoing = await getOutgoingCalls(root)
    for (const call of outgoing ?? []) {
        const callee = call.to;
        const calleeId = `${callee.name}@${callee.uri.toString()}`;

        if (visitedCalles.has(calleeId)) {
            continue
        }
        visitedCalles.add(calleeId)

        const calleeSymbol = await buildCallTree(callee, visited)
        if (calleeSymbol) {
            newSymbol.dependencies?.callTree.push(calleeSymbol)
        }
    }
    return newSymbol
}

/**
 * Buid a symbol in a json format using callHierarchyItem
 */
export async function buildSymbol(hierarchySymbol: vscode.CallHierarchyItem): Promise<Symbol | undefined> {
    const documentSymbol = await getADocumentSymbol(hierarchySymbol.uri, hierarchySymbol.range)
    if (documentSymbol) {
        const allSymbolsUsed = await getCalleSymbols(hierarchySymbol.uri, documentSymbol.range)
        documentSymbol.dependencies = { callTree: allSymbolsUsed }
    }
    return documentSymbol
}


/**
 * A method to find texts in all files
 */
export interface TextSearchResult {
    uri: vscode.Uri;
    range: vscode.Range;
    preview?: {
        text: string;
        match: vscode.Range;
    }
}

//TODO
export async function findReferenceInAllFiles(query: string): Promise<TextSearchResult[]> {
    let results: TextSearchResult[] = [];

    await vscode.workspace.findTextInFiles({ pattern: query }, { include: '**/*.{c,h}', useIgnoreFiles: true, useGlobalIgnoreFiles: true }, result => {
        results.push(result)
    })

    return results
}