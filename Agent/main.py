from Agent import Agent 
from Agent import pretty_print_messages
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

from Data import InitData

from Tools import ToolGetSourceFile 
from Tools import ToolGetTestTemplate 
from Tools import ToolGetDetailForOne
from Tools import ToolGetFunctionUTDependency 
from Tools import ToolGetSiblingDependency 
from Tools import ToolTerminate
from Tools import GetInitialPrompt

import sys

if __name__ == "__main__":
    json_path = 'C:/OpenSIL/webview/Agent/knowledge/KnowledgeBase.json'
    source_file_path = 'C:/OpenSIL/webview/Agent/knowledge/sourcefile.c'
    # prompt_path = 'C:/OpenSIL/webview/Agent/knowledge/prompt.md'  # prompt to generate shallow mocks
    prompt_path = 'C:/OpenSIL/webview/Agent/knowledge/_prompt.md'   # promot to generate unit tests
    ut_c_template_path = 'C:/OpenSIL/webview/Agent/template/template.c'
    ut_h_template_path = 'C:/OpenSIL/webview/Agent/template/template.h'
    
    if len(sys.argv) >= 2:
        function_ut = sys.argv[1]
    else:
        function_ut = input("What function to test: ")

    # model = "gpt-4o-mini"
    # model = "gpt-4.1-mini"
    model = "o4-mini"
    initData = InitData(model=model, function_ut=function_ut, json_path=json_path, source_file_path=source_file_path, prompt_path=prompt_path, ut_c_template_path=ut_c_template_path, ut_h_template_path=ut_h_template_path)

    tool_get_source_file = ToolGetSourceFile( initData.data )
    tool_get_test_template = ToolGetTestTemplate( initData.data )
    tool_get_detail_for_one = ToolGetDetailForOne( initData.data )
    tool_get_function_ut_dependency = ToolGetFunctionUTDependency(initData.data)
    tool_get_sibling_dependency = ToolGetSiblingDependency(initData.data)
    tool_terminate = ToolTerminate(initData.data)

    tools = [tool_get_source_file, tool_get_test_template, tool_get_detail_for_one, tool_get_function_ut_dependency, tool_get_sibling_dependency, tool_terminate]


    ReActAgent = Agent(
        model=ChatOpenAI(model=initData.data.model), 
        tools=tools,
        system=initData
    )

    for i in range(1):
        UTOneMessage = HumanMessage(content=GetInitialPrompt(initData.data))

        UTOneInitialState = {
            "messages": [
                SystemMessage(content=initData.data.system_prompt),
                UTOneMessage
            ],
            "scratchpad": [],
        }

        UTOneFinalState = ReActAgent.graph.invoke(
            UTOneInitialState,
            config={"recursion_limit": 100}
        )

        pretty_print_messages(UTOneFinalState["messages"])
