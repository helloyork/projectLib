/* eslint-disable @typescript-eslint/naming-convention */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const {
    TextDocuments,
    CompletionItem,
    CompletionItemKind,
    TextDocumentPositionParams,
    Connection,
    _,
} = require('vscode-languageserver');

const node_1 = require("vscode-languageserver/node");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const connection = (0, node_1.createConnection)(node_1.ProposedFeatures.all);
const documents = new node_1.TextDocuments(vscode_languageserver_textdocument_1.TextDocument);
let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;
connection.onInitialize((params) => {
    const capabilities = params.capabilities;
    // Does the client support the `workspace/configuration` request?
    // If not, we fall back using global settings.
    hasConfigurationCapability = !!(capabilities.workspace && !!capabilities.workspace.configuration);
    hasWorkspaceFolderCapability = !!(capabilities.workspace && !!capabilities.workspace.workspaceFolders);
    hasDiagnosticRelatedInformationCapability = !!(capabilities.textDocument &&
        capabilities.textDocument.publishDiagnostics &&
        capabilities.textDocument.publishDiagnostics.relatedInformation);
    const result = {
        capabilities: {
            textDocumentSync: node_1.TextDocumentSyncKind.Incremental,
            // Tell the client that this server supports code completion.
            completionProvider: {
                resolveProvider: true
            }
        }
    };
    if (hasWorkspaceFolderCapability) {
        result.capabilities.workspace = {
            workspaceFolders: {
                supported: true
            }
        };
    }
    return result;
});
connection.onInitialized(() => {
    if (hasConfigurationCapability) {
        connection.client.register(node_1.DidChangeConfigurationNotification.type, undefined);
    }
    if (hasWorkspaceFolderCapability) {
        connection.workspace.onDidChangeWorkspaceFolders(_event => {
        });
    }
});
// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings = { maxNumberOfProblems: 1000 };
let globalSettings = defaultSettings;
// Cache the settings of all open documents
const documentSettings = new Map();
connection.onDidChangeConfiguration(change => {
    if (hasConfigurationCapability) {
        documentSettings.clear();
    }
    else {
        globalSettings = ((change.settings.languageServerExample || defaultSettings));
    }
    documents.all().forEach(validateTextDocument);
});
function getDocumentSettings(resource) {
    if (!hasConfigurationCapability) {
        return Promise.resolve(globalSettings);
    }
    let result = documentSettings.get(resource);
    if (!result) {
        result = connection.workspace.getConfiguration({
            scopeUri: resource,
            section: 'languageServerExample'
        });
        documentSettings.set(resource, result);
    }
    return result;
}

documents.onDidClose(e => {
    documentSettings.delete(e.document.uri);
});
documents.onDidChangeContent(change => {
    validateTextDocument(change.document);
});

/**
 * @param {vscode_languageserver_textdocument_1.TextDocument} textDocument 
 */
async function validateTextDocument(textDocument) {
    const settings = await getDocumentSettings(textDocument.uri);
    const text = textDocument.getText();
    const pattern = /\b[A-Z]{2,}\b/g;
    let m;
    let problems = 0;
    const diagnostics = [];
    text.split('\n').forEach((v, i) => {
        let result = parseSentence(v, textDocument, i);
        if (result && result.error) {
            diagnostics.push(result.diagnostic);
        }
    });
    while ((m = pattern.exec(text)) && problems < settings.maxNumberOfProblems) {
        problems++;
        const diagnostic = {
            severity: node_1.DiagnosticSeverity.Warning,
            range: {
                start: textDocument.positionAt(m.index),
                end: textDocument.positionAt(m.index + m[0].length)
            },
            message: `${m[0]} is all uppercase.`,
            source: 'ex'
        };
        if (hasDiagnosticRelatedInformationCapability) {
            diagnostic.relatedInformation = [
                {
                    location: {
                        uri: textDocument.uri,
                        range: Object.assign({}, diagnostic.range)
                    },
                    message: 'Spelling matters'
                },
                {
                    location: {
                        uri: textDocument.uri,
                        range: Object.assign({}, diagnostic.range)
                    },
                    message: 'Particularly for names'
                }
            ];
        }
        diagnostics.push(diagnostic);
    }
    // Send the computed diagnostics to VSCode.
    connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}
connection.onDidChangeWatchedFiles(_change => {
    // Monitored files have change in VSCode
});

let advancement = {}

