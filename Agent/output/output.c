/* SPDX-License-Identifier: MIT */
/* Copyright (C) 2024 Advanced Micro Devices, Inc. All rights reserved. */
/**
 * @file InitializeRcMgrPhxTp1Ut.c
 * @brief Unit test for InitializeRcMgrPhxTp1
 *
 * Iterations:
 *   "StructNotFound"   - xUslFindStructure returns NULL
 *   "Ip2IpApiFail"     - SilGetIp2IpApi returns error
 *   "NormalFlowEqual"  - full path with SetRcBasedOnNv = FALSE
 */

#include "InitializeRcMgrPhxTp1Ut.h"

//
// Deep stubs / fakes for InitializeRcMgrPhxTp1
//

/* Globals to control stub return values */
void                 *gXUslFindStructureReturn;
SIL_STATUS            gSilGetIp2IpApiReturn;
SIL_STATUS            gSilInitMmioBasedOnNvReturn;
SIL_STATUS            gSilInitMmioEquallyReturn;
SIL_STATUS            gSilInitIoBasedOnNvReturn;
SIL_STATUS            gSilInitIoEquallyReturn;

/* Fake APOB API instance */
static APOB_IP2IP_API gApobApiFake;

/* xUslFindStructure stub */
void *
xUslFindStructure(
  SIL_CONTEXT *Ctx,
  uint32_t     Id,
  uint32_t     Index
  )
{
    (void)Ctx; (void)Id; (void)Index;
    return gXUslFindStructureReturn;
}

/* SilGetIp2IpApi stub */
SIL_STATUS
SilGetIp2IpApi(
  SIL_CONTEXT *Ctx,
  uint32_t     Id,
  void       **ApiPtr
  )
{
    (void)Ctx; (void)Id;
    *ApiPtr = &gApobApiFake;
    return gSilGetIp2IpApiReturn;
}

/* ApobGetMaxDieInfo fake: always report max sockets >=1 */
void
ApobGetMaxDieInfo(
  SIL_CONTEXT     *Ctx,
  APOB_SOC_DIE_INFO *Info
  )
{
    (void)Ctx;
    Info->MaxSocSocketsSupportedValue = 4;
}

/* MMIO/IO stubs */
SIL_STATUS
SilInitMmioBasedOnNvVariable4(
  SIL_CONTEXT            *Ctx,
  DFX_RCMGR_INPUT_BLK    *Blk,
  void                   *V,
  bool                    B
  )
{
    (void)Ctx; (void)Blk; (void)V; (void)B;
    return gSilInitMmioBasedOnNvReturn;
}
SIL_STATUS
SilInitMmioEqually4(
  SIL_CONTEXT         *Ctx,
  DFX_RCMGR_INPUT_BLK *Blk
  )
{
    (void)Ctx; (void)Blk;
    return gSilInitMmioEquallyReturn;
}
SIL_STATUS
SilInitIoBasedOnNvVariable4(
  SIL_CONTEXT            *Ctx,
  DFX_RCMGR_INPUT_BLK    *Blk,
  void                   *V,
  bool                    B
  )
{
    (void)Ctx; (void)Blk; (void)V; (void)B;
    return gSilInitIoBasedOnNvReturn;
}
SIL_STATUS
SilInitIoEqually4(
  SIL_CONTEXT         *Ctx,
  DFX_RCMGR_INPUT_BLK *Blk
  )
{
    (void)Ctx; (void)Blk;
    return gSilInitIoEquallyReturn;
}

//
// Shallow stubs for sibling functions & other externals
//

/* RcMgrSetInputBlkPhx dependency */
void *
SilCreateInfoBlock(
  SIL_CONTEXT *Ctx,
  uint32_t     A,
  size_t       B,
  uint32_t     C,
  uint32_t     D,
  uint32_t     E
  )
{
    (void)Ctx;(void)A;(void)B;(void)C;(void)D;(void)E;
    return (void*)0x1000;
}
/* Tracepoint already stubbed away */
/* SilInitCommon2RevXferTable */
SIL_STATUS
SilInitCommon2RevXferTable(
  SIL_CONTEXT *Ctx,
  uint32_t     Id,
  void       *Blk
  )
{
    (void)Ctx;(void)Id;(void)Blk;
    return SilPass;
}
/* SilInitIp2IpApi */
SIL_STATUS
SilInitIp2IpApi(
  SIL_CONTEXT *Ctx,
  uint32_t     Id,
  void       *Api
  )
{
    (void)Ctx;(void)Id;(void)Api;
    return SilPass;
}

//
// Test Frame
//

