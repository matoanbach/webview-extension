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


system_prompt = """
# AMD Open Silicon Unit Test Generation Agent

## PURPOSE:
- You are OpenSilUnitTestAgent, an intelligent agent whose sole purpose is to generate correct, readable, and high‑quality C unit tests for functions in the AMD Open Silicon (OpenSIL) library, using the AMD_UNIT_TEST framework.
- You must produce well-structured unit test code that compiles, follows AMD coding conventions, and covers normal, boundary, and error paths

## EXPECTED INPUT:
- A user message with the target function name containing signature and the function name. 

## EXPECTED OUTPUT:
- Two files, generated via ToolGetUTTemplate:
    1. **{FunctionName}Ut.c**  
      - Place all test-case logic inside TestBody(); do not modify TestPrerequisite(), TestCleanUp(), or main().         
        1. **Deep Mocks (Function Under Test)**  
          - Stub every external call the target invokes directly.  
          - Mocks must:
            - Match the real signature exactly.  
            - Expose a global return‐value variable tweakable per iteration.  
            - Capture all input parameters into globals.  

        2. **Shallow Stubs (Sibling Functions’ Sub‐calls)**  
          - To avoid unresolved external symbols or linking issue, inside any other functions in the same source file, identify their direct sub-calls.  
          - For each of their direct sub-calls (one level deeper), must generate minimal stubs that:
            - Match the API signature.  
            - Return safe defaults (e.g., `SilPass`, non‐NULL pointer).  
            - **No** parameter capture or reset logic—just satisfy the linker. 

      - TestBody() should have many iterations representing test cases, and each test case should have Arrange, Act, Assert
        - Implement multiple iterations to dispatch named test cases using strcmp checks:
            if (strcmp(IterationName, "case1") == 0) {
                // Arrange: set up test data and preconditions
                …
                // Act: call the function under test
                …
                // Assert: compare actual vs. expected using if-statement. Include this part if the function returns a value
                if (actual == expected) {
                  UtSetTestStatus(Ut, AMD_UNIT_TEST_PASSED);
                } else {
                  UtSetTestStatus(Ut, AMD_UNIT_TEST_FAILED);
                }
            } else if (strcmp(IterationName, "case2") == 0) {
                …
            } else {
                …
            }
      - Cover normal, boundary, and error paths with as many iterations as needed.  
      - If mocks, stubs, or fakes are required, insert them before TestPrerequisite().  
      - Do not include anything except **{FunctionName}Ut.h**   

    2. **{FunctionName}Ut.h**
      - Keep the content in the UT header template unchanged including any includes
      - Any includes must go here, do not put them in **{FunctionName}Ut.c**    
      - Go to the function's C source file and find all #include and put them here.  
      - Ensure the function’s c source file (not the header) is included e.g: #include <SourceFile.c>.
         
## ALLOWED TOOLS:
1. `GET_SOURCE_FILE`: Return the full C source code of the target function under test.  
2. `GET_TEST_TEMPLATE`: Provide boilerplate unit‐test templates (`.c` and `.h`) for the function, with placeholders ready for test logic.  
3. `GET_DETAIL_FOR_ONE(symbol_name: str)`: Fetch detailed information for a single symbol (function, struct, macro, etc.).  
4. `GET_DEPENDENCY`:  List all direct dependencies (functions, types, macros) of the function under test to aid in stub/mock generation.  
5. `TERMINATE`: Signal that the unit‐test generation is complete and stop invoking further tools.  

## REASONING AND ACTING STRATEGY (ReAct):
- You **must first generate a Thought** that shows your reasoning **before any Action**.
- After each Action, either:
    - For search actions → include an Observation containing the result of the action.
    - For generative actions → include an Output with the generated code.

## FORMAT (STRICTLY ENFORCED) 
You **must respond in this exact format**:

Thought: [describe what you're thinking]  
Action: [name_of_action]: [parameters]

After executing:
- Observation: {...} (only for search actions)  
- Output: [generated code] (only for generative actions)

## UNIT TEST GENERATION REQUIREMENTS
1. **Test Structure**  
   - Place all mocks, stubs, and fakes at the top of the .c file, before TestPrerequisite().  
   - Treat each test case as an *Iteration* within TestBody(), dispatching by IterationName:
     if (strcmp(IterationName, "case1") == 0) {
       // …Arrange–Act–Assert for case1…
     }
     else if (strcmp(IterationName, "case2") == 0) {
       // …Arrange–Act–Assert for case2…
     }
     else {
       // …default or error path…
     }
  - Within each block, strictly follow **Arrange → Act → Assert**.
2. **Test Coverage**  
   - Target 100 % line coverage of the function under test.  
   - Provide one Iteration per unique control path (normal, boundary, error).

3. **Arrange–Act–Assert**  
  - **Arrange:** Initialize inputs, allocate resources, set global state.  
  - **Act:** Call the function under test.  
  - **Assert:** Compare actual vs. expected using an if statement:
    ```c
    if (actual == expected) {
      UtSetTestStatus(Ut, AMD_UNIT_TEST_PASSED);
    } else {
      UtSetTestStatus(Ut, AMD_UNIT_TEST_FAILED);
    }
    ```
  - For pointer or struct outputs, validate each field individually.
4. **Code Style**  
  - Follow AMD’s conventions:
    - AMD_UNIT_TEST_STATUS EFIAPI TestPrerequisite
    - AMD_UNIT_TEST_STATUS EFIAPI TestBody
    - AMD_UNIT_TEST_STATUS EFIAPI TestCleanUp
  - Use appropriate logging macros.
  - Include all needed headers.
  - Maintain consistent naming.

5. **Dependencies & Isolation**  
  - Stub/mock all direct dependencies (first- and second-level calls per call-tree analysis).  
  - Generate mocks/stubs outside TestBody(), above TestPrerequisite().  
  - Use ToolGetFunctionDependencies(function_name, layer=2) to identify which symbols to mock.
"""

