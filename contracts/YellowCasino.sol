// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title YellowCasino
 * @dev Casino contract optimized for Yellow Network state channels
 * Handles final settlement on Arbitrum Sepolia while gaming happens off-chain
 */
contract YellowCasino is Ownable, ReentrancyGuard, Pausable {
    
    // Events
    event GameSessionCreated(
        address indexed player,
        bytes32 indexed sessionId,
        GameType gameType,
        uint256 depositAmount
    );
    
    event GameSessionSettled(
        address indexed player,
        bytes32 indexed sessionId,
        GameType gameType,
        uint256 finalPayout,
        bool playerWon
    );
    
    event ChannelDeposit(
        address indexed player,
        bytes32 indexed channelId,
        uint256 amount
    );
    
    event ChannelWithdraw(
        address indexed player,
        bytes32 indexed channelId,
        uint256 amount
    );
    
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event HouseEdgeUpdated(uint256 oldEdge, uint256 newEdge);
    
    // Game Types
    enum GameType {
        MINES,
        PLINKO,
        ROULETTE,
        WHEEL
    }
    
    // Game Session Structure
    struct GameSession {
        address player;
        GameType gameType;
        uint256 depositAmount;
        uint256 timestamp;
        bool isActive;
        bool isSettled;
        bytes32 yellowChannelId; // Yellow Network channel ID
    }
    
    // State Channel Structure
    struct StateChannel {
        address player;
        uint256 balance;
        uint256 lockedAmount;
        bool isActive;
        uint256 lastActivity;
    }
    
    // State Variables
    mapping(bytes32 => GameSession) public gameSessions;
    mapping(address => mapping(bytes32 => StateChannel)) public stateChannels;
    mapping(address => uint256) public playerBalances;
    mapping(GameType => uint256) public gameTypeCount;
    
    address public treasury;
    uint256 public houseEdge = 270; // 2.7% (270 basis points)
    uint256 public constant MAX_HOUSE_EDGE = 1000; // 10% max
    uint256 public constant CHANNEL_TIMEOUT = 24 hours;
    uint256 public minBet = 0.001 ether;
    uint256 public maxBet = 10 ether;
    
    // Statistics
    uint256 public totalGamesPlayed;
    uint256 public totalVolumeWagered;
    uint256 public totalPayouts;
    
    modifier validGameType(GameType _gameType) {
        require(uint256(_gameType) <= 3, "Invalid game type");
        _;
    }
    
    modifier onlyActiveSession(bytes32 _sessionId) {
        require(gameSessions[_sessionId].isActive, "Session not active");
        require(!gameSessions[_sessionId].isSettled, "Session already settled");
        _;
    }
    
    constructor(address _treasury) Ownable(msg.sender) {
        require(_treasury != address(0), "Invalid treasury address");
        treasury = _treasury;
    }
    
    /**
     * @dev Create a new game session for Yellow Network state channel
     * @param _sessionId Unique session identifier from Yellow Network
     * @param _gameType Type of game being played
     * @param _yellowChannelId Yellow Network channel ID
     */
    function createGameSession(
        bytes32 _sessionId,
        GameType _gameType,
        bytes32 _yellowChannelId
    ) external payable nonReentrant whenNotPaused validGameType(_gameType) {
        require(msg.value >= minBet, "Bet amount too low");
        require(msg.value <= maxBet, "Bet amount too high");
        require(!gameSessions[_sessionId].isActive, "Session already exists");
        
        // Create game session
        gameSessions[_sessionId] = GameSession({
            player: msg.sender,
            gameType: _gameType,
            depositAmount: msg.value,
            timestamp: block.timestamp,
            isActive: true,
            isSettled: false,
            yellowChannelId: _yellowChannelId
        });
        
        // Update statistics
        gameTypeCount[_gameType]++;
        totalGamesPlayed++;
        totalVolumeWagered += msg.value;
        
        emit GameSessionCreated(msg.sender, _sessionId, _gameType, msg.value);
    }
    
    /**
     * @dev Settle a game session with final results from Yellow Network
     * @param _sessionId Session identifier
     * @param _playerWon Whether the player won
     * @param _finalPayout Final payout amount (0 if lost)
     * @param _yellowSignature Signature from Yellow Network (for verification)
     */
    function settleGameSession(
        bytes32 _sessionId,
        bool _playerWon,
        uint256 _finalPayout,
        bytes calldata _yellowSignature
    ) external nonReentrant onlyActiveSession(_sessionId) {
        GameSession storage session = gameSessions[_sessionId];
        require(session.player == msg.sender, "Not session owner");
        
        // Verify Yellow Network signature (simplified for demo)
        // In production, implement proper signature verification
        require(_yellowSignature.length > 0, "Invalid signature");
        
        // Mark session as settled
        session.isSettled = true;
        session.isActive = false;
        
        // Process payout
        if (_playerWon && _finalPayout > 0) {
            require(_finalPayout <= address(this).balance, "Insufficient contract balance");
            
            // Apply house edge to winnings (not to original bet)
            uint256 winnings = _finalPayout > session.depositAmount ? 
                _finalPayout - session.depositAmount : 0;
            uint256 houseEdgeAmount = (winnings * houseEdge) / 10000;
            uint256 netPayout = _finalPayout - houseEdgeAmount;
            
            // Transfer payout to player
            (bool success, ) = payable(session.player).call{value: netPayout}("");
            require(success, "Payout transfer failed");
            
            // Transfer house edge to treasury
            if (houseEdgeAmount > 0) {
                (bool treasurySuccess, ) = payable(treasury).call{value: houseEdgeAmount}("");
                require(treasurySuccess, "Treasury transfer failed");
            }
            
            totalPayouts += netPayout;
        }
        
        emit GameSessionSettled(
            session.player,
            _sessionId,
            session.gameType,
            _playerWon ? _finalPayout : 0,
            _playerWon
        );
    }
    
    /**
     * @dev Deposit funds to a Yellow Network state channel
     * @param _channelId Yellow Network channel identifier
     */
    function depositToChannel(bytes32 _channelId) external payable nonReentrant whenNotPaused {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        
        StateChannel storage channel = stateChannels[msg.sender][_channelId];
        channel.player = msg.sender;
        channel.balance += msg.value;
        channel.isActive = true;
        channel.lastActivity = block.timestamp;
        
        emit ChannelDeposit(msg.sender, _channelId, msg.value);
    }
    
    /**
     * @dev Withdraw funds from a Yellow Network state channel
     * @param _channelId Yellow Network channel identifier
     * @param _amount Amount to withdraw
     * @param _yellowSignature Signature from Yellow Network authorizing withdrawal
     */
    function withdrawFromChannel(
        bytes32 _channelId,
        uint256 _amount,
        bytes calldata _yellowSignature
    ) external nonReentrant {
        StateChannel storage channel = stateChannels[msg.sender][_channelId];
        require(channel.isActive, "Channel not active");
        require(channel.balance >= _amount, "Insufficient channel balance");
        require(_yellowSignature.length > 0, "Invalid signature");
        
        // Update channel balance
        channel.balance -= _amount;
        channel.lastActivity = block.timestamp;
        
        // Transfer funds to player
        (bool success, ) = payable(msg.sender).call{value: _amount}("");
        require(success, "Withdrawal transfer failed");
        
        emit ChannelWithdraw(msg.sender, _channelId, _amount);
    }
    
    /**
     * @dev Emergency withdrawal for expired channels
     * @param _channelId Channel identifier
     */
    function emergencyWithdraw(bytes32 _channelId) external nonReentrant {
        StateChannel storage channel = stateChannels[msg.sender][_channelId];
        require(channel.isActive, "Channel not active");
        require(
            block.timestamp >= channel.lastActivity + CHANNEL_TIMEOUT,
            "Channel timeout not reached"
        );
        
        uint256 amount = channel.balance;
        require(amount > 0, "No balance to withdraw");
        
        // Close channel
        channel.balance = 0;
        channel.isActive = false;
        
        // Transfer funds to player
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Emergency withdrawal failed");
        
        emit ChannelWithdraw(msg.sender, _channelId, amount);
    }
    
    /**
     * @dev Get game session details
     * @param _sessionId Session identifier
     */
    function getGameSession(bytes32 _sessionId) external view returns (
        address player,
        GameType gameType,
        uint256 depositAmount,
        uint256 timestamp,
        bool isActive,
        bool isSettled,
        bytes32 yellowChannelId
    ) {
        GameSession memory session = gameSessions[_sessionId];
        return (
            session.player,
            session.gameType,
            session.depositAmount,
            session.timestamp,
            session.isActive,
            session.isSettled,
            session.yellowChannelId
        );
    }
    
    /**
     * @dev Get state channel details
     * @param _player Player address
     * @param _channelId Channel identifier
     */
    function getStateChannel(address _player, bytes32 _channelId) external view returns (
        uint256 balance,
        uint256 lockedAmount,
        bool isActive,
        uint256 lastActivity
    ) {
        StateChannel memory channel = stateChannels[_player][_channelId];
        return (
            channel.balance,
            channel.lockedAmount,
            channel.isActive,
            channel.lastActivity
        );
    }
    
    /**
     * @dev Get contract statistics
     */
    function getContractStats() external view returns (
        uint256 totalGames,
        uint256 totalVolume,
        uint256 totalPayoutsAmount,
        uint256 contractBalance,
        uint256 currentHouseEdge
    ) {
        return (
            totalGamesPlayed,
            totalVolumeWagered,
            totalPayouts,
            address(this).balance,
            houseEdge
        );
    }
    
    /**
     * @dev Get game type statistics
     */
    function getGameTypeStats() external view returns (
        uint256 minesCount,
        uint256 plinkoCount,
        uint256 rouletteCount,
        uint256 wheelCount
    ) {
        return (
            gameTypeCount[GameType.MINES],
            gameTypeCount[GameType.PLINKO],
            gameTypeCount[GameType.ROULETTE],
            gameTypeCount[GameType.WHEEL]
        );
    }
    
    // Admin Functions
    
    /**
     * @dev Update treasury address (only owner)
     * @param _newTreasury New treasury address
     */
    function updateTreasury(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Invalid treasury address");
        address oldTreasury = treasury;
        treasury = _newTreasury;
        emit TreasuryUpdated(oldTreasury, _newTreasury);
    }
    
    /**
     * @dev Update house edge (only owner)
     * @param _newHouseEdge New house edge in basis points
     */
    function updateHouseEdge(uint256 _newHouseEdge) external onlyOwner {
        require(_newHouseEdge <= MAX_HOUSE_EDGE, "House edge too high");
        uint256 oldEdge = houseEdge;
        houseEdge = _newHouseEdge;
        emit HouseEdgeUpdated(oldEdge, _newHouseEdge);
    }
    
    /**
     * @dev Update betting limits (only owner)
     * @param _minBet New minimum bet
     * @param _maxBet New maximum bet
     */
    function updateBettingLimits(uint256 _minBet, uint256 _maxBet) external onlyOwner {
        require(_minBet > 0, "Min bet must be greater than 0");
        require(_maxBet > _minBet, "Max bet must be greater than min bet");
        minBet = _minBet;
        maxBet = _maxBet;
    }
    
    /**
     * @dev Pause contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency fund withdrawal (only owner)
     * @param _amount Amount to withdraw
     */
    function emergencyFundWithdraw(uint256 _amount) external onlyOwner {
        require(_amount <= address(this).balance, "Insufficient balance");
        (bool success, ) = payable(treasury).call{value: _amount}("");
        require(success, "Emergency withdrawal failed");
    }
    
    /**
     * @dev Receive function to accept ETH deposits
     */
    receive() external payable {
        // Accept ETH deposits for contract funding
    }
    
    /**
     * @dev Fallback function
     */
    fallback() external payable {
        revert("Function not found");
    }
}