AMD_UNIT_TEST_STATUS
EFIAPI
TestPrerequisite(
    IN AMD_UNIT_TEST_CONTEXT Context)
{
    /* no global setup required */
    return AMD_UNIT_TEST_PASSED;
}

void
EFIAPI
TestBody(
    IN AMD_UNIT_TEST_CONTEXT Context)
{
    AMD_UNIT_TEST_FRAMEWORK *Ut = (AMD_UNIT_TEST_FRAMEWORK *)UtGetActiveFrameworkHandle();
    const char *Iteration = UtGetTestIteration(Ut);
    SIL_STATUS  Actual, Expected;
    static SIL_CONTEXT       FakeCtx;
    static DFX_RCMGR_INPUT_BLK FakeBlk;

    Ut->Log(AMD_UNIT_TEST_LOG_INFO, __FUNCTION__, __LINE__,
            "InitializeRcMgrPhxTp1Ut (Iteration: %s) start", Iteration);

    if (strcmp(Iteration, "StructNotFound") == 0) {
        /* Arrange */
        gXUslFindStructureReturn    = NULL;
        /* we won't call any other stub in this branch */
        /* Act */
        Actual = InitializeRcMgrPhxTp1(&FakeCtx);
        Expected = SilPass;
        /* Assert */
        if (Actual == Expected) {
            UtSetTestStatus(Ut, AMD_UNIT_TEST_PASSED);
        } else {
            UtSetTestStatus(Ut, AMD_UNIT_TEST_FAILED);
        }

    } else if (strcmp(Iteration, "Ip2IpApiFail") == 0) {
        /* Arrange */
        FakeBlk.SetRcBasedOnNv = false;
        FakeBlk.SocketNumber   = 1;
        FakeBlk.RbsPerSocket   = 1;
        gXUslFindStructureReturn    = &FakeBlk;
        gSilGetIp2IpApiReturn       = SilNotFound;
        /* Act */
        Actual = InitializeRcMgrPhxTp1(&FakeCtx);
        Expected = SilNotFound;
        /* Assert */
        if (Actual == Expected) {
            UtSetTestStatus(Ut, AMD_UNIT_TEST_PASSED);
        } else {
            UtSetTestStatus(Ut, AMD_UNIT_TEST_FAILED);
        }

    } else if (strcmp(Iteration, "NormalFlowEqual") == 0) {
        /* Arrange */
        FakeBlk.SetRcBasedOnNv         = false;
        FakeBlk.SocketNumber           = 1;
        FakeBlk.RbsPerSocket           = 1;
        gXUslFindStructureReturn       = &FakeBlk;
        gSilGetIp2IpApiReturn          = SilPass;
        gSilInitMmioBasedOnNvReturn    = SilAborted;  /* will skip */
        gSilInitMmioEquallyReturn      = SilPass;
        gSilInitIoBasedOnNvReturn      = SilAborted;  /* will skip */
        gSilInitIoEquallyReturn        = SilPass;
        /* Act */
        Actual = InitializeRcMgrPhxTp1(&FakeCtx);
        Expected = SilPass;
        /* Assert */
        if (Actual == Expected) {
            UtSetTestStatus(Ut, AMD_UNIT_TEST_PASSED);
        } else {
            UtSetTestStatus(Ut, AMD_UNIT_TEST_FAILED);
        }

    } else {
        /* unknown iteration */
        UtSetTestStatus(Ut, AMD_UNIT_TEST_FAILED);
    }

    Ut->Log(AMD_UNIT_TEST_LOG_INFO, __FUNCTION__, __LINE__,
            "InitializeRcMgrPhxTp1Ut (Iteration: %s) end", Iteration);
}

AMD_UNIT_TEST_STATUS
EFIAPI
TestCleanUp(
    IN AMD_UNIT_TEST_CONTEXT Context)
{
    return AMD_UNIT_TEST_PASSED;
}

int main(int argc, char *argv[])
{
    AMD_UNIT_TEST_STATUS Status;
    AMD_UNIT_TEST_FRAMEWORK Ut;

    Status = UtInitFromArgs(&Ut, argc, argv);
    if (Status != AMD_UNIT_TEST_PASSED) {
        return Status;
    }
    Ut.Log(AMD_UNIT_TEST_LOG_INFO, __FUNCTION__, __LINE__,
           "Test %s started.", UtGetTestName(&Ut));
    UtRunTest(&Ut);
    Ut.Log(AMD_UNIT_TEST_LOG_INFO, __FUNCTION__, __LINE__,
           "Test %s ended.", UtGetTestName(&Ut));
    UtDeinit(&Ut);
    return AMD_UNIT_TEST_PASSED;
}