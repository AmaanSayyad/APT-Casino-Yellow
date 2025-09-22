"use client";
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Collapse,
  Grid,
  Divider
} from '@mui/material';
import { ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import yellowNetworkService from '@/services/YellowNetworkService';

const GameHistoryCard = ({ game, gameType }) => {
  const [expanded, setExpanded] = useState(false);
  const [yellowChannelId, setYellowChannelId] = useState(null);
  const [yellowSessionId, setYellowSessionId] = useState(null);

  useEffect(() => {
    // Prefer proof from game record; fallback to current service channel
    const chId = game?.yellowProof?.channelId || yellowNetworkService.channelId || null;
    const sessId = game?.yellowProof?.sessionId || yellowNetworkService.sessionId || null;
    setYellowChannelId(chId);
    setYellowSessionId(sessId);
  }, [game]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You can add a toast notification here
  };

  const openTransaction = (txHash, logIndex) => {
    const network = process.env.NEXT_PUBLIC_NETWORK || 'arbitrum-sepolia';
    let explorerUrl;
    
    if (network === 'arbitrum-sepolia') {
      explorerUrl = `https://sepolia.arbiscan.io/tx/${txHash}#eventlog`;
    } else if (network === 'arbitrum-one') {
      explorerUrl = `https://arbiscan.io/tx/${txHash}#eventlog`;
    } else {
      explorerUrl = `https://sepolia.etherscan.io/tx/${txHash}#eventlog`;
    }
    
    window.open(explorerUrl, '_blank');
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getGameResultColor = (result) => {
    if (result === 'win') return 'success';
    if (result === 'lose') return 'error';
    return 'default';
  };

  const getGameResultText = (result) => {
    if (result === 'win') return '🎉 WIN';
    if (result === 'lose') return '❌ LOSE';
    return '🤝 DRAW';
  };

  const proof = null; // VRF removed in Yellow mode

  return (
    <Card 
      sx={{ 
        mb: 2, 
        background: 'linear-gradient(135deg, rgba(139, 35, 152, 0.1) 0%, rgba(49, 196, 190, 0.1) 100%)',
        border: '1px solid rgba(139, 35, 152, 0.3)',
        borderRadius: '12px',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(139, 35, 152, 0.3)',
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ 
              color: 'white',
              fontWeight: 'bold',
              mb: 1
            }}>
              {gameType} Game
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              {formatTimestamp(game.timestamp)}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip 
              label={getGameResultText(game.result)}
              color={getGameResultColor(game.result)}
              variant="outlined"
              sx={{ 
                fontWeight: 'bold',
                borderWidth: '2px'
              }}
            />
            
            <Button
              onClick={() => setExpanded(!expanded)}
              sx={{ 
                color: 'white',
                minWidth: 'auto',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              {expanded ? <ExpandLess size={20} /> : <ExpandMore size={20} />}
            </Button>
          </Box>
        </Box>

        {/* Game Details */}
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Bet Amount:
              </Typography>
              <Typography variant="body1" sx={{ color: 'white', fontWeight: 'bold' }}>
                {game.betAmount} ETH
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Payout:
              </Typography>
              <Typography variant="body1" sx={{ color: 'white', fontWeight: 'bold' }}>
                {game.payout || '0'} ETH
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Yellow Channel Info */}
        <Box sx={{ 
          mb: 2, 
          p: 2, 
          bgcolor: 'rgba(255, 193, 7, 0.08)', 
          borderRadius: '8px',
          border: '1px solid rgba(255, 193, 7, 0.3)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <CheckCircle size={16} color="#FFC107" />
            <Typography variant="subtitle2" sx={{ color: '#FFC107', fontWeight: 'bold' }}>
              🟡 Yellow Channel
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Channel ID:
              </Typography>
              <Typography variant="body2" sx={{ color: 'white', fontFamily: 'monospace' }}>
                {yellowChannelId ? `${String(yellowChannelId).slice(0, 10)}...` : 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Session ID:
              </Typography>
              <Typography variant="body2" sx={{ color: 'white', fontFamily: 'monospace' }}>
                {yellowSessionId ? `${String(yellowSessionId).slice(0, 10)}...` : 'N/A'}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Expanded Content */}
        <Collapse in={expanded}>
          <Divider sx={{ my: 2, borderColor: 'rgba(139, 35, 152, 0.3)' }} />
          
          <Box>
            <Typography variant="h6" sx={{ 
              color: '#8B2398', 
              mb: 2,
              fontWeight: 'bold'
            }}>
              Game Details
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Game ID:
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', fontFamily: 'monospace' }}>
                  {game.id || 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Player Address:
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', fontFamily: 'monospace' }}>
                  {game.playerAddress ? 
                    `${game.playerAddress.slice(0, 8)}...${game.playerAddress.slice(-6)}` : 
                    'N/A'
                  }
                </Typography>
              </Grid>
              
              {game.gameData && (
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Game Data:
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white', fontFamily: 'monospace' }}>
                    {JSON.stringify(game.gameData, null, 2)}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default GameHistoryCard;