from langchain_core.tools import tool
from Data import Data, InitData, SYMBOL_KIND_MAP
from typing import List, Tuple

# -------- TOOL interface ---------

# One tool to retrieve the source file
def ToolGetSourceFile(data: Data):
    @tool
    def GET_SOURCE_FILE():
        """
        Return the complete C source code of the target function under test, as read from its source file.
        """
        return GetSourceFile(data)
    return GET_SOURCE_FILE

# One tool to provide the test template
def ToolGetTestTemplate(data: Data):
    @tool
    def GET_TEST_TEMPLATE():
        """
        Provide boilerplate unit test templates (.c and .h) for the specified function, including necessary placeholders.
        """
        return GetTestTemplate(data)
    return GET_TEST_TEMPLATE

# One tool to retrieve a symbol detail (structs, macros, defines, ...)
def ToolGetDetailForOne(data: Data):
    @tool
    def GET_DETAIL_FOR_ONE(symbol_name: str):
        """
        Fetch detailed information for a single symbol, including its name, documentation, implementation, and source location.
        """
        return GetDetailForOne(data, symbol_name)
    return GET_DETAIL_FOR_ONE

# One tool to provide direct dependencies that need to be mocked 
#       (to resolve external symbols and compiler linking issue)
def ToolGetDependency(data: Data):
    @tool
    def GET_DEPENDENCY():
        """
        List the direct dependencies (functions, types, macros) for all declared functions in the source file under test, 
        for use in generating necessary stubs or mocks.
        """
        return GetDependency(data)
    return GET_DEPENDENCY

def ToolTerminate(data: Data):
    @tool
    def TERMINATE():
        """
        Signal completion of unit test generation and halt any further tool invocations. 
        """
        return "\n\nAgent has terminated execution.\n\n"
    return TERMINATE

# ------ ACTUAL LOGIC OF THE TOOLS ----

def GetSourceFile(data: Data):
    output = []
    output.append('# THE FUNCTION SOURCE FILE:')
    output.append(data.source_file)
    return "\n\n".join(output) 

def GetTestTemplate(data: Data):
    output = [] 
    output.append('# Unit Test C File Template')
    output.append(data.ut_c_template)
    output.append('# Unit Test H File Template')
    output.append(data.ut_h_template)
    return "\n\n".join(output)  

def GetDetailForOne(data: Data, symbol_name: str):
    output = [] 
    
    if symbol_name not in data.symbol_map:
        output.append(f'# DETAIL FOR {symbol_name} not found')
    else:
        sym = data.symbol_map.get(symbol_name)
        output.append(f'# DETAIL FOR {symbol_name}')
        output.append(f"## Documentation\n{sym.documentation}")
        output.append(f"## Implementation\n{sym.implementation}")
        
    return "\n\n".join(output)

def GetDependency(data: Data):
    output = []
    for root in data.call_hierarchy.tree:
        output.append(f'# DIRECT DEPENDENCIES FOR FUNCTION {root.name}:')
        for symbol in root.dependencies.callTree:
            output.append(f'## SYMBOL NAME: `{symbol.name}`')
            output.append(f'### KIND: {SYMBOL_KIND_MAP.get(int(symbol.kind))}')
            output.append(f'### DOCUMENTATION: ')
            output.append(symbol.raw_to_block(symbol.documentation))
            output.append(f'### IMPLEMENTATION: ')
            output.append(symbol.raw_to_block(symbol.implementation))
    return "\n\n".join(output)

def GetInitialPrompt(choice: str):
    return f"""
    Generate a complete unit test for the {choice} function.
    Your output must include:
    - Unit test header file (.h)
    - Unit test source file (.c)
    - Any necessary mocks or stubs
    - Prevent compiler linking issues by create Mock/Stub/Fake dependencies especially any sub-functions called by functiosn declared in the source file

    Respond only with code blocks.
    """


# initData = InitData('KnowledgeBase.json')
# print(GetSourceFile(initData.data))
# print(GetTestTemplate(initData.data))
# print(GetDetailForOne(initData.data, 'RcMgrSetInputBlkPhx(SIL_CONTEXT *)'))
# print(GetDependency(initData.data))