source_file = """
```c
/* SPDX-License-Identifier: MIT */
/* Copyright (C) 2021 - 2025 Advanced Micro Devices, Inc. All rights reserved. */
/**
 * @file RcMgrPhx.c
 * @brief Defines RcMgr PHX core initialization Entry Point
 *
 */

#include <SilCommon.h>
#include <Utils.h>
#include <DF/Df.h>
#include <DF/DfIp2Ip.h>
#include <DF/DfX/PHX/DfSilFabricRegistersPhx.h>
#include <RcMgr/Common/FabricResourceManager.h>
#include <RcMgr/RcMgrIp2Ip.h>
#include "FabricRcInitPhx.h"
#include "FabricRcManagerPhx.h"
#include <RcMgr/DfX/RcManager-api.h>
#include <ProjSocConst.h>
#include <RcMgr/Common/RcMgrCmn2Rev.h>
#include <RcMgr/DfX/FabricRcManagerDfX.h>
#include <RcMgrPhx.h>
#include <APOB/ApobIp2Ip.h>
#include <APOB/Common/ApobCmn.h>

extern RCMGR_COMMON_2_REV_XFER_BLOCK mRcMgrXferPhx;
extern RCMGR_IP2IP_API mRcMgrApiPhx;

/**
 * RcMgrSetInputBlkPhx
 *
 * @brief Input block API that assigns host memory block to the IP.
 *
 * @param   SilContext          A context structure through which host firmware defined data
 *                              can be passed to openSIL. The host firmware is responsible
 *                              for initializing the SIL_CONTEXT structure.
 */
SIL_STATUS
RcMgrSetInputBlkPhx (
  SIL_CONTEXT  *SilContext
  )
{
  void *InfoBlkPtr;

  InfoBlkPtr = SilCreateInfoBlock(SilContext,
    SilId_RcManager,
    sizeof (DFX_RCMGR_INPUT_BLK),
    RCMGR_INIT_INSTANCE,
    RCMGR_INIT_MAJOR_REV,
    RCMGR_INIT_MINOR_REV
    );

  if (InfoBlkPtr == NULL) {
    return SilAborted;
  }

  return SilPass;
}

/**
 * InitializeRcMgrPhxTp1
 *
 * @brief Initialize PHX resource registers for each RootBridge.
 *
 * @param   SilContext          A context structure through which host firmware defined data
 *                              can be passed to openSIL. The host firmware is responsible
 *                              for initializing the SIL_CONTEXT structure.
 */
SIL_STATUS
InitializeRcMgrPhxTp1 (
  SIL_CONTEXT  *SilContext
  )
{
  DFX_RCMGR_INPUT_BLK *SilData;
  SIL_STATUS          Status;
  SIL_STATUS          CalledStatus;
  APOB_IP2IP_API      *ApobIp2IpApi;
  APOB_SOC_DIE_INFO   SocMaxDieInfo;

  // Locate the IP block
  SilData = (DFX_RCMGR_INPUT_BLK *) xUslFindStructure(SilContext, SilId_RcManager, 0);
  if (SilData == NULL) {
    RCMGR_TRACEPOINT(SIL_TRACE_INFO, "SIL RC Init memory block not found!\n");
    CalledStatus = SilNotFound; // Could not find the IP input block
  } else {
    RCMGR_TRACEPOINT(SIL_TRACE_INFO, "SIL RC Init memory block is found blk at: 0x%x \n", SilData);

    CalledStatus = SilPass;

    Status = SilGetIp2IpApi(SilContext, SilId_ApobClass, (void **) &ApobIp2IpApi);
    if ((Status != SilPass) || (ApobIp2IpApi == NULL)) {
      assert(Status == SilPass);
      return Status;
    }
    ApobIp2IpApi->ApobGetMaxDieInfo(SilContext, &SocMaxDieInfo);
    // These asserts prevent tainted scalar coverity warnings by checking values
    // are within permissible ranges
    RCMGR_TRACEPOINT(SIL_TRACE_INFO, "SilData->SocketNumber: 0x%x \n", SilData->SocketNumber);
    RCMGR_TRACEPOINT(SIL_TRACE_INFO, "SilData->RbsPerSocket: 0x%x \n", SilData->RbsPerSocket);
    assert((SilData->SocketNumber > 0) && (SilData->SocketNumber <= SocMaxDieInfo.MaxSocSocketsSupportedValue));
    assert((SilData->RbsPerSocket > 0) && (SilData->RbsPerSocket <= PROJ_MAX_RBS_PER_SOCKET));

    RCMGR_TRACEPOINT(SIL_TRACE_INFO, "SilData->MmioRcMgr: 0x%x \n", &SilData->MmioRcMgr);
    RCMGR_TRACEPOINT(SIL_TRACE_INFO, "SilData->IoRcMgr:   0x%x \n", &SilData->IoRcMgr);


    // Initialize MMIO
    if (SilData->SetRcBasedOnNv) {
      // Got NvVariable successfully, try to init MMIO based on it
      RCMGR_TRACEPOINT(SIL_TRACE_INFO, "  Init MMIO based on NV variable\n");
      CalledStatus = SilInitMmioBasedOnNvVariable4(SilContext, SilData, NULL, true);
    }

    if ((CalledStatus != SilPass) || (!SilData->SetRcBasedOnNv)) {
      RCMGR_TRACEPOINT(SIL_TRACE_INFO,
        " Can't get NV variable or init MMIO based on NV variable failed.\n"
        );
      RCMGR_TRACEPOINT(SIL_TRACE_INFO, " Init MMIO equally.\n");
      /* coverity[tainted_data:SUPPRESS] */
      CalledStatus = SilInitMmioEqually4(SilContext, SilData);
    }

    if (CalledStatus == SilPass) {
      // Initialize IO
      if (SilData->SetRcBasedOnNv) {
        // Get NvVariable successfully, try to init IO base on it
        RCMGR_TRACEPOINT(SIL_TRACE_INFO, "  Init IO based on NV variable\n");
        CalledStatus = SilInitIoBasedOnNvVariable4(SilContext, SilData, NULL, true);
      }

      if ((!SilData->SetRcBasedOnNv) || (CalledStatus != SilPass)) {
        RCMGR_TRACEPOINT(SIL_TRACE_INFO, " Can't get NV variable or init IO based on NV variable failed.\n");
        RCMGR_TRACEPOINT(SIL_TRACE_INFO, "                      Init IO equally.\n");
        /* coverity[tainted_data:SUPPRESS] */
        CalledStatus = SilInitIoEqually4(SilContext, SilData);
      }
    }
  }
  return SilPass;
}

/**
 * InitializeRcMgrPhxTp2
 *
 * @brief Initialize PHX resource manager at Tp2.
 *
 * @param   SilContext          A context structure through which host firmware defined data
 *                              can be passed to openSIL. The host firmware is responsible
 *                              for initializing the SIL_CONTEXT structure.
 */
SIL_STATUS
InitializeRcMgrPhxTp2 (
  SIL_CONTEXT  *SilContext
  )
{
  RCMGR_TRACEPOINT(SIL_TRACE_ENTRY, "\n");
  RCMGR_TRACEPOINT(SIL_TRACE_EXIT, "\n");
  return SilPass;
}

/**
 * InitializeRcMgrPhxTp3
 *
 * @brief Initialize PHX resource manager at Tp3.
 *
 * @param   SilContext          A context structure through which host firmware defined data
 *                              can be passed to openSIL. The host firmware is responsible
 *                              for initializing the SIL_CONTEXT structure.
 */
SIL_STATUS
InitializeRcMgrPhxTp3 (
  SIL_CONTEXT  *SilContext
  )
{
  RCMGR_TRACEPOINT(SIL_TRACE_ENTRY, "\n");
  RCMGR_TRACEPOINT(SIL_TRACE_EXIT, "\n");
  return SilPass;
}

/**
 * InitializeApiRcMgrPhx
 *
 * @brief   Initialize internal and external APIs for Resource Manager
 *
 * @param   SilContext          A context structure through which host firmware defined data
 *                              can be passed to openSIL. The host firmware is responsible
 *                              for initializing the SIL_CONTEXT structure.
 * @retval  SilPass             API initialized successfully
 * @retval  SilInvalidParameter Id class is invalid
 *
 */
SIL_STATUS
InitializeApiRcMgrPhx (
  SIL_CONTEXT  *SilContext
  )
{
  SIL_STATUS  Status;

  // Initialize Common to Rev specific transfer table first
  Status = SilInitCommon2RevXferTable(SilContext, SilId_RcManager, (void *)&mRcMgrXferPhx);
  if (Status != SilPass) {
    return Status;
  }

  return SilInitIp2IpApi(SilContext, SilId_RcManager, (void *)&mRcMgrApiPhx);
}
```
"""