const commandParamsTypes = {
    "selector": (v) => {
        return /^@(e|r|s|p|a|c|v|initiator)(\[([^=\]]+=[^=\]]+)(,[^=\]]+=[^=\]]+)*\])?$|^[a-zA-Z\u4e00-\u9fa5]+$/.test(v);
    },
    "Ability": (v) => {
        return ["worldbuilder", "mayfly", "mute"].includes(v);
    },
    "boolean": (v) => {
        return v === "true" || v === "false";
    },
    "string": (v) => {
        return v && v.length;
    },
    "number": (v) => {
        return !isNaN(v);
    },
    "grant|revoke": (v) => {
        return ["grant", "revoke"].includes(v);
    },
    "everything": (v) => {
        return v === "everything";
    },
    "only": (v) => {
        return v === "only";
    },
    "advancement": (v) => {
        return v && v.length;
    },
    "criterion": (v) => {
        return v && v.length;
    },
    "from|through|until": (v) => {
        return ["from", "through", "until"].includes(v);
    },
};

const commands = {
    "ability": {
        params: [
            {
                params: ["selector", "Ability", "boolean"]
            },
            {
                params: ["selector", "Ability"]
            }
        ]
    },
    "advancement": {
        params: [
            {
                params: ["grant|revoke", "selector", "everything"]
            },
            {
                params: ["grant|revoke", "selector", "only", "advancement", "criterion"]
            },
            {
                params: ["grant|revoke", "selector", "from|through|until", "advancement"]
            }
        ]
    }
};

const { Function, EnumMember } = node_1.CompletionItemKind;
let completions = {
    command: [],
    types: [],
    "grant|revoke": [],
    "from|through|until": [],
    selector: [],
    advancement:[]
};
let completionList = {
    command: Object.keys(commands),
    "_command-type": Function,
    types: ["from", "everything", "only", "through", "until"],
    "_types-type": EnumMember,
    "grant|revoke": ["grant", "revoke"],
    "_grant|revoke-type": EnumMember,
    "from|through|until": ["from", "through", "until"],
    "_from|through|until-type": EnumMember,
    selector: ["@e", "@r", "@s", "@p", "@a", "@c", "@v", "@initiator"],
    "_selector-type": EnumMember,
    advancement: Object.keys(advancement),
    "_advancement-type":EnumMember,
};
Object.keys(completionList).filter(v => !v.startsWith("_")).forEach(v => {
    completionList[v].forEach(m => {
        if (!completions[v]) {
            completions[v] = [];
        }
        completions[v].push({
            label: m,
            kind: completionList[`_${v}-type`] || Function,
            data: `${v}-${m}`
        });
    });
});

const details = {
    "command-ability": {
        detail: "赋予或剥夺玩家的能力",
        documentation: "ability <player: target> <ability: Ability> <value: Boolean> \nability <player: target> [ability: Ability]"
    },
    "command-advancement": {
        detail: "给予或移除玩家的进度",
        documentation: "advancement (grant|revoke) <targets> everything \nadvancement (grant|revoke) <targets> only <advancement> [<criterion>] \nadvancement (grant|revoke) <targets> (from|through|until) <advancement>",
    },
    "types-from": {
        detail: "操作玩家的指定进度及其全部下游进度"
    },
    "types-everything": {
        detail: "操作玩家的全部已载入进度"
    },
    "types-only": {
        detail: "仅操作玩家的指定进度"
    },
    "types-through": {
        detail: "操作玩家的指定进度及其全部上游和下游进度"
    },
    "types-until": {
        detail: "操作玩家的指定进度及其全部上游进度"
    },
    "selector-@e":{
        detail:"所有实体",
    },
    "selector-@r":{
        detail:"随机玩家",
    },
    "selector-@s":{
        detail:"命令的执行者",
    },
    "selector-@p":{
        detail:"距离最近的玩家",
    },
    "selector-@a":{
        detail:"所有玩家",
    },
    "selector-@c":{
        detail:"自己的智能体",
    },
    "selector-@v":{
        detail:"所有智能体",
    },
    "selector-@initiator":{
        detail:"与NPC交互的玩家",
    },
};

function getPositionOfParams(sentence) {
    let strings = splitStringWithIndex(sentence.replace(/\r/g, '').trim(), " ");
    if (strings[0] && strings[0].value.startsWith("/")) {
        strings[0].value = strings[0].value.slice(1);
    }
    if (!strings[0] || !commands[strings[0].value]) {
        return [];
    };
    let params = strings.slice(1).map(v => v.value);
    for (let i = 0; i < commands[strings[0].value].params.length; i++) {
        let match = true;
        for (let r = 0; r < commands[strings[0].value].params[i].params.length; r++) {
            if (!commandParamsTypes[commands[strings[0].value].params[i].params[r]](params[r])) {
                if (r === params.length - 1) {
                    return {
                        index: r,
                        type: commands[strings[0].value].params[i].params[r]
                    };
                } else {
                    break;
                }
                match = false;
            }
        }
        if (match && commands[strings[0].value].params[i].params.length > params.length) {
            return {
                index: -1,
                type: commands[strings[0].value].params[i].params[params.length]
            }
        }
    }
    return {};
}

