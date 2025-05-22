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

/**
 * TODO: #include <UT_NAME.h>
 *     Note: Do not put any other include here
 */

/**
 * TODO: One block to put **Deep stubs, mocks and/or fakes** for the Function Under Test only:
 * - Call **GET_FUNCTION_UT_DEPENDENCY** to get all the symbols used inside the function under test.
 * - Analyze what necessary to mock/stub/fake.
 * - Mocks/stubs/Fakes must:
 *     - Match the real signature exactly.
 *     - Expose a global return-value variable tweakable per iteration.
 *     - Capture all input parameters into globals.
 */

/**
 * MUSTDO: One block to put **Shallow stubs** for Sub-calls inside the Sibling Functions:
 * - Must Call **GET_SIBLING_DEPENDENCY** to get all the sub-functions called inside each sibling function
 * - Proceed to stub all of them
 * - Shallow stubs must:
 *     - if the sub-function requires a return value, just return a default one
 *     - if not, just return;
 * - no need to put complex logic, just enough to avoid linking issues and unresolved external symbols
 * */

// NOTE: leave TestPrerequisite as it is
AMD_UNIT_TEST_STATUS
EFIAPI
TestPrerequisite(
    IN AMD_UNIT_TEST_CONTEXT Context)
{
    // No setup needed
    return AMD_UNIT_TEST_PASSED;
}

void
    EFIAPI
    TestBody(
        IN AMD_UNIT_TEST_CONTEXT Context)
{
    AMD_UNIT_TEST_FRAMEWORK *Ut = (AMD_UNIT_TEST_FRAMEWORK *)UtGetActiveFrameworkHandle();
    const char *TestName = UtGetTestName(Ut);
    const char *IterationName = UtGetTestIteration(Ut);

    Ut->Log(AMD_UNIT_TEST_LOG_INFO, __FUNCTION__, __LINE__,
            "%s (Iteration: %s) Test started.", TestName, IterationName);

    /**
     * TODO: One block to place all test-case logic inside TestBody(); do not modify TestPrerequisite(), TestCleanUp(), or main().
     * - TestBody() should have many iterations representing test cases, and each test case should have Arrange, Act, Assert
     *     - Analyze what iterations or test cases for the function under test
     *     - For each iteration, implement the iteration to dispatch named test cases using strcmp checks:
     */

    if (strcmp(IterationName, "case1") == 0)
    {
        // Arrange: set up test data and preconditions
        …
            // Act: call the function under test
        …
            // Assert: compare actual vs. expected using if-statement.
            if (actual == expected)
        {
            UtSetTestStatus(Ut, AMD_UNIT_TEST_PASSED);
        }
        else
        {
            UtSetTestStatus(Ut, AMD_UNIT_TEST_FAILED);
        }
    }
    else if (strcmp(IterationName, "case2") == 0)
    {
        …
    }
    else
    {
        …
    }

    UtSetTestStatus(Ut, AMD_UNIT_TEST_PASSED);
    Ut->Log(AMD_UNIT_TEST_LOG_INFO, __FUNCTION__, __LINE__, "%s (Iteration: %s) Test ended.", TestName, IterationName);
}

// MOTE: Leave TestCleanUp as it is
AMD_UNIT_TEST_STATUS
EFIAPI
TestCleanUp(
    IN AMD_UNIT_TEST_CONTEXT Context)
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
// NOTE: Leave main() as it is
int main(
    int argc,
    char *argv[])
{
    AMD_UNIT_TEST_STATUS Status;
    AMD_UNIT_TEST_FRAMEWORK Ut;

    // Initializing the UnitTest framework
    Status = UtInitFromArgs(
        &Ut,
        argc,
        argv);
    if (Status != AMD_UNIT_TEST_PASSED)
    {
        return Status;
    }

    // Logging the start of the test.
    Ut.Log(AMD_UNIT_TEST_LOG_INFO, __FUNCTION__, __LINE__,
           "Test %s started. TestStatus is %s.", UtGetTestName(&Ut), UtGetTestStatusString(&Ut));

    // Running the test
    UtRunTest(&Ut);

    // Freeing up all framework related allocated memories
    Ut.Log(AMD_UNIT_TEST_LOG_INFO, __FUNCTION__, __LINE__,
           "Test %s ended.", UtGetTestName(&Ut));
    UtDeinit(&Ut);

    return AMD_UNIT_TEST_PASSED;
}