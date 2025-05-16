declare module 'vscode' {
	export const version: string;
	export interface Command {
		title: string;
		command: string;
		tooltip?: string;
		arguments?: any[];
	}
	export interface TextLine {
		readonly lineNumber: number;
		readonly text: string;
		readonly range: Range;
		readonly rangeIncludingLineBreak: Range;
		readonly firstNonWhitespaceCharacterIndex: number;
		readonly isEmptyOrWhitespace: boolean;
	}
	export interface TextDocument {
		readonly uri: Uri;
		readonly fileName: string;
		readonly isUntitled: boolean;
		readonly languageId: string;
		readonly version: number;
		readonly isDirty: boolean;
		readonly isClosed: boolean;
		save(): Thenable<boolean>;
		readonly eol: EndOfLine;
		readonly lineCount: number;
		lineAt(line: number): TextLine;
		lineAt(position: Position): TextLine;
		offsetAt(position: Position): number;
		positionAt(offset: number): Position;
		getText(range?: Range): string;
		getWordRangeAtPosition(position: Position, regex?: RegExp): Range | undefined;
		validateRange(range: Range): Range;
		validatePosition(position: Position): Position;
	}
	export class Position {
		readonly line: number;
		readonly character: number;
		constructor(line: number, character: number);
		isBefore(other: Position): boolean;
		isBeforeOrEqual(other: Position): boolean;
		isAfter(other: Position): boolean;
		isAfterOrEqual(other: Position): boolean;
		isEqual(other: Position): boolean;
		compareTo(other: Position): number;
		translate(lineDelta?: number, characterDelta?: number): Position;
		translate(change: {
			lineDelta?: number;
			characterDelta?: number;
		}): Position;
		with(line?: number, character?: number): Position;
		with(change: {
			line?: number;
			character?: number;
		}): Position;
	}
	export class Range {
		readonly start: Position;
		readonly end: Position;
		constructor(start: Position, end: Position);
		constructor(startLine: number, startCharacter: number, endLine: number, endCharacter: number);
		isEmpty: boolean;
		isSingleLine: boolean;
		contains(positionOrRange: Position | Range): boolean;
		isEqual(other: Range): boolean;
		intersection(range: Range): Range | undefined;
		union(other: Range): Range;
		with(start?: Position, end?: Position): Range;
		with(change: {
			start?: Position;
			end?: Position;
		}): Range;
	}
	export class Selection extends Range {
		readonly anchor: Position;
		readonly active: Position;
		constructor(anchor: Position, active: Position);
		constructor(anchorLine: number, anchorCharacter: number, activeLine: number, activeCharacter: number);
		readonly isReversed: boolean;
	}
	export enum TextEditorSelectionChangeKind {
		Keyboard = 1,
		Mouse = 2,
		Command = 3
	}
	export interface TextEditorSelectionChangeEvent {
		readonly textEditor: TextEditor;
		readonly selections: readonly Selection[];
		readonly kind: TextEditorSelectionChangeKind | undefined;
	}
	export interface TextEditorVisibleRangesChangeEvent {
		readonly textEditor: TextEditor;
		readonly visibleRanges: readonly Range[];
	}
	export interface TextEditorOptionsChangeEvent {
		readonly textEditor: TextEditor;
		readonly options: TextEditorOptions;
	}
	export interface TextEditorViewColumnChangeEvent {
		readonly textEditor: TextEditor;
		readonly viewColumn: ViewColumn;
	}
	export enum TextEditorCursorStyle {
		Line = 1,
		Block = 2,
		Underline = 3,
		LineThin = 4,
		BlockOutline = 5,
		UnderlineThin = 6
	}
	export enum TextEditorLineNumbersStyle {
		Off = 0,
		On = 1,
		Relative = 2,
		Interval = 3,
	}
	export interface TextEditorOptions {
		tabSize?: number | string;
		indentSize?: number | string;
		insertSpaces?: boolean | string;
		cursorStyle?: TextEditorCursorStyle;
		lineNumbers?: TextEditorLineNumbersStyle;
	}
	export interface TextEditorDecorationType {
		readonly key: string;
		dispose(): void;
	}
	export enum TextEditorRevealType {
		Default = 0,
		InCenter = 1,
		InCenterIfOutsideViewport = 2,
		AtTop = 3
	}
	export enum OverviewRulerLane {
		Left = 1,
		Center = 2,
		Right = 4,
		Full = 7
	}
	export enum DecorationRangeBehavior {
		OpenOpen = 0,
		ClosedClosed = 1,
		OpenClosed = 2,
		ClosedOpen = 3
	}
	export interface TextDocumentShowOptions {
		viewColumn?: ViewColumn;
		preserveFocus?: boolean;
		preview?: boolean;
		selection?: Range;
	}
	export interface NotebookEditorSelectionChangeEvent {
		readonly notebookEditor: NotebookEditor;
		readonly selections: readonly NotebookRange[];
	}
	export interface NotebookEditorVisibleRangesChangeEvent {
		readonly notebookEditor: NotebookEditor;
		readonly visibleRanges: readonly NotebookRange[];
	}
	export interface NotebookDocumentShowOptions {
		readonly viewColumn?: ViewColumn;
		readonly preserveFocus?: boolean;
		readonly preview?: boolean;
		readonly selections?: readonly NotebookRange[];
	}
	export class ThemeColor {
		readonly id: string;
		constructor(id: string);
	}
	export class ThemeIcon {
		static readonly File: ThemeIcon;
		static readonly Folder: ThemeIcon;
		readonly id: string;
		readonly color?: ThemeColor | undefined;
		constructor(id: string, color?: ThemeColor);
	}
	export type IconPath = Uri | {
		light: Uri;
		dark: Uri;
	} | ThemeIcon;
	export interface ThemableDecorationRenderOptions {
		backgroundColor?: string | ThemeColor;
		outline?: string;
		outlineColor?: string | ThemeColor;
		outlineStyle?: string;
		outlineWidth?: string;
		border?: string;
		borderColor?: string | ThemeColor;
		borderRadius?: string;
		borderSpacing?: string;
		borderStyle?: string;
		borderWidth?: string;
		fontStyle?: string;
		fontWeight?: string;
		textDecoration?: string;
		cursor?: string;
		color?: string | ThemeColor;
		opacity?: string;
		letterSpacing?: string;
		gutterIconPath?: string | Uri;
		gutterIconSize?: string;
		overviewRulerColor?: string | ThemeColor;
		before?: ThemableDecorationAttachmentRenderOptions;
		after?: ThemableDecorationAttachmentRenderOptions;
	}
	export interface ThemableDecorationAttachmentRenderOptions {
		contentText?: string;
		contentIconPath?: string | Uri;
		border?: string;
		borderColor?: string | ThemeColor;
		fontStyle?: string;
		fontWeight?: string;
		textDecoration?: string;
		color?: string | ThemeColor;
		backgroundColor?: string | ThemeColor;
		margin?: string;
		width?: string;
		height?: string;
	}
	export interface DecorationRenderOptions extends ThemableDecorationRenderOptions {
		isWholeLine?: boolean;
		rangeBehavior?: DecorationRangeBehavior;
		overviewRulerLane?: OverviewRulerLane;
		light?: ThemableDecorationRenderOptions;
		dark?: ThemableDecorationRenderOptions;
	}
	export interface DecorationOptions {
		range: Range;
		hoverMessage?: MarkdownString | MarkedString | Array<MarkdownString | MarkedString>;
		renderOptions?: DecorationInstanceRenderOptions;
	}
	export interface ThemableDecorationInstanceRenderOptions {
		before?: ThemableDecorationAttachmentRenderOptions;
		after?: ThemableDecorationAttachmentRenderOptions;
	}
	export interface DecorationInstanceRenderOptions extends ThemableDecorationInstanceRenderOptions {
		light?: ThemableDecorationInstanceRenderOptions;
		dark?: ThemableDecorationInstanceRenderOptions;
	}
	export interface TextEditor {
		readonly document: TextDocument;
		selection: Selection;
		selections: readonly Selection[];
		readonly visibleRanges: readonly Range[];
		options: TextEditorOptions;
		readonly viewColumn: ViewColumn | undefined;
		edit(callback: (editBuilder: TextEditorEdit) => void, options?: {
			readonly undoStopBefore: boolean;
			readonly undoStopAfter: boolean;
		}): Thenable<boolean>;
		insertSnippet(snippet: SnippetString, location?: Position | Range | readonly Position[] | readonly Range[], options?: {
			readonly undoStopBefore: boolean;
			readonly undoStopAfter: boolean;
			readonly keepWhitespace?: boolean;
		}): Thenable<boolean>;
		setDecorations(decorationType: TextEditorDecorationType, rangesOrOptions: readonly Range[] | readonly DecorationOptions[]): void;
		revealRange(range: Range, revealType?: TextEditorRevealType): void;
		show(column?: ViewColumn): void;
		hide(): void;
	}
	export enum EndOfLine {
		LF = 1,
		CRLF = 2
	}
	export interface TextEditorEdit {
		replace(location: Position | Range | Selection, value: string): void;
		insert(location: Position, value: string): void;
		delete(location: Range | Selection): void;
		setEndOfLine(endOfLine: EndOfLine): void;
	}
	export class Uri {
		static parse(value: string, strict?: boolean): Uri;
		static file(path: string): Uri;
		static joinPath(base: Uri, ...pathSegments: string[]): Uri;
		static from(components: {
			readonly scheme: string;
			readonly authority?: string;
			readonly path?: string;
			readonly query?: string;
			readonly fragment?: string;
		}): Uri;
		private constructor(scheme: string, authority: string, path: string, query: string, fragment: string);
		readonly scheme: string;
		readonly authority: string;
		readonly path: string;
		readonly query: string;
		readonly fragment: string;
		readonly fsPath: string;
		with(change: {
			scheme?: string;
			authority?: string;
			path?: string;
			query?: string;
			fragment?: string;
		}): Uri;
		toString(skipEncoding?: boolean): string;
		toJSON(): any;
	}
	export interface CancellationToken {
		isCancellationRequested: boolean;
		onCancellationRequested: Event<any>;
	}
	export class CancellationTokenSource {
		token: CancellationToken;
		cancel(): void;
		dispose(): void;
	}
	export class CancellationError extends Error {
		constructor();
	}
	export class Disposable {
		static from(...disposableLikes: {
			dispose: () => any;
		}[]): Disposable;
		constructor(callOnDispose: () => any);
		dispose(): any;
	}
	export interface Event<T> {
		(listener: (e: T) => any, thisArgs?: any, disposables?: Disposable[]): Disposable;
	}
	export class EventEmitter<T> {
		event: Event<T>;
		fire(data: T): void;
		dispose(): void;
	}
	export interface FileSystemWatcher extends Disposable {
		readonly ignoreCreateEvents: boolean;
		readonly ignoreChangeEvents: boolean;
		readonly ignoreDeleteEvents: boolean;
		readonly onDidCreate: Event<Uri>;
		readonly onDidChange: Event<Uri>;
		readonly onDidDelete: Event<Uri>;
	}
	export interface TextDocumentContentProvider {
		onDidChange?: Event<Uri>;
		provideTextDocumentContent(uri: Uri, token: CancellationToken): ProviderResult<string>;
	}
	export enum QuickPickItemKind {
		Separator = -1,
		Default = 0,
	}
	export interface QuickPickItem {
		label: string;
		kind?: QuickPickItemKind;
		iconPath?: IconPath;
		description?: string;
		detail?: string;
		picked?: boolean;
		alwaysShow?: boolean;
		buttons?: readonly QuickInputButton[];
	}
	export interface QuickPickOptions {
		title?: string;
		matchOnDescription?: boolean;
		matchOnDetail?: boolean;
		placeHolder?: string;
		ignoreFocusOut?: boolean;
		canPickMany?: boolean;
		onDidSelectItem?(item: QuickPickItem | string): any;
	}
	export interface WorkspaceFolderPickOptions {
		placeHolder?: string;
		ignoreFocusOut?: boolean;
	}
	export interface OpenDialogOptions {
		defaultUri?: Uri;
		openLabel?: string;
		canSelectFiles?: boolean;
		canSelectFolders?: boolean;
		canSelectMany?: boolean;
		filters?: { [name: string]: string[] };
		title?: string;
	}
	export interface SaveDialogOptions {
		defaultUri?: Uri;
		saveLabel?: string;
		filters?: { [name: string]: string[] };
		title?: string;
	}
	export interface MessageItem {
		title: string;
		isCloseAffordance?: boolean;
	}
	export interface MessageOptions {
		modal?: boolean;
		detail?: string;
	}
	export enum InputBoxValidationSeverity {
		Info = 1,
		Warning = 2,
		Error = 3
	}
	export interface InputBoxValidationMessage {
		readonly message: string;
		readonly severity: InputBoxValidationSeverity;
	}
	export interface InputBoxOptions {
		title?: string;
		value?: string;
		valueSelection?: [number, number];
		prompt?: string;
		placeHolder?: string;
		password?: boolean;
		ignoreFocusOut?: boolean;
		validateInput?(value: string): string | InputBoxValidationMessage | undefined | null |
			Thenable<string | InputBoxValidationMessage | undefined | null>;
	}
	export class RelativePattern {
		baseUri: Uri;
		base: string;
		pattern: string;
		constructor(base: WorkspaceFolder | Uri | string, pattern: string);
	}
	export type GlobPattern = string | RelativePattern;
	export interface DocumentFilter {
		readonly language?: string;
		readonly notebookType?: string;
		readonly scheme?: string;
		readonly pattern?: GlobPattern;
	}
	export type DocumentSelector = DocumentFilter | string | ReadonlyArray<DocumentFilter | string>;
	export type ProviderResult<T> = T | undefined | null | Thenable<T | undefined | null>;
	export class CodeActionKind {
		static readonly Empty: CodeActionKind;
		static readonly QuickFix: CodeActionKind;
		static readonly Refactor: CodeActionKind;
		static readonly RefactorExtract: CodeActionKind;
		static readonly RefactorInline: CodeActionKind;
		static readonly RefactorMove: CodeActionKind;
		static readonly RefactorRewrite: CodeActionKind;
		static readonly Source: CodeActionKind;
		static readonly SourceOrganizeImports: CodeActionKind;
		static readonly SourceFixAll: CodeActionKind;
		static readonly Notebook: CodeActionKind;
		private constructor(value: string);
		readonly value: string;
		append(parts: string): CodeActionKind;
		intersects(other: CodeActionKind): boolean;
		contains(other: CodeActionKind): boolean;
	}
	export enum CodeActionTriggerKind {
		Invoke = 1,
		Automatic = 2,
	}
	export interface CodeActionContext {
		readonly triggerKind: CodeActionTriggerKind;
		readonly diagnostics: readonly Diagnostic[];
		readonly only: CodeActionKind | undefined;
	}
	export class CodeAction {
		title: string;
		edit?: WorkspaceEdit;
		diagnostics?: Diagnostic[];
		command?: Command;
		kind?: CodeActionKind;
		isPreferred?: boolean;
		disabled?: {
			readonly reason: string;
		};
		constructor(title: string, kind?: CodeActionKind);
	}
	export interface CodeActionProvider<T extends CodeAction = CodeAction> {
		provideCodeActions(document: TextDocument, range: Range | Selection, context: CodeActionContext, token: CancellationToken): ProviderResult<Array<Command | T>>;
		resolveCodeAction?(codeAction: T, token: CancellationToken): ProviderResult<T>;
	}
	export interface CodeActionProviderMetadata {
		readonly providedCodeActionKinds?: readonly CodeActionKind[];
		readonly documentation?: ReadonlyArray<{
			readonly kind: CodeActionKind;
			readonly command: Command;
		}>;
	}
	export class CodeLens {
		range: Range;
		command?: Command;
		readonly isResolved: boolean;
		constructor(range: Range, command?: Command);
	}
	export interface CodeLensProvider<T extends CodeLens = CodeLens> {
		onDidChangeCodeLenses?: Event<void>;
		provideCodeLenses(document: TextDocument, token: CancellationToken): ProviderResult<T[]>;
		resolveCodeLens?(codeLens: T, token: CancellationToken): ProviderResult<T>;
	}
	export type DefinitionLink = LocationLink;
	export type Definition = Location | Location[];
	export interface DefinitionProvider {
		provideDefinition(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<Definition | DefinitionLink[]>;
	}
	export interface ImplementationProvider {
		provideImplementation(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<Definition | DefinitionLink[]>;
	}
	export interface TypeDefinitionProvider {
		provideTypeDefinition(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<Definition | DefinitionLink[]>;
	}
	export type Declaration = Location | Location[] | LocationLink[];
	export interface DeclarationProvider {
		provideDeclaration(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<Declaration>;
	}
	export class MarkdownString {
		value: string;
		isTrusted?: boolean | {
			readonly enabledCommands: readonly string[];
		};
		supportThemeIcons?: boolean;
		supportHtml?: boolean;
		baseUri?: Uri;
		constructor(value?: string, supportThemeIcons?: boolean);
		appendText(value: string): MarkdownString;
		appendMarkdown(value: string): MarkdownString;
		appendCodeblock(value: string, language?: string): MarkdownString;
	}
	export type MarkedString = string | {
		language: string;
		value: string;
	};
	export class Hover {
		contents: Array<MarkdownString | MarkedString>;
		range?: Range;
		constructor(contents: MarkdownString | MarkedString | Array<MarkdownString | MarkedString>, range?: Range);
	}
	export interface HoverProvider {
		provideHover(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<Hover>;
	}
	export class EvaluatableExpression {
		readonly range: Range;
		readonly expression?: string | undefined;
		constructor(range: Range, expression?: string);
	}
	export interface EvaluatableExpressionProvider {
		provideEvaluatableExpression(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<EvaluatableExpression>;
	}
	export class InlineValueText {
		readonly range: Range;
		readonly text: string;
		constructor(range: Range, text: string);
	}
	export class InlineValueVariableLookup {
		readonly range: Range;
		readonly variableName?: string | undefined;
		readonly caseSensitiveLookup: boolean;
		constructor(range: Range, variableName?: string, caseSensitiveLookup?: boolean);
	}
	export class InlineValueEvaluatableExpression {
		readonly range: Range;
		readonly expression?: string | undefined;
		constructor(range: Range, expression?: string);
	}
	export type InlineValue = InlineValueText | InlineValueVariableLookup | InlineValueEvaluatableExpression;
	export interface InlineValueContext {
		readonly frameId: number;
		readonly stoppedLocation: Range;
	}
	export interface InlineValuesProvider {
		onDidChangeInlineValues?: Event<void> | undefined;
		provideInlineValues(document: TextDocument, viewPort: Range, context: InlineValueContext, token: CancellationToken): ProviderResult<InlineValue[]>;
	}
	export enum DocumentHighlightKind {
		Text = 0,
		Read = 1,
		Write = 2
	}
	export class DocumentHighlight {
		range: Range;
		kind?: DocumentHighlightKind;
		constructor(range: Range, kind?: DocumentHighlightKind);
	}
	export interface DocumentHighlightProvider {
		provideDocumentHighlights(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<DocumentHighlight[]>;
	}
	export enum SymbolKind {
		File = 0,
		Module = 1,
		Namespace = 2,
		Package = 3,
		Class = 4,
		Method = 5,
		Property = 6,
		Field = 7,
		Constructor = 8,
		Enum = 9,
		Interface = 10,
		Function = 11,
		Variable = 12,
		Constant = 13,
		String = 14,
		Number = 15,
		Boolean = 16,
		Array = 17,
		Object = 18,
		Key = 19,
		Null = 20,
		EnumMember = 21,
		Struct = 22,
		Event = 23,
		Operator = 24,
		TypeParameter = 25
	}
	export enum SymbolTag {
		Deprecated = 1
	}
	export class SymbolInformation {
		name: string;
		containerName: string;
		kind: SymbolKind;
		tags?: readonly SymbolTag[];
		location: Location;
		constructor(name: string, kind: SymbolKind, containerName: string, location: Location);
		constructor(name: string, kind: SymbolKind, range: Range, uri?: Uri, containerName?: string);
	}
	export class DocumentSymbol {
		name: string;
		detail: string;
		kind: SymbolKind;
		tags?: readonly SymbolTag[];
		range: Range;
		selectionRange: Range;
		children: DocumentSymbol[];
		constructor(name: string, detail: string, kind: SymbolKind, range: Range, selectionRange: Range);
	}
	export interface DocumentSymbolProvider {
		provideDocumentSymbols(document: TextDocument, token: CancellationToken): ProviderResult<SymbolInformation[] | DocumentSymbol[]>;
	}
	export interface DocumentSymbolProviderMetadata {
		label?: string;
	}
	export interface WorkspaceSymbolProvider<T extends SymbolInformation = SymbolInformation> {
		provideWorkspaceSymbols(query: string, token: CancellationToken): ProviderResult<T[]>;
		resolveWorkspaceSymbol?(symbol: T, token: CancellationToken): ProviderResult<T>;
	}
	export interface ReferenceContext {
		readonly includeDeclaration: boolean;
	}
	export interface ReferenceProvider {
		provideReferences(document: TextDocument, position: Position, context: ReferenceContext, token: CancellationToken): ProviderResult<Location[]>;
	}
	export class TextEdit {
		static replace(range: Range, newText: string): TextEdit;
		static insert(position: Position, newText: string): TextEdit;
		static delete(range: Range): TextEdit;
		static setEndOfLine(eol: EndOfLine): TextEdit;
		range: Range;
		newText: string;
		newEol?: EndOfLine;
		constructor(range: Range, newText: string);
	}
	export class SnippetTextEdit {
		static replace(range: Range, snippet: SnippetString): SnippetTextEdit;
		static insert(position: Position, snippet: SnippetString): SnippetTextEdit;
		range: Range;
		snippet: SnippetString;
		keepWhitespace?: boolean;
		constructor(range: Range, snippet: SnippetString);
	}
	export class NotebookEdit {
		static replaceCells(range: NotebookRange, newCells: NotebookCellData[]): NotebookEdit;
		static insertCells(index: number, newCells: NotebookCellData[]): NotebookEdit;
		static deleteCells(range: NotebookRange): NotebookEdit;
		static updateCellMetadata(index: number, newCellMetadata: { [key: string]: any }): NotebookEdit;
		static updateNotebookMetadata(newNotebookMetadata: { [key: string]: any }): NotebookEdit;
		range: NotebookRange;
		newCells: NotebookCellData[];
		newCellMetadata?: { [key: string]: any };
		newNotebookMetadata?: { [key: string]: any };
		constructor(range: NotebookRange, newCells: NotebookCellData[]);
	}
	export interface WorkspaceEditEntryMetadata {
		needsConfirmation: boolean;
		label: string;
		description?: string;
		iconPath?: IconPath;
	}
	export interface WorkspaceEditMetadata {
		isRefactoring?: boolean;
	}
	export class WorkspaceEdit {
		readonly size: number;
		replace(uri: Uri, range: Range, newText: string, metadata?: WorkspaceEditEntryMetadata): void;
		insert(uri: Uri, position: Position, newText: string, metadata?: WorkspaceEditEntryMetadata): void;
		delete(uri: Uri, range: Range, metadata?: WorkspaceEditEntryMetadata): void;
		has(uri: Uri): boolean;
		set(uri: Uri, edits: ReadonlyArray<TextEdit | SnippetTextEdit>): void;
		set(uri: Uri, edits: ReadonlyArray<[TextEdit | SnippetTextEdit, WorkspaceEditEntryMetadata | undefined]>): void;
		set(uri: Uri, edits: readonly NotebookEdit[]): void;
		set(uri: Uri, edits: ReadonlyArray<[NotebookEdit, WorkspaceEditEntryMetadata | undefined]>): void;
		get(uri: Uri): TextEdit[];
		createFile(uri: Uri, options?: {
			readonly overwrite?: boolean;
			readonly ignoreIfExists?: boolean;
			readonly contents?: Uint8Array | DataTransferFile;
		}, metadata?: WorkspaceEditEntryMetadata): void;
		deleteFile(uri: Uri, options?: {
			readonly recursive?: boolean;
			readonly ignoreIfNotExists?: boolean;
		}, metadata?: WorkspaceEditEntryMetadata): void;
		renameFile(oldUri: Uri, newUri: Uri, options?: {
			readonly overwrite?: boolean;
			readonly ignoreIfExists?: boolean;
		}, metadata?: WorkspaceEditEntryMetadata): void;
		entries(): [Uri, TextEdit[]][];
	}
	export class SnippetString {
		value: string;
		constructor(value?: string);
		appendText(string: string): SnippetString;
		appendTabstop(number?: number): SnippetString;
		appendPlaceholder(value: string | ((snippet: SnippetString) => any), number?: number): SnippetString;
		appendChoice(values: readonly string[], number?: number): SnippetString;
		appendVariable(name: string, defaultValue: string | ((snippet: SnippetString) => any)): SnippetString;
	}
	export interface RenameProvider {
		provideRenameEdits(document: TextDocument, position: Position, newName: string, token: CancellationToken): ProviderResult<WorkspaceEdit>;
		prepareRename?(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<Range | {
			range: Range;
			placeholder: string;
		}>;
	}
	export class SemanticTokensLegend {
		readonly tokenTypes: string[];
		readonly tokenModifiers: string[];
		constructor(tokenTypes: string[], tokenModifiers?: string[]);
	}
	export class SemanticTokensBuilder {
		constructor(legend?: SemanticTokensLegend);
		push(line: number, char: number, length: number, tokenType: number, tokenModifiers?: number): void;
		push(range: Range, tokenType: string, tokenModifiers?: readonly string[]): void;
		build(resultId?: string): SemanticTokens;
	}
	export class SemanticTokens {
		readonly resultId: string | undefined;
		readonly data: Uint32Array;
		constructor(data: Uint32Array, resultId?: string);
	}
	export class SemanticTokensEdits {
		readonly resultId: string | undefined;
		readonly edits: SemanticTokensEdit[];
		constructor(edits: SemanticTokensEdit[], resultId?: string);
	}
	export class SemanticTokensEdit {
		readonly start: number;
		readonly deleteCount: number;
		readonly data: Uint32Array | undefined;
		constructor(start: number, deleteCount: number, data?: Uint32Array);
	}
	export interface DocumentSemanticTokensProvider {
		onDidChangeSemanticTokens?: Event<void>;
		provideDocumentSemanticTokens(document: TextDocument, token: CancellationToken): ProviderResult<SemanticTokens>;
		provideDocumentSemanticTokensEdits?(document: TextDocument, previousResultId: string, token: CancellationToken): ProviderResult<SemanticTokens | SemanticTokensEdits>;
	}
	export interface DocumentRangeSemanticTokensProvider {
		provideDocumentRangeSemanticTokens(document: TextDocument, range: Range, token: CancellationToken): ProviderResult<SemanticTokens>;
	}
	export interface FormattingOptions {
		tabSize: number;
		insertSpaces: boolean;
		[key: string]: boolean | number | string;
	}
	export interface DocumentFormattingEditProvider {
		provideDocumentFormattingEdits(document: TextDocument, options: FormattingOptions, token: CancellationToken): ProviderResult<TextEdit[]>;
	}
	export interface DocumentRangeFormattingEditProvider {
		provideDocumentRangeFormattingEdits(document: TextDocument, range: Range, options: FormattingOptions, token: CancellationToken): ProviderResult<TextEdit[]>;
		provideDocumentRangesFormattingEdits?(document: TextDocument, ranges: Range[], options: FormattingOptions, token: CancellationToken): ProviderResult<TextEdit[]>;
	}
	export interface OnTypeFormattingEditProvider {
		provideOnTypeFormattingEdits(document: TextDocument, position: Position, ch: string, options: FormattingOptions, token: CancellationToken): ProviderResult<TextEdit[]>;
	}
	export class ParameterInformation {
		label: string | [number, number];
		documentation?: string | MarkdownString;
		constructor(label: string | [number, number], documentation?: string | MarkdownString);
	}
	export class SignatureInformation {
		label: string;
		documentation?: string | MarkdownString;
		parameters: ParameterInformation[];
		activeParameter?: number;
		constructor(label: string, documentation?: string | MarkdownString);
	}
	export class SignatureHelp {
		signatures: SignatureInformation[];
		activeSignature: number;
		activeParameter: number;
	}
	export enum SignatureHelpTriggerKind {
		Invoke = 1,
		TriggerCharacter = 2,
		ContentChange = 3,
	}
	export interface SignatureHelpContext {
		readonly triggerKind: SignatureHelpTriggerKind;
		readonly triggerCharacter: string | undefined;
		readonly isRetrigger: boolean;
		readonly activeSignatureHelp: SignatureHelp | undefined;
	}
	export interface SignatureHelpProvider {
		provideSignatureHelp(document: TextDocument, position: Position, token: CancellationToken, context: SignatureHelpContext): ProviderResult<SignatureHelp>;
	}
	export interface SignatureHelpProviderMetadata {
		readonly triggerCharacters: readonly string[];
		readonly retriggerCharacters: readonly string[];
	}
	export interface CompletionItemLabel {
		label: string;
		detail?: string;
		description?: string;
	}
	export enum CompletionItemKind {
		Text = 0,
		Method = 1,
		Function = 2,
		Constructor = 3,
		Field = 4,
		Variable = 5,
		Class = 6,
		Interface = 7,
		Module = 8,
		Property = 9,
		Unit = 10,
		Value = 11,
		Enum = 12,
		Keyword = 13,
		Snippet = 14,
		Color = 15,
		Reference = 17,
		File = 16,
		Folder = 18,
		EnumMember = 19,
		Constant = 20,
		Struct = 21,
		Event = 23,
		Operator = 24,
		TypeParameter = 25,
		User = 25,
		Issue = 26,
	}
	export enum CompletionItemTag {
		Deprecated = 1
	}
	export class CompletionItem {
		label: string | CompletionItemLabel;
		kind?: CompletionItemKind;
		tags?: readonly CompletionItemTag[];
		detail?: string;
		documentation?: string | MarkdownString;
		sortText?: string;
		filterText?: string;
		preselect?: boolean;
		insertText?: string | SnippetString;
		range?: Range | {
			inserting: Range;
			replacing: Range;
		};
		commitCharacters?: string[];
		keepWhitespace?: boolean;
		textEdit?: TextEdit;
		additionalTextEdits?: TextEdit[];
		command?: Command;
		constructor(label: string | CompletionItemLabel, kind?: CompletionItemKind);
	}
	export class CompletionList<T extends CompletionItem = CompletionItem> {
		isIncomplete?: boolean;
		items: T[];
		constructor(items?: T[], isIncomplete?: boolean);
	}
	export enum CompletionTriggerKind {
		Invoke = 0,
		TriggerCharacter = 1,
		TriggerForIncompleteCompletions = 2
	}
	export interface CompletionContext {
		readonly triggerKind: CompletionTriggerKind;
		readonly triggerCharacter: string | undefined;
	}
	export interface CompletionItemProvider<T extends CompletionItem = CompletionItem> {
		provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken, context: CompletionContext): ProviderResult<T[] | CompletionList<T>>;
		resolveCompletionItem?(item: T, token: CancellationToken): ProviderResult<T>;
	}
	export interface InlineCompletionItemProvider {
		provideInlineCompletionItems(document: TextDocument, position: Position, context: InlineCompletionContext, token: CancellationToken): ProviderResult<InlineCompletionItem[] | InlineCompletionList>;
	}
	export class InlineCompletionList {
		items: InlineCompletionItem[];
		constructor(items: InlineCompletionItem[]);
	}
	export interface InlineCompletionContext {
		readonly triggerKind: InlineCompletionTriggerKind;
		readonly selectedCompletionInfo: SelectedCompletionInfo | undefined;
	}
	export interface SelectedCompletionInfo {
		readonly range: Range;
		readonly text: string;
	}
	export enum InlineCompletionTriggerKind {
		Invoke = 0,
		Automatic = 1,
	}
	export class InlineCompletionItem {
		insertText: string | SnippetString;
		filterText?: string;
		range?: Range;
		command?: Command;
		constructor(insertText: string | SnippetString, range?: Range, command?: Command);
	}
	export class DocumentLink {
		range: Range;
		target?: Uri;
		tooltip?: string;
		constructor(range: Range, target?: Uri);
	}
	export interface DocumentLinkProvider<T extends DocumentLink = DocumentLink> {
		provideDocumentLinks(document: TextDocument, token: CancellationToken): ProviderResult<T[]>;
		resolveDocumentLink?(link: T, token: CancellationToken): ProviderResult<T>;
	}
	export class Color {
		readonly red: number;
		readonly green: number;
		readonly blue: number;
		readonly alpha: number;
		constructor(red: number, green: number, blue: number, alpha: number);
	}
	export class ColorInformation {
		range: Range;
		color: Color;
		constructor(range: Range, color: Color);
	}
	export class ColorPresentation {
		label: string;
		textEdit?: TextEdit;
		additionalTextEdits?: TextEdit[];
		constructor(label: string);
	}
	export interface DocumentColorProvider {
		provideDocumentColors(document: TextDocument, token: CancellationToken): ProviderResult<ColorInformation[]>;
		provideColorPresentations(color: Color, context: {
			readonly document: TextDocument;
			readonly range: Range;
		}, token: CancellationToken): ProviderResult<ColorPresentation[]>;
	}
	export enum InlayHintKind {
		Type = 1,
		Parameter = 2,
	}
	export class InlayHintLabelPart {
		value: string;
		tooltip?: string | MarkdownString | undefined;
		location?: Location | undefined;
		command?: Command | undefined;
		constructor(value: string);
	}
	export class InlayHint {
		position: Position;
		label: string | InlayHintLabelPart[];
		tooltip?: string | MarkdownString | undefined;
		kind?: InlayHintKind;
		textEdits?: TextEdit[];
		paddingLeft?: boolean;
		paddingRight?: boolean;
		constructor(position: Position, label: string | InlayHintLabelPart[], kind?: InlayHintKind);
	}
	export interface InlayHintsProvider<T extends InlayHint = InlayHint> {
		onDidChangeInlayHints?: Event<void>;
		provideInlayHints(document: TextDocument, range: Range, token: CancellationToken): ProviderResult<T[]>;
		resolveInlayHint?(hint: T, token: CancellationToken): ProviderResult<T>;
	}
	export class FoldingRange {
		start: number;
		end: number;
		kind?: FoldingRangeKind;
		constructor(start: number, end: number, kind?: FoldingRangeKind);
	}
	export enum FoldingRangeKind {
		Comment = 1,
		Imports = 2,
		Region = 3
	}
	export interface FoldingContext {
	}
	export interface FoldingRangeProvider {
		onDidChangeFoldingRanges?: Event<void>;
		provideFoldingRanges(document: TextDocument, context: FoldingContext, token: CancellationToken): ProviderResult<FoldingRange[]>;
	}
	export class SelectionRange {
		range: Range;
		parent?: SelectionRange;
		constructor(range: Range, parent?: SelectionRange);
	}
	export interface SelectionRangeProvider {
		provideSelectionRanges(document: TextDocument, positions: readonly Position[], token: CancellationToken): ProviderResult<SelectionRange[]>;
	}
	export class CallHierarchyItem {
		name: string;
		kind: SymbolKind;
		tags?: readonly SymbolTag[];
		detail?: string;
		uri: Uri;
		range: Range;
		selectionRange: Range;
		constructor(kind: SymbolKind, name: string, detail: string, uri: Uri, range: Range, selectionRange: Range);
	}
	export class CallHierarchyIncomingCall {
		from: CallHierarchyItem;
		fromRanges: Range[];
		constructor(item: CallHierarchyItem, fromRanges: Range[]);
	}
	export class CallHierarchyOutgoingCall {
		to: CallHierarchyItem;
		fromRanges: Range[];
		constructor(item: CallHierarchyItem, fromRanges: Range[]);
	}
	export interface CallHierarchyProvider {
		prepareCallHierarchy(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<CallHierarchyItem | CallHierarchyItem[]>;
		provideCallHierarchyIncomingCalls(item: CallHierarchyItem, token: CancellationToken): ProviderResult<CallHierarchyIncomingCall[]>;
		provideCallHierarchyOutgoingCalls(item: CallHierarchyItem, token: CancellationToken): ProviderResult<CallHierarchyOutgoingCall[]>;
	}
	export class TypeHierarchyItem {
		name: string;
		kind: SymbolKind;
		tags?: ReadonlyArray<SymbolTag>;
		detail?: string;
		uri: Uri;
		range: Range;
		selectionRange: Range;
		constructor(kind: SymbolKind, name: string, detail: string, uri: Uri, range: Range, selectionRange: Range);
	}
	export interface TypeHierarchyProvider {
		prepareTypeHierarchy(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<TypeHierarchyItem | TypeHierarchyItem[]>;
		provideTypeHierarchySupertypes(item: TypeHierarchyItem, token: CancellationToken): ProviderResult<TypeHierarchyItem[]>;
		provideTypeHierarchySubtypes(item: TypeHierarchyItem, token: CancellationToken): ProviderResult<TypeHierarchyItem[]>;
	}
	export class LinkedEditingRanges {
		constructor(ranges: Range[], wordPattern?: RegExp);
		readonly ranges: Range[];
		readonly wordPattern: RegExp | undefined;
	}
	export interface LinkedEditingRangeProvider {
		provideLinkedEditingRanges(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<LinkedEditingRanges>;
	}
	export class DocumentDropOrPasteEditKind {
		static readonly Empty: DocumentDropOrPasteEditKind;
		static readonly Text: DocumentDropOrPasteEditKind;
		static readonly TextUpdateImports: DocumentDropOrPasteEditKind;
		private constructor(value: string);
		readonly value: string;
		append(...parts: string[]): DocumentDropOrPasteEditKind;
		intersects(other: DocumentDropOrPasteEditKind): boolean;
		contains(other: DocumentDropOrPasteEditKind): boolean;
	}
	export class DocumentDropEdit {
		title?: string;
		kind?: DocumentDropOrPasteEditKind;
		yieldTo?: readonly DocumentDropOrPasteEditKind[];
		insertText: string | SnippetString;
		additionalEdit?: WorkspaceEdit;
		constructor(insertText: string | SnippetString, title?: string, kind?: DocumentDropOrPasteEditKind);
	}
	export interface DocumentDropEditProvider<T extends DocumentDropEdit = DocumentDropEdit> {
		provideDocumentDropEdits(document: TextDocument, position: Position, dataTransfer: DataTransfer, token: CancellationToken): ProviderResult<T | T[]>;
		resolveDocumentDropEdit?(edit: T, token: CancellationToken): ProviderResult<T>;
	}
	export interface DocumentDropEditProviderMetadata {
		readonly providedDropEditKinds?: readonly DocumentDropOrPasteEditKind[];
		readonly dropMimeTypes: readonly string[];
	}
	export enum DocumentPasteTriggerKind {
		Automatic = 0,
		PasteAs = 1,
	}
	export interface DocumentPasteEditContext {
		readonly only: DocumentDropOrPasteEditKind | undefined;
		readonly triggerKind: DocumentPasteTriggerKind;
	}
	export interface DocumentPasteEditProvider<T extends DocumentPasteEdit = DocumentPasteEdit> {
		prepareDocumentPaste?(document: TextDocument, ranges: readonly Range[], dataTransfer: DataTransfer, token: CancellationToken): void | Thenable<void>;
		provideDocumentPasteEdits?(document: TextDocument, ranges: readonly Range[], dataTransfer: DataTransfer, context: DocumentPasteEditContext, token: CancellationToken): ProviderResult<T[]>;
		resolveDocumentPasteEdit?(pasteEdit: T, token: CancellationToken): ProviderResult<T>;
	}
	export class DocumentPasteEdit {
		title: string;
		kind: DocumentDropOrPasteEditKind;
		insertText: string | SnippetString;
		additionalEdit?: WorkspaceEdit;
		yieldTo?: readonly DocumentDropOrPasteEditKind[];
		constructor(insertText: string | SnippetString, title: string, kind: DocumentDropOrPasteEditKind);
	}
	export interface DocumentPasteProviderMetadata {
		readonly providedPasteEditKinds: readonly DocumentDropOrPasteEditKind[];
		readonly copyMimeTypes?: readonly string[];
		readonly pasteMimeTypes?: readonly string[];
	}
	export type CharacterPair = [string, string];
	export interface CommentRule {
		lineComment?: string;
		blockComment?: CharacterPair;
	}
	export interface IndentationRule {
		decreaseIndentPattern: RegExp;
		increaseIndentPattern: RegExp;
		indentNextLinePattern?: RegExp;
		unIndentedLinePattern?: RegExp;
	}
	export enum IndentAction {
		None = 0,
		Indent = 1,
		IndentOutdent = 2,
		Outdent = 3
	}
	export interface EnterAction {
		indentAction: IndentAction;
		appendText?: string;
		removeText?: number;
	}
	export interface OnEnterRule {
		beforeText: RegExp;
		afterText?: RegExp;
		previousLineText?: RegExp;
		action: EnterAction;
	}
	export enum SyntaxTokenType {
		Other = 0,
		Comment = 1,
		String = 2,
		RegEx = 3
	}
	export interface AutoClosingPair {
		open: string;
		close: string;
		notIn?: SyntaxTokenType[];
	}
	export interface LanguageConfiguration {
		comments?: CommentRule;
		brackets?: CharacterPair[];
		wordPattern?: RegExp;
		indentationRules?: IndentationRule;
		onEnterRules?: OnEnterRule[];
		autoClosingPairs?: AutoClosingPair[];
		__electricCharacterSupport?: {
			brackets?: any;
			docComment?: {
				scope: string;
				open: string;
				lineStart: string;
				close?: string;
			};
		};
		__characterPairSupport?: {
			autoClosingPairs: {
				open: string;
				close: string;
				notIn?: string[];
			}[];
		};
	}
	export enum ConfigurationTarget {
		Global = 1,
		Workspace = 2,
		WorkspaceFolder = 3
	}
	export interface WorkspaceConfiguration {
		get<T>(section: string): T | undefined;
		get<T>(section: string, defaultValue: T): T;
		has(section: string): boolean;
		inspect<T>(section: string): {
			key: string;
			defaultValue?: T;
			globalValue?: T;
			workspaceValue?: T;
			workspaceFolderValue?: T;
			defaultLanguageValue?: T;
			globalLanguageValue?: T;
			workspaceLanguageValue?: T;
			workspaceFolderLanguageValue?: T;
			languageIds?: string[];
		} | undefined;
		update(section: string, value: any, configurationTarget?: ConfigurationTarget | boolean | null, overrideInLanguage?: boolean): Thenable<void>;
		readonly [key: string]: any;
	}
	export class Location {
		uri: Uri;
		range: Range;
		constructor(uri: Uri, rangeOrPosition: Range | Position);
	}
	export interface LocationLink {
		originSelectionRange?: Range;
		targetUri: Uri;
		targetRange: Range;
		targetSelectionRange?: Range;
	}
	export interface DiagnosticChangeEvent {
		readonly uris: readonly Uri[];
	}
	export enum DiagnosticSeverity {
		Error = 0,
		Warning = 1,
		Information = 2,
		Hint = 3
	}
	export class DiagnosticRelatedInformation {
		location: Location;
		message: string;
		constructor(location: Location, message: string);
	}
	export enum DiagnosticTag {
		Unnecessary = 1,
		Deprecated = 2,
	}
	export class Diagnostic {
		range: Range;
		message: string;
		severity: DiagnosticSeverity;
		source?: string;
		code?: string | number | {
			value: string | number;
			target: Uri;
		};
		relatedInformation?: DiagnosticRelatedInformation[];
		tags?: DiagnosticTag[];
		constructor(range: Range, message: string, severity?: DiagnosticSeverity);
	}
	export interface DiagnosticCollection extends Iterable<[uri: Uri, diagnostics: readonly Diagnostic[]]> {
		readonly name: string;
		set(uri: Uri, diagnostics: readonly Diagnostic[] | undefined): void;
		set(entries: ReadonlyArray<[Uri, readonly Diagnostic[] | undefined]>): void;
		delete(uri: Uri): void;
		clear(): void;
		forEach(callback: (uri: Uri, diagnostics: readonly Diagnostic[], collection: DiagnosticCollection) => any, thisArg?: any): void;
		get(uri: Uri): readonly Diagnostic[] | undefined;
		has(uri: Uri): boolean;
		dispose(): void;
	}
	export enum LanguageStatusSeverity {
		Information = 0,
		Warning = 1,
		Error = 2
	}
	export interface LanguageStatusItem {
		readonly id: string;
		name: string | undefined;
		selector: DocumentSelector;
		severity: LanguageStatusSeverity;
		text: string;
		detail?: string;
		busy: boolean;
		command: Command | undefined;
		accessibilityInformation?: AccessibilityInformation;
		dispose(): void;
	}
	export enum ViewColumn {
		Active = -1,
		Beside = -2,
		One = 1,
		Two = 2,
		Three = 3,
		Four = 4,
		Five = 5,
		Six = 6,
		Seven = 7,
		Eight = 8,
		Nine = 9
	}
	export interface OutputChannel {
		readonly name: string;
		append(value: string): void;
		appendLine(value: string): void;
		replace(value: string): void;
		clear(): void;
		show(preserveFocus?: boolean): void;
		show(column?: ViewColumn, preserveFocus?: boolean): void;
		hide(): void;
		dispose(): void;
	}
	export interface LogOutputChannel extends OutputChannel {
		readonly logLevel: LogLevel;
		readonly onDidChangeLogLevel: Event<LogLevel>;
		trace(message: string, ...args: any[]): void;
		debug(message: string, ...args: any[]): void;
		info(message: string, ...args: any[]): void;
		warn(message: string, ...args: any[]): void;
		error(error: string | Error, ...args: any[]): void;
	}
	export interface AccessibilityInformation {
		readonly label: string;
		readonly role?: string;
	}
	export enum StatusBarAlignment {
		Left = 1,
		Right = 2
	}
	export interface StatusBarItem {
		readonly id: string;
		readonly alignment: StatusBarAlignment;
		readonly priority: number | undefined;
		name: string | undefined;
		text: string;
		tooltip: string | MarkdownString | undefined;
		color: string | ThemeColor | undefined;
		backgroundColor: ThemeColor | undefined;
		command: string | Command | undefined;
		accessibilityInformation: AccessibilityInformation | undefined;
		show(): void;
		hide(): void;
		dispose(): void;
	}
	export interface Progress<T> {
		report(value: T): void;
	}
	export interface Terminal {
		readonly name: string;
		readonly processId: Thenable<number | undefined>;
		readonly creationOptions: Readonly<TerminalOptions | ExtensionTerminalOptions>;
		readonly exitStatus: TerminalExitStatus | undefined;
		readonly state: TerminalState;
		readonly shellIntegration: TerminalShellIntegration | undefined;
		sendText(text: string, shouldExecute?: boolean): void;
		show(preserveFocus?: boolean): void;
		hide(): void;
		dispose(): void;
	}
	export enum TerminalLocation {
		Panel = 1,
		Editor = 2,
	}
	export interface TerminalEditorLocationOptions {
		viewColumn: ViewColumn;
		preserveFocus?: boolean;
	}
	export interface TerminalSplitLocationOptions {
		parentTerminal: Terminal;
	}
	export interface TerminalState {
		readonly isInteractedWith: boolean;
		readonly shell: string | undefined;
	}
	export interface TerminalShellIntegration {
		readonly cwd: Uri | undefined;
		executeCommand(commandLine: string): TerminalShellExecution;
		executeCommand(executable: string, args: string[]): TerminalShellExecution;
	}
	export interface TerminalShellExecution {
		readonly commandLine: TerminalShellExecutionCommandLine;
		readonly cwd: Uri | undefined;
		read(): AsyncIterable<string>;
	}
	export interface TerminalShellExecutionCommandLine {
		readonly value: string;
		readonly isTrusted: boolean;
		readonly confidence: TerminalShellExecutionCommandLineConfidence;
	}
	export enum TerminalShellExecutionCommandLineConfidence {
		Low = 0,
		Medium = 1,
		High = 2
	}
	export interface TerminalShellIntegrationChangeEvent {
		readonly terminal: Terminal;
		readonly shellIntegration: TerminalShellIntegration;
	}
	export interface TerminalShellExecutionStartEvent {
		readonly execution: TerminalShellExecution;
	}
	export interface TerminalShellExecutionEndEvent {
		readonly execution: TerminalShellExecution;
		readonly exitCode: number | undefined;
	}
	export interface TerminalLinkContext {
		line: string;
		terminal: Terminal;
	}
	export interface TerminalLinkProvider<T extends TerminalLink = TerminalLink> {
		provideTerminalLinks(context: TerminalLinkContext, token: CancellationToken): ProviderResult<T[]>;
		handleTerminalLink(link: T): ProviderResult<void>;
	}
	export class TerminalLink {
		startIndex: number;
		length: number;
		tooltip?: string;
		constructor(startIndex: number, length: number, tooltip?: string);
	}
	export interface TerminalProfileProvider {
		provideTerminalProfile(token: CancellationToken): ProviderResult<TerminalProfile>;
	}
	export class TerminalProfile {
		options: TerminalOptions | ExtensionTerminalOptions;
		constructor(options: TerminalOptions | ExtensionTerminalOptions);
	}
	export class FileDecoration {
		badge?: string;
		tooltip?: string;
		color?: ThemeColor;
		propagate?: boolean;
		constructor(badge?: string, tooltip?: string, color?: ThemeColor);
	}
	export interface FileDecorationProvider {
		onDidChangeFileDecorations?: Event<undefined | Uri | Uri[]>;
		provideFileDecoration(uri: Uri, token: CancellationToken): ProviderResult<FileDecoration>;
	}
	export enum ExtensionKind {
		UI = 1,
		Workspace = 2
	}
	export interface Extension<T> {
		readonly id: string;
		readonly extensionUri: Uri;
		readonly extensionPath: string;
		readonly isActive: boolean;
		readonly packageJSON: any;
		extensionKind: ExtensionKind;
		readonly exports: T;
		activate(): Thenable<T>;
	}
	export enum ExtensionMode {
		Production = 1,
		Development = 2,
		Test = 3,
	}
	export interface ExtensionContext {
		readonly subscriptions: {
			dispose(): any;
		}[];
		readonly workspaceState: Memento;
		readonly globalState: Memento & {
			setKeysForSync(keys: readonly string[]): void;
		};
		readonly secrets: SecretStorage;
		readonly extensionUri: Uri;
		readonly extensionPath: string;
		readonly environmentVariableCollection: GlobalEnvironmentVariableCollection;
		asAbsolutePath(relativePath: string): string;
		readonly storageUri: Uri | undefined;
		readonly storagePath: string | undefined;
		readonly globalStorageUri: Uri;
		readonly globalStoragePath: string;
		readonly logUri: Uri;
		readonly logPath: string;
		readonly extensionMode: ExtensionMode;
		readonly extension: Extension<any>;
		readonly languageModelAccessInformation: LanguageModelAccessInformation;
	}
	export interface Memento {
		keys(): readonly string[];
		get<T>(key: string): T | undefined;
		get<T>(key: string, defaultValue: T): T;
		update(key: string, value: any): Thenable<void>;
	}
	export interface SecretStorageChangeEvent {
		readonly key: string;
	}
	export interface SecretStorage {
		get(key: string): Thenable<string | undefined>;
		store(key: string, value: string): Thenable<void>;
		delete(key: string): Thenable<void>;
		onDidChange: Event<SecretStorageChangeEvent>;
	}
	export enum ColorThemeKind {
		Light = 1,
		Dark = 2,
		HighContrast = 3,
		HighContrastLight = 4
	}
	export interface ColorTheme {
		readonly kind: ColorThemeKind;
	}
	export enum TaskRevealKind {
		Always = 1,
		Silent = 2,
		Never = 3
	}
	export enum TaskPanelKind {
		Shared = 1,
		Dedicated = 2,
		New = 3
	}
	export interface TaskPresentationOptions {
		reveal?: TaskRevealKind;
		echo?: boolean;
		focus?: boolean;
		panel?: TaskPanelKind;
		showReuseMessage?: boolean;
		clear?: boolean;
		close?: boolean;
	}
	export class TaskGroup {
		static Clean: TaskGroup;
		static Build: TaskGroup;
		static Rebuild: TaskGroup;
		static Test: TaskGroup;
		readonly isDefault: boolean | undefined;
		readonly id: string;
		private constructor(id: string, label: string);
	}
	export interface TaskDefinition {
		readonly type: string;
		[name: string]: any;
	}
	export interface ProcessExecutionOptions {
		cwd?: string;
		env?: { [key: string]: string };
	}
	export class ProcessExecution {
		constructor(process: string, options?: ProcessExecutionOptions);
		constructor(process: string, args: string[], options?: ProcessExecutionOptions);
		process: string;
		args: string[];
		options?: ProcessExecutionOptions;
	}
	export interface ShellQuotingOptions {
		escape?: string | {
			escapeChar: string;
			charsToEscape: string;
		};
		strong?: string;
		weak?: string;
	}
	export enum ShellQuoting {
		Escape = 1,
		Strong = 2,
		Weak = 3
	}
	export interface ShellQuotedString {
		value: string;
		quoting: ShellQuoting;
	}
	export class ShellExecution {
		constructor(commandLine: string, options?: ShellExecutionOptions);
		constructor(command: string | ShellQuotedString, args: Array<string | ShellQuotedString>, options?: ShellExecutionOptions);
		commandLine: string | undefined;
		command: string | ShellQuotedString | undefined;
		args: Array<string | ShellQuotedString> | undefined;
		options?: ShellExecutionOptions;
	}
	export class CustomExecution {
		constructor(callback: (resolvedDefinition: TaskDefinition) => Thenable<Pseudoterminal>);
	}
	export enum TaskScope {
		Global = 1,
		Workspace = 2
	}
	export interface RunOptions {
		reevaluateOnRerun?: boolean;
	}
	export class Task {
		constructor(taskDefinition: TaskDefinition, scope: WorkspaceFolder | TaskScope.Global | TaskScope.Workspace, name: string, source: string, execution?: ProcessExecution | ShellExecution | CustomExecution, problemMatchers?: string | string[]);
		constructor(taskDefinition: TaskDefinition, name: string, source: string, execution?: ProcessExecution | ShellExecution, problemMatchers?: string | string[]);
		definition: TaskDefinition;
		readonly scope: TaskScope.Global | TaskScope.Workspace | WorkspaceFolder | undefined;
		name: string;
		detail?: string;
		execution?: ProcessExecution | ShellExecution | CustomExecution;
		isBackground: boolean;
		source: string;
		group?: TaskGroup;
		presentationOptions: TaskPresentationOptions;
		problemMatchers: string[];
		runOptions: RunOptions;
	}
	export interface TaskProvider<T extends Task = Task> {
		provideTasks(token: CancellationToken): ProviderResult<T[]>;
		resolveTask(task: T, token: CancellationToken): ProviderResult<T>;
	}
	export interface TaskExecution {
		task: Task;
		terminate(): void;
	}
	export interface TaskStartEvent {
		readonly execution: TaskExecution;
	}
	export interface TaskEndEvent {
		readonly execution: TaskExecution;
	}
	export interface TaskProcessStartEvent {
		readonly execution: TaskExecution;
		readonly processId: number;
	}
	export interface TaskProcessEndEvent {
		readonly execution: TaskExecution;
		readonly exitCode: number | undefined;
	}
	export interface TaskFilter {
		version?: string;
		type?: string;
	}
	export namespace tasks {
		export function registerTaskProvider(type: string, provider: TaskProvider): Disposable;
		export function fetchTasks(filter?: TaskFilter): Thenable<Task[]>;
		export function executeTask(task: Task): Thenable<TaskExecution>;
		export const taskExecutions: readonly TaskExecution[];
		export const onDidStartTask: Event<TaskStartEvent>;
		export const onDidEndTask: Event<TaskEndEvent>;
		export const onDidStartTaskProcess: Event<TaskProcessStartEvent>;
		export const onDidEndTaskProcess: Event<TaskProcessEndEvent>;
	}
	export enum FileType {
		Unknown = 0,
		File = 1,
		Directory = 2,
		SymbolicLink = 64
	}
	export enum FilePermission {
		Readonly = 1
	}
	export interface FileStat {
		type: FileType;
		ctime: number;
		mtime: number;
		size: number;
		permissions?: FilePermission;
	}
	export class FileSystemError extends Error {
		static FileNotFound(messageOrUri?: string | Uri): FileSystemError;
		static FileExists(messageOrUri?: string | Uri): FileSystemError;
		static FileNotADirectory(messageOrUri?: string | Uri): FileSystemError;
		static FileIsADirectory(messageOrUri?: string | Uri): FileSystemError;
		static NoPermissions(messageOrUri?: string | Uri): FileSystemError;
		static Unavailable(messageOrUri?: string | Uri): FileSystemError;
		constructor(messageOrUri?: string | Uri);
		readonly code: string;
	}
	export enum FileChangeType {
		Changed = 1,
		Created = 2,
		Deleted = 3,
	}
	export interface FileChangeEvent {
		readonly type: FileChangeType;
		readonly uri: Uri;
	}
	export interface FileSystemProvider {
		readonly onDidChangeFile: Event<FileChangeEvent[]>;
	}
	export interface CustomTextEditorProvider {
		resolveCustomTextEditor(document: TextDocument, webviewPanel: WebviewPanel, token: CancellationToken): Thenable<void> | void;
	}
	export interface CustomDocument {
		readonly uri: Uri;
		dispose(): void;
	}
	export interface CustomDocumentEditEvent<T extends CustomDocument = CustomDocument> {
		readonly document: T;
		undo(): Thenable<void> | void;
		redo(): Thenable<void> | void;
		readonly label?: string;
	}
	export interface CustomDocumentContentChangeEvent<T extends CustomDocument = CustomDocument> {
		readonly document: T;
	}
	export interface CustomDocumentBackup {
		readonly id: string;
		delete(): void;
	}
	export interface CustomDocumentBackupContext {
		readonly destination: Uri;
	}
	export interface CustomDocumentOpenContext {
		readonly backupId: string | undefined;
		readonly untitledDocumentData: Uint8Array | undefined;
	}
	export interface CustomReadonlyEditorProvider<T extends CustomDocument = CustomDocument> {
	}
	export interface CustomEditorProvider<T extends CustomDocument = CustomDocument> extends CustomReadonlyEditorProvider<T> {
		onDidChangeCustomDocument: Event<CustomDocumentEditEvent<T> | CustomDocumentContentChangeEvent<T>>;
		saveCustomDocument(document: T, cancellation: CancellationToken): Thenable<void>;
		saveCustomDocumentAs(document: T, destination: Uri, cancellation: CancellationToken): Thenable<void>;
		revertCustomDocument(document: T, cancellation: CancellationToken): Thenable<void>;
		backupCustomDocument(document: T, context: CustomDocumentBackupContext, cancellation: CancellationToken): Thenable<CustomDocumentBackup>;
	}
	export interface QuickInput {
		title?: string;
		placeholder?: string;
		enabled: boolean;
		busy: boolean;
		ignoreFocusOut: boolean;
		buttons: readonly QuickInputButton[];
		onDidTriggerButton: Event<QuickInputButton>;
		show(): void;
		hide(): void;
		dispose(): void;
		onDidHide: Event<void>;
		onDidDispose: Event<void>;
	}
	export interface QuickInputButton {
		iconPath: IconPath;
		tooltip?: string;
	}
	export interface QuickPick<T extends QuickPickItem> extends QuickInput {
		matchOnDescription: boolean;
		matchOnDetail: boolean;
		items: readonly T[];
		activeItems: readonly T[];
		selectedItems: readonly T[];
		canSelectMany: boolean;
		onDidChangeActive: Event<readonly T[]>;
		onDidChangeSelection: Event<readonly T[]>;
		onDidAccept: Event<void>;
		onDidSelectItem?: Event<T | string>;
		onDidTriggerItemButton: Event<QuickPickItemButtonEvent<T>>;
		value: string;
		onDidChangeValue: Event<string>;
	}
	export interface QuickPickItemButtonEvent<T extends QuickPickItem> {
		button: QuickInputButton;
		item: T;
	}
	export interface InputBox extends QuickInput {
		value: string;
		password?: boolean;
		prompt?: string;
		validationMessage?: string | InputBoxValidationMessage;
		onDidChangeValue: Event<string>;
		onDidAccept: Event<void>;
	}
	export namespace window {
		export const activeTextEditor: TextEditor | undefined;
		export const visibleTextEditors: readonly TextEditor[];
		export const activeNotebookEditor: NotebookEditor | undefined;
		export const visibleNotebookEditors: readonly NotebookEditor[];
		export const terminals: readonly Terminal[];
		export const activeTerminal: Terminal | undefined;
		export const onDidChangeActiveTextEditor: Event<TextEditor | undefined>;
		export const onDidChangeVisibleTextEditors: Event<readonly TextEditor[]>;
		export const onDidChangeActiveNotebookEditor: Event<NotebookEditor | undefined>;
		export const onDidChangeVisibleNotebookEditors: Event<readonly NotebookEditor[]>;
		export const onDidChangeTextEditorSelection: Event<TextEditorSelectionChangeEvent>;
		export const onDidChangeTextEditorVisibleRanges: Event<TextEditorVisibleRangesChangeEvent>;
		export const onDidChangeTextEditorOptions: Event<TextEditorOptionsChangeEvent>;
		export const onDidChangeTextEditorViewColumn: Event<TextEditorViewColumnChangeEvent>;
		export const onDidChangeTerminalState: Event<TerminalState>;
		export const onDidOpenTerminal: Event<Terminal>;
		export const onDidCloseTerminal: Event<Terminal>;
		export const onDidChangeTerminalShellIntegration: Event<TerminalShellIntegrationChangeEvent>;
		export const onDidStartTerminalShellExecution: Event<TerminalShellExecutionStartEvent>;
		export const onDidEndTerminalShellExecution: Event<TerminalShellExecutionEndEvent>;
		export const onDidChangeTerminalDimensions: Event<TerminalDimensionsChangeEvent>;
		export function showTextDocument(textDocument: TextDocument, column?: ViewColumn, preserveFocus?: boolean): Thenable<TextEditor>;
		export function showTextDocument(uri: Uri, options?: TextDocumentShowOptions): Thenable<TextEditor>;
		export function showNotebookDocument(notebookDocument: NotebookDocument, options?: NotebookDocumentShowOptions): Thenable<NotebookEditor>;
		export function showNotebookDocument(uri: Uri, options?: NotebookDocumentShowOptions): Thenable<NotebookEditor>;
		export function showErrorMessage<T extends string>(message: string, ...items: T[]): Thenable<T | undefined>;
		export function showErrorMessage<T extends string>(message: string, options: MessageOptions, ...items: T[]): Thenable<T | undefined>;
		export function showErrorMessage<T extends MessageItem>(message: string, ...items: T[]): Thenable<T | undefined>;
		export function showErrorMessage<T extends MessageItem>(message: string, options: MessageOptions, ...items: T[]): Thenable<T | undefined>;
		export function showWarningMessage<T extends string>(message: string, ...items: T[]): Thenable<T | undefined>;
		export function showWarningMessage<T extends string>(message: string, options: MessageOptions, ...items: T[]): Thenable<T | undefined>;
		export function showWarningMessage<T extends MessageItem>(message: string, ...items: T[]): Thenable<T | undefined>;
		export function showWarningMessage<T extends MessageItem>(message: string, options: MessageOptions, ...items: T[]): Thenable<T | undefined>;
		export function showInformationMessage<T extends string>(message: string, ...items: T[]): Thenable<T | undefined>;
		export function showInformationMessage<T extends string>(message: string, options: MessageOptions, ...items: T[]): Thenable<T | undefined>;
		export function showInformationMessage<T extends MessageItem>(message: string, ...items: T[]): Thenable<T | undefined>;
		export function showInformationMessage<T extends MessageItem>(message: string, options: MessageOptions, ...items: T[]): Thenable<T | undefined>;
		export function showInputBox(options?: InputBoxOptions, token?: CancellationToken): Thenable<string | undefined>;
		export function showQuickPick<T extends QuickPickItem>(items: readonly T[] | Thenable<readonly T[]>, options?: QuickPickOptions, token?: CancellationToken): Thenable<T | undefined>;
		export function showQuickPick<T extends QuickPickItem>(items: readonly T[] | Thenable<readonly T[]>, options?: QuickPickOptions & { canPickMany: true; }, token?: CancellationToken): Thenable<T[] | undefined>;
		export function showQuickPick(items: readonly string[] | Thenable<readonly string[]>, options?: QuickPickOptions, token?: CancellationToken): Thenable<string | undefined>;
		export function showQuickPick(items: readonly string[] | Thenable<readonly string[]>, options?: QuickPickOptions & { canPickMany: true; }, token?: CancellationToken): Thenable<string[] | undefined>;
		export function showWorkspaceFolderPick(options?: WorkspaceFolderPickOptions): Thenable<WorkspaceFolder | undefined>;
		export function showOpenDialog(options: OpenDialogOptions): Thenable<Uri[] | undefined>;
		export function showSaveDialog(options: SaveDialogOptions): Thenable<Uri | undefined>;
		export function createOutputChannel(name: string, languageId?: string): OutputChannel;
		export function createOutputChannel(name: string, options: { log: boolean; languageId?: string }): LogOutputChannel;
		export function createTerminal(name?: string, shellPath?: string, shellArgs?: string[]): Terminal;
		export function createTerminal(options: TerminalOptions | ExtensionTerminalOptions): Terminal;
		export function createTerminal(options: TerminalOptions | ExtensionTerminalOptions | TerminalEditorLocationOptions | TerminalSplitLocationOptions): Terminal;
		export function createWebviewPanel(viewType: string, title: string, showOptions: ViewColumn | { preserveFocus: boolean; viewColumn: ViewColumn; }, options?: WebviewPanelOptions & WebviewOptions): WebviewPanel;
		export function createWebviewTextEditorInlineWidget(editor: TextEditor, classType: { new (editor: TextEditor): WebviewTextEditorInlineWidget }): WebviewTextEditorInlineWidget;
		export function createStatusBarItem(alignment?: StatusBarAlignment, priority?: number): StatusBarItem;
		export function createStatusBarItem(id: string, alignment?: StatusBarAlignment, priority?: number): StatusBarItem;
		export function setStatusBarMessage(text: string, hideAfterTimeout?: number): Disposable;
		export function setStatusBarMessage(text: string, cancelOnPromiseOrThenable: Thenable<any>): Disposable;
		export function withProgress<R>(options: ProgressOptions, task: (progress: Progress<{ message?: string; percentage?: number }>, token: CancellationToken) => Thenable<R>): Thenable<R>;
		export function createTextEditorDecorationType(options: DecorationRenderOptions): TextEditorDecorationType;
		export function createQuickPick<T extends QuickPickItem>(): QuickPick<T>;
		export function createInputBox(): InputBox;
		export function createTerminalLinkProvider<T extends TerminalLink>(provider: TerminalLinkProvider<T>): Disposable;
		export function registerTerminalProfileProvider(id: string, provider: TerminalProfileProvider): Disposable;
		export function registerFileDecorationProvider(provider: FileDecorationProvider): Disposable;
		export function registerWebviewPanelSerializer(viewType: string, serializer: WebviewPanelSerializer): Disposable;
	}
	export namespace workspace {
		export const name: string | undefined;
		export const workspaceFolders: readonly WorkspaceFolder[] | undefined;
		export const rootPath: string | undefined;
		export const textDocuments: readonly TextDocument[];
		export const notebookDocuments: readonly NotebookDocument[];
		export const onDidSaveTextDocument: Event<TextDocument>;
		export const onWillSaveTextDocument: Event<TextDocumentWillSaveEvent>;
		export const onDidOpenTextDocument: Event<TextDocument>;
		export const onDidCloseTextDocument: Event<TextDocument>;
		export const onDidChangeTextDocument: Event<TextDocumentChangeEvent>;
		export const onDidOpenNotebookDocument: Event<NotebookDocument>;
		export const onDidCloseNotebookDocument: Event<NotebookDocument>;
		export const onDidChangeNotebookDocument: Event<NotebookDocumentChangeEvent>;
		export const onWillCreateFiles: Event<FileWillCreateEvent>;
		export const onDidCreateFiles: Event<FileCreateEvent>;
		export const onWillDeleteFiles: Event<FileWillDeleteEvent>;
		export const onDidDeleteFiles: Event<FileDeleteEvent>;
		export const onWillRenameFiles: Event<FileWillRenameEvent>;
		export const onDidRenameFiles: Event<FileRenameEvent>;
		export const onDidChangeWorkspaceFolders: Event<WorkspaceFoldersChangeEvent>;
		export const onDidChangeConfiguration: Event<ConfigurationChangeEvent>;
		export const onDidGrantWorkspaceTrust: Event<void>;
		export const onDidOpenTextDocumentContentProvider: Event<string>;
		export const onDidCloseTextDocumentContentProvider: Event<string>;
		export const onDidCreateTextDocument: Event<TextDocument>;
		export function getConfiguration(section?: string, scope?: ConfigurationScope | null): WorkspaceConfiguration;
    }
}