function maxNumber(numbers) {
    return Math.max(...numbers);
}

function minNumber(numbers) {
    return Math.min(...numbers);
}

function splitStringWithIndex(originalString, separator) {
    const result = [];
    let startIndex = 0;
    let endIndex = originalString.indexOf(separator);
    while (endIndex !== -1) {
        result.push({ value: originalString.slice(startIndex, endIndex), index: startIndex });
        startIndex = endIndex + separator.length;
        endIndex = originalString.indexOf(separator, startIndex);
    }
    result.push({ value: originalString.slice(startIndex), index: startIndex });
    return result;
}

function getSyn(name, params) {
    if (!params || !params.length || !params[0].length) {
        return {};
    }
    for (let i = 0; i < commands[name].params.length; i++) {
        if (commands[name].params[i].params.every((v, i) => commandParamsTypes[v](params[i])) && commands[name].params[i].params.length === params.length) {
            return {
                data: commands[name].params[i].params.map((v, i) => {
                    return {
                        type: v,
                        value: params[i]
                    };
                })
            };
        }
    };
    let errorOutput = {
        error: {},
        data: []
    };
    let maxN = maxNumber(commands[name].params.map(v => v.params.length));
    let minN = minNumber(commands[name].params.map(v => v.params.length));
    if (maxN < params.length) {
        errorOutput.error.message = `意外的参数: ${params[maxN]}`;
        errorOutput.error.position = maxN;

    } else if (minN > params.length) {
        errorOutput.error.message = `缺少${minN - params.length}个必要的参数，预期应该有${minN}个参数`;
        errorOutput.error.position = params.length - 1;
    } else {
        let errorPosition = -1;
        for (let i = 0; i < commands[name].params.length; i++) {
            for (let r = 0; r < commands[name].params[i].params.length; r++) {
                if (!commandParamsTypes[commands[name].params[i].params[r]](params[r])) {
                    if (errorPosition === -1 || r < errorPosition) {
                        errorOutput.error.message = `参数 ${params[r]} 类型错误,预期应该是 ${commands[name].params[i].params[r]}`;
                        errorPosition = r;
                        break;
                    }
                }
            }
        }
        errorOutput.error.position = errorPosition;
    }
    return errorOutput;
}

function findFirstDifferenceIndex(list1, list2) {
    let index = -1;
    for (let i = 0; i < Math.min(list1.length, list2.length); i++) {
        if (list1[i] !== list2[i]) {
            index = i;
            break;
        }
    }
    return index;
}

/**
 * @param {vscode_languageserver_textdocument_1.TextDocument} textDocument
 */
function parseSentence(sentence, textDocument, line) {
    let strings = splitStringWithIndex(sentence.replace(/\r/g, '').trim(), " ");
    if (strings[0] && strings[0].value.startsWith("/")) {
        strings[0].value = strings[0].value.slice(1);
    }
    if (!strings[0] || !commands[strings[0].value]) {
        return [];
    };

    let params = strings.slice(1).map(v => v.value);
    let result = getSyn(strings[0].value, params);
    if (!result || result === null || !result.data) {
        return;
    } else {
        if (result.error) {
            let diagnostic = {
                severity: node_1.DiagnosticSeverity.Error,
                range: {
                    start: textDocument.positionAt(textDocument.offsetAt({
                        line,
                        character: strings[result.error.position + 1].index
                    })),
                    end: textDocument.positionAt(textDocument.offsetAt({
                        line,
                        character: strings[result.error.position + 1].index + strings[result.error.position + 1].value.length
                    }))
                },
                message: `${result.error.message}`,
                source: 'Nomen mccmd'
            };
            return {
                error: true,
                diagnostic
            };
        }
        return {
            error: false,
            result
        };
    }
}

connection.onCompletion((_textDocumentPosition) => {
    const document = documents.get(_textDocumentPosition.textDocument.uri);
    if (!document) {
        return null;
    }
    const text = document.getText({
        start: document.offsetAt({ line: _textDocumentPosition.position, character: 0 }),
        end: _textDocumentPosition.position
    });
    let result = getPositionOfParams(text);
    if (result.type && completions[result.type]) {
        return completions[result.type];
    }
    return completions.command;
});

connection.onCompletionResolve((item) => {
    if (details[item.data]) {
        Object.assign(item, details[item.data]);
    }
    return item;
});

documents.listen(connection);
connection.listen();
