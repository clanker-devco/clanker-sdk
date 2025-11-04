# Clanker Presales: Fair Launch for Your Token

Clanker Presales enable token creators to raise funds from their community **before** deploying their token to the blockchain. This innovative approach ensures fair distribution, builds community engagement, and provides initial liquidity—all while protecting both creators and participants.

> **Part of the [Clanker SDK](https://github.com/clanker-devco/clanker-sdk)** - A comprehensive toolkit for deploying tokens on Base and Ethereum with advanced features like presales, airdrops, dev buys, and more.

## 🎯 What is a Presale?

A presale is a fundraising period where community members can contribute ETH in exchange for tokens that will be distributed after the token is officially deployed. Think of it as a "crowdfunding campaign" for your token launch.

**Key Benefits:**
- **Raise Capital First**: Gather ETH from your community before deployment
- **Fair Distribution**: Set participation limits and ensure wide token distribution
- **Risk Protection**: Built-in refunds if goals aren't met
- **Community Building**: Early supporters become stakeholders from day one

## ✨ Core Features

### 🎯 Flexible Goal Setting

Set minimum and maximum fundraising targets:
- **Minimum Goal**: The amount needed for a successful launch (minimum 0.01 ETH, e.g., 1 ETH)
- **Maximum Goal**: Cap on total fundraising (e.g., 10 ETH)
- If minimum isn't reached, everyone gets refunded automatically
- If maximum is reached, the presale ends early

### ⏰ Time-Bound Campaigns

Control your presale duration:
- Set a specific timeframe (minimum 1 minute, e.g., 1 hour, 1 day, 1 week)
- **Early Completion**: As the creator, you can end the presale early once the minimum goal is met
- Automatic refunds if time expires without reaching the minimum

### 🔒 Lockup & Vesting

Protect your token launch with built-in time controls:
- **Lockup Period**: Tokens remain locked for a set time after deployment (minimum 7 days)
- **Vesting Schedule**: Tokens gradually become claimable over time
- Prevents immediate dumping and promotes long-term holding

### 📊 Supply Distribution Control

Decide how tokens are allocated:
- Configure what percentage goes to presale buyers vs. liquidity pool (0.01% to 100%)
- Default: 50% to presale participants, 50% to initial liquidity
- Example: Set 70% for presale, 30% for LP to reward early supporters more

### 👥 Allowlist Support (Whitelist)

Create exclusive presales:
- Restrict participation to specific wallet addresses
- Perfect for community members, early supporters, or VIPs
- Prevents bot participation and ensures fair access
- Easy on/off toggle with Merkle tree verification

### 💰 Automatic ETH Distribution

No manual steps required:
- When a presale succeeds, ETH is automatically distributed
- Funds go directly to the recipient address you specify
- Clanker takes a 5% platform fee (deducted when presale owner claims ETH)
- Net proceeds = Raised ETH - 5% fee
- Transparent and trustless process

### 🔄 Flexible Participation

Participants have full control:
- **Buy In**: Contribute ETH at any time during the active presale
- **Increase**: Add more ETH to your contribution
- **Withdraw**: Remove some or all of your contribution before the presale ends
- **Refund**: Get your ETH back if the presale fails

## 🚀 How It Works

### Complete Presale Lifecycle

#### Phase 1: Setup & Launch (Status: Active)
1. **Creator Configures Presale**
   - Set minimum and maximum ETH goals (minimum 0.01 ETH)
   - Choose presale duration (minimum 1 minute)
   - Configure lockup (minimum 7 days) and vesting periods
   - Optionally add an allowlist for exclusive access
   - Presale goes live immediately upon creation

#### Phase 2: Fundraising (Status: Active)
2. **Community Participates**
   - Users contribute ETH to the presale
   - Contributions are tracked per wallet address
   - Users can increase their contribution at any time
   - Users can withdraw (reduce/remove) their contribution at any time
   - If max goal is reached, presale automatically moves to next phase
   - If time expires without reaching min goal, presale fails

#### Phase 3: Ending the Presale
3. **Three Ways to End a Presale:**

   **Option A: Maximum Goal Reached** (Status: SuccessfulMaximumHit)
   - Automatically triggered when max ETH is raised
   - Anyone can call `endPresale()` to deploy the token
   
   **Option B: Duration Expires + Min Goal Met** (Status: SuccessfulMinimumHit)
   - Automatically triggered when time expires and min goal is reached
   - Anyone can call `endPresale()` to deploy the token
   
   **Option C: Early Completion by Creator** ⭐ (Status: Active → Deployment)
   - Creator can call `endPresale()` early once minimum goal is met
   - Allows faster deployment when fundraising is going well
   - No need to wait for duration to expire

#### Phase 4: Token Deployment (Automated)
4. **Smart Contract Deploys Token**
   - `endPresale()` triggers automatic token deployment via Clanker factory
   - Token is minted with the configured total supply
   - Presale contract receives tokens proportional to `presaleSupplyBps` setting
   - Remaining tokens go to liquidity pool on Uniswap V4
   - Lockup and vesting timers start counting from deployment
   - Status changes to **Claimable**

#### Phase 5: Distribution (Status: Claimable)
5. **ETH Distribution to Creator**
   - Presale owner calls `claimEth()` to receive raised ETH
   - Clanker fee (default 5%) is automatically deducted
   - Net ETH is sent to the recipient address specified at presale creation
   - Can only be claimed once

6. **Token Distribution to Participants**
   - After lockup period passes (minimum 7 days), users call `claimTokens()`
   - Tokens are distributed **proportionally** based on ETH contributed:
     - If you contributed 1 ETH out of 10 ETH total → you receive 10% of presale tokens
     - Formula: `Your Tokens = (Your ETH / Total ETH) × Total Presale Token Supply`
   - If vesting is enabled:
     - Tokens unlock gradually over the vesting period
     - Users can claim multiple times as more tokens vest
     - After vesting ends, all remaining tokens become claimable
   - Users can claim tokens at any time after lockup (no expiration)

### Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 1: ACTIVE PRESALE                                         │
│ • Users contribute ETH                                           │
│ • Users can withdraw ETH anytime                                 │
│ • Tracking: ETH raised vs. min/max goals                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │   Did it reach min goal?     │
              └──────────┬───────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │ YES                           │ NO
         ▼                               ▼
┌────────────────────┐           ┌──────────────────┐
│ PHASE 2: READY     │           │ Time expired?    │
│ • Min goal met     │           └────────┬─────────┘
│ • Creator can end  │                    │
│   early ⭐         │           YES      │      NO
│ • OR wait for      │            │       │       │
│   time/max         │            ▼       │       │
└─────────┬──────────┘      ┌─────────┐  │   Continue
          │                 │ FAILED  │◄─┘    Active
          ▼                 │ PRESALE │
┌─────────────────────────┐ └────┬────┘
│ PHASE 3: DEPLOYMENT     │      │
│ endPresale() called:    │      │ All users
│ 1. Token deployed       │      │ withdraw ETH
│ 2. Tokens split:        │      │ (full refund)
│    • X% to presale      │      │
│    • (100-X)% to LP     │      └──────► End
│ 3. Lockup starts        │
│ 4. Status: CLAIMABLE ✓  │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 4: DISTRIBUTION (Status: Claimable)                       │
│                                                                  │
│ Creator:                                                         │
│ • Calls claimEth()                                              │
│ • Receives: Total ETH - 5% Clanker fee                          │
│                                                                  │
│ Participants (after lockup passes):                             │
│ • Call claimTokens()                                            │
│ • Receive: (Their ETH ÷ Total ETH) × Total Presale Tokens      │
│ • If vesting enabled: tokens unlock gradually over time         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### For Token Creators (Quick Summary)

1. **Configure & Launch** - Set parameters and start presale
2. **Monitor Progress** - Track contributions in real-time
3. **End Presale** - Deploy when conditions are met (or end early ⭐)
4. **Claim ETH** - Receive raised funds (minus 5% Clanker fee)
5. **Community Claims** - Your supporters claim tokens after lockup

### For Participants

1. **Discover a Presale**
   - Find presales you want to support
   - Check goals, duration, and token details

2. **Contribute ETH**
   - Send ETH during the presale period
   - Adjust your contribution anytime before it ends
   - Withdraw if you change your mind

3. **Wait for Deployment**
   - If successful: Wait for lockup period to pass
   - If failed: Withdraw your ETH back

4. **Claim Your Tokens**
   - After lockup, claim your tokens
   - If vesting is enabled, tokens unlock gradually
   - Start trading or holding immediately

## 📈 Use Cases

### Community Token Launches
Perfect for DAOs, communities, or projects that want to involve their members from the start. Ensure fair distribution and build loyalty.

### Exclusive Drops
Use allowlists to reward early supporters, community members, or whitelist participants. Create FOMO and exclusivity.

### Fair Launch Guarantees
Built-in refunds protect participants from failed launches. Only successful projects get funded, reducing risk for everyone.

### Liquidity Bootstrapping
Raise funds to provide initial liquidity, ensuring your token has a healthy market from day one.

## 🔐 Safety & Transparency

### Built-In Protections
- **Automatic Refunds**: ETH returned if minimum goal isn't reached
- **Transparent Goals**: All parameters visible on-chain
- **No Rug Pulls**: Smart contract enforces all rules
- **Community Control**: Participants can withdraw before presale ends

### Smart Contract Security
- Battle-tested contracts deployed on multiple chains
- Audited code with extensive testing
- Open-source and verifiable
- No admin keys or backdoors

## 🌐 Multi-Chain Support

Presales are available on:
- **Base** (Mainnet)
- **Ethereum** (Mainnet)

Each deployment uses the same secure, reliable smart contracts.

## 💡 Best Practices

### For Creators

1. **Set Realistic Goals**: Don't set minimum too high or you risk refunding everyone
2. **Communicate Clearly**: Tell your community about:
   - Lockup and vesting periods upfront
   - How tokens will be distributed (proportionally based on ETH contributed)
   - When they can claim (after lockup passes)
   - The Clanker fee (5% of raised ETH)
3. **Promote Actively**: Share your presale link widely to reach your goals
4. **Consider Early Ending**: If you reach minimum quickly, you can end early to:
   - Build momentum and excitement
   - Deploy faster while community is engaged
   - Start trading sooner
5. **Choose Supply Split Wisely**: 
   - Higher presale % = More tokens for early supporters
   - Higher LP % = Better initial liquidity for trading
   - Default 50/50 is usually a good balance

### For Participants

1. **Research First**: Check the project, team, and token details before contributing
2. **Understand Token Distribution**: 
   - Your token share = Your ETH contribution ÷ Total ETH raised
   - Contributing more ETH = receiving more tokens (proportionally)
   - The final amount depends on how much total ETH is raised
3. **Understand Lockup**: Know when you'll be able to claim your tokens (minimum 7 days after deployment)
4. **Don't Overcommit**: Only contribute what you can afford
5. **Monitor Progress**: Check presale status to see if goals are being met
6. **Flexibility**: Remember you can withdraw your ETH anytime before the presale ends

## ⚙️ Technical Requirements

All presales must meet these minimum requirements:

| Parameter | Minimum Value | Notes |
|-----------|---------------|-------|
| **Minimum ETH Goal** | 0.01 ETH | Any amount greater than 0 |
| **Maximum ETH Goal** | Must be ≥ Minimum Goal | No upper limit |
| **Presale Duration** | 1 minute (60 seconds) | Can be set to any length |
| **Lockup Period** | 7 days (604,800 seconds) | Required safety feature |
| **Vesting Duration** | 0 seconds | Optional, can be 0 for instant vesting |
| **Supply to Presale** | 0.01% (1 basis point) | Maximum 100% (10,000 basis points) |

These requirements ensure presales are fair, safe, and functional for all participants.

## 📊 Example Scenarios

### Scenario 1: Successful Early Completion
**Setup:** Min: 1 ETH | Max: 10 ETH | Duration: 24 hours | Presale Supply: 50%

- **Hour 12**: 5 ETH raised (minimum met)
- **Creator Action**: Ends presale early to capture momentum
- **Deployment**: Token deploys automatically
  - 1M total token supply
  - 500K tokens (50%) to presale contract for participants
  - 500K tokens (50%) to Uniswap V4 liquidity pool
- **ETH Distribution**: Creator receives 4.75 ETH (5 ETH - 5% Clanker fee = 4.75 ETH)
- **Token Distribution** (after 7-day lockup):
  - Alice contributed 2 ETH → receives 200K tokens (40% of presale tokens)
  - Bob contributed 2 ETH → receives 200K tokens (40% of presale tokens)
  - Carol contributed 1 ETH → receives 100K tokens (20% of presale tokens)

### Scenario 2: Maximum Reached
**Setup:** Min: 2 ETH | Max: 5 ETH | Duration: 48 hours | Presale Supply: 70%

- **Hour 8**: Maximum 5 ETH reached
- **Status**: Presale automatically marked as SuccessfulMaximumHit
- **Deployment**: Anyone calls `endPresale()`, token deploys
  - 1M total token supply
  - 700K tokens (70%) to presale participants
  - 300K tokens (30%) to liquidity pool
- **ETH**: Creator receives 4.75 ETH (after 5% fee)
- **Distribution**: 10 participants who contributed 0.5 ETH each get 70K tokens each

### Scenario 3: Failed Presale
**Setup:** Min: 10 ETH | Max: 50 ETH | Duration: 7 days

- **Day 7**: Only 3 ETH raised (minimum not met)
- **Status**: Automatically marked as Failed when time expires
- **Result**: No token deployment
- **Refunds**: All participants call `withdrawFromPresale()` to get their ETH back
- **Outcome**: No loss for anyone, token not launched

## 🛠️ Technical Details

For developers and technical users:
- Smart contracts deployed on Base and Ethereum
- ERC-20 token standard with custom extensions
- Merkle tree allowlists for gas-efficient whitelisting
- Linear vesting algorithm for smooth token distribution
- Integration with Uniswap V4 for instant liquidity
- [View Smart Contract Source Code](https://github.com/clanker-devco/clanker-sdk/tree/main/src/v4/extensions/presale.ts) - Full presale implementation

## 📞 Getting Started

Ready to launch your presale? Check out:
- [Developer Documentation](https://github.com/clanker-devco/clanker-sdk/tree/main/examples/v4/presale) - Technical implementation guide with code examples
- [Clanker SDK Repository](https://github.com/clanker-devco/clanker-sdk) - Full SDK documentation and source code
- [NPM Package](https://www.npmjs.com/package/clanker-sdk) - Install and use the SDK in your project

## ❓ FAQ

**Q: What happens if the minimum goal isn't reached?**  
A: The presale is marked as "Failed" and all participants can withdraw their ETH back. No tokens are deployed.

**Q: Can I withdraw my ETH after contributing?**  
A: Yes! You can withdraw any amount (up to your contribution) at any time while the presale is still active.

**Q: Why is there a 7-day minimum lockup period?**  
A: This is a required safety feature that prevents immediate dumping after deployment and gives the token time to establish healthy trading patterns. All presales must have at least a 7-day (604,800 seconds) lockup period.

**Q: What fees does Clanker charge?**  
A: Clanker charges a default fee of 5% of the raised ETH. This is automatically deducted when the presale owner claims their ETH. For example, if 10 ETH is raised, the creator receives 9.5 ETH and Clanker receives 0.5 ETH.

**Q: How are tokens distributed to participants?**  
A: Tokens are distributed **proportionally** based on each participant's ETH contribution relative to the total ETH raised. For example:
- Total raised: 10 ETH
- Alice contributed 4 ETH (40%) → receives 40% of presale tokens
- Bob contributed 6 ETH (60%) → receives 60% of presale tokens

The formula is: `Your Tokens = (Your ETH ÷ Total ETH) × Total Presale Token Supply`

**Q: What's the minimum ETH I can set as a goal?**  
A: Technically any amount greater than 0, but practically we recommend at least 0.01 ETH as a minimum goal. You can set any maximum goal as long as it's greater than or equal to the minimum.

**Q: Can I create multiple presales?**  
A: Yes! Each presale is independent and can have different parameters.

**Q: What if I want to give more tokens to presale buyers?**  
A: Use the `presaleSupplyBps` parameter to allocate a higher percentage (e.g., 70%) to presale participants. Minimum is 0.01%, maximum is 100%.

**Q: What exactly happens when I call `endPresale()`?**  
A: The smart contract automatically:
1. Deploys your token via the Clanker factory
2. Mints the total token supply
3. Sends the presale allocation (based on `presaleSupplyBps`) to the presale contract
4. Sends the remaining tokens to the Uniswap V4 liquidity pool
5. Starts the lockup and vesting timers
6. Changes the presale status to "Claimable"

After this, you can claim your ETH, and participants can claim their tokens once the lockup period passes.

**Q: Can I end a presale early before the duration expires?**  
A: Yes! As the presale creator, you can call `endPresale()` at any time once the minimum goal is reached, even if the duration hasn't expired. This allows you to deploy faster when fundraising is going well.

---

**Built with ❤️ by the Clanker team**

*Presales are experimental. Please do your own research and only participate with funds you can afford to lose.*

