# APT Casino - Yellow Network Diagrams (ERC-7824 Only)

## 🌐 On-Chain Working with Yellow State Channels

```mermaid
flowchart LR
  subgraph Client
    UI[UI Components]
    Hook[useYellowNetwork]
    Svc[YellowNetworkService]
  end

  subgraph Yellow
    NL[Nitrolite Client]
    SC[ERC-7824 State Channel]
    CN[Clearnode]
  end

  subgraph L2
    Custody[Custody Contract]
    Adjudicator[Adjudicator Contract]
  end

  UI --> Hook
  Hook --> Svc
  Svc --> NL
  NL <-->|open/close, updates| SC
  SC <-->|messages| CN
  SC -->|settlement disputes| Adjudicator
  SC -->|on-chain deposits/withdrawals| Custody
```

## 🔌 Channel Creation (Open State Channel)

```mermaid
sequenceDiagram
  participant UI as UI
  participant Svc as YellowNetworkService
  participant NL as NitroliteClient
  participant CN as Clearnode
  participant Cust as Custody Contract (L2)
  participant Adj as Adjudicator (L2)

  UI->>Svc: connect(channelId?, accessToken?)
  alt first time / no active channel
    Svc->>NL: init client (ws url, publicClient)
    Svc->>NL: openChannel(params)
    NL->>Cust: on-chain deposit (optional)
    Cust-->>NL: deposit confirmed
    NL->>CN: register channel metadata
    CN-->>NL: channel ready
    NL-->>Svc: channelId
    Svc-->>UI: connected (channelId)
  else already initialized
    Svc-->>UI: connected
  end

  note over Adj,NL: Adjudicator used only on disputes/challenges
```

## 🎮 Session Creation (Game Session Lifecycle)

```mermaid
sequenceDiagram
  participant UI as Game UI
  participant Svc as YellowNetworkService
  participant NL as NitroliteClient
  participant CN as Clearnode

  UI->>Svc: createGameSession('PLINKO', config)
  Svc->>NL: createSession({ appId, params })
  NL->>CN: open session
  CN-->>NL: sessionId, state initialized
  NL-->>Svc: session details
  Svc-->>UI: sessionId

  UI->>Svc: generateRandom({ purpose: 'game_random' })
  Svc->>NL: callSessionMethod(generateSecureRandom)
  NL->>CN: compute randomness in channel
  CN-->>NL: randomValue (+optional proofs)
  NL-->>Svc: random result
  Svc-->>UI: randomNumber -> animate result

  UI->>Svc: endGameSession()
  Svc->>NL: closeSession(sessionId)
  NL->>CN: finalize session state
  CN-->>NL: closed
```

## 💳 Deposit / Withdraw via State Channel

```mermaid
flowchart TB
  subgraph App
    Svc[YellowNetworkService]
  end
  subgraph Chain
    Custody[Custody Contract]
  end

  Svc -->|depositTokens| Custody
  Custody -->|credit balance| Svc
  Svc -->|withdrawTokens| Custody
  Custody -->|transfer to wallet| Svc
  %% Note: params omitted in labels for GitHub Mermaid compatibility
```

## ⚖️ Dispute & Settlement (High-Level)

```mermaid
sequenceDiagram
  participant P as Player
  participant S as Service
  participant CN as Clearnode
  participant ADJ as Adjudicator (L2)

  P->>S: play, off-chain updates
  S->>CN: exchange signed states
  Note over S,CN: Normal path: fast, off-chain
  alt dispute or offline
    S->>ADJ: submit latest signed state
    ADJ-->>S: challenge window
    S->>ADJ: finalize / enforce outcome
  else no dispute
    S-->>P: payout via channel/withdraw
  end
```

## 🎮 Game Play Flows over Channels (Mines, Plinko, Roulette, Wheel)

