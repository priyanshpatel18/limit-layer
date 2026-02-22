/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/limitlayer_protocol.json`.
 */
export type LimitlayerProtocol = {
  "address": "LLycnqAcLQoVRqQ1jrisJL4oacnkDE6sZnM6MHHxixm",
  "metadata": {
    "name": "limitlayerProtocol",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "attachPolicyToKey",
      "discriminator": [
        36,
        27,
        4,
        69,
        131,
        185,
        229,
        138
      ],
      "accounts": [
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "service"
        },
        {
          "name": "policy"
        },
        {
          "name": "apiKey",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "createApiKey",
      "discriminator": [
        239,
        195,
        250,
        230,
        153,
        63,
        174,
        174
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "protocol",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "service"
        },
        {
          "name": "apiKey",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  112,
                  105,
                  95,
                  107,
                  101,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "protocol.api_key_count",
                "account": "protocolState"
              }
            ]
          }
        },
        {
          "name": "delegatedUsage",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  108,
                  101,
                  103,
                  97,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  97,
                  103,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "apiKey"
              }
            ]
          }
        },
        {
          "name": "reputation",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  112,
                  117,
                  116,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "owner"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "policy",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "createPolicy",
      "discriminator": [
        27,
        81,
        33,
        27,
        196,
        103,
        246,
        53
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "service",
          "writable": true
        },
        {
          "name": "policy",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  108,
                  105,
                  99,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "service"
              },
              {
                "kind": "account",
                "path": "service.total_usage_units",
                "account": "serviceAccount"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "requestsPerWindow",
          "type": "u64"
        },
        {
          "name": "windowSeconds",
          "type": "u64"
        },
        {
          "name": "burstLimit",
          "type": "u64"
        },
        {
          "name": "costPerRequest",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createService",
      "discriminator": [
        1,
        254,
        91,
        243,
        178,
        196,
        28,
        245
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "protocol",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "service",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  101,
                  114,
                  118,
                  105,
                  99,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "protocol.service_count",
                "account": "protocolState"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "defaultPolicy",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "delegateUsage",
      "discriminator": [
        51,
        8,
        247,
        107,
        27,
        250,
        87,
        20
      ],
      "accounts": [
        {
          "name": "payer",
          "docs": [
            "Payer for delegation CPI"
          ],
          "signer": true
        },
        {
          "name": "apiKey"
        },
        {
          "name": "bufferPda",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  117,
                  102,
                  102,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "pda"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                4,
                244,
                159,
                91,
                36,
                204,
                40,
                75,
                153,
                168,
                59,
                201,
                253,
                232,
                164,
                117,
                66,
                6,
                26,
                242,
                19,
                61,
                116,
                197,
                237,
                40,
                187,
                221,
                139,
                152,
                168,
                126
              ]
            }
          }
        },
        {
          "name": "delegationRecordPda",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  108,
                  101,
                  103,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "pda"
              }
            ],
            "program": {
              "kind": "account",
              "path": "delegationProgram"
            }
          }
        },
        {
          "name": "delegationMetadataPda",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  108,
                  101,
                  103,
                  97,
                  116,
                  105,
                  111,
                  110,
                  45,
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "pda"
              }
            ],
            "program": {
              "kind": "account",
              "path": "delegationProgram"
            }
          }
        },
        {
          "name": "pda",
          "writable": true
        },
        {
          "name": "ownerProgram",
          "address": "LLycnqAcLQoVRqQ1jrisJL4oacnkDE6sZnM6MHHxixm"
        },
        {
          "name": "delegationProgram",
          "address": "DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "executionRegion",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "emitAbuseSignal",
      "discriminator": [
        215,
        252,
        126,
        56,
        85,
        246,
        225,
        137
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "service"
        },
        {
          "name": "abuseSignal",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  98,
                  117,
                  115,
                  101,
                  95,
                  115,
                  105,
                  103,
                  110,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "reputation.subject",
                "account": "reputationAccount"
              },
              {
                "kind": "account",
                "path": "clock.unix_timestamp"
              }
            ]
          }
        },
        {
          "name": "reputation",
          "writable": true
        },
        {
          "name": "clock",
          "address": "SysvarC1ock11111111111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "severity",
          "type": "u8"
        },
        {
          "name": "category",
          "type": "u32"
        }
      ]
    },
    {
      "name": "evaluateEnforcement",
      "discriminator": [
        17,
        118,
        53,
        154,
        88,
        224,
        240,
        42
      ],
      "accounts": [
        {
          "name": "apiKey",
          "writable": true
        },
        {
          "name": "policy"
        },
        {
          "name": "delegatedUsage"
        }
      ],
      "args": []
    },
    {
      "name": "initializeProtocol",
      "discriminator": [
        188,
        233,
        252,
        106,
        134,
        146,
        202,
        91
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "protocol",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "protocolFeeBps",
          "type": "u16"
        },
        {
          "name": "treasury",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "manualBlockKey",
      "discriminator": [
        253,
        137,
        79,
        106,
        163,
        45,
        42,
        145
      ],
      "accounts": [
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "service"
        },
        {
          "name": "apiKey",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "manualUnblockKey",
      "discriminator": [
        87,
        10,
        89,
        229,
        86,
        25,
        115,
        184
      ],
      "accounts": [
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "service"
        },
        {
          "name": "apiKey",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "prepareDelegation",
      "discriminator": [
        245,
        172,
        11,
        80,
        50,
        242,
        5,
        62
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "service"
        },
        {
          "name": "apiKey"
        },
        {
          "name": "policy"
        },
        {
          "name": "delegatedUsage",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  108,
                  101,
                  103,
                  97,
                  116,
                  101,
                  100,
                  95,
                  117,
                  115,
                  97,
                  103,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "apiKey"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "executionRegion",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "processUndelegation",
      "discriminator": [
        196,
        28,
        41,
        206,
        48,
        37,
        51,
        167
      ],
      "accounts": [
        {
          "name": "baseAccount",
          "writable": true
        },
        {
          "name": "buffer"
        },
        {
          "name": "payer",
          "writable": true
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": [
        {
          "name": "accountSeeds",
          "type": {
            "vec": "bytes"
          }
        }
      ]
    },
    {
      "name": "recordUsageRealtime",
      "discriminator": [
        96,
        208,
        69,
        9,
        86,
        36,
        171,
        19
      ],
      "accounts": [
        {
          "name": "delegatedUsage",
          "writable": true
        },
        {
          "name": "apiKey",
          "docs": [
            "Read-only; only delegated_usage can be written on ER"
          ]
        },
        {
          "name": "policy"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "revokeApiKey",
      "discriminator": [
        243,
        12,
        2,
        136,
        215,
        55,
        213,
        183
      ],
      "accounts": [
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "service"
        },
        {
          "name": "apiKey",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "setApiKeyStatus",
      "discriminator": [
        233,
        204,
        58,
        195,
        221,
        32,
        77,
        125
      ],
      "accounts": [
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "service"
        },
        {
          "name": "apiKey",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "newStatus",
          "type": {
            "defined": {
              "name": "apiKeyStatus"
            }
          }
        }
      ]
    },
    {
      "name": "setServiceStatus",
      "discriminator": [
        194,
        188,
        10,
        145,
        245,
        118,
        238,
        250
      ],
      "accounts": [
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "service",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "newStatus",
          "type": {
            "defined": {
              "name": "serviceStatus"
            }
          }
        }
      ]
    },
    {
      "name": "submitUsageCheckpoint",
      "discriminator": [
        19,
        147,
        65,
        192,
        20,
        72,
        193,
        125
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "delegatedUsage",
          "writable": true
        },
        {
          "name": "magicProgram",
          "address": "Magic11111111111111111111111111111111111111"
        },
        {
          "name": "magicContext",
          "writable": true,
          "address": "MagicContext1111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "undelegateUsage",
      "discriminator": [
        192,
        149,
        204,
        105,
        201,
        154,
        41,
        1
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "delegatedUsage",
          "writable": true
        },
        {
          "name": "magicProgram",
          "address": "Magic11111111111111111111111111111111111111"
        },
        {
          "name": "magicContext",
          "writable": true,
          "address": "MagicContext1111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "updatePolicy",
      "discriminator": [
        212,
        245,
        246,
        7,
        163,
        151,
        18,
        57
      ],
      "accounts": [
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "service"
        },
        {
          "name": "policy",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "requestsPerWindow",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "windowSeconds",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "burstLimit",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "costPerRequest",
          "type": {
            "option": "u64"
          }
        }
      ]
    },
    {
      "name": "updateProtocol",
      "discriminator": [
        206,
        25,
        218,
        114,
        109,
        41,
        74,
        173
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "protocol",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "newFeeBps",
          "type": {
            "option": "u16"
          }
        },
        {
          "name": "newTreasury",
          "type": {
            "option": "pubkey"
          }
        },
        {
          "name": "paused",
          "type": {
            "option": "bool"
          }
        }
      ]
    },
    {
      "name": "updateReputation",
      "discriminator": [
        194,
        220,
        43,
        201,
        54,
        209,
        49,
        178
      ],
      "accounts": [
        {
          "name": "reputation",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "delta",
          "type": "i64"
        }
      ]
    },
    {
      "name": "updateService",
      "discriminator": [
        46,
        169,
        26,
        33,
        191,
        78,
        40,
        221
      ],
      "accounts": [
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "service",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "newAuthority",
          "type": {
            "option": "pubkey"
          }
        },
        {
          "name": "newDefaultPolicy",
          "type": {
            "option": "pubkey"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "abuseSignal",
      "discriminator": [
        216,
        14,
        121,
        129,
        198,
        125,
        3,
        181
      ]
    },
    {
      "name": "apiKeyAccount",
      "discriminator": [
        205,
        218,
        27,
        32,
        8,
        107,
        172,
        106
      ]
    },
    {
      "name": "delegatedUsageAccount",
      "discriminator": [
        129,
        247,
        215,
        204,
        26,
        215,
        31,
        87
      ]
    },
    {
      "name": "protocolState",
      "discriminator": [
        33,
        51,
        173,
        134,
        35,
        140,
        195,
        248
      ]
    },
    {
      "name": "rateLimitPolicy",
      "discriminator": [
        220,
        194,
        242,
        221,
        245,
        108,
        71,
        242
      ]
    },
    {
      "name": "reputationAccount",
      "discriminator": [
        19,
        185,
        177,
        157,
        34,
        87,
        67,
        233
      ]
    },
    {
      "name": "serviceAccount",
      "discriminator": [
        72,
        33,
        73,
        146,
        208,
        186,
        107,
        192
      ]
    }
  ],
  "events": [
    {
      "name": "abuseSignalEmitted",
      "discriminator": [
        41,
        228,
        86,
        153,
        40,
        127,
        162,
        252
      ]
    },
    {
      "name": "apiKeyCreated",
      "discriminator": [
        64,
        2,
        19,
        158,
        93,
        200,
        123,
        42
      ]
    },
    {
      "name": "apiKeyRevoked",
      "discriminator": [
        91,
        214,
        0,
        145,
        95,
        139,
        234,
        194
      ]
    },
    {
      "name": "apiKeyStatusChanged",
      "discriminator": [
        5,
        232,
        100,
        241,
        251,
        205,
        134,
        87
      ]
    },
    {
      "name": "enforcementEvaluated",
      "discriminator": [
        77,
        15,
        43,
        20,
        220,
        61,
        124,
        2
      ]
    },
    {
      "name": "keyManuallyBlocked",
      "discriminator": [
        1,
        152,
        214,
        197,
        141,
        11,
        250,
        22
      ]
    },
    {
      "name": "keyManuallyUnblocked",
      "discriminator": [
        208,
        51,
        169,
        191,
        209,
        138,
        210,
        77
      ]
    },
    {
      "name": "policyAttachedToKey",
      "discriminator": [
        64,
        21,
        54,
        215,
        97,
        25,
        120,
        154
      ]
    },
    {
      "name": "policyCreated",
      "discriminator": [
        59,
        189,
        65,
        121,
        86,
        157,
        108,
        10
      ]
    },
    {
      "name": "policyUpdated",
      "discriminator": [
        225,
        112,
        112,
        67,
        95,
        236,
        245,
        161
      ]
    },
    {
      "name": "protocolInitialized",
      "discriminator": [
        173,
        122,
        168,
        254,
        9,
        118,
        76,
        132
      ]
    },
    {
      "name": "protocolUpdated",
      "discriminator": [
        52,
        35,
        157,
        26,
        20,
        117,
        63,
        218
      ]
    },
    {
      "name": "reputationUpdated",
      "discriminator": [
        26,
        36,
        187,
        150,
        235,
        90,
        106,
        89
      ]
    },
    {
      "name": "serviceCreated",
      "discriminator": [
        232,
        107,
        180,
        200,
        214,
        120,
        171,
        227
      ]
    },
    {
      "name": "serviceStatusChanged",
      "discriminator": [
        40,
        101,
        223,
        0,
        120,
        227,
        183,
        102
      ]
    },
    {
      "name": "serviceUpdated",
      "discriminator": [
        184,
        118,
        4,
        188,
        134,
        109,
        194,
        235
      ]
    },
    {
      "name": "usageCheckpointSubmitted",
      "discriminator": [
        239,
        66,
        102,
        197,
        6,
        196,
        176,
        250
      ]
    },
    {
      "name": "usageDelegated",
      "discriminator": [
        13,
        21,
        74,
        21,
        58,
        47,
        169,
        129
      ]
    },
    {
      "name": "usageRecordedRealtime",
      "discriminator": [
        187,
        105,
        226,
        248,
        26,
        13,
        196,
        224
      ]
    },
    {
      "name": "usageUndelegated",
      "discriminator": [
        172,
        46,
        230,
        193,
        37,
        253,
        248,
        23
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unauthorized",
      "msg": "unauthorized"
    },
    {
      "code": 6001,
      "name": "invalidInput",
      "msg": "Invalid input"
    },
    {
      "code": 6002,
      "name": "mathOverflow",
      "msg": "Math overflow"
    },
    {
      "code": 6003,
      "name": "protocolPaused",
      "msg": "Protocol is paused"
    },
    {
      "code": 6004,
      "name": "protocolAlreadyInitialized",
      "msg": "Protocol already initialized"
    },
    {
      "code": 6005,
      "name": "invalidProtocolFee",
      "msg": "Invalid protocol fee"
    },
    {
      "code": 6006,
      "name": "serviceNameTooLong",
      "msg": "Service name too long"
    },
    {
      "code": 6007,
      "name": "invalidService",
      "msg": "Invalid service"
    },
    {
      "code": 6008,
      "name": "serviceDisabled",
      "msg": "Service disabled"
    },
    {
      "code": 6009,
      "name": "invalidServiceStatusTransition",
      "msg": "Invalid service status transition"
    },
    {
      "code": 6010,
      "name": "invalidPolicy",
      "msg": "Invalid policy"
    },
    {
      "code": 6011,
      "name": "policyDisabled",
      "msg": "Policy disabled"
    },
    {
      "code": 6012,
      "name": "invalidRateLimitConfig",
      "msg": "Invalid rate limit configuration"
    },
    {
      "code": 6013,
      "name": "invalidApiKey",
      "msg": "Invalid API key"
    },
    {
      "code": 6014,
      "name": "apiKeyInactive",
      "msg": "API key inactive"
    },
    {
      "code": 6015,
      "name": "apiKeyBlocked",
      "msg": "API key blocked"
    },
    {
      "code": 6016,
      "name": "apiKeyRevoked",
      "msg": "API key revoked"
    },
    {
      "code": 6017,
      "name": "invalidApiKeyStatusTransition",
      "msg": "Invalid API key status transition"
    },
    {
      "code": 6018,
      "name": "alreadyDelegated",
      "msg": "Already delegated"
    },
    {
      "code": 6019,
      "name": "notDelegated",
      "msg": "Not delegated"
    },
    {
      "code": 6020,
      "name": "invalidDelegationState",
      "msg": "Invalid delegation state; call prepare_delegation first"
    },
    {
      "code": 6021,
      "name": "invalidExecutionRegion",
      "msg": "Invalid execution region"
    },
    {
      "code": 6022,
      "name": "delegationRequiresCheckpoint",
      "msg": "Delegation requires final checkpoint"
    },
    {
      "code": 6023,
      "name": "rateLimitExceeded",
      "msg": "Rate limit exceeded"
    },
    {
      "code": 6024,
      "name": "burstLimitExceeded",
      "msg": "Burst limit exceeded"
    },
    {
      "code": 6025,
      "name": "invalidWindow",
      "msg": "Invalid usage window"
    },
    {
      "code": 6026,
      "name": "windowNotFinished",
      "msg": "Window not finished"
    },
    {
      "code": 6027,
      "name": "invalidCheckpointSequence",
      "msg": "Checkpoint sequence invalid"
    },
    {
      "code": 6028,
      "name": "checkpointRegression",
      "msg": "Checkpoint regression detected"
    },
    {
      "code": 6029,
      "name": "manualBlockActive",
      "msg": "Manual block prevents change"
    },
    {
      "code": 6030,
      "name": "enforcementDataMissing",
      "msg": "Enforcement skipped due to missing data"
    },
    {
      "code": 6031,
      "name": "invalidSeverity",
      "msg": "Invalid abuse severity"
    },
    {
      "code": 6032,
      "name": "duplicateAbuseSignal",
      "msg": "Duplicate abuse signal"
    },
    {
      "code": 6033,
      "name": "reputationTooLow",
      "msg": "Reputation too low"
    },
    {
      "code": 6034,
      "name": "reputationOverflow",
      "msg": "Reputation overflow"
    }
  ],
  "types": [
    {
      "name": "abuseSignal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "reporterService",
            "type": "pubkey"
          },
          {
            "name": "subject",
            "type": "pubkey"
          },
          {
            "name": "severity",
            "type": "u8"
          },
          {
            "name": "category",
            "type": "u32"
          },
          {
            "name": "createdTs",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "abuseSignalEmitted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "abuseSignal",
            "type": "pubkey"
          },
          {
            "name": "reporterService",
            "type": "pubkey"
          },
          {
            "name": "subject",
            "type": "pubkey"
          },
          {
            "name": "severity",
            "type": "u8"
          },
          {
            "name": "category",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "apiKeyAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "service",
            "type": "pubkey"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "policy",
            "type": "pubkey"
          },
          {
            "name": "reputation",
            "type": "pubkey"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "apiKeyStatus"
              }
            }
          },
          {
            "name": "lifetimeUsage",
            "type": "u128"
          },
          {
            "name": "lastCheckpointTs",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "apiKeyCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "apiKey",
            "type": "pubkey"
          },
          {
            "name": "service",
            "type": "pubkey"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "policy",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "apiKeyRevoked",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "apiKey",
            "type": "pubkey"
          },
          {
            "name": "service",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "apiKeyStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "active"
          },
          {
            "name": "throttled"
          },
          {
            "name": "blocked"
          },
          {
            "name": "revoked"
          }
        ]
      }
    },
    {
      "name": "apiKeyStatusChanged",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "apiKey",
            "type": "pubkey"
          },
          {
            "name": "service",
            "type": "pubkey"
          },
          {
            "name": "newStatus",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "delegatedUsageAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "apiKey",
            "type": "pubkey"
          },
          {
            "name": "policy",
            "type": "pubkey"
          },
          {
            "name": "executionRegion",
            "type": "pubkey"
          },
          {
            "name": "delegated",
            "type": "bool"
          },
          {
            "name": "delegationSeq",
            "type": "u64"
          },
          {
            "name": "windowStartTs",
            "type": "i64"
          },
          {
            "name": "currentWindowUsage",
            "type": "u64"
          },
          {
            "name": "burstCounter",
            "type": "u64"
          },
          {
            "name": "lastUpdateTs",
            "type": "i64"
          },
          {
            "name": "delegatedAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "enforcementEvaluated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "apiKey",
            "type": "pubkey"
          },
          {
            "name": "newStatus",
            "type": "u8"
          },
          {
            "name": "usage",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "keyManuallyBlocked",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "apiKey",
            "type": "pubkey"
          },
          {
            "name": "service",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "keyManuallyUnblocked",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "apiKey",
            "type": "pubkey"
          },
          {
            "name": "service",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "policyAttachedToKey",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "apiKey",
            "type": "pubkey"
          },
          {
            "name": "policy",
            "type": "pubkey"
          },
          {
            "name": "service",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "policyCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "policy",
            "type": "pubkey"
          },
          {
            "name": "service",
            "type": "pubkey"
          },
          {
            "name": "requestsPerWindow",
            "type": "u64"
          },
          {
            "name": "windowSeconds",
            "type": "u64"
          },
          {
            "name": "burstLimit",
            "type": "u64"
          },
          {
            "name": "costPerRequest",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "policyUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "policy",
            "type": "pubkey"
          },
          {
            "name": "requestsPerWindow",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "windowSeconds",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "burstLimit",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "costPerRequest",
            "type": {
              "option": "u64"
            }
          }
        ]
      }
    },
    {
      "name": "protocolInitialized",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "protocol",
            "type": "pubkey"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "treasury",
            "type": "pubkey"
          },
          {
            "name": "protocolFeeBps",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "protocolState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "adminAuthority",
            "type": "pubkey"
          },
          {
            "name": "treasury",
            "type": "pubkey"
          },
          {
            "name": "protocolFeeBps",
            "type": "u16"
          },
          {
            "name": "paused",
            "type": "bool"
          },
          {
            "name": "serviceCount",
            "type": "u64"
          },
          {
            "name": "apiKeyCount",
            "type": "u64"
          },
          {
            "name": "totalUsageCheckpoints",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "protocolUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "protocol",
            "type": "pubkey"
          },
          {
            "name": "newFeeBps",
            "type": {
              "option": "u16"
            }
          },
          {
            "name": "newTreasury",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "paused",
            "type": {
              "option": "bool"
            }
          }
        ]
      }
    },
    {
      "name": "rateLimitPolicy",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "service",
            "type": "pubkey"
          },
          {
            "name": "requestsPerWindow",
            "type": "u64"
          },
          {
            "name": "windowSeconds",
            "type": "u64"
          },
          {
            "name": "burstLimit",
            "type": "u64"
          },
          {
            "name": "costPerRequest",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "reputationAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "subject",
            "type": "pubkey"
          },
          {
            "name": "globalScore",
            "type": "i64"
          },
          {
            "name": "signalCount",
            "type": "u64"
          },
          {
            "name": "lastUpdatedTs",
            "type": "i64"
          },
          {
            "name": "flags",
            "type": "u32"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "reputationUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "reputation",
            "type": "pubkey"
          },
          {
            "name": "subject",
            "type": "pubkey"
          },
          {
            "name": "delta",
            "type": "i64"
          },
          {
            "name": "newScore",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "serviceAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "serviceStatus"
              }
            }
          },
          {
            "name": "defaultPolicy",
            "type": "pubkey"
          },
          {
            "name": "totalUsageUnits",
            "type": "u128"
          },
          {
            "name": "createdTs",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "serviceCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "service",
            "type": "pubkey"
          },
          {
            "name": "protocol",
            "type": "pubkey"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "defaultPolicy",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "serviceStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "active"
          },
          {
            "name": "paused"
          },
          {
            "name": "disabled"
          }
        ]
      }
    },
    {
      "name": "serviceStatusChanged",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "service",
            "type": "pubkey"
          },
          {
            "name": "newStatus",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "serviceUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "service",
            "type": "pubkey"
          },
          {
            "name": "newAuthority",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "newDefaultPolicy",
            "type": {
              "option": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "usageCheckpointSubmitted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "delegatedUsage",
            "type": "pubkey"
          },
          {
            "name": "apiKey",
            "type": "pubkey"
          },
          {
            "name": "service",
            "type": "pubkey"
          },
          {
            "name": "windowUsage",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "usageDelegated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "delegatedUsage",
            "type": "pubkey"
          },
          {
            "name": "apiKey",
            "type": "pubkey"
          },
          {
            "name": "policy",
            "type": "pubkey"
          },
          {
            "name": "executionRegion",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "usageRecordedRealtime",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "delegatedUsage",
            "type": "pubkey"
          },
          {
            "name": "apiKey",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "windowUsage",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "usageUndelegated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "delegatedUsage",
            "type": "pubkey"
          },
          {
            "name": "apiKey",
            "type": "pubkey"
          }
        ]
      }
    }
  ],
  "constants": [
    {
      "name": "abuseSignalSeed",
      "type": "string",
      "value": "\"abuse_signal\""
    },
    {
      "name": "apiKeySeed",
      "type": "string",
      "value": "\"api_key\""
    },
    {
      "name": "defaultReputationScore",
      "docs": [
        "DEFAULTS"
      ],
      "type": "i64",
      "value": "0"
    },
    {
      "name": "defaultWindowSeconds",
      "type": "u64",
      "value": "60"
    },
    {
      "name": "delegatedUsageSeed",
      "type": "string",
      "value": "\"delegated_usage\""
    },
    {
      "name": "flagBot",
      "type": "u32",
      "value": "2"
    },
    {
      "name": "flagManualBlock",
      "type": "u32",
      "value": "8"
    },
    {
      "name": "flagSpam",
      "docs": [
        "ABUSE FLAG BITS"
      ],
      "type": "u32",
      "value": "1"
    },
    {
      "name": "flagSuspiciousBurst",
      "type": "u32",
      "value": "4"
    },
    {
      "name": "maxBps",
      "type": "u16",
      "value": "10000"
    },
    {
      "name": "maxFlags",
      "type": "u32",
      "value": "4294967295"
    },
    {
      "name": "maxNameLen",
      "docs": [
        "GENERAL LIMITS"
      ],
      "type": "u32",
      "value": "64"
    },
    {
      "name": "maxSeverity",
      "type": "u8",
      "value": "10"
    },
    {
      "name": "minWindowSeconds",
      "type": "u64",
      "value": "1"
    },
    {
      "name": "policySeed",
      "type": "string",
      "value": "\"policy\""
    },
    {
      "name": "protocolSeed",
      "docs": [
        "PDA SEEDS"
      ],
      "type": "string",
      "value": "\"protocol\""
    },
    {
      "name": "reputationMax",
      "type": "i64",
      "value": "1000000"
    },
    {
      "name": "reputationMin",
      "docs": [
        "Reputation bounds (prevent runaway math)"
      ],
      "type": "i64",
      "value": "-1000000"
    },
    {
      "name": "reputationSeed",
      "type": "string",
      "value": "\"reputation\""
    },
    {
      "name": "serviceSeed",
      "type": "string",
      "value": "\"service\""
    },
    {
      "name": "usageSeed",
      "type": "string",
      "value": "\"usage\""
    }
  ]
};
