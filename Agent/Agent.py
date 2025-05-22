from dotenv import load_dotenv
_ = load_dotenv()

import operator
from typing import TypedDict, Annotated, Dict, Any
from langgraph.graph import StateGraph, END
from langchain_core.messages import AnyMessage, SystemMessage, HumanMessage, ToolMessage
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.tools import Tool

from Data import InitData

import tiktoken

def count_tokens(messages, model="gpt-4o"):
    try:
        enc = tiktoken.encoding_for_model(model)
    except KeyError:
        enc = tiktoken.get_encoding("cl100k_base")

    total = 0
    for msg in messages:
        if hasattr(msg, "content"):
            text = msg.content
        else:
            text = str(msg)

        total += len(enc.encode(text))
    return total

def pretty_print_messages(messages):
    for msg in messages:
        # System‐level instructions
        if isinstance(msg, SystemMessage):
            header = "SYSTEM"
        # What the user said
        elif isinstance(msg, HumanMessage):
            header = "USER"
        # Output from a tool
        elif isinstance(msg, ToolMessage):
            header = f"TOOL:{msg.name}"
        # Fallback for any other message types
        else:
            header = msg.type.upper() if hasattr(msg, "type") else "UNKNOWN"

        print(f"\n--- {header} ---\n{msg.content}\n")


class AgentState(TypedDict):
    messages: Annotated[list[AnyMessage], operator.add]
    # messages: list[AnyMessage]
    scratchpad: Annotated[list[str], operator.add]
    actions_taken: Annotated[list[str], operator.add]

class Agent:
    def __init__(self, model:BaseChatModel=None, tools:Tool=None, system:InitData=None):
        self.system = system
        self.tools = {t.name: t for t in tools} if tools else {}
        self.model = model if tools is None else model.bind_tools(tools)

        # Adds main nodes
        graph = StateGraph(AgentState)
        graph.add_node("llm", self.call_openai)
        graph.add_node("give_reason", self.give_reason)
        graph.add_node("take_action", self.take_action)

        # Adds edges
        graph.add_conditional_edges("llm", self.exists_action, {True: "give_reason", False: END})
        graph.add_edge("give_reason", "take_action")
        graph.add_edge("take_action", "llm")
        graph.set_entry_point("llm")
        self.graph = graph.compile()

    def exists_action(self, state: AgentState) -> bool:
        result = state['messages'][-1]
        return hasattr(result, 'tool_calls') and result.tool_calls is not None and len(result.tool_calls) > 0

    def call_openai(self, state: AgentState) -> Dict[str, Any]:
        old_messages = state['messages']
        new_messages = list(old_messages)  # start with everything so far

        last = old_messages[-1] if old_messages else None
        if last and hasattr(last, 'tool_calls') and last.tool_calls:
            # add one ToolMessage per call
            for tc in last.tool_calls:
                tm = ToolMessage(
                    tool_call_id=tc['id'],
                    name=tc['name'],
                    content=f"Tool {tc['name']} was called with ID {tc['id']}"
                )
                new_messages.append(tm)
            # prevent us from handling the same tool_calls again:
            last.tool_calls = []

        # now invoke the LLM on the *old* messages
        response = self.model.invoke(old_messages)
        new_messages.append(response)

        print(f"\ncall_openai() - [LOG INFO] - Messages contain {count_tokens(new_messages, self.system.data.model)} tokens\n")
        return {'messages': [response]}

    def give_reason(self, state: AgentState) -> Dict[str, Any]:
        last_msg = state['messages'][-1]

        # uses tool message only if the latest reasoning is originated from the tools
        if isinstance(last_msg, ToolMessage):
            return {}

        content = getattr(last_msg, "content", "")
        if not isinstance(content, str):
            print("\n⚠️ Invalid LLM output content. Skipping reasoning...\n")
            return {}

        # checks for the thought state
        thought = None
        for line in content.splitlines():
            if line.strip().lower().startswith("thought:"):
                thought = line.split(":", 1)[-1].strip()
                break

        if thought:
            print(f"\n💭 Reasoning: \n{thought}\n")
            return {'scratchpad': state['scratchpad'] + [thought]}
        else:
            print("\n⚠️ Reasoning: \nNo explicit Thought found.\n")
            return {}

    # Takes action based on agent state (stochastic)
    def take_action(self, state: AgentState) -> Dict[str, Any]:
        tool_calls = state['messages'][-1].tool_calls
        results = []
        actions_taken = state.get("actions_taken", [])

        # action space -> main logic
        for t in tool_calls:
            tool_name = t['name']
            tool_id = t['id']
            args = t['args']
            content = ""

            print(f"\n🔧 Invoking tool '{tool_name}' with args: {args}\n")

            if tool_name == "TERMINATE":
                print("\n🛑 Agent termination requested.\n")
                tool_message = ToolMessage(
                    tool_call_id=tool_id,
                    name=tool_name,
                    content="Agent terminated."
                )
                state['messages'].append(tool_message)  # early return -> state == termination
                return {
                    "messages": state['messages'],
                    "actions_taken": actions_taken + [tool_name],
                    "__end__": True
                }

            if tool_name in actions_taken:
                content = "Error: Repeated tool call."
                print(f"\n❌ ERROR: Repeated tool detected for '{tool_name}'.\n")
                tool_message = ToolMessage(
                    tool_call_id=tool_id,
                    name=tool_name,
                    content=content
                )
                state['messages'].append(tool_message)  # early return -> state == infinite looping of tool calls
                return {
                    "messages": state['messages'],
                    "actions_taken": actions_taken,
                    "__end__": True
                }

            try:
                if tool_name in self.tools:
                    result = self.tools[tool_name].invoke(args)
                else:
                    raise ValueError(f"Invalid tool: {tool_name}")

                content = str(result)
                actions_taken.append(tool_name)

                # print detail what tool returns
                # print(f"\n✅ Tool '{tool_name}' returned: \n{content}\n\n")

                # print tokens used by tools
                print(f"\ntake_action() - [LOG INFO] - Tool '{tool_name}' used tokens_count: {count_tokens([content], self.system.data.model)}\n\n")

                tool_message = ToolMessage(
                    tool_call_id=tool_id,
                    name=tool_name,
                    content=content
                )
                state['messages'].append(tool_message)  # state change -> generates UT from reasoning

            except Exception as e:
                content = f"Error: {e}"
                print(f"\n❌ ERROR in tool '{tool_name}': {e}\n")
                tool_message = ToolMessage(
                    tool_call_id=tool_id,
                    name=tool_name,
                    content=content
                )
                state['messages'].append(tool_message)  # exception state reached -> raised during tooling

        print(f"\ntake_action() - [LOG INFO] - Messages contain {count_tokens(state["messages"], self.system.data.model)} tokens\n")
        # returns the action taken to the main routine
        return {
            "messages": state['messages'],
            "actions_taken": actions_taken,
            "__end__": False
        }