```mermaid
flowchart TB
  subgraph UI
    GM[Game Manager]
    Mines[Mines]
    Plinko[Plinko]
    Roulette[Roulette]
    Wheel[Wheel]
  end

  subgraph SDK
    Sess[createGameSession]
    Rand[generateRandom]
    Bet[placeBet/settleBet]
  end

  subgraph Channel
    Open[Open Session]
    Update[Off-chain State Updates]
    Close[Close Session]
  end

  GM --> Sess
  Sess --> Open
  Mines --> Rand
  Plinko --> Rand
  Roulette --> Rand
  Wheel --> Rand
  Rand --> Update
  GM --> Bet
  Bet --> Update
  Update --> Close
```

### Mines Round (detailed)
```mermaid
sequenceDiagram
  participant UI as Mines UI
  participant S as YellowService
  participant CH as State Channel
  participant CN as Clearnode

  UI->>S: ensure session('MINES')
  S->>CH: open or reuse session
  UI->>S: startRound(bet, mineCount)
  S->>CN: callSessionMethod(generateSecureRandom)
  CN-->>S: randomValue -> mine grid seed
  S-->>UI: mines layout derived
  loop each tile
    UI->>S: revealTile(i)
    S->>CN: callSessionMethod(generateSecureRandom)
    CN-->>S: randomValue -> outcome
    S-->>UI: safe or mine
  end
  UI->>S: cashOut()
  S->>CN: finalize off-chain payout
```

### Plinko Drop (detailed)
```mermaid
sequenceDiagram
  participant UI as Plinko UI
  participant S as YellowService
  participant CN as Clearnode

  UI->>S: ensure session('PLINKO')
  UI->>S: dropBall(rows,risk,bet)
  S->>CN: generateSecureRandom (seed)
  CN-->>S: randomValue
  S-->>UI: seed -> physics path -> slot -> payout
```

### Roulette Spin (detailed)
```mermaid
sequenceDiagram
  participant UI as Roulette UI
  participant S as YellowService
  participant CN as Clearnode

  UI->>S: placeBets(bets)
  UI->>S: spin()
  S->>CN: generateSecureRandom (0..36)
  CN-->>S: number
  S-->>UI: resolve bets -> payouts
```

### Wheel Spin (detailed)
```mermaid
sequenceDiagram
  participant UI as Wheel UI
  participant S as YellowService
  participant CN as Clearnode

  UI->>S: ensure session('WHEEL')
  UI->>S: spinWheel(bet, segments)
  S->>CN: generateSecureRandom (seed)
  CN-->>S: randomValue
  S-->>UI: segmentIndex = seed % segments
  UI-->>UI: animate wheel -> stop at segmentIndex
  UI->>S: settle(bet, segmentIndex)
  S-->>UI: payout/result
```

## 🔊 Chain Listener & Session On-chain TX (Arbitrum Sepolia)

```mermaid
flowchart LR
  subgraph Backend
    L[Chain Listener]
  end
  subgraph L2
    SessTx[Session Registry TX]
    Events[Contract Events]
  end
  subgraph App
    Svc[YellowNetworkService]
    UI[Games]
  end

  Svc -->|init/connect| L
  UI -->|createGameSession| Svc
  Svc -->|submit session meta| SessTx
  SessTx --> Events
  L -->|subscribe| Events
  Events --> L
  L -->|notify| Svc
  Svc -->|update UI/session state| UI
```

### Listener Sequence (Session Submit + Confirm)
```mermaid
sequenceDiagram
  participant UI as Game UI
  participant S as YellowService
  participant L as Listener
  participant L2 as Arbitrum Sepolia

  UI->>S: createGameSession(game)
  S->>L2: sendTransaction(sessionRegister)
  L2-->>S: txHash
  par listen
    L->>L2: watch tx/events
    L2-->>L: SessionRegistered(evt)
  and update
    S-->>UI: pending(session on-chain)
  end
  L-->>S: confirmed(sessionId,onChain=true)
  S-->>UI: session ready (on-chain)
```