ut_c_template = """
```c
/* SPDX-License-Identifier: MIT */
/* Copyright (C) 2024 Advanced Micro Devices, Inc. All rights reserved. */
/**
 * @file {UT_NAME}.c
 * @brief
 *
 * {UT_NAME} Iteration definitions
 *
 * Iterations:
 *
 {ITERATION_NAMES_AND_DEFINITION}
 */

{INCLUDE_STATEMENTS}

{MOCKS_STUBS_FAKES}

 AMD_UNIT_TEST_STATUS
 EFIAPI
 TestPrerequisite (
   IN AMD_UNIT_TEST_CONTEXT Context
   )
 {
   AMD_UNIT_TEST_FRAMEWORK *Ut = (AMD_UNIT_TEST_FRAMEWORK*) UtGetActiveFrameworkHandle ();
   const char* TestName        = UtGetTestName (Ut);
   const char* IterationName   = UtGetTestIteration (Ut);
   Ut->Log(AMD_UNIT_TEST_LOG_INFO, __FUNCTION__, __LINE__,
     "%s (Iteration: %s) Prerequisite started.", TestName, IterationName);
   Ut->Log(AMD_UNIT_TEST_LOG_INFO, __FUNCTION__, __LINE__, "Allocating memory for openSIL.");
   return AMD_UNIT_TEST_PASSED;
 }
 
 void
 EFIAPI
 TestBody (
   IN AMD_UNIT_TEST_CONTEXT Context
   )
 {
     AMD_UNIT_TEST_FRAMEWORK *Ut = (AMD_UNIT_TEST_FRAMEWORK*) UtGetActiveFrameworkHandle ();
     const char* TestName        = UtGetTestName (Ut);
     const char* IterationName   = UtGetTestIteration (Ut);
 
     Ut->Log(AMD_UNIT_TEST_LOG_INFO, __FUNCTION__, __LINE__,
         "%s (Iteration: %s) Test started.", TestName, IterationName);
 
     SIL_CONTEXT SilContext;
     SilContext.ApobBaseAddress = 0;
     PCIe_WRAPPER_CONFIG Wrapper;
     uint8_t Buffer;
     GNB_HANDLE GnbHandle;
 
    if (strcmp(IterationName, "case1") == 0) {
        // Arrange: set up test data and preconditions
        …
        // Act: call the function under test
        …
        // Assert: compare actual vs. expected using if-statement. Include this part if the function returns a value
        if (actual == expected) {
           UtSetTestStatus(Ut, AMD_UNIT_TEST_PASSED);
        } else {
           UtSetTestStatus(Ut, AMD_UNIT_TEST_FAILED);
        }
    } else if (strcmp(IterationName, "case2") == 0) {
         …
    } else {
         …
    } 
 
    UtSetTestStatus (Ut, AMD_UNIT_TEST_PASSED);
    Ut->Log(AMD_UNIT_TEST_LOG_INFO, __FUNCTION__, __LINE__, "%s (Iteration: %s) Test ended.", TestName, IterationName);
 }
 
 AMD_UNIT_TEST_STATUS
 EFIAPI
 TestCleanUp (
   IN AMD_UNIT_TEST_CONTEXT Context
   )
 {
   return AMD_UNIT_TEST_PASSED;
 }
 
 /**
  * main
  * @brief      Statring point for Execution
  *
  * @details    This routine:
  *              - Handles the command line arguments.
  *                example: MpioCfgWrapperBeforeBifurcationPhxUt.exe -o "E:\test" -i "CheckSilContext"
  *                         -c <Path to Test Config File>
  *              - Declares the unit test framework.
  *              - Run the tests.
  *              - Deallocate the Unit test framework.
  *
  * @param    argc                     Argument count
  * @param    *argv[]                  Argument vector
  *
  * @retval   AMD_UNIT_TEST_PASSED     Function succeeded
  * @retval   NON-ZERO                 Error occurs
  */
 int
 main (
   int   argc,
   char  *argv[]
   )
 {
   AMD_UNIT_TEST_STATUS     Status;
   AMD_UNIT_TEST_FRAMEWORK  Ut;
 
   // Initializing the UnitTest framework
   Status = UtInitFromArgs (
     &Ut,
     argc,
     argv
   );
   if (Status != AMD_UNIT_TEST_PASSED) {
     return Status;
   }
 
   // Logging the start of the test.
   Ut.Log(AMD_UNIT_TEST_LOG_INFO, __FUNCTION__, __LINE__,
     "Test %s started. TestStatus is %s.", UtGetTestName (&Ut), UtGetTestStatusString (&Ut));
 
   // Running the test
   UtRunTest (&Ut);
 
   // Freeing up all framework related allocated memories
   Ut.Log(AMD_UNIT_TEST_LOG_INFO, __FUNCTION__, __LINE__,
     "Test %s ended.", UtGetTestName (&Ut));
   UtDeinit (&Ut);
 
   return AMD_UNIT_TEST_PASSED;
 }
```
"""

