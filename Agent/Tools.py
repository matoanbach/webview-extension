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

# One tool to provide dependencies for the function under test
def ToolGetFunctionUTDependency(data: Data):
    @tool
    def GET_FUNCTION_UT_DEPENDENCY():
        """
        List the direct dependencies (functions, types, macros) used inside the
        function under test in the source file under test, for use in generating
        necessary mocks/stubs/fakes.
        """
        return GetFunctionUTDependency(data)    # <-- call the correct helper
    return GET_FUNCTION_UT_DEPENDENCY

# One tool to provide direct dependencies that need to be mocked 
#       (to resolve external symbols and compiler linking issue)
def ToolGetSiblingDependency(data: Data):
    @tool
    def GET_SIBLING_DEPENDENCY():
        """
        List the sub-calls inside sibling functions in the source file under test, for use in generating necessary stubs or mocks to resolve external symbols and linking issues.
        """
        return GetSiblingDependency(data)
    return GET_SIBLING_DEPENDENCY

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
        symbol = data.symbol_map.get(symbol_name)
        output.append(f'# DETAIL FOR {symbol_name}')
        output.append(f'## Kind: {SYMBOL_KIND_MAP.get(int(symbol.kind))}') 
        output.append(f"## Documentation\n{symbol.documentation}")
        output.append(f"## Implementation\n{symbol.implementation}")
        
    return "\n\n".join(output)
def GetFunctionUTDependency(data: Data):
    if data.function_ut not in data.symbol_map:
        return
    
    output = []
    for root in data.call_hierarchy.tree:
        if data.function_ut == root.name:
            output.append(f"# SUB-CALLS AND SYMBOLS USED INSIDE FUNCTION UNDER TEST {root.name}") 
            for symbol in root.dependencies.callTree:
                output.append(f'## SYMBOL NAME: `{symbol.name}`')
                output.append(f'### KIND: {SYMBOL_KIND_MAP.get(int(symbol.kind))}')
                output.append(f'### DOCUMENTATION: ')
                output.append(symbol.raw_to_block(symbol.documentation))
                output.append(f'### IMPLEMENTATION: ')
                output.append(symbol.raw_to_block(symbol.implementation))
    return "\n\n".join(output)

def GetSiblingDependency(data: Data):
    # output = []
    # for root in data.call_hierarchy.tree:
    #     output.append(f'# SUB-CALLS INSIDE **SIBLING** FUNCTION {root.name}:')
    #     if not root.dependencies.callTree:
    #         output.append("None")
    #         continue
    #     for symbol in root.dependencies.callTree:
    #         if SYMBOL_KIND_MAP.get(int(symbol.kind)) == "Function":
    #             output.append(f'## SYMBOL NAME: `{symbol.name}`')
    #             output.append(f'### KIND: {SYMBOL_KIND_MAP.get(int(symbol.kind))}')
    #             output.append(f'### DOCUMENTATION: ')
    #             output.append(symbol.raw_to_block(symbol.documentation))
    #             output.append(f'### IMPLEMENTATION: ')
    #             output.append(symbol.raw_to_block(symbol.implementation))
    # return "\n\n".join(output)
    output = []
    output.append(f'# SUB-CALLS INSIDE **SIBLING** FUNCTION:')
    for root in data.call_hierarchy.tree:
        if not root.dependencies.callTree:
            output.append("None")
            continue
        for symbol in root.dependencies.callTree:
            if SYMBOL_KIND_MAP.get(int(symbol.kind)) == "Function":
                output.append(f'## Function signature: \n{symbol.raw_to_block(symbol.definition)}')
                # output.append(f'## Function uses below symbols: ')
                # for sym in root.dependencies.callTree:
                #     if SYMBOL_KIND_MAP.get(int(symbol.kind)) != "Function":
                #         output.append(f'### IMPLEMENTATION: ')
                #         output.append(symbol.raw_to_block(sym.implementation))
    return "\n\n".join(output)

def GetInitialPrompt(data: Data):
    return f"""
    Generate a complete unit test for the {data.function_ut} function.
    Your output must include:
    - Unit test header file (.h)
    - Unit test source file (.c)
    - Any necessary mocks or stubs
    - Mock/Stub/Fake dependencies especially any sub-functions called by functiosn declared in the source file to prevent compiler linking issues

    Respond only with code blocks.
    """


# json_path = 'C:/OpenSIL/webview/Agent/knowledge/KnowledgeBase.json'
# source_file_path = 'C:/OpenSIL/webview/Agent/knowledge/sourcefile.c'
# prompt_path = 'C:/OpenSIL/webview/Agent/knowledge/prompt.md'
# ut_c_template_path = 'C:/OpenSIL/webview/Agent/template/template.c'
# ut_h_template_path = 'C:/OpenSIL/webview/Agent/template/template.h'
# # model = "gpt-4o-mini"
# model = "gpt-4.1-mini"
# # model = "o4-mini"
# initData = InitData(model=model, function_ut="NbioBaseInitPhx", json_path=json_path, source_file_path=source_file_path, prompt_path=prompt_path, ut_c_template_path=ut_c_template_path, ut_h_template_path=ut_h_template_path)

# print(GetFunctionUTDependency(initData.data))
# print(GetSiblingDependency(initData.data))
