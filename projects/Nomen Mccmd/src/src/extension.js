/* eslint-disable @typescript-eslint/naming-convention */
"use strict";



Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const path = require("path");
const vscode_1 = require("vscode");
const node_1 = require("vscode-languageclient/node");
let client;
function activate(context) {
    const serverModule = context.asAbsolutePath(path.join('server', 'src', 'server.js'));
    const serverOptions = {
        run: { module: serverModule, transport: node_1.TransportKind.ipc },
        debug: {
            module: serverModule,
            transport: node_1.TransportKind.ipc,
        }
    };
    const clientOptions = {
        documentSelector: [{ scheme: 'file', language: 'mccmd' }],
        synchronize: {
            fileEvents: vscode_1.workspace.createFileSystemWatcher('**/.clientrc')
        }
    };
    client = new node_1.LanguageClient('languageServerExample', 'Language Server Example', serverOptions, clientOptions);
    client.start();
}

function deactivate() {
    if (!client) {
        return undefined;
    }
    return client.stop();
}

vscode_1.languages.registerHoverProvider('mccmd', (a) => {
    return new vscode.Hover({
        language: "mccmd",
        value: a
    });
})




exports.activate = activate;
exports.deactivate = deactivate;