ut_h_template = """
```c
/* SPDX-License-Identifier: MIT */
/* Copyright (C) 2021 - 2024 Advanced Micro Devices, Inc. All rights reserved. */
/**
 * @file  {UT_NAME}.h
 * @brief
 *
 */

#pragma once

#include <UtBaseLib.h>
#include <UtSilInitLib.h>
#include <UtLogLib.h>

#include {The source file that containing the function under test, e.g, RcMgrPhx.c}

#include {The includes in the source file that containing the function under test}
```
"""


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
    call_hierarchy: CallHierarchy
    ascii_tree: str
    json_tree: str
    system_prompt: str
    source_file: str # the file contain the function under test
    ut_c_template: str
    ut_h_template: str
    symbol_map: Dict[str, Symbol] = field(default_factory=dict)


class InitData:
    def __init__(self, json_path: str):
        with open(json_path, "r") as f:
            raw = json.load(f)
            
        hierarchy = CallHierarchy.from_dict(raw)
        ascii_tree = hierarchy.tree_to_ascii()
        json_tree = hierarchy.tree_to_json()
        sym_map = hierarchy.tree_to_map() 
        self.data = Data(call_hierarchy=hierarchy, ascii_tree=ascii_tree, json_tree=json_tree, system_prompt=system_prompt, source_file=source_file, ut_c_template=ut_c_template, ut_h_template=ut_h_template, symbol_map=sym_map)

    def get_data(self) -> Data:
        return self.data



# # example usage
# initData = InitData('KnowledgeBase.json')
# for key, val in initData.data.symbol_map.items():
#     print(val.documentation, "\n\n")
#     print(val.definition, "\n\n")
#     print(val.implementation, "\n\n")
# # print(initData.data.ascii_tree) 