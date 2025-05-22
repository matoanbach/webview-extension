/* SPDX-License-Identifier: MIT */
/* Copyright (C) 2024 Advanced Micro Devices, Inc. All rights reserved. */
/**
 * @file InitializeRcMgrPhxTp1Ut.h
 * @brief Unit test header for InitializeRcMgrPhxTp1
 *
 */

#pragma once

#include <UtBaseLib.h>
#include <UtSilInitLib.h>
#include <UtLogLib.h>
#include <assert.h>

/* Include all the real headers that the .c uses */
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
#include <APOB/ApobIp2Ip.h>
#include <APOB/Common/ApobCmn.h>

/* Disable assert() in UUT to return error codes instead of abort */
#undef assert
#define assert(x)

/* Suppress tracepoints during tests */
#undef RCMGR_TRACEPOINT
#define RCMGR_TRACEPOINT(...)

/* Pull in the UUT source for direct testing */
#include "RcMgrPhx.c"