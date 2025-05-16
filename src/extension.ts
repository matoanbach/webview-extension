import * as vscode from "vscode";
import * as tools from './tools/symbol'

export function activate(context: vscode.ExtensionContext) {
  console.log('This extension’s ID is:', context.extension.id);
  // ctx.extension.id will be "publisher.name"

  const testSupportProvider = new TestSupporter(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      TestSupporter.viewType,
      testSupportProvider
    )
  );

  const C_MODE: vscode.DocumentFilter = { language: "c", scheme: "file" };
  context.subscriptions.push(
    vscode.languages.registerHoverProvider(
      C_MODE,
      new DependencyHoverProvider()
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "extension.generateDependencies",
      async (args: {
        name: string;
        uri: string;
        position: { line: number; character: number };
      }) => {
        vscode.window.showInformationMessage(
          `Generating dependencies for ${args.name}…`
        );

        const documentUri = vscode.Uri.parse(args.uri);
        const pos = new vscode.Position(
          args.position.line,
          args.position.character
        );

        const roots = await tools.prepareCallRoots(vscode.Uri.parse(args.uri), new vscode.Position(args.position.line, args.position.character))

        const tree: tools.Symbol[] = []
        for (const root of roots ?? []) {
          const branch = await tools.buildCallTree(root, new Set<string>())
          if (branch) tree.push(branch)
        }

        // 3) Send the full forest to React
        testSupportProvider.postMessage({
          type: "callHierarchy",
          tree, // array of CallTreeNode
        });

        // console.log(await tools.getSymbolDocumentation(vscode.Uri.parse(args.uri), new vscode.Position(args.position.line, args.position.character)))
      })

  );

  const verifyCmd = vscode.commands.registerCommand(
    'extension.verifySearch',
    async () => {
      const term = await vscode.window.showInputBox({
        prompt: 'Enter text to search for'
      });
      if (!term) {
        return vscode.window.showWarningMessage('No search term provided.');
      }

      tools.findReferenceInAllFiles(term)

    }
  );

  context.subscriptions.push(verifyCmd);
}

class TestSupporter implements vscode.WebviewViewProvider {
  public static readonly viewType = "TestSupporter.testView";
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) { }

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    const webview = webviewView.webview;

    webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "web", "dist", "index.css")
    );
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "web", "dist", "index.js")
    );

    webviewView.webview.html = this.getHtml(webview, styleUri, scriptUri);

    webviewView.webview.onDidReceiveMessage((message) => {
      if (message.type === "runCommand") {
        vscode.commands.executeCommand(message.command);
      }
    });
  }

  private getHtml(
    webview: vscode.Webview,
    styleUri: vscode.Uri,
    scriptUri: vscode.Uri
  ) {
    // Use webview.cspSource to safely allow your local assets
    return `<!DOCTYPE html>
        <html lang="en">
          <head>
            <link rel="stylesheet" href="${styleUri}" />
          </head>
          <body>
            <noscript>You need to enable JavaScript to run this app.</noscript>
            <div id="root"></div>
            <script src="${scriptUri}"></script>
          </body>
        </html>
        `;
  }

  public postMessage(message: any) {
    if (this._view) {
      this._view.webview.postMessage(message);
    }
  }
}

class DependencyHoverProvider implements vscode.HoverProvider {
  public provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> {
    // 1) Find the word under the cursor
    const range = document.getWordRangeAtPosition(position);
    if (!range) {
      return;
    }
    const word = document.getText(range);
    if (!word) {
      return;
    }

    // 2) Build the arguments object with name, uri, and position
    const args = {
      name: word,
      uri: document.uri.toString(),
      position: { line: position.line, character: position.character },
    };

    // 3) Encode and build the command URI
    const cmdUri = vscode.Uri.parse(
      `command:extension.generateDependencies?${encodeURIComponent(
        JSON.stringify(args)
      )}`
    );

    // 4) Create a trusted markdown link
    const markdown = new vscode.MarkdownString(
      `[Generate dependencies for “${word}”](${cmdUri})`
    );
    markdown.isTrusted = true;

    // const func = vscode.commands.executeCommand()

    // 5) Return the hover
    return new vscode.Hover(markdown, range);
  }
}



export function deactivate() { }
