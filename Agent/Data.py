from dataclasses import dataclass, field, asdict
from typing import List, Tuple, Dict
import json
SYMBOL_KIND_MAP: Dict[int, str] = {
    0: "File",
    1: "Module",
    2: "Namespace",
    3: "Package",
    4: "Class",
    5: "Method",
    6: "Property",
    7: "Field",
    8: "Constructor",
    9: "Enum",
    10: "Interface",
    11: "Function",
    12: "Variable",
    13: "Constant",
    14: "String",
    15: "Number",
    16: "Boolean",
    17: "Array",
    18: "Object",
    19: "Key",
    20: "Null",
    21: "EnumMember",
    22: "Struct",
    23: "Event",
    24: "Operator",
    25: "TypeParameter",
}

# ------------------------------------------------
# 
#
# Other files will not interact with section below
#
#
# ------------------------------------------------
@dataclass
class Symbol:
    name: str
    kind: str
    documentation: str
    definition: str
    implementation: str

@dataclass
class Range:
    start: Tuple[int, int]
    end: Tuple[int, int]

@dataclass
class Dependencies:
    callTree: List["CallTreeNode"] = field(default_factory=list)

@dataclass
class CallTreeNode:
    name: str
    kind: str
    uri: str
    documentation: str
    definition: str
    implementation: str
    range: Range
    selectionRange: Range
    dependencies: Dependencies

    def _node_to_ascii(self, indent: int = 0) -> str:
        """Recursively build an ASCII “|__” representation of this node + children."""
        if indent == 0:
            results = self.name + "\n"
        else:
            prefix = "|   " * (indent - 1)
            results = f"{prefix}|__ {self.name}\n"

        for child in self.dependencies.callTree:
            results += child._node_to_ascii(indent + 1)

        return results
    
    def _node_to_json(self) -> json:
        if self.dependencies.callTree:
            return {
                "name": self.name,
                "children": [child._node_to_json() for child in self.dependencies.callTree]
            }
        return {
            "name": self.name
        }
    
    def _node_to_map(self) -> Dict[str, Symbol]:
        sym_map: Dict[str, Symbol] = {}

        sym_map[self.name] = Symbol(
            name=self.name,
            kind=self.kind,
            documentation=self.raw_to_block(self.documentation),
            definition=self.raw_to_block(self.definition),
            implementation=self.raw_to_block(self.implementation)
        )

        for child in self.dependencies.callTree:
            sym_map |= child._node_to_map()
        
        return sym_map 
    
    def raw_to_block(self, raw: str):
        # below works for mac
        lines = raw.split("\\r\\n")
        return "```c\n" + "\n".join(lines) + "\n```" 

            

@dataclass
class CallHierarchy:
    type: str
    tree: List[CallTreeNode]

    @staticmethod
    def from_dict(raw: dict) -> "CallHierarchy":
        def make_range(positions) -> Range:
            if len(positions) < 2:
                return Range((0,0), (0,0))
            start = (positions[0].get("line", 0), positions[0].get("character", 0))
            end   = (positions[1].get("line", 0), positions[1].get("character", 0))
            return Range(start=start, end=end)

        def make_node(node: dict) -> CallTreeNode:
            children = [
                make_node(child)
                for child in node.get("dependencies", {})
                                 .get("callTree", [])
            ]
            return CallTreeNode(
                name=node["name"],
                kind=node["kind"],
                uri=node["uri"],
                documentation=node["documentation"],
                definition=node["definition"],
                implementation=node["implementation"],
                range=make_range(node.get("range", [])),
                selectionRange=make_range(node.get("selectionRange", [])),
                dependencies=Dependencies(callTree=children)
            )

        roots = [make_node(r) for r in raw.get("tree", [])]
        return CallHierarchy(type=raw.get("type", ""), tree=roots)

    def tree_to_ascii(self) -> str:
        """Return the entire hierarchy as an ASCII tree string."""
        out = ""
        for root in self.tree:
            out += root._node_to_ascii()
        return out

    def tree_to_json(self) -> str:
        """
        Return a JSON string that includes only each node's name,
        preserving the tree structure under a "children" key.
        """
        out = []
        for root in self.tree:
            out.append(root._node_to_json())
        return json.dumps(out, indent=2)
    
    def tree_to_map(self) -> Dict[str, Symbol]:
        out: Dict[str, Symbol] = {}
        for root in self.tree:
            out |= root._node_to_map()
        
        return out

# ------------------------------------------------
# 
#
# Other files will mainly interact with section below
#
#
# ------------------------------------------------

@dataclass
class Data:
    model: str
    call_hierarchy: CallHierarchy
    ascii_tree: str
    json_tree: str
    system_prompt: str
    source_file: str # the file contain the function under test
    function_ut: str
    ut_c_template: str
    ut_h_template: str
    symbol_map: Dict[str, Symbol] = field(default_factory=dict)

class InitData:
    def __init__(self, model: str, function_ut: str, json_path: str, source_file_path: str, prompt_path: str, ut_c_template_path: str, ut_h_template_path: str):
        with open(json_path, "r", encoding='utf-8') as f:
          raw = json.load(f)

        with open(source_file_path, 'r', encoding='utf-8') as f:
          source_file = f.read()

        with open(prompt_path, "r", encoding='utf-8') as f:
          system_prompt = f.read() 

        with open(ut_c_template_path, 'r',encoding='utf-8') as f:
          ut_c_template = f.read()

        with open(ut_h_template_path, 'r', encoding='utf-8') as f:
          ut_h_template = f.read()

        hierarchy = CallHierarchy.from_dict(raw)
        ascii_tree = hierarchy.tree_to_ascii()
        json_tree = hierarchy.tree_to_json()
        sym_map = hierarchy.tree_to_map()

        if function_ut not in sym_map:
          print(f"function {function_ut} not found, try again!")
        
        self.data = Data(model=model, call_hierarchy=hierarchy, ascii_tree=ascii_tree, json_tree=json_tree, system_prompt=system_prompt, source_file=source_file, ut_c_template=ut_c_template, ut_h_template=ut_h_template, function_ut=function_ut, symbol_map=sym_map)

    def get_data(self) -> Data:
        return self.data

# example usage
# initData = InitData('KnowledgeBase.json', 'RcMgrPhx.c', 'prompt.md', 'template.c', 'template.h')
# print(initData.data.system_prompt) 
# print(initData.data.source_file) 
# print(initData.data.ut_c_template) 
# print(initData.data.ut_h_template) 
# for root in initData.data.call_hierarchy.tree:
#   print(f'# DIRECT DEPENDENCIES FOR FUNCTION {root.name}:')
#   for symbol in root.dependencies.callTree:
#       print(f'## SYMBOL NAME: `{symbol.name}`')
#       print(f'### KIND: {SYMBOL_KIND_MAP.get(int(symbol.kind))}')

# print(initData.data.ascii_tree) 